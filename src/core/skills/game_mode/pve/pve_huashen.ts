import { CompulsorySkill, PersistentSkill } from 'core/skills/skill_wrappers';
import { Room } from 'core/room/room';
import { PlayerPhase, PlayerDiedStage, PlayerDyingStage } from 'core/game/stage_processor';
import { ServerEventFinder, GameEventIdentifiers, EventPacker } from 'core/event/event';
import { TriggerSkill } from 'core/skills/skill';
import { AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Sanguosha } from 'core/game/engine';
import { PveChaoFeng } from 'core/characters/pve/pve_chaofeng';
import { PveSuanNi } from 'core/characters/pve/pve_suanni';
import { PveYaZi } from 'core/characters/pve/pve_yazi';
import { PveBiAn } from 'core/characters/pve/pve_bian';
import { PveFuXi } from 'core/characters/pve/pve_fuxi';
import { PveBiXi } from 'core/characters/pve/pve_bixi';
import { PlayerId } from 'core/player/player_props';

@PersistentSkill({ stubbornSkill: true })
@CompulsorySkill({ name: 'pve_huashen', description: 'pve_huashen_description' })
export class PveHuaShen extends TriggerSkill {
  public afterDead(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.RequestRescue;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return content.dying === owner.Id;
  }

  private async nextCharacter(room: Room, ownerId: PlayerId) {
    console.log('next character');
    const NewMaxHp = room.getPlayerById(ownerId).MaxHp + 1;
    console.log('character MaxHp is ' + NewMaxHp);
    const nextCharacter = Sanguosha.getCharacterByCharaterName('pve_chaofeng');
    const playerPropertiesChangeEvent: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent> = {
      changedProperties: [
        {
          toId: ownerId,
          nationality: nextCharacter.Nationality,
          gender: nextCharacter.Gender,
        },
      ],
    };

    room.changePlayerProperties(playerPropertiesChangeEvent);
    const player = room.getPlayerById(ownerId);

    const huashenInfo = player.getHuaShenInfo();
    if (huashenInfo !== undefined) {
      await room.loseSkill(ownerId, huashenInfo.skillName);
    }

    !player.isFaceUp() && (await room.turnOver(player.Id));
    player.ChainLocked && (await room.chainedOn(player.Id));
    player.clearHeaded();

    await room.changeMaxHp(ownerId, 1);
    await room.recover({ recoveredHp: NewMaxHp - player.Hp, toId: ownerId });
    await room.drawCards(5, ownerId, 'top', ownerId, this.Name);

    player.setHuaShenInfo({ skillName: nextCharacter.Skills[0].GeneralName, characterId: nextCharacter.Id });

    await room.obtainSkill(ownerId, nextCharacter.Skills[0].GeneralName, true);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await this.nextCharacter(room, event.fromId);

    const otherPlayers = room.AlivePlayers.filter(player => player.Id !== event.fromId);

    for (const player of otherPlayers) {
      await room.recover({ recoverBy: event.fromId, recoveredHp: 1, toId: player.Id });
      await room.drawCards(1, player.Id, 'top');

      const pveHuashenCharacters = room.getRandomCharactersFromLoadedPackage(3);
      const askForChoosingCharacterEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCharacterEvent> = {
        amount: 1,
        characterIds: pveHuashenCharacters,
        toId: player.Id,
        byHuaShen: true,
      };

      room.notify(GameEventIdentifiers.AskForChoosingCharacterEvent, askForChoosingCharacterEvent, player.Id);

      const { chosenCharacterIds } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingCharacterEvent,
        player.Id,
      );

      // console.log(`${player.Id} choose ${chosenCharacterIds}`);

      const options = Sanguosha.getCharacterById(chosenCharacterIds[0])
        .Skills.filter(skill => !(skill.isShadowSkill() || skill.isLordSkill()))
        .map(skill => skill.GeneralName);

      const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options,
        toId: player.Id,
        conversation: 'pve_huashen: please announce a skill to obtain',
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(
          askForChoosingOptionsEvent,
        ),
        player.Id,
      );

      const { selectedOption } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        player.Id,
      );

      await room.obtainSkill(player.Id, selectedOption!, true);
    }

    return true;
  }
}

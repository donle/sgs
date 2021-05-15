import { CompulsorySkill, PersistentSkill } from 'core/skills/skill_wrappers';
import { Room } from 'core/room/room';
import { PlayerDyingStage, GameStartStage } from 'core/game/stage_processor';
import { ServerEventFinder, GameEventIdentifiers, EventPacker, CardMoveReason } from 'core/event/event';
import { TriggerSkill } from 'core/skills/skill';
import { AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Sanguosha } from 'core/game/engine';
import { PlayerId } from 'core/player/player_props';
import { MarkEnum } from 'core/shares/types/mark_list';

@PersistentSkill({ stubbornSkill: true })
@CompulsorySkill({ name: 'pve_huashen', description: 'pve_huashen_description' })
export class PveHuaShen extends TriggerSkill {
  static readonly CHARACTERS = ['pve_suanni', 'pve_bian', 'pve_bixi', 'pve_yazi', 'pve_fuxi', 'pve_chaofeng'];

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent | GameEventIdentifiers.GameStartEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PlayerDyingStage.RequestRescue || stage === GameStartStage.AfterGameStarted;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent | GameEventIdentifiers.GameStartEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(
      event as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent | GameEventIdentifiers.GameStartEvent>,
    );

    if (identifier === GameEventIdentifiers.GameStartEvent) {
      return !owner.hasUsedSkill(this.Name);
    }

    if (identifier === GameEventIdentifiers.PlayerDyingEvent) {
      return (event as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>).dying === owner.Id;
    }

    return false;
  }

  private async nextEntity(room: Room, ownerId: PlayerId) {
    const NewMaxHp = room.getPlayerById(ownerId).MaxHp + 1;
    const chara = PveHuaShen.CHARACTERS[PveHuaShen.CHARACTERS.length - room.getMark(ownerId, MarkEnum.PveHuaShen)];
    room.addMark(ownerId, MarkEnum.PveHuaShen, -1);
    if (chara === undefined) {
      return false;
    }
    const nextCharacter = Sanguosha.getCharacterByCharaterName(chara);

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

    await room.dropCards(CardMoveReason.SelfDrop, player.getPlayerCards(), player.Id, player.Id, this.GeneralName);

    !player.isFaceUp() && (await room.turnOver(player.Id));
    player.ChainLocked && (await room.chainedOn(player.Id));
    player.clearHeaded();

    await room.changeMaxHp(ownerId, 1);
    await room.recover({ recoveredHp: NewMaxHp - player.Hp, toId: ownerId });
    await room.drawCards(room.getMark(ownerId, MarkEnum.PveHuaShen) === 5 ? 0 : 5, ownerId, 'top', ownerId, this.Name);
    player.setHuaShenInfo({ skillName: nextCharacter.Skills[0].GeneralName, characterId: nextCharacter.Id });
    await room.obtainSkill(ownerId, nextCharacter.Skills[0].GeneralName, true);

    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const identifier = EventPacker.getIdentifier(
      event.triggeredOnEvent as ServerEventFinder<
        GameEventIdentifiers.PlayerDyingEvent | GameEventIdentifiers.GameStartEvent
      >,
    );

    if (identifier === GameEventIdentifiers.GameStartEvent) {
      room.addMark(event.fromId, MarkEnum.PveHuaShen, PveHuaShen.CHARACTERS.length);
      await this.nextEntity(room, event.fromId);

      const otherPlayers = room.AlivePlayers.filter(player => player.Id !== event.fromId);
      for (const player of otherPlayers) {
        const playerPropertiesChangeEvent: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent> = {
          changedProperties: [
            {
              toId: player.Id,
              maxHp: player.Character.MaxHp + 1,
              hp: player.Character.Hp + 1,
            },
          ],
        };

        room.changePlayerProperties(playerPropertiesChangeEvent);
      }
      return true;
    }

    if (room.getMark(event.fromId, MarkEnum.PveHuaShen) === 0) {
      return true;
    }

    const nextCharacter = await this.nextEntity(room, event.fromId);
    if (!nextCharacter) {
      return true;
    }

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

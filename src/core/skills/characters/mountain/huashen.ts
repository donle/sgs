import { CharacterId } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, GameBeginStage, PhaseChangeStage, PlayerPhase, StagePriority } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { OnDefineReleaseTiming, SkillType, TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'huashen', description: 'huashen_description' })
export class HuaShen extends TriggerSkill implements OnDefineReleaseTiming {
  async whenDead(room: Room, owner: Player) {
    const playerPropertiesChangeEvent: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent> = {
      changedProperties: [
        {
          toId: owner.Id,
          nationality: owner.Character.Nationality,
          gender: owner.Character.Gender,
        },
      ],
    };
    room.changePlayerProperties(playerPropertiesChangeEvent);
    const huashenInfo = owner.getHuaShenInfo();
    if (huashenInfo !== undefined) {
      await room.loseSkill(owner.Id, huashenInfo.skillName);
    }
  }

  async whenLosingSkill(room: Room, owner: Player) {
    const playerPropertiesChangeEvent: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent> = {
      changedProperties: [
        {
          toId: owner.Id,
          nationality: owner.Character.Nationality,
          gender: owner.Character.Gender,
        },
      ],
    };
    room.changePlayerProperties(playerPropertiesChangeEvent);
    const huashenInfo = owner.getHuaShenInfo();
    if (huashenInfo !== undefined) {
      await room.loseSkill(owner.Id, huashenInfo.skillName);
    }
  }

  public isAutoTrigger(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.GameBeginEvent>,
  ): boolean {
    if (EventPacker.getIdentifier(event) === GameEventIdentifiers.GameBeginEvent) {
      return true;
    }
    return false;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.GameBeginEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      stage === PhaseChangeStage.AfterPhaseChanged ||
      stage === PhaseChangeStage.PhaseChanged ||
      stage === GameBeginStage.AfterGameBegan
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.GameBeginEvent>,
    stage?: AllStage,
  ) {
    if (stage === GameBeginStage.AfterGameBegan) {
      return true;
    }

    const content = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
    const canUse =
      (content.toPlayer === owner.Id &&
        content.to === PlayerPhase.PhaseBegin &&
        stage === PhaseChangeStage.AfterPhaseChanged &&
        owner.getCardIds<CharacterId>(PlayerCardsArea.OutsideArea, this.Name).length > 0) ||
      (content.fromPlayer === owner.Id &&
        content.from === PlayerPhase.PhaseFinish &&
        stage === PhaseChangeStage.PhaseChanged &&
        owner.getCardIds<CharacterId>(PlayerCardsArea.OutsideArea, this.Name).length > 0);

    return canUse;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public getPriority(room: Room, owner: Player) {
    if (room.CurrentPlayerPhase === PlayerPhase.PhaseBegin) {
      return StagePriority.High;
    } else if (room.CurrentPlayerPhase === PlayerPhase.PhaseFinish) {
      return StagePriority.Low;
    } else {
      return StagePriority.Medium;
    }
  }

  public async askForChoosingCharacter(
    room: Room,
    who: Player,
    amount: number,
    except?: CharacterId,
  ): Promise<CharacterId[]> {
    let characterIds = who.getCardIds<CharacterId>(PlayerCardsArea.OutsideArea, this.GeneralName);
    if (except !== undefined) {
      characterIds = characterIds.filter(characterId => characterId !== except);
    }

    const askForChoosingCharacterEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCharacterEvent> = {
      characterIds,
      toId: who.Id,
      amount,
      byHuaShen: true,
      triggeredBySkills: [this.Name],
    };

    room.notify(GameEventIdentifiers.AskForChoosingCharacterEvent, askForChoosingCharacterEvent, who.Id);

    const { chosenCharacterIds } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCharacterEvent,
      who.Id,
    );

    return chosenCharacterIds;
  }

  public async disguise(room: Room, who: PlayerId): Promise<void> {
    const player = room.getPlayerById(who);
    const chosenCharacterIds = await this.askForChoosingCharacter(room, player, 1);
    const character = Sanguosha.getCharacterById(chosenCharacterIds[0]);

    const playerPropertiesChangeEvent: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent> = {
      changedProperties: [{ toId: who, nationality: character.Nationality, gender: character.Gender }],
    };

    room.changePlayerProperties(playerPropertiesChangeEvent);

    const options = character.Skills.filter(
      skill =>
        !(
          skill.isShadowSkill() ||
          skill.isLordSkill() ||
          skill.SkillType === SkillType.Limit ||
          skill.SkillType === SkillType.Awaken ||
          skill.SkillType === SkillType.Quest
        ),
    ).map(skill => skill.GeneralName);

    const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      toId: who,
      conversation: 'huashen: please announce a skill to obtain',
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChoosingOptionsEvent),
      who,
    );

    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      who,
    );

    const huashenInfo = player.getHuaShenInfo();
    if (huashenInfo !== undefined) {
      await room.loseSkill(who, huashenInfo.skillName);
    }

    player.setHuaShenInfo({ skillName: selectedOption!, characterId: character.Id });
    room.broadcast(GameEventIdentifiers.HuaShenCardUpdatedEvent, {
      toId: player.Id,
      latestHuaShen: character.Id,
      latestHuaShenSkillName: selectedOption!,
    });
    await room.obtainSkill(who, selectedOption!, true);
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const player = room.getPlayerById(skillEffectEvent.fromId);
    if (room.Circle === 1 && !player.getFlag<boolean>(this.GeneralName)) {
      player.setFlag(this.GeneralName, true);
      const huashen = room.getRandomCharactersFromLoadedPackage(3);
      room.setCharacterOutsideAreaCards(
        skillEffectEvent.fromId,
        this.GeneralName,
        huashen,
        TranslationPack.translationJsonPatcher(
          '{0} obtained character cards {1}',
          TranslationPack.patchPlayerInTranslation(player),
          TranslationPack.wrapArrayParams(...huashen.map(characterId => Sanguosha.getCharacterById(characterId).Name)),
        ).extract(),
        TranslationPack.translationJsonPatcher(
          '{0} swapped {1} character cards',
          TranslationPack.patchPlayerInTranslation(player),
          huashen.length,
        ).extract(),
      );
      await this.disguise(room, skillEffectEvent.fromId);
    } else {
      const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options: ['option-one', 'option-two'],
        toId: skillEffectEvent.fromId,
        conversation:
          'please choose: 1. show a character from huashen area and announce a skill to obtain. 2. remove no more than two unshown characters of huashen and get equal number of that.',
        triggeredBySkills: [this.Name],
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(
          askForChoosingOptionsEvent,
        ),
        skillEffectEvent.fromId,
      );

      const { selectedOption } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        skillEffectEvent.fromId,
      );

      if (selectedOption === 'option-one') {
        await this.disguise(room, skillEffectEvent.fromId);
      } else {
        const huashenInfo = Precondition.exists(player.getHuaShenInfo(), 'unknown huashen info');
        const selectedCharacterIds = await this.askForChoosingCharacter(room, player, 2, huashenInfo.characterId);
        const huashenCards = player.getCardIds<CharacterId>(PlayerCardsArea.OutsideArea, this.GeneralName);
        const huashen = room.getRandomCharactersFromLoadedPackage(selectedCharacterIds.length, huashenCards);
        const newHuashenCards = huashenCards
          .filter(characterId => !selectedCharacterIds.includes(characterId))
          .concat(huashen);
        room.setCharacterOutsideAreaCards(
          player.Id,
          this.GeneralName,
          newHuashenCards,
          TranslationPack.translationJsonPatcher(
            '{0} obtained character cards {1}',
            TranslationPack.patchPlayerInTranslation(player),
            TranslationPack.wrapArrayParams(
              ...huashen.map(characterId => Sanguosha.getCharacterById(characterId).Name),
            ),
          ).extract(),
          TranslationPack.translationJsonPatcher(
            '{0} swapped {1} character cards',
            TranslationPack.patchPlayerInTranslation(player),
            huashen.length,
          ).extract(),
        );
      }
    }

    return true;
  }
}

import { CharacterId } from 'core/characters/character';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseChangeStage, PlayerDiedStage, PlayerPhase, StagePriority } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { OnDefineReleaseTiming, SkillType, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'huashen', description: 'huashen_description' })
export class HuaShen extends TriggerSkill {
  public isAutoTrigger(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    if (event.from === undefined && event.to === PlayerPhase.PrepareStage) {
      return true;
    }
    return false;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.BeforePhaseChange || stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    const canUse =
      ((event.toPlayer === owner.Id || (room.Round === 0 && !owner.getFlag<boolean>(this.Name))) &&
        event.to === PlayerPhase.PrepareStage &&
        room.CurrentProcessingStage === PhaseChangeStage.BeforePhaseChange) ||
      (event.fromPlayer === owner.Id &&
        event.from === PlayerPhase.FinishStage &&
        room.CurrentProcessingStage === PhaseChangeStage.AfterPhaseChanged);

    return canUse;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public getPriority(room: Room, owner: Player) {
    if (room.CurrentProcessingStage === PhaseChangeStage.BeforePhaseChange) {
      return StagePriority.High;
    } else if (room.CurrentProcessingStage === PhaseChangeStage.AfterPhaseChanged) {
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
          skill.SkillType === SkillType.Awaken
        ),
    ).map(skill => skill.GeneralName);

    const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      toId: who,
      conversation: 'huashen: please announce a skill to obtain',
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
    room.obtainSkill(who, selectedOption!, true);
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const player = room.getPlayerById(skillEffectEvent.fromId);
    if (room.Round === 0 && !player.getFlag<boolean>(this.Name)) {
      player.setFlag(this.Name, true);
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

@ShadowSkill
@CommonSkill({ name: HuaShen.Name, description: HuaShen.Description })
export class HuaShenShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room, owner: PlayerId): boolean {
    return !room.getPlayerById(owner).hasSkill(this.GeneralName);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public afterDead(room: Room): boolean {
    return room.CurrentProcessingStage === PlayerDiedStage.PlayerDied;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>, stage?: AllStage): boolean {
    return true;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>): boolean {
    if (room.CurrentProcessingStage !== PlayerDiedStage.PlayerDied && owner.hasSkill(this.GeneralName)) {
      return false;
    }

    if (!owner.getFlag<boolean>(this.Name)) {
      owner.setFlag(this.Name, true);
      return owner.Dead || !owner.hasSkill(this.GeneralName);
    } else {
      return false;
    }
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.translationsMessage = undefined;
    return true;
  }

  public async onEffect(room: Room, skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const player = room.getPlayerById(skillEffectEvent.fromId);
    const playerPropertiesChangeEvent: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent> = {
      changedProperties: [
        {
          toId: skillEffectEvent.fromId,
          nationality: player.Character.Nationality,
          gender: player.Character.Gender,
        },
      ],
    };
    room.changePlayerProperties(playerPropertiesChangeEvent);
    const huashenInfo = player.getHuaShenInfo();
    if (huashenInfo !== undefined) {
      await room.loseSkill(skillEffectEvent.fromId, huashenInfo.skillName);
    }

    return true;
  }
}

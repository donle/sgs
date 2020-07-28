import { CharacterGender, CharacterId, CharacterNationality } from 'core/characters/character';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  GameStartStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { SkillType, TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

type HuaShenInfo = {
  originGender: CharacterGender;
  originNationality: CharacterNationality;
  tempCharacterId?: CharacterId;
  tempSkill?: string;
};

@CommonSkill({ name: 'huashen', description: 'huashen_description' })
export class HuaShen extends TriggerSkill {
  public isAutoTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers>): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.GameStartEvent) {
      return true;
    }
    return false;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return (
      stage === PhaseChangeStage.BeforePhaseChange ||
      stage === PhaseStageChangeStage.AfterStageChanged ||
      stage === GameStartStage.GameStarting
    );
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers>) {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.toPlayer === owner.Id && phaseChangeEvent.to === PlayerPhase.PrepareStage;
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageEnd
      );
    } else {
      return !owner.hasUsedSkill(this.GeneralName);
    }
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async askForChoosingCharacter(
    room: Room,
    who: PlayerId,
    amount: number,
    except?: CharacterId,
  ): Promise<CharacterId[]> {
    let characterIds = room.getOutsideCharacters(who, this.GeneralName);
    if (except !== undefined) {
      characterIds = characterIds.filter(characterId => characterId !== except);
    }

    const askForChoosingCharacterEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCharacterEvent> = {
      characterIds,
      toId: who,
      amount,
    };

    room.notify(GameEventIdentifiers.AskForChoosingCharacterEvent, askForChoosingCharacterEvent, who);

    const { chosenCharacterIds } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCharacterEvent,
      who,
    );

    return chosenCharacterIds;
  }

  public async disguise(room: Room, who: PlayerId): Promise<void> {
    const player = room.getPlayerById(who);
    const chosenCharacterIds = await this.askForChoosingCharacter(room, who, 1);
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

    let skillObtain: string | undefined;
    if (options.length > 0) {
      const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options,
        toId: who,
        conversation: 'huashen: please announce a skill to obtain',
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(
          askForChoosingOptionsEvent,
        ),
        who,
      );

      const { selectedOption } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        who,
      );

      skillObtain = selectedOption!;
    }

    const huashenInfo = room.getFlag<HuaShenInfo>(who, this.GeneralName);
    huashenInfo.tempCharacterId = chosenCharacterIds[0];

    if (huashenInfo.tempSkill && huashenInfo.tempSkill !== skillObtain) {
      await room.loseSkill(who, huashenInfo.tempSkill);
      huashenInfo.tempSkill = undefined;
    }

    if (skillObtain && !player.hasSkill(skillObtain)) {
      room.obtainSkill(who, skillObtain);
      huashenInfo.tempSkill = skillObtain;
    }
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const player = room.getPlayerById(skillEffectEvent.fromId);
    const unknownEvent = skillEffectEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier !== GameEventIdentifiers.GameStartEvent) {
      const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options: ['huashen_1', 'huashen_2'],
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

      if (selectedOption === 'huashen_1') {
        await this.disguise(room, skillEffectEvent.fromId);
      } else {
        const huashenInfo = room.getFlag<HuaShenInfo>(skillEffectEvent.fromId, this.GeneralName);
        const selectedCharacterIds = await this.askForChoosingCharacter(
          room,
          skillEffectEvent.fromId,
          2,
          huashenInfo.tempCharacterId,
        );
        const huashen = room.getRandomCharactersFromLoadedPackage(2);
        room.removeOutsideCharacters(skillEffectEvent.fromId, this.GeneralName, selectedCharacterIds);
        room.addOutsideCharacters(skillEffectEvent.fromId, this.GeneralName, huashen);
      }
    } else {
      const husahenInfo: HuaShenInfo = {
        originGender: player.Gender,
        originNationality: player.Nationality,
      };
      room.setFlag<HuaShenInfo>(skillEffectEvent.fromId, this.GeneralName, husahenInfo);

      const huashen = room.getRandomCharactersFromLoadedPackage(3);
      room.addOutsideCharacters(skillEffectEvent.fromId, this.GeneralName, huashen);
      await this.disguise(room, skillEffectEvent.fromId);
    }

    return true;
  }
}

/*
const log = new Logger();

@ShadowSkill
@CommonSkill({ name: HuaShen.Name, description: HuaShen.Description })
export class HuaShenShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public onLosingSkill(room: Room, owner: PlayerId): boolean {
    return !room.getPlayerById(owner).hasSkill(this.GeneralName);
  }

  public onDeath(room: Room, owner: PlayerId): boolean {
    log.info(room.getPlayerById(owner).Dead);
    return room.getPlayerById(owner).Dead;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(): boolean {
    return true;
  }

  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasSkill(this.GeneralName) || owner.Dead;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    log.info('triggered');
    const huashenInfo = room.getFlag<HuaShenInfo>(skillEffectEvent.fromId, this.GeneralName);
    const playerPropertiesChangeEvent: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent> = {
      changedProperties: [
        { toId: skillEffectEvent.fromId, nationality: huashenInfo.originNationality, gender: huashenInfo.originGender },
      ],
    };
    room.changePlayerProperties(playerPropertiesChangeEvent);

    if (huashenInfo.tempSkill) {
      room.getPlayerById(skillEffectEvent.fromId).hasSkill(huashenInfo.tempSkill) &&
        (await room.loseSkill(skillEffectEvent.fromId, huashenInfo.tempSkill));
    }

    room.removeFlag(skillEffectEvent.fromId, this.GeneralName);

    return true;
  }
}
*/

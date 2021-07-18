import { CardType } from 'core/cards/card';
import { CardSuit } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  CardUseStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, OnDefineReleaseTiming, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jingce', description: 'jingce_description' })
export class JingCe extends TriggerSkill {
  public static readonly JingCeSuits: string = 'jingce_suits';
  public static readonly JingCeTypes: string = 'jingce_types';

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    const types = owner.getFlag<CardType[]>(JingCe.JingCeTypes);
    return (
      owner.Id === content.playerId &&
      content.toStage === PlayerPhaseStages.PlayCardStageEnd &&
      types !== undefined &&
      types.length > 0
    );
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to draw {1} card(s)?',
      this.Name,
      owner.getFlag<CardType[]>(JingCe.JingCeTypes).length,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const player = room.getPlayerById(event.fromId);
    const drawNum: number = player.getFlag<CardType[]>(JingCe.JingCeTypes).length;
    await room.drawCards(drawNum, event.fromId, undefined, event.fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: JingCe.Name, description: JingCe.Description })
export class JingCeRecorder extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: CardUseStage): boolean {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return room.CurrentPlayer.Id === owner.Id && content.fromId === owner.Id;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const CardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    room.syncGameCommonRules(event.fromId, user => {
      const card = Sanguosha.getCardById(CardUseEvent.cardId);
      const jingceTypes = JingCe.JingCeTypes;
      const JingCeSuits = JingCe.JingCeSuits;

      const types = user.getFlag<CardType[]>(jingceTypes) || [];
      if (!types.includes(card.BaseType)) {
        types.push(card.BaseType);
        user.setFlag<CardType[]>(jingceTypes, types);
      }

      const suits = user.getFlag<CardSuit[]>(JingCeSuits) || [];
      if (!suits.includes(card.Suit)) {
        suits.push(card.Suit);
        user.setFlag<CardSuit[]>(JingCeSuits, suits);
        room.CommonRules.addAdditionalHoldCardNumber(user, 1);
      }
    });
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: JingCeRecorder.Name, description: JingCeRecorder.Description })
export class JingCeShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return content.fromPlayer === owner.Id && content.from === PlayerPhase.PhaseFinish;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    room.syncGameCommonRules(event.fromId, user => {
      const jingceSuits = JingCe.JingCeSuits;
      const suits = user.getFlag<CardSuit[]>(jingceSuits);
      if (suits) {
        room.CommonRules.addAdditionalHoldCardNumber(user, -suits.length);
        user.removeFlag(jingceSuits);
      }
      user.removeFlag(JingCe.JingCeTypes);
    });

    return true;
  }
}

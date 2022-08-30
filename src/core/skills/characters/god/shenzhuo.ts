import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { FilterSkill, OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'shenzhuo', description: 'shenzhuo_description' })
export class ShenZhuo extends TriggerSkill {
  public static readonly Block = 'shenzhuo_block';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      Sanguosha.getCardById(content.cardId).GeneralName === 'slash' &&
      !Sanguosha.isVirtualCardId(content.cardId)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const options = ['shenzhuo:drawOne', 'shenzhuo:drawThree'];
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose shenzhuo options',
          this.Name,
        ).extract(),
        toId: event.fromId,
        triggeredBySkills: [this.Name],
      },
      event.fromId,
      true,
    );

    response.selectedOption = response.selectedOption || options[0];

    if (response.selectedOption === options[0]) {
      await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);
      room.setFlag<number>(event.fromId, this.Name, (room.getFlag<number>(event.fromId, this.Name) || 0) + 1);
    } else {
      await room.drawCards(3, event.fromId, 'top', event.fromId, this.Name);
      room.setFlag<boolean>(event.fromId, ShenZhuo.Block, true);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: ShenZhuo.Name, description: ShenZhuo.Description })
export class ShenZhuoExtra extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (!room.getFlag<number>(owner.Id, this.GeneralName)) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return room.getFlag<number>(owner.Id, this.GeneralName);
    } else {
      return 0;
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: ShenZhuoExtra.Name, description: ShenZhuoExtra.Description })
export class ShenZhuoBlock extends FilterSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public canUseCard(
    cardId: CardId | CardMatcher,
    room: Room,
    owner: PlayerId,
    onResponse?: ServerEventFinder<GameEventIdentifiers>,
    isCardResponse?: boolean,
  ): boolean {
    if (!room.getFlag<boolean>(owner, ShenZhuo.Block) || isCardResponse) {
      return true;
    }

    return cardId instanceof CardMatcher
      ? !cardId.match(new CardMatcher({ generalName: ['slash'] }))
      : Sanguosha.getCardById(cardId).GeneralName !== 'slash';
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: ShenZhuoBlock.Name, description: ShenZhuoBlock.Description })
export class ShenZhuoRemove extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      event.from === PlayerPhase.PhaseFinish &&
      (owner.getFlag<number>(this.GeneralName) !== undefined || owner.getFlag<boolean>(ShenZhuo.Block) !== undefined)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.getFlag<number>(event.fromId, this.GeneralName) !== undefined &&
      room.removeFlag(event.fromId, this.GeneralName);
    room.getFlag<boolean>(event.fromId, ShenZhuo.Block) !== undefined && room.removeFlag(event.fromId, ShenZhuo.Block);

    return true;
  }
}

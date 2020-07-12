import { CardType } from 'core/cards/card';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { GameCommonRules } from 'core/game/game_rules';
import { CardMoveStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, CompulsorySkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jizhi', description: 'jizhi_description' })
export class JiZhi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage: CardUseStage) {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const card = Sanguosha.getCardById(content.cardId);
    return content.fromId === owner.Id && card.is(CardType.Trick);
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activated skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const cardId = (await room.drawCards(1, event.fromId))[0];
    if (Sanguosha.getCardById(cardId).is(CardType.Basic)) {
      const askForOptionsEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options: ['jizhi:discard', 'jizhi:keep'],
        toId: event.fromId,
        conversation: TranslationPack.translationJsonPatcher(
          'do you wanna discard {0}',
          TranslationPack.patchCardInTranslation(cardId),
        ).extract(),
      });

      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForOptionsEvent, event.fromId);

      const response = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        event.fromId,
      );

      if (response.selectedOption === 'jizhi:discard') {
        await room.dropCards(CardMoveReason.SelfDrop, [cardId], event.fromId, event.fromId, this.Name);
        room.syncGameCommonRules(event.fromId, user => {
          user.addInvisibleMark(this.Name, 1);
          GameCommonRules.addAdditionalHoldCardNumber(user, 1);
        });
      }
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: JiZhi.Name, description: JiZhi.Description })
export class JiZhiShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: PhaseChangeStage) {
    return stage === PhaseChangeStage.AfterPhaseChanged && event.from === PlayerPhase.FinishStage;
  }

  canUse() {
    return true;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = event;
    const phaseChangeEvent = Precondition.exists(
      triggeredOnEvent,
      'Unknown phase change event in jizhi',
    ) as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;

    phaseChangeEvent.fromPlayer &&
      room.syncGameCommonRules(phaseChangeEvent.fromPlayer, user => {
        const extraHold = user.getInvisibleMark(this.GeneralName);
        user.removeInvisibleMark(this.GeneralName);
        GameCommonRules.addAdditionalHoldCardNumber(user, -extraHold);
      });
    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: JiZhiShadow.Name, description: JiZhiShadow.Description })
export class JizhiBlock extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage: CardMoveStage) {
    return stage === CardMoveStage.BeforeCardMoving;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    return (
      content.fromId === owner.Id &&
      content.moveReason === CardMoveReason.PassiveDrop &&
      content.proposer !== owner.Id &&
      content.movingCards.find(
        cardInfo =>
          cardInfo.fromArea === CardMoveArea.EquipArea &&
          (Sanguosha.getCardById(cardInfo.card).is(CardType.Armor) ||
            Sanguosha.getCardById(cardInfo.card).is(CardType.Precious)),
      ) !== undefined
    );
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activated skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      this.Name,
    ).extract();
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = event;
    EventPacker.terminate(triggeredOnEvent!);
    return true;
  }
}

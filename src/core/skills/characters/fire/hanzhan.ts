import { Card } from 'core/cards/card';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PinDianStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'hanzhan', description: 'hanzhan_description' })
export class HanZhan extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return stage === PinDianStage.BeforePinDianEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PinDianEvent>) {
    return owner.Id === content.fromId || content.toIds.includes(owner.Id);
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const pindianEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PinDianEvent>;
    if (pindianEvent.fromId === fromId) {
      pindianEvent.randomPinDianCardPlayer.push(...pindianEvent.toIds);
    } else {
      pindianEvent.randomPinDianCardPlayer.push(pindianEvent.fromId);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: HanZhan.Name, description: HanZhan.Description })
export class HanZhanHidden extends TriggerSkill {
  isAutoTrigger() {
    return true;
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return stage === PinDianStage.AfterPinDianEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PinDianEvent>) {
    const involved = owner.Id === content.fromId || content.toIds.includes(owner.Id);
    if (!involved) {
      return false;
    }

    return (
      Sanguosha.getCardById(content.cardId!).GeneralName === 'slash' ||
      content.procedures.find(result => Sanguosha.getCardById(result.cardId).GeneralName === 'slash') !== undefined
    );
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const pindianEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PinDianEvent>;

    const cards = pindianEvent.procedures.map(result => Sanguosha.getCardById(result.cardId));
    cards.push(Sanguosha.getCardById(pindianEvent.cardId!));
    let bigCards: Card[] = [];

    for (const card of cards) {
      if (card.GeneralName === 'slash') {
        if (bigCards.length === 0) {
          bigCards.push(card);
        } else {
          if (card.CardNumber === bigCards[0].CardNumber) {
            bigCards.push(card);
          } else if (card.CardNumber > bigCards[0].CardNumber) {
            bigCards = [card];
          }
        }
      }
    }

    if (bigCards.length === 0) {
      return false;
    }

    let obtainingCard = bigCards[0].Id;
    if (bigCards.length > 1) {
      const askForChooseCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent> = {
        toId: fromId,
        cardIds: bigCards.map(card => card.Id),
        amount: 1,
        customTitle: this.GeneralName,
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardEvent>(askForChooseCardEvent),
        fromId,
      );

      const { selectedCards } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingCardEvent,
        fromId,
      );

      obtainingCard = selectedCards![0];
    }

    await room.moveCards({
      movingCards: [
        {
          card: obtainingCard,
          fromArea: CardMoveArea.ProcessingArea,
        },
      ],
      moveReason: CardMoveReason.ActivePrey,
      movedByReason: this.GeneralName,
      toArea: CardMoveArea.HandArea,
      toId: fromId,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} triggered skill {1}, obtained card {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        this.GeneralName,
        TranslationPack.patchCardInTranslation(obtainingCard),
      ).extract(),
    });

    return true;
  }
}

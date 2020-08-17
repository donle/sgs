import { CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'liyu', description: 'liyu_description' })
export class LiYu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return (
      stage === DamageEffectStage.AfterDamageEffect &&
      !!event.cardIds &&
      event.cardIds.length === 1 &&
      Sanguosha.getCardById(event.cardIds[0]).GeneralName === 'slash'
    );
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    const to = room.getPlayerById(content.toId);
    const cards = to.getCardIds();

    return owner.Id === content.fromId && cards.length > 0;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { triggeredOnEvent } = skillUseEvent;
    const damageEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    const from = room.getPlayerById(damageEvent.fromId!);
    const to = room.getPlayerById(damageEvent.toId);

    const options: CardChoosingOptions = {
      [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent = {
      fromId: damageEvent.fromId!,
      toId: damageEvent.toId,
      options,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
      damageEvent.fromId!,
    );

    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      damageEvent.fromId!,
    );

    if (response.selectedCard === undefined) {
      const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    await room.moveCards({
      movingCards: [{ card: response.selectedCard, fromArea: response.fromArea }],
      fromId: chooseCardEvent.toId,
      toId: chooseCardEvent.fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: chooseCardEvent.fromId,
      movedByReason: this.Name,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} obtains cards {1} from {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(chooseCardEvent.fromId)),
        TranslationPack.patchCardInTranslation(response.selectedCard),
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(chooseCardEvent.toId)),
      ).extract(),
    });

    const responseCard = Sanguosha.getCardById(response.selectedCard);
    if (responseCard.is(CardType.Equip)) {
      const targets = room
        .getOtherPlayers(damageEvent.fromId!)
        .filter(p => p.Id !== damageEvent.toId && from.canUseCardTo(room, new CardMatcher({ name: ['duel'] }), p.Id))
        .map(p => p.Id);

      if (targets.length > 0) {
        const choosePlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
          players: targets,
          requiredAmount: 1,
          conversation: TranslationPack.translationJsonPatcher(
            'liyu: please choose a player, as target of {0} duel',
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
          ).extract(),
          toId: chooseCardEvent.toId,
          triggeredBySkills: [this.Name],
        };

        room.notify(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>(choosePlayerEvent),
          chooseCardEvent.toId,
        );

        const choosePlayerResponse = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          chooseCardEvent.toId,
        );

        const cardUseEvent = {
          fromId: from.Id,
          cardId: VirtualCard.create({
            cardName: 'duel',
            bySkill: this.Name,
          }).Id,
          toIds: choosePlayerResponse.selectedPlayers,
        };

        await room.useCard(cardUseEvent);
      }
    } else {
      await room.drawCards(1, chooseCardEvent.toId, undefined, skillUseEvent.fromId, this.Name);
    }

    return true;
  }
}

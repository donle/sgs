import { CardType } from 'core/cards/card';
import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'buyi', description: 'buyi_description' })
export class BuYi extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PlayerDyingStage.PlayerDying;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>,
  ): boolean {
    const dyingPlayer = room.getPlayerById(content.dying);
    return dyingPlayer.Hp <= 0 && dyingPlayer.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to reveal a hand card from {1} ?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.dying)),
    ).extract();
  }
    
  public async onTrigger() {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const dyingEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>;
    const dyingPlayer = room.getPlayerById(dyingEvent.dying);

    const options: CardChoosingOptions = {
      [PlayerCardsArea.HandArea]: dyingPlayer.getCardIds(PlayerCardsArea.HandArea).length,
    };

    if (event.fromId === dyingEvent.dying) {
      options[PlayerCardsArea.HandArea] = dyingPlayer.getCardIds(PlayerCardsArea.HandArea);
    }

    const chooseCardEvent = {
      fromId: event.fromId,
      toId: dyingEvent.dying,
      options,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
      event.fromId,
    );

    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      event.fromId,
    );

    if (response.selectedCard === undefined) {
      const cardIds = dyingPlayer.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    room.broadcast(GameEventIdentifiers.CardDisplayEvent, {
      displayCards: [response.selectedCard],
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} display hand card {1}',
        TranslationPack.patchPlayerInTranslation(dyingPlayer),
        TranslationPack.patchCardInTranslation(response.selectedCard),
      ).extract(),
    });

    if (!Sanguosha.getCardById(response.selectedCard).is(CardType.Basic)) {
      await room.dropCards(
        CardMoveReason.SelfDrop,
        [response.selectedCard],
        dyingEvent.dying,
        dyingEvent.dying,
        this.Name,
      );

      await room.recover({
        toId: dyingEvent.dying,
        recoveredHp: 1,
        recoverBy: dyingEvent.dying,
      });
    }

    return true;
  }
}

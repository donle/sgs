import { CardType } from 'core/cards/card';
import { CardChoosingOptions } from 'core/cards/libs/card_props';
import {
  CardMoveReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhenlie', description: 'zhenlie_description' })
export class ZhenLie extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
    stage?: AllStage,
  ): boolean {
    if (!event.byCardId) {
      return false;
    }

    const card = Sanguosha.getCardById(event.byCardId);
    return (
      stage === AimStage.AfterAimmed &&
      (
        card.GeneralName === 'slash' ||
        (
          card.is(CardType.Trick) &&
          !card.is(CardType.DelayedTrick)
        )
      )
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): boolean {
    return event.toId === owner.Id && event.fromId !== owner.Id && owner.Hp > 0;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to lose 1 hp to nullify {1}, then drop a card from {2}',
      this.Name,
      TranslationPack.patchCardInTranslation(event.byCardId!),
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    await room.loseHp(fromId, 1);
    aimEvent.nullifiedTargets.push(fromId);

    if (aimEvent.fromId) {
      const user = room.getPlayerById(aimEvent.fromId);
      if (user.getPlayerCards().length < 1 || room.getPlayerById(fromId).Dead) {
        return false;
      }

      const options: CardChoosingOptions = {
        [PlayerCardsArea.EquipArea]: user.getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.HandArea]: user.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId,
        toId: aimEvent.fromId,
        options,
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
        fromId,
      );

      const response = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        fromId,
      );

      if (response.selectedCard === undefined) {
        const cardIds = user.getCardIds(PlayerCardsArea.HandArea);
        response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
      }

      await room.dropCards(
        CardMoveReason.PassiveDrop,
        [response.selectedCard],
        chooseCardEvent.toId,
        fromId,
        this.Name,
      );
    }

    return true;
  }
}

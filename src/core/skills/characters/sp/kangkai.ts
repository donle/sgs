import { CardType, VirtualCard } from 'core/cards/card';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'kangkai', description: 'kangkai_description' })
export class KangKai extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      Sanguosha.getCardById(content.byCardId).GeneralName === 'slash' &&
      room.distanceBetween(owner, room.getPlayerById(content.toId)) <= 1
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    return event.toId === owner.Id
      ? TranslationPack.translationJsonPatcher(
          '{0}: do you want to draw a card?',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toId)),
        ).extract()
      : TranslationPack.translationJsonPatcher(
          '{0}: do you want to draw 1 card, and then give {1} a card?',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toId)),
        ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    await room.drawCards(1, fromId, 'top', fromId, this.Name);

    const toId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>).toId;
    if (fromId !== toId && !room.getPlayerById(toId).Dead && room.getPlayerById(fromId).getPlayerCards().length > 0) {
      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        {
          cardAmount: 1,
          toId: fromId,
          reason: this.Name,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose a card to display and give it to {1} ? If this card is eqiup card, {1} can use it',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(toId)),
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      const wholeCards = room.getPlayerById(fromId).getPlayerCards();
      resp.selectedCards = resp.selectedCards || [wholeCards[Math.floor(Math.random() * wholeCards.length)]];

      const showCardEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
        displayCards: [resp.selectedCards[0]],
        fromId,
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} displays card {1}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
          TranslationPack.patchCardInTranslation(resp.selectedCards[0]),
        ).extract(),
      };
      room.broadcast(GameEventIdentifiers.CardDisplayEvent, showCardEvent);

      const realCardId = VirtualCard.getActualCards([resp.selectedCards[0]])[0];

      await room.moveCards({
        movingCards: [
          { card: resp.selectedCards[0], fromArea: room.getPlayerById(fromId).cardFrom(resp.selectedCards[0]) },
        ],
        fromId,
        toId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      });

      const toUse = room
        .getPlayerById(toId)
        .getCardIds(PlayerCardsArea.HandArea)
        .find(id => VirtualCard.getActualCards([id])[0] === realCardId);
      if (toUse && Sanguosha.getCardById(toUse).is(CardType.Equip)) {
        const { selectedOption } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
          GameEventIdentifiers.AskForChoosingOptionsEvent,
          {
            toId,
            options: ['yes', 'no'],
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: do you want to use {1}',
              this.Name,
              TranslationPack.patchCardInTranslation(toUse),
            ).extract(),
          },
          toId,
          true,
        );

        selectedOption === 'yes' &&
          (await room.useCard(
            {
              fromId: toId,
              targetGroup: [[toId]],
              cardId: toUse,
            },
            true,
          ));
      }
    }

    return true;
  }
}

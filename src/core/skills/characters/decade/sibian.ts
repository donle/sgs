import { CardId } from 'core/cards/libs/card_props';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DrawCardStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'sibian', description: 'sibian_description' })
export class SiBian extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage): boolean {
    return stage === DrawCardStage.BeforeDrawCardEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>): boolean {
    return (
      owner.Id === content.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      content.bySpecialReason === CardDrawReason.GameStage &&
      content.drawAmount > 0
    );
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to display 4 cards from the top of draw stack?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>).drawAmount = 0;

    const displayCards = room.getCards(4, 'top');
    const cardDisplayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      displayCards,
      fromId: event.fromId,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} used skill {1}, display cards: {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
        this.Name,
        TranslationPack.patchCardInTranslation(...displayCards),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, cardDisplayEvent);

    const toGain: CardId[] = [];
    let max = Sanguosha.getCardById(displayCards[0]).CardNumber;
    let min = max;
    for (const id of displayCards) {
      const cardNumber = Sanguosha.getCardById(id).CardNumber;
      cardNumber > max && (max = cardNumber);
      cardNumber < min && (min = cardNumber);
    }

    toGain.push(...displayCards.filter(id => Sanguosha.getCardById(id).CardNumber === max));
    min !== max && toGain.push(...displayCards.filter(id => Sanguosha.getCardById(id).CardNumber === min));

    await room.moveCards({
      movingCards: toGain.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
      toId: event.fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: event.fromId,
      triggeredBySkills: [this.Name],
    });

    const leftCards = displayCards.filter(id => !toGain.includes(id));
    if (leftCards.length > 0) {
      if (
        leftCards.length === 2 &&
        Math.abs(Sanguosha.getCardById(leftCards[0]).CardNumber - Sanguosha.getCardById(leftCards[1]).CardNumber) <
          room.AlivePlayers.length
      ) {
        const minimun = room.getOtherPlayers(event.fromId).reduce<number>((min, player) => {
          player.getCardIds(PlayerCardsArea.HandArea).length < min &&
            (min = player.getCardIds(PlayerCardsArea.HandArea).length);
          return min;
        }, room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea).length);

        const players = room.AlivePlayers.filter(
          player => player.getCardIds(PlayerCardsArea.HandArea).length === minimun,
        ).map(player => player.Id);
        const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          {
            players,
            toId: event.fromId,
            requiredAmount: 1,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: do you want to choose a target to give him {1}',
              this.Name,
              TranslationPack.patchCardInTranslation(...leftCards),
            ).extract(),
            triggeredBySkills: [this.Name],
          },
          event.fromId,
        );

        if (resp.selectedPlayers && resp.selectedPlayers.length > 0) {
          await room.moveCards({
            movingCards: leftCards.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
            toId: resp.selectedPlayers[0],
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActiveMove,
            proposer: event.fromId,
            triggeredBySkills: [this.Name],
          });

          return true;
        }
      }

      await room.moveCards({
        movingCards: leftCards.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
        toArea: CardMoveArea.DropStack,
        moveReason: CardMoveReason.PlaceToDropStack,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}

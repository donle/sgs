import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  CommonSkill,
  OnDefineReleaseTiming,
  PersistentSkill,
  ShadowSkill,
  TriggerSkill,
} from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'daoshu', description: 'daoshu_description' })
export class DaoShu extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.getFlag<boolean>(this.Name);
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const options = ['spade', 'club', 'diamond', 'heart'];

    const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
      options,
      conversation: TranslationPack.translationJsonPatcher('{0}: please choose a card suit', this.Name).extract(),
      toId: fromId,
      triggeredBySkills: [this.Name],
    });

    const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      askForChooseEvent,
      fromId,
    );

    resp.selectedOption = resp.selectedOption || options[3];

    let suit = CardSuit.Spade;
    switch (resp.selectedOption) {
      case options[1]:
        suit = CardSuit.Club;
        break;
      case options[2]:
        suit = CardSuit.Diamond;
        break;
      case options[3]:
        suit = CardSuit.Heart;
        break;
      default:
        break;
    }

    const toId = toIds[0];
    const target = room.getPlayerById(toId);

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      {
        fromId,
        toId,
        options: {
          [PlayerCardsArea.HandArea]: target.getCardIds(PlayerCardsArea.HandArea).length,
        },
        triggeredBySkills: [this.Name],
      },
      fromId,
    );

    if (response.selectedCardIndex !== undefined) {
      const cardIds = target.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    if (response.selectedCard !== undefined) {
      await room.moveCards({
        movingCards: [{ card: response.selectedCard, fromArea: response.fromArea }],
        fromId: toId,
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: fromId,
        movedByReason: this.Name,
      });

      const cardSuit = Sanguosha.getCardById(response.selectedCard).Suit;
      if (cardSuit === suit) {
        await room.damage({
          fromId,
          toId,
          damage: 1,
          damageType: DamageType.Normal,
          triggeredBySkills: [this.Name],
        });
      } else {
        room.setFlag<boolean>(fromId, this.Name, true);
        const from = room.getPlayerById(fromId);
        const hands = from.getCardIds(PlayerCardsArea.HandArea);

        const restHands = hands.filter(card => Sanguosha.getCardById(card).Suit !== cardSuit);
        if (restHands.length > 0) {
          const allSuits = [CardSuit.Spade, CardSuit.Club, CardSuit.Diamond, CardSuit.Heart];
          const matcher = allSuits.filter(oneSuit => oneSuit !== cardSuit);

          const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
            GameEventIdentifiers.AskForCardEvent,
            EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardEvent>({
              cardAmount: 1,
              toId: fromId,
              reason: this.Name,
              conversation: TranslationPack.translationJsonPatcher(
                '{0}: please give {1} a hand card except the card with suit {2}',
                this.Name,
                TranslationPack.patchPlayerInTranslation(target),
              ).extract(),
              fromArea: [PlayerCardsArea.HandArea],
              cardMatcher: new CardMatcher({ suit: [...matcher] }).toSocketPassenger(),
              triggeredBySkills: [this.Name],
            }),
            fromId,
          );

          response.selectedCards =
            response.selectedCards.length > 0
              ? response.selectedCards
              : [restHands[Math.floor(Math.random() * restHands.length)]];

          await room.moveCards({
            movingCards: [{ card: response.selectedCards[0], fromArea: CardMoveArea.HandArea }],
            fromId,
            toId,
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActiveMove,
            proposer: fromId,
          });
        } else {
          room.broadcast(GameEventIdentifiers.CardDisplayEvent, {
            fromId,
            displayCards: hands,
            translationsMessage: TranslationPack.translationJsonPatcher(
              '{0} display hand card {1}',
              TranslationPack.patchPlayerInTranslation(from),
              TranslationPack.patchCardInTranslation(...hands),
            ).extract(),
          });
        }
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: DaoShu.Name, description: DaoShu.Description })
export class DaoShuShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
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

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return content.from === PlayerPhase.PlayCardStage && owner.getFlag<boolean>(this.GeneralName);
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}

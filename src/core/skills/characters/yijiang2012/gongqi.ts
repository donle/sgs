import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_ATTACK_RANGE, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { ActiveSkill, CommonSkill, OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'gongqi', description: 'gongqi_description' })
export class GongQi extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets(): number {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, cardIds } = event;
    if (!cardIds) {
      return false;
    }

    const suit = Sanguosha.getCardById(cardIds[0]).Suit;
    await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);
    const suits = room.getFlag<CardSuit[]>(fromId, this.Name) || [];
    suits.push(suit);
    room.setFlag<CardSuit[]>(
      fromId,
      this.Name,
      suits,
      TranslationPack.translationJsonPatcher(
        'gongqi suits: {0}',
        suits.reduce<string>((suitString, suit) => {
          return suitString + Functional.getCardSuitCharText(suit);
        }, ''),
      ).toString(),
    );

    if (Sanguosha.getCardById(cardIds[0]).is(CardType.Equip)) {
      const targets = room
        .getOtherPlayers(fromId)
        .filter(player => player.getPlayerCards().length > 0)
        .map(player => player.Id);
      if (targets.length > 0) {
        const { selectedPlayers } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          {
            players: targets,
            toId: fromId,
            requiredAmount: 1,
            conversation: 'gongqi: do you want to drop one card of another player?',
            triggeredBySkills: [this.Name],
          },
          fromId,
        );

        if (selectedPlayers && selectedPlayers.length === 1) {
          const toId = selectedPlayers[0];
          const to = room.getPlayerById(toId);
          const options: CardChoosingOptions = {
            [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
            [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
          };

          const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
            GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
            EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>({
              fromId,
              toId,
              options,
              triggeredBySkills: [this.Name],
            }),
            fromId,
          );

          if (response.selectedCardIndex !== undefined) {
            const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
            response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
          } else if (response.selectedCard === undefined) {
            const cardIds = to.getPlayerCards();
            response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
          }

          await room.dropCards(CardMoveReason.PassiveDrop, [response.selectedCard], toId, fromId, this.Name);
        }
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: GongQi.Name, description: GongQi.Description })
export class GongQiBuff extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakFinalAttackRange(room: Room, owner: Player): number {
    return owner.getFlag<CardSuit[]>(this.GeneralName) ? INFINITE_ATTACK_RANGE : -1;
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    const suits = owner.getFlag<CardSuit[]>(this.GeneralName);
    if (!suits || suits.length === 0) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'], suit: suits }));
    } else {
      match =
        suits.includes(Sanguosha.getCardById(cardId).Suit) && Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return INFINITE_TRIGGERING_TIMES;
    } else {
      return 0;
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: GongQiBuff.Name, description: GongQiBuff.Description })
export class GongQiClear extends TriggerSkill implements OnDefineReleaseTiming {
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
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PhaseFinish &&
      owner.getFlag<CardSuit[]>(this.GeneralName) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}

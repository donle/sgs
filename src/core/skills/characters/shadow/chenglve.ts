import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import {
  ActiveSkill,
  OnDefineReleaseTiming,
  RulesBreakerSkill,
  SwitchSkillState,
  TriggerSkill,
} from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill, SwitchSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@SwitchSkill()
@CommonSkill({ name: 'chenglve', description: 'chenglve_description' })
export class ChengLve extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId, selectedCards: CardId[]): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);
    const skillState = from.getSwitchSkillState(this.Name) === SwitchSkillState.Yang;
    await room.drawCards(skillState ? 1 : 2, fromId, 'top', fromId, this.Name);

    const dropNum = skillState ? 2 : 1;

    const response = await room.askForCardDrop(fromId, dropNum, [PlayerCardsArea.HandArea], true, undefined, this.Name);
    if (response.droppedCards.length === 0) {
      return false;
    }

    const toDrop = response.droppedCards;
    const suits = toDrop.reduce<CardSuit[]>((allSuit, cardId) => {
      const suit = Sanguosha.getCardById(cardId).Suit;
      allSuit.includes(suit) || allSuit.push(suit);
      return allSuit;
    }, []);

    await room.dropCards(CardMoveReason.SelfDrop, toDrop, fromId, fromId, this.Name);
    room.setFlag<CardSuit[]>(
      fromId,
      this.Name,
      suits,
      TranslationPack.translationJsonPatcher(
        'chenglve suits: {0}',
        suits.reduce<string>((suitString, suit) => suitString + Functional.getCardSuitCharText(suit), ''),
      ).toString(),
    );

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ChengLve.Name, description: ChengLve.Description })
export class ChengLveShadow extends TriggerSkill implements OnDefineReleaseTiming {
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

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PlayCardStage &&
      owner.getFlag<number>(this.GeneralName) !== undefined
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

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ChengLveShadow.Name, description: ChengLveShadow.Description })
export class ChengLveBuff extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    const suits = owner.getFlag<CardSuit[]>(this.GeneralName);
    if (!suits || suits.length === 0) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ suit: suits }));
    } else {
      match = suits.includes(Sanguosha.getCardById(cardId).Suit);
    }

    if (match) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    const suits = owner.getFlag<CardSuit[]>(this.GeneralName);
    if (!suits || suits.length === 0) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ suit: suits }));
    } else {
      match = suits.includes(Sanguosha.getCardById(cardId).Suit);
    }

    if (match) {
      return INFINITE_TRIGGERING_TIMES;
    } else {
      return 0;
    }
  }
}

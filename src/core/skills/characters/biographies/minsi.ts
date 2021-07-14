import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardColor, CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE } from 'core/game/game_props';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import {
  ActiveSkill,
  CommonSkill,
  OnDefineReleaseTiming,
  RulesBreakerSkill,
  ShadowSkill,
  TriggerSkill,
} from 'core/skills/skill';
import { PersistentSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'minsi', description: 'minsi_description' })
export class MinSi extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getPlayerCards().length > 0;
  }

  public numberOfTargets(): number {
    return 0;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return (
      cards.length > 0 &&
      cards.reduce<number>((sum, id) => {
        return (sum += Sanguosha.getCardById(id).CardNumber);
      }, 0) === 13
    );
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId, selectedCards: CardId[]): boolean {
    if (selectedCards.length > 0) {
      return (
        Sanguosha.getCardById(cardId).CardNumber <=
        13 -
          selectedCards.reduce<number>((sum, id) => {
            return (sum += Sanguosha.getCardById(id).CardNumber);
          }, 0)
      );
    }

    return Sanguosha.getCardById(cardId).CardNumber <= 13;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const cardIds = Precondition.exists(event.cardIds, 'Unable to get minsi cards');
    await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);

    const cards = await room.drawCards(cardIds.length * 2, fromId, 'top', fromId, this.Name);
    room.setFlag<CardId[]>(fromId, this.Name, cards);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: MinSi.Name, description: MinSi.Description })
export class MinSiShadow extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage: AllStage,
  ): boolean {
    return (
      EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForCardDropEvent ||
      stage === PhaseChangeStage.PhaseChanged
    );
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return true;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ) {
    let canTrigger = false;
    if (EventPacker.getIdentifier(content) === GameEventIdentifiers.AskForCardDropEvent) {
      canTrigger = room.CurrentPlayerPhase === PlayerPhase.DropCardStage && room.CurrentPhasePlayer.Id === owner.Id;
    } else if (EventPacker.getIdentifier(content) === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      canTrigger = phaseChangeEvent.from === PlayerPhase.PhaseFinish;
    }

    return canTrigger && owner.getFlag<boolean>(this.GeneralName) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AskForCardDropEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.AskForCardDropEvent) {
      const askForCardDropEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>;
      const player = room.getPlayerById(askForCardDropEvent.toId);
      const cardIds = player.getFlag<CardId[]>(this.GeneralName);

      if (cardIds.length > 0) {
        const hands = player.getCardIds(PlayerCardsArea.HandArea);
        const minSiCards = hands.filter(
          card => cardIds.includes(card) && Sanguosha.getCardById(card).Color === CardColor.Red,
        );
        const discardAmount = hands.length - minSiCards.length - player.getMaxCardHold(room);

        askForCardDropEvent.cardAmount = discardAmount;
        askForCardDropEvent.except = askForCardDropEvent.except
          ? [...askForCardDropEvent.except, ...minSiCards]
          : minSiCards;
      }
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      room.removeFlag(event.fromId, this.GeneralName);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: MinSiShadow.Name, description: MinSiShadow.Description })
export class MinSiUnlimited extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (!room.getFlag<CardId[]>(owner.Id, this.GeneralName) || cardId instanceof CardMatcher) {
      return 0;
    }

    if (
      room.getFlag<CardId[]>(owner.Id, this.GeneralName).includes(cardId) &&
      Sanguosha.getCardById(cardId).Color === CardColor.Black
    ) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }
}

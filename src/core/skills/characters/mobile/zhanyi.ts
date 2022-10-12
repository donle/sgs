import { CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { WuXieKeJi } from 'core/cards/standard/wuxiekeji';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import {
  AimStage,
  AllStage,
  CardEffectStage,
  CardUseStage,
  PhaseChangeStage,
  PlayerPhase,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { System } from 'core/shares/libs/system';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { ActiveSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill, SideEffectSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhanyi', description: 'zhanyi_description' })
export class ZhanYi extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) && owner.getPlayerCards().length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public numberOfTargets() {
    return 0;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.cardIds) {
      return false;
    }
    const typeDiscarded = Sanguosha.getCardById(event.cardIds[0]).BaseType;
    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId, event.fromId, this.Name);

    await room.loseHp(event.fromId, 1);
    if (!room.getPlayerById(event.fromId).Dead) {
      room.setFlag<CardType>(
        event.fromId,
        this.Name,
        typeDiscarded,
        TranslationPack.translationJsonPatcher(
          'zhanyi: {0}',
          Functional.getCardBaseTypeAbbrRawText(typeDiscarded),
        ).toString(),
      );

      if (typeDiscarded === CardType.Basic) {
        room.installSideEffectSkill(System.SideEffectSkillApplierEnum.ZhanYi, ZhanYiSide.Name, event.fromId);
      } else if (typeDiscarded === CardType.Trick) {
        await room.drawCards(3, event.fromId, 'top', event.fromId, this.Name);
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ZhanYi.Name, description: ZhanYi.Description })
export class ZhanYiShadow extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage !== AimStage.AfterAim;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return (
      stage === CardUseStage.BeforeCardUseEffect ||
      stage === CardEffectStage.PreCardEffect ||
      stage === AimStage.AfterAim ||
      stage === PhaseChangeStage.PhaseChanged
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<
      | GameEventIdentifiers.CardUseEvent
      | GameEventIdentifiers.CardEffectEvent
      | GameEventIdentifiers.AimEvent
      | GameEventIdentifiers.PhaseChangeEvent
    >,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        cardUseEvent.fromId === owner.Id &&
        Sanguosha.getCardById(cardUseEvent.cardId).is(CardType.Basic) &&
        !owner.getFlag<boolean>(this.Name) &&
        owner.getFlag<CardType>(this.GeneralName) === CardType.Basic
      );
    } else if (identifier === GameEventIdentifiers.CardEffectEvent) {
      const cardEffectEvent = event as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      return (
        cardEffectEvent.fromId === owner.Id &&
        Sanguosha.getCardById(cardEffectEvent.cardId).is(CardType.Trick) &&
        owner.getFlag<CardType>(this.GeneralName) === CardType.Trick
      );
    } else if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = event as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      return (
        aimEvent.fromId === owner.Id &&
        AimGroupUtil.getAllTargets(aimEvent.allTargets).length === 1 &&
        Sanguosha.getCardById(aimEvent.byCardId).GeneralName === 'slash' &&
        room.getPlayerById(aimEvent.toId).getPlayerCards().length > 0 &&
        owner.getFlag<CardType>(this.GeneralName) === CardType.Equip
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.from === PlayerPhase.PlayCardStage &&
        phaseChangeEvent.fromPlayer === owner.Id &&
        owner.getFlag<CardType>(this.GeneralName) !== undefined
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      | GameEventIdentifiers.CardUseEvent
      | GameEventIdentifiers.CardEffectEvent
      | GameEventIdentifiers.AimEvent
      | GameEventIdentifiers.PhaseChangeEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      cardUseEvent.additionalDamage = (cardUseEvent.additionalDamage || 0) + 1;
      cardUseEvent.additionalRecoveredHp = (cardUseEvent.additionalRecoveredHp || 0) + 1;

      room.getPlayerById(event.fromId).setFlag<boolean>(this.Name, true);
    } else if (identifier === GameEventIdentifiers.CardEffectEvent) {
      const cardEffectEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      cardEffectEvent.disresponsiveCards = cardEffectEvent.disresponsiveCards || [];
      cardEffectEvent.disresponsiveCards.push(WuXieKeJi.name);
    } else if (identifier === GameEventIdentifiers.AimEvent) {
      const toId = (unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>).toId;
      const response = await room.askForCardDrop(
        toId,
        2,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        undefined,
        this.GeneralName,
      );
      if (response.droppedCards.length > 0) {
        await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toId, event.fromId, this.GeneralName);

        const toGain = response.droppedCards.filter(cardId => room.isCardInDropStack(cardId));
        if (toGain.length > 0) {
          const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardEvent>(
            GameEventIdentifiers.AskForChoosingCardEvent,
            {
              toId: event.fromId,
              cardIds: toGain,
              amount: 1,
              customTitle: 'zhanyi: please choose one of these cards to gain',
            },
            event.fromId,
            true,
          );

          resp.selectedCards = resp.selectedCards || [toGain[0]];

          await room.moveCards({
            movingCards: [{ card: resp.selectedCards[0], fromArea: CardMoveArea.DropStack }],
            toId: event.fromId,
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActivePrey,
            proposer: event.fromId,
            triggeredBySkills: [this.Name],
          });
        }
      }
    } else {
      if (room.getFlag<CardType>(event.fromId, this.GeneralName) === CardType.Basic) {
        room.uninstallSideEffectSkill(System.SideEffectSkillApplierEnum.ZhanYi);
      }
      room.removeFlag(event.fromId, this.GeneralName);

      room.getPlayerById(event.fromId).removeFlag(this.Name);
    }

    return true;
  }
}

@SideEffectSkill
@PersistentSkill()
@CommonSkill({ name: 'side_zhanyi_s', description: 'side_zhanyi_s_description' })
export class ZhanYiSide extends ViewAsSkill {
  public canViewAs(): string[] {
    return Sanguosha.getCardNameByType(types => types.includes(CardType.Basic));
  }

  public canUse(
    room: Room,
    owner: Player,
    event?: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>,
  ): boolean {
    const identifier = event && EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
      return (
        Sanguosha.getCardNameByType(types => types.includes(CardType.Basic)).find(name =>
          owner.canUseCard(room, new CardMatcher({ name: [name] }), new CardMatcher(event!.cardMatcher)),
        ) !== undefined
      );
    }

    return (
      identifier !== GameEventIdentifiers.AskForCardResponseEvent &&
      Sanguosha.getCardNameByType(types => types.includes(CardType.Basic)).find(name =>
        owner.canUseCard(room, new CardMatcher({ name: [name] })),
      ) !== undefined
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return Sanguosha.getCardById(pendingCardId).is(CardType.Basic);
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    Precondition.assert(!!viewAs, 'Unknown zhanyi card');
    return VirtualCard.create(
      {
        cardName: viewAs,
        bySkill: ZhanYi.Name,
      },
      selectedCards,
    );
  }
}

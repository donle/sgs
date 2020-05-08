import { VirtualCard } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { WuXieKeJi } from 'core/cards/standard/wuxiekeji';
import {
  CardLostReason,
  CardObtainedReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, TurnOverStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'jiewei', description: 'jiewei_description' })
export class JieWei extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['wuxiekeji'];
  }

  public canUse(room: Room, owner: Player): boolean {
    return (
      owner.canUseCard(room, new CardMatcher({ name: ['wuxiekeji'] })) &&
      owner.getCardIds(PlayerCardsArea.EquipArea).length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }
  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return owner.cardFrom(pendingCardId) === PlayerCardsArea.EquipArea;
  }

  public viewAs(selectedCards: CardId[]) {
    return VirtualCard.create<WuXieKeJi>(
      {
        cardName: 'wuxiekeji',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@CommonSkill({ name: 'jiewei', description: 'jjiewei_description' })
export class JieWeiShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerTurnOverEvent>, stage: AllStage): boolean {
    if (stage === TurnOverStage.TurnedOver) {
      return true;
    }
    return false;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PlayerTurnOverEvent>,
  ): boolean {
    return owner.Id === event.toId && owner.isFaceUp();
  }

  public cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return /* targets.length === 0 || */ targets.length === 2;
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    const to = room.getPlayerById(target);
    const equiprCardIds = to.getCardIds(PlayerCardsArea.EquipArea);
    const judgeCardIds = to.getCardIds(PlayerCardsArea.JudgeArea);

    if (selectedTargets.length === 0) {
      return equiprCardIds.length + judgeCardIds.length > 0;
    } else if (selectedTargets.length === 1) {
      const from = room.getPlayerById(selectedTargets[0]);

      const fromEquipArea = from
        .getCardIds(PlayerCardsArea.EquipArea)
        .map(id => Sanguosha.getCardById(id) as EquipCard);
      for (const card of fromEquipArea) {
        const equipment = room.getPlayerById(target).getEquipment(card.EquipType);
        if (equipment === undefined) {
          return true;
        }
      }

      const fromJudgeArea = from.getCardIds(PlayerCardsArea.JudgeArea).map(id => Sanguosha.getCardById(id).GeneralName);
      const toJudgeArea = judgeCardIds.map(id => Sanguosha.getCardById(id).GeneralName);
      for (const cardName of fromJudgeArea) {
        if (!toJudgeArea.includes(cardName)) {
          return true;
        }
      }
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    await room.dropCards(
      CardLostReason.ActiveDrop,
      skillUseEvent.cardIds!,
      skillUseEvent.fromId,
      skillUseEvent.fromId,
      this.Name,
    );

    const moveFrom = room.getPlayerById(skillUseEvent.toIds![0]);
    const moveTo = room.getPlayerById(skillUseEvent.toIds![1]);
    const canMovedEquipCardIds: CardId[] = [];
    const canMovedJudgeCardIds: CardId[] = [];

    const fromEquipArea = moveFrom
      .getCardIds(PlayerCardsArea.EquipArea)
      .map(id => Sanguosha.getCardById(id) as EquipCard);

    for (const card of fromEquipArea) {
      const equipment = moveTo.getEquipment(card.EquipType);
      if (equipment === undefined) {
        canMovedEquipCardIds.push(card.Id);
      }
    }

    const fromJudgeArea = moveFrom.getCardIds(PlayerCardsArea.JudgeArea).map(id => Sanguosha.getCardById(id));
    const toJudgeArea = moveTo.getCardIds(PlayerCardsArea.JudgeArea).map(id => Sanguosha.getCardById(id).GeneralName);

    for (const card of fromJudgeArea) {
      if (!toJudgeArea.includes(card.GeneralName)) {
        canMovedJudgeCardIds.push(card.Id);
      }
    }

    const options: CardChoosingOptions = {
      [PlayerCardsArea.JudgeArea]: canMovedJudgeCardIds,
      [PlayerCardsArea.EquipArea]: canMovedEquipCardIds,
    };

    const chooseCardEvent = {
      fromId: skillUseEvent.fromId,
      toId: skillUseEvent.fromId,
      options,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
      skillUseEvent.fromId,
    );

    const response = await room.onReceivingAsyncReponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      skillUseEvent.fromId,
    );

    await room.moveCards(
      [response.selectedCard!],
      skillUseEvent.toIds![0],
      skillUseEvent.toIds![1],
      CardLostReason.PassiveMove,
      response.fromArea,
      response.fromArea!,
      CardObtainedReason.PassiveObtained,
      chooseCardEvent.fromId,
      this.Name,
    );

    return true;
  }
}

import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'shanxi', description: 'shanxi_description' })
export class ShanXi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PlayCardStageStart &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableCard(owner: string, room: Room, cardId: CardId): boolean {
    return Sanguosha.getCardById(cardId).isRed() && Sanguosha.getCardById(cardId).is(CardType.Basic);
  }

  public isAvailableTarget(owner: string, room: Room, target: string): boolean {
    return target !== owner && room.getPlayerById(target).getPlayerCards().length > 0;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds || !event.cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId, event.fromId, this.Name);

    const toId = event.toIds[0];

    const to = room.getPlayerById(toId);
    const handCardIds = to.getCardIds(PlayerCardsArea.HandArea);
    const equipCardIds = to.getCardIds(PlayerCardsArea.EquipArea);

    const { selectedCards, selectedCardsIndex } =
      await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardWithConditionsEvent>(
        GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
        {
          toId,
          customCardFields: {
            [PlayerCardsArea.HandArea]: handCardIds.length,
            [PlayerCardsArea.EquipArea]: equipCardIds,
          },
          customTitle: this.Name,
          amount: [1, room.getPlayerById(event.fromId).Hp],
          triggeredBySkills: [this.Name],
        },
        event.fromId,
        true,
      );

    const movingCards: { card: CardId; fromArea: PlayerCardsArea | undefined }[] = selectedCards
      ? selectedCards.map(id => ({ card: id, fromArea: to.cardFrom(id) }))
      : [];

    for (const card of selectedCardsIndex ? Algorithm.randomPick(selectedCardsIndex.length, handCardIds) : []) {
      movingCards.push({ card, fromArea: PlayerCardsArea.HandArea });
    }

    await room.moveCards({
      movingCards,
      fromId: to.Id,
      toId: to.Id,
      toArea: PlayerCardsArea.OutsideArea,
      moveReason: CardMoveReason.PassiveMove,
      proposer: event.fromId,
      toOutsideArea: this.GeneralName,
      movedByReason: this.GeneralName,
    });

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ShanXi.Name, description: ShanXi.Description })
export class ShanXiClear extends TriggerSkill implements OnDefineReleaseTiming {
  public async shanxiClear(room: Room): Promise<void> {
    for (const player of room.getAlivePlayersFrom()) {
      const shanxiCard = player.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName);
      if (shanxiCard.length) {
        await room.moveCards({
          movingCards: shanxiCard.map(id => ({ card: id, fromArea: PlayerCardsArea.OutsideArea })),
          fromId: player.Id,
          toId: player.Id,
          toArea: PlayerCardsArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: player.Id,
          movedByReason: this.GeneralName,
        });
      }
    }
  }

  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public afterDead(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public async whenDead(room: Room, player: Player): Promise<void> {
    if (room.CurrentPhasePlayer === player) {
      await this.shanxiClear(room);
    }
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return event.from === PlayerPhase.PhaseFinish;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room): Promise<boolean> {
    await this.shanxiClear(room);

    return true;
  }
}

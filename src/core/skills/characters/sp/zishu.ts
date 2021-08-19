import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CompulsorySkill, OnDefineReleaseTiming, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'zishu', description: 'zishu_description' })
export class ZiShu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    if (room.CurrentPlayer === owner) {
      return false;
    }

    return (
      content.infos.find(
        info =>
          !info.movedByReason?.includes(this.Name) && info.toId === owner.Id && info.toArea === CardMoveArea.HandArea,
      ) !== undefined
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const from = room.getPlayerById(fromId);
    const moveCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;

    if (room.CurrentPlayer.Id === fromId) {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    } else {
      const zishuCards = from.getFlag<CardId[]>(this.Name) || [];
      if (moveCardEvent.infos.length === 1) {
        zishuCards.push(...moveCardEvent.infos[0].movingCards.map(card => card.card));
      } else {
        const infos = moveCardEvent.infos.filter(info => info.toId === fromId && info.toArea === CardMoveArea.HandArea);
        for (const info of infos) {
          zishuCards.push(...info.movingCards.map(card => card.card));
        }
      }
      from.setFlag<CardId[]>(this.Name, zishuCards);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: ZiShu.Name, description: ZiShu.Description })
export class ZiShuShadow extends TriggerSkill implements OnDefineReleaseTiming {
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

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return owner.getFlag<CardId[]>(this.GeneralName) && content.from === PlayerPhase.PhaseFinish;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);

    if (from.getCardIds(PlayerCardsArea.HandArea).length > 0) {
      const zishuCards = from.getFlag<CardId[]>(this.GeneralName);
      const restCards = zishuCards.filter(cardId => from.getCardIds(PlayerCardsArea.HandArea).includes(cardId));

      if (restCards.length > 0) {
        await room.moveCards({
          movingCards: restCards.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
          fromId,
          toArea: CardMoveArea.DropStack,
          moveReason: CardMoveReason.PlaceToDropStack,
          proposer: fromId,
          triggeredBySkills: [this.GeneralName],
        });
      }
    }

    room.removeFlag(fromId, this.GeneralName);

    return true;
  }
}

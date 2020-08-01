import { CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'tuntian', description: 'tuntian_description' })
export class TunTian extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    if (owner.Id !== content.fromId || room.CurrentPhasePlayer === owner) {
      return false;
    }

    const yourCards = content.movingCards.filter(
      card => card.fromArea === PlayerCardsArea.HandArea || card.fromArea === PlayerCardsArea.EquipArea,
    );

    return (
      !(
        owner.Id === content.toId &&
        (content.toArea === PlayerCardsArea.HandArea || content.toArea === PlayerCardsArea.EquipArea)
      ) && yourCards.length > 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;

    const judgeEvent = await room.judge(fromId, undefined, this.Name);

    if (!room.isCardInDropStack(judgeEvent.judgeCardId)) {
      return false;
    }

    if (Sanguosha.getCardById(judgeEvent.judgeCardId).Suit !== CardSuit.Heart) {
      await room.moveCards({
        movingCards: [{ card: judgeEvent.judgeCardId, fromArea: CardMoveArea.DropStack }],
        toId: fromId,
        toArea: PlayerCardsArea.OutsideArea,
        moveReason: CardMoveReason.ActiveMove,
        toOutsideArea: this.Name,
        isOutsideAreaInPublic: true,
        proposer: fromId,
        movedByReason: this.Name,
      });
    } else if (Sanguosha.getCardById(judgeEvent.judgeCardId).Suit === CardSuit.Heart) {
      await room.moveCards({
        movingCards: [{ card: judgeEvent.judgeCardId, fromArea: CardMoveArea.DropStack }],
        toId: fromId,
        toArea: PlayerCardsArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: fromId,
        movedByReason: this.Name,
      });
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: TunTian.Name, description: TunTian.Description })
export class TunTianShadow extends RulesBreakerSkill {
  public breakOffenseDistance(room: Room, owner: Player) {
    return owner.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length;
  }
}

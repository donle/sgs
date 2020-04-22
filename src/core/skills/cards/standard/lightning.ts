import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardLostReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill, SelfTargetSkill } from 'core/skills/skill';

@CommonSkill({ name: 'lightning', description: 'lightning_description' })
@SelfTargetSkill
export class LightningSkill extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return (
      owner
        .getCardIds(PlayerCardsArea.JudgeArea)
        .find(cardId => Sanguosha.getCardById(cardId).GeneralName === 'lightning') === undefined
    );
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 0;
  }
  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }
  public isAvailableTarget(): boolean {
    return false;
  }
  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    for (const player of room.getAlivePlayersFrom(event.fromId)) {
      if (room.isAvailableTarget(event.cardId, event.fromId, player.Id)) {
        await room.moveCards(
          [event.cardId],
          undefined,
          player.Id,
          CardLostReason.CardUse,
          undefined,
          PlayerCardsArea.JudgeArea,
        );
        event.toIds = [player.Id];
        break;
      }
    }

    return true;
  }

  public async moveToNextPlayer(room: Room, cardId: CardId, currentPlayer: PlayerId) {
    let player: Player | undefined;
    while (true) {
      player = room.getNextAlivePlayer(player ? player.Id : currentPlayer);
      if (player.Id === currentPlayer) {
        break;
      }

      const skip =
        !room.canUseCardTo(cardId, player.Id) ||
        player
          .getCardIds(PlayerCardsArea.JudgeArea)
          .find(cardId => Sanguosha.getCardById(cardId).GeneralName === 'lightning') !== undefined;

      if (skip) {
        continue;
      }

      if (player.Id !== currentPlayer) {
        await room.moveCards([cardId], undefined, player.Id, undefined, undefined, PlayerCardsArea.JudgeArea);
      }
      break;
    }
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, cardId } = event;

    const judgeEvent = await room.judge(
      Precondition.exists(toIds, 'Unknown targets in lightning')[0],
      cardId,
      this.Name,
    );

    const card = Sanguosha.getCardById(judgeEvent.judgeCardId);
    if (card.Suit === CardSuit.Spade && card.CardNumber >= 2 && card.CardNumber <= 9) {
      const damageEvent: ServerEventFinder<GameEventIdentifiers.DamageEvent> = {
        damageType: DamageType.Thunder,
        damage: 3,
        toId: judgeEvent.toId,
        cardIds: [event.cardId],
        triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.Name] : [this.Name],
      };

      await room.damage(damageEvent);
    } else {
      await this.moveToNextPlayer(room, cardId, judgeEvent.toId);
    }
    return true;
  }

  public async onEffectRejected(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    await this.moveToNextPlayer(room, event.cardId, event.toIds![0]);
  }
}

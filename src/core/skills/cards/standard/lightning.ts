import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { JudgeMatcher, JudgeMatcherEnum } from 'core/shares/libs/judge_matchers';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill, SelfTargetSkill } from 'core/skills/skill';
import { ExtralCardSkillProperty } from '../interface/extral_property';

@CommonSkill({ name: 'lightning', description: 'lightning_description' })
@SelfTargetSkill
export class LightningSkill extends ActiveSkill implements ExtralCardSkillProperty {
  public canUse(room: Room, owner: Player, containerCard?: CardId) {
    let canUseTo = true;
    if (containerCard) {
      canUseTo = owner.canUseCardTo(room, containerCard, owner.Id);
    }

    return (
      owner
        .getCardIds(PlayerCardsArea.JudgeArea)
        .find(cardId => Sanguosha.getCardById(cardId).GeneralName === 'lightning') === undefined && canUseTo
    );
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }

  public isCardAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return (
      room.getPlayerById(owner).canUseCardTo(room, containerCard, target) &&
      room
        .getPlayerById(target)
        .getCardIds(PlayerCardsArea.JudgeArea)
        .find(cardId => Sanguosha.getCardById(cardId).GeneralName === 'lightning') === undefined
    );
  }

  public isAvailableTarget(): boolean {
    return false;
  }
  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    event.targetGroup = [[event.fromId]];

    return true;
  }

  public async moveToNextPlayer(room: Room, cardId: CardId, currentPlayer: PlayerId) {
    let player: Player | undefined;
    while (true) {
      player = room.getNextAlivePlayer(player ? player.Id : currentPlayer);
      if (player.Id === currentPlayer) {
        await room.moveCards({
          movingCards: [{ card: cardId, fromArea: CardMoveArea.ProcessingArea }],
          toArea: CardMoveArea.JudgeArea,
          toId: currentPlayer,
          moveReason: CardMoveReason.PassiveMove,
        });
        break;
      }

      const skip =
        !room.canUseCardTo(cardId, player, player) ||
        player
          .getCardIds(PlayerCardsArea.JudgeArea)
          .find(cardId => Sanguosha.getCardById(cardId).GeneralName === this.Name) !== undefined;

      if (skip) {
        continue;
      }

      await room.moveCards({
        fromId: currentPlayer,
        movingCards: [{ card: cardId, fromArea: CardMoveArea.ProcessingArea }],
        toArea: CardMoveArea.JudgeArea,
        toId: player.Id,
        moveReason: CardMoveReason.PassiveMove,
      });
      break;
    }
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, cardId } = event;

    const judgeEvent = await room.judge(
      Precondition.exists(toIds, 'Unknown targets in lightning')[0],
      cardId,
      this.Name,
      JudgeMatcherEnum.Lightning,
    );

    const card = Sanguosha.getCardById(judgeEvent.judgeCardId);
    if (JudgeMatcher.onJudge(judgeEvent.judgeMatcherEnum!, card)) {
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

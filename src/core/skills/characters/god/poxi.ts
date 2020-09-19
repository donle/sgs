import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { GameCommonRules } from 'core/game/game_rules';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { System } from 'core/shares/libs/system';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'poxi', description: 'poxi_description' })
export class PoXi extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public cardFilter() {
    return true;
  }

  public isAvailableCard() {
    return false;
  }

  public numberOfTargets() {
    return 1;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return target !== owner && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public whenRefresh(room: Room, owner: Player) {
    if (owner.getFlag<boolean>(this.Name)) {
      owner.removeFlag(this.Name);

      room.syncGameCommonRules(owner.Id, from => {
        GameCommonRules.addAdditionalHoldCardNumber(from, 1);
      });
    }
  }

  public async onUse() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, toIds } = skillUseEvent;
    const from = room.getPlayerById(fromId);
    const to = room.getPlayerById(toIds![0]);

    const askForCards: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardWithConditionsEvent> = {
      toId: to.Id,
      cardFilter: System.AskForChoosingCardEventFilter.PoXi,
      customCardFields: {
        [from.Character.Name]: from.getCardIds(PlayerCardsArea.HandArea),
        [to.Character.Name]: to.getCardIds(PlayerCardsArea.HandArea),
      },
      customTitle: this.Name,
      amount: 4,
    };

    room.notify(GameEventIdentifiers.AskForChoosingCardWithConditionsEvent, askForCards, from.Id);
    const { selectedCards } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
      from.Id,
    );
    if (!selectedCards) {
      return false;
    }

    const fromCards = Algorithm.intersection<CardId>(from.getCardIds(PlayerCardsArea.HandArea), selectedCards);
    const toCards = Algorithm.intersection<CardId>(to.getCardIds(PlayerCardsArea.HandArea), selectedCards);

    await room.asyncMoveCards([
      {
        moveReason: CardMoveReason.SelfDrop,
        fromId: from.Id,
        movingCards: fromCards.map(card => ({ card, fromArea: PlayerCardsArea.HandArea })),
        movedByReason: this.Name,
        toArea: CardMoveArea.DropStack,
      },
      {
        moveReason: CardMoveReason.PassiveDrop,
        fromId: to.Id,
        movingCards: toCards.map(card => ({ card, fromArea: PlayerCardsArea.HandArea })),
        movedByReason: this.Name,
        toArea: CardMoveArea.DropStack,
      },
    ]);

    if (fromCards.length === 0) {
      await room.changeMaxHp(from.Id, -1);
    } else if (fromCards.length === 1) {
      from.setFlag(this.Name, true);
      room.syncGameCommonRules(from.Id, from => {
        GameCommonRules.addAdditionalHoldCardNumber(from, -1);
      });
      room.endPhase(PlayerPhase.PlayCardStage);
    } else if (fromCards.length === 3 && from.isInjured()) {
      await room.recover({
        toId: from.Id,
        recoveredHp: 1,
        recoverBy: from.Id,
      });
    } else if (fromCards.length === 4) {
      await room.drawCards(4, from.Id, undefined, from.Id, this.Name);
    }

    return true;
  }
}

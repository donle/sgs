import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'lianying', description: 'lianying_description' })
export class LianYing extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
    return stage === CardMoveStage.AfterCardMoved;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    const infos = content.infos.filter(
      info => owner.Id === info.fromId && info.movingCards.find(({ fromArea }) => fromArea === CardMoveArea.HandArea),
    );
    const canUse = infos.length > 0 && owner.getCardIds(PlayerCardsArea.HandArea).length === 0;

    if (canUse) {
      const num = infos.reduce<number>(
        (sum, info) => sum + info.movingCards.filter(card => card.fromArea === CardMoveArea.HandArea).length,
        0,
      );
      room.setFlag(owner.Id, this.Name, num);
    }

    return canUse;
  }

  targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length > 0;
  }

  isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ) {
    const numberOfTargets = room.getFlag<number>(owner, this.Name);
    return selectedTargets.length < numberOfTargets;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = skillUseEvent;
    for (const toId of toIds!) {
      await room.drawCards(1, toId, 'top', fromId, this.Name);
    }
    return true;
  }
}

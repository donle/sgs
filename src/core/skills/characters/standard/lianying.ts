import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
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
    const lostCards = content.movingCards.filter(({ fromArea }) => fromArea === PlayerCardsArea.HandArea);
    room.setFlag(owner.Id, this.Name, lostCards.length);

    return (
      owner.Id === content.fromId && lostCards.length > 0 && owner.getCardIds(PlayerCardsArea.HandArea).length === 0
    );
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

import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'zongxuan', description: 'zongxuan_description' })
export class ZongXuan extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.GeneralName);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 1;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return true;
  }

  public numberOfTargets() {
    return 0;
  }

  public isAvailableTarget() {
    return true;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { cardIds } = event;
    room.putCards('top', ...cardIds!);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: ZongXuan.Name, description: ZongXuan.Description })
export class ZongXuanShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    return (
      content.fromId === owner.Id &&
      (content.moveReason === CardMoveReason.PassiveDrop || content.moveReason === CardMoveReason.SelfDrop) &&
      content.movingCards.find(node => room.isCardInDropStack(node.card)) !== undefined
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const moveCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    const cardIds = moveCardEvent.movingCards.filter(node => room.isCardInDropStack(node.card)).map(node => node.card);
    const numOfCards = cardIds.length;

    const askForGuanxing = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForPlaceCardsInDileEvent>({
      toId: fromId,
      cardIds,
      top: numOfCards,
      topStackName: 'drop stack',
      bottom: numOfCards,
      bottomStackName: 'draw stack top',
      bottomMinCard: 1,
      movable: true,
      triggeredBySkills: [this.Name],
    });

    room.notify(GameEventIdentifiers.AskForPlaceCardsInDileEvent, askForGuanxing, fromId);
    const { bottom } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForPlaceCardsInDileEvent,
      fromId,
    );

    if (bottom !== undefined) {
      room.putCards('top', ...bottom);
    } else {
      room.putCards('top', ...Algorithm.randomPick<CardId>(1, cardIds));
    }

    return true;
  }
}

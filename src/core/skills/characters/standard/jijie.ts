import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'jijie', description: 'jijie_description' })
export class JiJie extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 0;
  }
  public targetFilter(): boolean {
    return true;
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

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const displayCards = room.getCards(1, 'bottom');
    const observeCardsEvent: ServerEventFinder<GameEventIdentifiers.ObserveCardsEvent> = {
      cardIds: displayCards,
      selected: [],
    };
    room.notify(GameEventIdentifiers.ObserveCardsEvent, observeCardsEvent, skillUseEvent.fromId);

    const choosePlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      players: room.getAlivePlayersFrom().map(p => p.Id),
      toId: skillUseEvent.fromId,
      requiredAmount: 1,
      conversation: 'jijie:Please choose a target to obtain the card you show',
    };
    room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, choosePlayerEvent, skillUseEvent.fromId);

    const choosePlayerResponse = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      skillUseEvent.fromId,
    );

    const target =
      choosePlayerResponse.selectedPlayers === undefined
        ? skillUseEvent.fromId
        : choosePlayerResponse.selectedPlayers[0];

    room.notify(GameEventIdentifiers.ObserveCardFinishEvent, {}, skillUseEvent.fromId);
    await room.moveCards({
      movingCards: displayCards.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
      toId: target,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: skillUseEvent.fromId,
      movedByReason: this.Name,
      engagedPlayerIds: [target],
    });

    return true;
  }
}

import { CardObtainedReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'jijie', description: 'jijie_description' })
export class JiJie extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
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
    room.broadcast(GameEventIdentifiers.ObserveCardsEvent, observeCardsEvent);

    const choosePlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      players: room.getAlivePlayersFrom().map(p => p.Id),
      toId: skillUseEvent.fromId,
      requiredAmount: 1,
      conversation: 'jijie:Please choose a target to obtain the card you show',
    };
    room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, choosePlayerEvent, skillUseEvent.fromId);

    const choosePlayerResponse = await room.onReceivingAsyncReponseFrom(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      skillUseEvent.fromId,
    );

    const target =
      choosePlayerResponse.selectedPlayers === undefined
        ? skillUseEvent.fromId
        : choosePlayerResponse.selectedPlayers[0];

    room.broadcast(GameEventIdentifiers.ContinuouslyChoosingCardFinishEvent, {});
    await room.moveCards(
      displayCards,
      undefined,
      target,
      undefined,
      undefined,
      PlayerCardsArea.HandArea,
      CardObtainedReason.PassiveObtained,
      skillUseEvent.fromId,
      this.Name,
    );

    return true;
  }
}

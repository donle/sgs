import {
  CardLostReason,
  CardObtainedReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { AllStage, DrawCardStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'tuxi', description: 'tuxi_description' })
export class TuXi extends TriggerSkill {
  constructor() {
    super();
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage) {
    return stage === DrawCardStage.CardDrawing;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>) {
    if (owner.getFlag<number>(this.Name) !== undefined) {
      room.removeFlag(owner.Id, this.Name);
    }

    const canUse = owner.Id === content.fromId && room.CurrentPlayerPhase === PlayerPhase.DrawCardStage;
    if (canUse) {
      room.setFlag(owner.Id, this.Name, content.drawAmount);
    }

    return canUse;
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length > 0 && targets.length <= room.CurrentPhasePlayer.getFlag<number>(this.Name);
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, toIds, fromId } = skillUseEvent;
    const drawCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
    drawCardEvent.drawAmount -= toIds!.length;
    room.removeFlag(fromId, this.Name);

    for (const toId of toIds!) {
      const cardIds = room.getPlayerById(toId).getCardIds(PlayerCardsArea.HandArea);
      const askForChoosingCard: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent> = {
        fromId,
        toId,
        options: {
          [PlayerCardsArea.HandArea]: cardIds.length,
        },
        triggeredBySkills: [this.Name],
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
          askForChoosingCard,
        ),
        fromId,
      );
      const { selectedCard } = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        fromId,
      );
      await room.moveCards(
        [selectedCard ? selectedCard : cardIds[Math.floor(Math.random() * cardIds.length)]],
        toId,
        fromId,
        CardLostReason.PassiveMove,
        PlayerCardsArea.HandArea,
        PlayerCardsArea.HandArea,
        CardObtainedReason.ActivePrey,
        fromId,
        this.Name,
      );
    }

    return true;
  }
}

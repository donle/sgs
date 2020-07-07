import { CardType } from 'core/cards/card';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'jushou', description: 'jushou_description' })
export class JuShou extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.BeforeStageChange;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return owner.Id === content.playerId && PlayerPhaseStages.FinishStageStart === content.toStage;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    await room.turnOver(skillUseEvent.fromId);
    await room.drawCards(4, skillUseEvent.fromId, 'top', undefined, this.Name);

    const player = room.getPlayerById(skillUseEvent.fromId);
    const handCards = player.getCardIds(PlayerCardsArea.HandArea);
    const askForChooseCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent> = {
      toId: skillUseEvent.fromId,
      cardIds: handCards,
      amount: 1,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardEvent>(askForChooseCardEvent),
      skillUseEvent.fromId,
    );

    const { selectedCards } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardEvent,
      skillUseEvent.fromId,
    );

    const card = Sanguosha.getCardById(selectedCards![0]);
    if (card.is(CardType.Equip)) {
      const cardUseEvent = {
        fromId: skillUseEvent.fromId,
        cardId: selectedCards![0],
      };
      await room.useCard(cardUseEvent);
    } else {
      await room.dropCards(
        CardMoveReason.SelfDrop,
        selectedCards!,
        skillUseEvent.fromId,
        skillUseEvent.fromId,
        this.Name,
      );
    }

    return true;
  }
}

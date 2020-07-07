import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'qinyin', description: 'qinyin_description' })
export class QinYin extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    let isUseable = owner.Id === content.playerId && content.toStage === PlayerPhaseStages.DropCardStageEnd;
    if (isUseable) {
      let droppedCardNum = 0;
      room.Analytics.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
        event =>
          EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
          event.fromId === content.playerId &&
          event.moveReason === CardMoveReason.SelfDrop,
        content.playerId,
        true,
        [PlayerPhase.DropCardStage],
      ).forEach(event => {
        droppedCardNum += event.movingCards.length;
      });

      isUseable = droppedCardNum >= 2;
    }
    return isUseable;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options: ['qinyin:loseHp', 'qinyin:recoverHp'],
      toId: skillUseEvent.fromId,
      conversation: 'qinyin: please choose a choice to make everyone lose hp or recover hp',
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChoosingOptionsEvent),
      skillUseEvent.fromId,
    );

    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      skillUseEvent.fromId,
    );

    if (selectedOption === 'qinyin:loseHp') {
      for (const player of room.getAlivePlayersFrom()) {
        await room.loseHp(player.Id, 1);
      }
    } else if (selectedOption === 'qinyin:recoverHp') {
      for (const player of room.getAlivePlayersFrom()) {
        await room.recover({ recoveredHp: 1, recoverBy: skillUseEvent.fromId, toId: player.Id });
      }
    } else {
      return false;
    }

    return true;
  }
}

import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'qinyin', description: 'qinyin_description' })
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
      const record = room.Analytics.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
        event =>
          EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
          event.infos.find(info => info.fromId === content.playerId && info.moveReason === CardMoveReason.SelfDrop) !==
            undefined,
        content.playerId,
        'round',
        [PlayerPhase.DropCardStage],
      );

      for (const event of record) {
        if (event.infos.length === 1) {
          droppedCardNum += event.infos[0].movingCards.filter(card => !Sanguosha.isVirtualCardId(card.card)).length;
        } else {
          const infos = event.infos.filter(
            info => info.fromId === content.playerId && info.moveReason === CardMoveReason.SelfDrop,
          );
          for (const info of infos) {
            droppedCardNum += info.movingCards.filter(card => !Sanguosha.isVirtualCardId(card.card)).length;
          }
        }
      }

      isUseable = droppedCardNum >= 2;
    }
    return isUseable;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const options = ['qinyin: loseHp'];
    room.getAlivePlayersFrom().find(player => player.isInjured()) && options.push('qinyin: recoverHp');
    const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      toId: skillEffectEvent.fromId,
      conversation: 'qinyin: please choose a choice to make everyone lose hp or recover hp',
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChoosingOptionsEvent),
      skillEffectEvent.fromId,
    );

    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      skillEffectEvent.fromId,
    );

    if (selectedOption === 'qinyin: loseHp') {
      for (const player of room.getAlivePlayersFrom()) {
        await room.loseHp(player.Id, 1);
      }
    } else if (selectedOption === 'qinyin: recoverHp') {
      for (const player of room.getAlivePlayersFrom()) {
        await room.recover({ recoveredHp: 1, recoverBy: skillEffectEvent.fromId, toId: player.Id });
      }
    } else {
      return false;
    }

    return true;
  }
}

import { CommonSkill, TriggerSkill ,ShadowSkill } from 'core/skills/skill';
import { ServerEventFinder, GameEventIdentifiers } from 'core/event/event';
import { AllStage, DrawCardStage, PlayerPhase, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Room } from 'core/room/room';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';

@CommonSkill({ name: 'haoshi', description: 'haoshi_description' })
export class Haoshi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage) {
    return stage === DrawCardStage.CardDrawing;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>) {
    return owner.Id === content.fromId && room.CurrentPlayerPhase === PlayerPhase.DrawCardStage;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const drawCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;

    drawCardEvent.drawAmount += 2;
    room.setFlag<boolean>(skillUseEvent.fromId, this.Name, true);

    return true;
  }
}

// @ShadowSkill
// @CommonSkill({ name: Haoshi.GeneralName, description: Haoshi.Description })
// export class HaoshiShadow extends TriggerSkill {
//   isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
//     return stage === PhaseStageChangeStage.BeforeStageChange;
//   }

//   canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
//     return (owner.Id === content.playerId
//       && content.toStage === PlayerPhaseStages.DrawCardStageEnd
//       && room.getFlag(owner.Id, this.GeneralName) === true
//     );
//   }

//   targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
//     return targets.length === 1;
//   }

  // isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
  //   const allHandcardsNum = room.getAlivePlayersFrom().reduce<number[]>(
  //     (allHandcardsNum, player) => {
  //       allHandcardsNum.push(player.Hp);
  //       return allHandcardsNum;
  //     },
  //     [],
  //   );

  //   return room.getPlayerById(target);
  // }

//   async onTrigger() {
//     return true;
//   }

//   async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
//     return true;
//   }
// }

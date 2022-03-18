import { CardDrawReason, CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { DamageType } from 'core/game/game_props';
import { AllStage, CardMoveStage, DrawCardStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'fuzhong', description: 'fuzhong_description' })
export class FuZhong extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<
      GameEventIdentifiers.MoveCardEvent | GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.PhaseChangeEvent
    >,
    stage?: AllStage,
  ): boolean {
    return (
      stage === CardMoveStage.AfterCardMoved ||
      stage === DrawCardStage.CardDrawing ||
      stage === PhaseChangeStage.AfterPhaseChanged
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<
      GameEventIdentifiers.MoveCardEvent | GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.PhaseChangeEvent
    >,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.MoveCardEvent) {
      return (
        room.CurrentPlayer !== owner &&
        (content as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos.find(
          info => info.toId === owner.Id && info.toArea === CardMoveArea.HandArea,
        ) !== undefined
      );
    } else if (identifier === GameEventIdentifiers.DrawCardEvent) {
      const drawCardEvent = content as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
      return (
        owner.Id === drawCardEvent.fromId &&
        owner.getMark(MarkEnum.Zhong) >= 3 &&
        room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
        drawCardEvent.bySpecialReason === CardDrawReason.GameStage
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.to === PlayerPhase.PhaseBegin &&
        phaseChangeEvent.toPlayer === owner.Id &&
        owner.getMark(MarkEnum.Zhong) >= 4
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.MoveCardEvent | GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.MoveCardEvent) {
      room.addMark(event.fromId, MarkEnum.Zhong, 1);
    } else if (identifier === GameEventIdentifiers.DrawCardEvent) {
      (unknownEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>).drawAmount++;
    } else {
      const players = room.getOtherPlayers(event.fromId).map(player => player.Id);
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players,
          toId: event.fromId,
          requiredAmount: 1,
          conversation: 'fuzhong: please choose another player to deal 1 damage',
          triggeredBySkills: [this.Name],
        },
        event.fromId,
        true,
      );

      response.selectedPlayers = response.selectedPlayers || [players[Math.floor(Math.random() * players.length)]];

      await room.damage({
        fromId: event.fromId,
        toId: response.selectedPlayers[0],
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      });

      room.removeMark(event.fromId, MarkEnum.Zhong);
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: FuZhong.Name, description: FuZhong.Description })
export class FuZhongShadow extends RulesBreakerSkill {
  public breakOffenseDistance(room: Room, owner: Player): number {
    return owner.getMark(MarkEnum.Zhong) >= 2 ? 1 : 0;
  }

  public breakAdditionalCardHoldNumber(room: Room, owner: Player): number {
    return owner.getMark(MarkEnum.Zhong) >= 1 ? 1 : 0;
  }
}

import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { MovingCardProps } from 'core/event/event.server';
import {
  AllStage,
  DamageEffectStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'lianhua', description: 'lianhua_description' })
export class LianHua extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['yingzi', 'guanxing', 'zhiyan', 'gongxin'];
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect || stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    const identfier = EventPacker.getIdentifier(content);
    if (identfier === GameEventIdentifiers.DamageEvent) {
      return (
        (content as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId !== owner.Id &&
        room.CurrentPlayer !== owner
      );
    } else if (identfier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseStageChangeEvent
    >;

    const identfier = EventPacker.getIdentifier(unknownEvent);
    if (identfier === GameEventIdentifiers.DamageEvent) {
      const victim = (unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId;
      room
        .getPlayerById(fromId)
        .addInvisibleMark(
          this.Name,
          room.hasDifferentCampWith(room.getPlayerById(fromId), room.getPlayerById(victim)) ? -1 : 1,
        );
      room.addMark(fromId, MarkEnum.DanXue, 1);
    } else {
      const toGainCards: MovingCardProps[] = [];
      let toGainSkill: string = this.RelatedSkills[0];
      let cardMatchers: CardMatcher[];

      const invisibleDanXue = room.getPlayerById(fromId).getInvisibleMark(this.Name);

      if (room.getMark(fromId, MarkEnum.DanXue) <= 3) {
        cardMatchers = [new CardMatcher({ name: ['peach'] })];
      } else if (invisibleDanXue > 0) {
        cardMatchers = [new CardMatcher({ name: ['wuzhongshengyou'] })];
        toGainSkill = this.RelatedSkills[1];
      } else if (invisibleDanXue < 0) {
        cardMatchers = [new CardMatcher({ name: ['shunshouqianyang'] })];
        toGainSkill = this.RelatedSkills[2];
      } else {
        cardMatchers = [new CardMatcher({ generalName: ['slash'] }), new CardMatcher({ name: ['duel'] })];
        toGainSkill = this.RelatedSkills[3];
      }

      for (const cardMatcher of cardMatchers) {
        const randomCards = room.findCardsByMatcherFrom(cardMatcher);
        const length = randomCards.length;
        randomCards.push(...room.findCardsByMatcherFrom(cardMatcher, false));

        if (randomCards.length > 0) {
          const randomIndex = Math.floor(Math.random() * randomCards.length);
          toGainCards.push({
            card: randomCards[randomIndex],
            fromArea: randomIndex < length ? CardMoveArea.DrawStack : CardMoveArea.DropStack,
          });
        }
      }

      toGainCards.length > 0 &&
        (await room.moveCards({
          movingCards: toGainCards,
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: fromId,
          triggeredBySkills: [this.Name],
        }));

      if (!room.getPlayerById(fromId).hasSkill(toGainSkill)) {
        const skills = room.getFlag<string[]>(fromId, this.Name) || [];
        skills.push(toGainSkill);
        room.getPlayerById(fromId).setFlag<string[]>(this.Name, skills);

        await room.obtainSkill(fromId, toGainSkill);
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: LianHua.Name, description: LianHua.Description })
export class LianHuaShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.getMark(owner, MarkEnum.DanXue) === 0 && room.getFlag<string[]>(owner, this.GeneralName) === undefined;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged || stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      (stage === PhaseChangeStage.AfterPhaseChanged &&
        content.to === PlayerPhase.PlayCardStage &&
        content.toPlayer === owner.Id &&
        owner.getMark(MarkEnum.DanXue) > 0) ||
      (stage === PhaseChangeStage.PhaseChanged &&
        content.from === PlayerPhase.PhaseFinish &&
        content.fromPlayer === owner.Id &&
        owner.getFlag<string[]>(this.GeneralName) !== undefined)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const phaseChangeEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;

    if (phaseChangeEvent.from === PlayerPhase.PhaseFinish) {
      const skills = room.getFlag<string[]>(event.fromId, this.GeneralName);
      for (const skill of skills) {
        await room.loseSkill(event.fromId, skill);
      }

      room.getPlayerById(event.fromId).removeFlag(this.GeneralName);
    } else {
      room.getPlayerById(event.fromId).removeInvisibleMark(this.GeneralName);
      room.removeMark(event.fromId, MarkEnum.DanXue);
    }

    return true;
  }
}

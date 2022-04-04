import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { CardSuit } from 'core/cards/libs/card_props';
import {
  AllStage,
  CardResponseStage,
  CardUseStage,
  DamageEffectStage,
  DrawCardStage,
  PhaseStageChangeStage,
  PlayerPhaseStages,
  StagePriority,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Algorithm } from 'core/shares/libs/algorithm';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { Sanguosha } from 'core/game/engine';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { VirtualCard } from 'core/cards/card';
import { Slash } from 'core/cards/standard/slash';

// 孤勇：
// 你每打出或使用一张花色的牌，若没有对应的标记，获得一个标记；
// 当你摸牌时，消耗一枚标记，额外摸一张牌
// 当你造成或受到伤害时，消耗两枚标记，伤害值+1/-1
// 准备阶段开始时，消耗三枚标记，摸一张牌并视为使用一张杀
// 结束阶段结束时，消耗四枚标记，增加一点体力上限并回复一点体力

@CompulsorySkill({ name: 'pve_classic_gu', description: 'pve_classic_gu_desc' })
export class PveClassicGu extends TriggerSkill {
  private getMarkNumber(owner: Player) {
    return (
      owner.getMark(MarkEnum.ZiWei) +
      owner.getMark(MarkEnum.HouTu) +
      owner.getMark(MarkEnum.YuQing) +
      owner.getMark(MarkEnum.GouChen)
    );
  }

  private useMark(room: Room, owner: Player, num: number) {
    const markList = [MarkEnum.YuQing, MarkEnum.GouChen, MarkEnum.HouTu, MarkEnum.ZiWei];
    const ownerMarks = markList.filter(mark => owner.getMark(mark) > 0);
    Algorithm.shuffle(ownerMarks);
    ownerMarks.slice(0, num).map(mark => room.addMark(owner.Id, mark, -1));
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public getPriority() {
    return StagePriority.High;
  }

  public isTriggerable(
    event: ServerEventFinder<
      GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.DamageEvent | GameEventIdentifiers.DrawCardEvent
    >,
    stage?: AllStage,
  ) {
    return (
      stage === PhaseStageChangeStage.StageChanged ||
      stage === DamageEffectStage.DamagedEffect ||
      stage === DrawCardStage.CardDrawing
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<
      GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.DamageEvent | GameEventIdentifiers.DrawCardEvent
    >,
  ) {
    const markNumber = this.getMarkNumber(owner);

    const identifier = EventPacker.getIdentifier(content);
    switch (identifier) {
      case GameEventIdentifiers.PhaseStageChangeEvent:
        const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
        return (
          phaseStageChangeEvent.playerId === owner.Id &&
          ((markNumber > 3 && phaseStageChangeEvent.toStage === PlayerPhaseStages.PhaseFinishEnd) ||
            (markNumber > 2 && phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart))
        );
      case GameEventIdentifiers.DrawCardEvent:
        const drawCardEvent = content as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
        return markNumber > 0 && drawCardEvent.fromId === owner.Id;
      case GameEventIdentifiers.DamageEvent:
        const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
        return markNumber > 1 && (damageEvent.toId === owner.Id || damageEvent.fromId === owner.Id);
      default:
        return false;
    }
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (event.triggeredOnEvent === undefined) {
      return false;
    }

    const owner = room.getPlayerById(event.fromId);
    const identifier = EventPacker.getIdentifier(event.triggeredOnEvent);
    switch (identifier) {
      case GameEventIdentifiers.PhaseStageChangeEvent:
        const phaseStageChangeEvent =
          event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
        if (this.getMarkNumber(owner) > 3 && phaseStageChangeEvent.toStage === PlayerPhaseStages.PhaseFinishEnd) {
          console.log(`add MaxHp`);
          this.useMark(room, owner, 4);
          await room.changeMaxHp(event.fromId, 1);
          await room.recover({ toId: event.fromId, recoveredHp: 1, recoverBy: event.fromId });
        } else if (
          this.getMarkNumber(owner) > 2 &&
          phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart
        ) {
          this.useMark(room, owner, 3);
          room.drawCards(1, owner.Id, 'top');

          const targets = room
            .getOtherPlayers(owner.Id)
            .filter(player =>
              room.getPlayerById(owner.Id).canUseCardTo(room, new CardMatcher({ generalName: ['slash'] }), player.Id),
            )
            .map(player => player.Id);

          if (targets.length > 0) {
            const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
              GameEventIdentifiers.AskForChoosingPlayerEvent,
              {
                players: targets,
                toId: owner.Id,
                requiredAmount: 1,
                conversation: 'pve_classic_guyong: do you want to use a slash?',
                triggeredBySkills: [this.Name],
              },
              owner.Id,
            );

            if (resp.selectedPlayers && resp.selectedPlayers.length > 0) {
              await room.useCard({
                fromId: owner.Id,
                targetGroup: [resp.selectedPlayers],
                cardId: VirtualCard.create<Slash>({ cardName: 'slash', bySkill: this.Name }).Id,
                extraUse: true,
                triggeredBySkills: [this.Name],
              });
            }
          }
        }
        return true;

      case GameEventIdentifiers.DrawCardEvent:
        const drawCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
        if (this.getMarkNumber(owner) === 0) {
          return false;
        }

        drawCardEvent.drawAmount += 1;
        this.useMark(room, owner, 1);
        return true;

      case GameEventIdentifiers.DamageEvent:
        const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
        if (this.getMarkNumber(owner) < 2) {
          return false;
        }

        if (damageEvent.toId === owner.Id) {
          this.useMark(room, owner, 2);
          damageEvent.damage--;
        } else if (damageEvent.fromId === owner.Id) {
          this.useMark(room, owner, 2);
          damageEvent.damage++;
        }
        return true;
      default:
        return false;
    }
  }
}

@ShadowSkill
@CompulsorySkill({ name: PveClassicGu.Name, description: PveClassicGu.Description })
export class PveClassicGuShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public getPriority() {
    return StagePriority.High;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
    stage?: AllStage,
  ) {
    return stage === CardUseStage.CardUsing || stage === CardResponseStage.CardResponsing;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ) {
    return owner.Id === content.fromId;
  }

  public async onTrigger() {
    return true;
  }

  // 根据这些牌的花色，你获得对应标记：黑桃牌，获得“紫微”；梅花牌，获得“后土”；红桃牌，获得“玉清”；方块牌，获得“勾陈”
  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const owner = room.getPlayerById(event.fromId);

    const content = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >;
    const cardSuit = Sanguosha.getCardById(content.cardId).Suit;
    switch (cardSuit) {
      case CardSuit.Spade:
        owner.getMark(MarkEnum.ZiWei) || room.addMark(owner.Id, MarkEnum.ZiWei, 1);
        break;
      case CardSuit.Club:
        owner.getMark(MarkEnum.HouTu) || room.addMark(owner.Id, MarkEnum.HouTu, 1);
        break;
      case CardSuit.Diamond:
        owner.getMark(MarkEnum.GouChen) || room.addMark(owner.Id, MarkEnum.GouChen, 1);
        break;
      case CardSuit.Heart:
        owner.getMark(MarkEnum.YuQing) || room.addMark(owner.Id, MarkEnum.YuQing, 1);
        break;
      default:
        break;
    }

    return true;
  }
}

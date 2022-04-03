import { CardDrawReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { CardSuit } from 'core/cards/libs/card_props';
import {
  AllStage,
  CardResponseStage,
  CardUseStage,
  DamageEffectStage,
  DrawCardStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Algorithm } from 'core/shares/libs/algorithm';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { Sanguosha } from 'core/game/engine';

// 孤：你每打出或使用一张花色的牌，若没有对应的标记，获得一个标记；回合开始时，消耗四枚标记，增加一点体力上限并回复一点体力；受到伤害时，消耗三枚标记并减少一定伤害，造成伤害时，消耗两枚标记并使伤害值加一；摸牌阶段开始时，消耗一枚标记并多摸一张牌。
@ShadowSkill
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

  public isTriggerable(
    event: ServerEventFinder<
      GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.DamageEvent | GameEventIdentifiers.DrawCardEvent
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
          markNumber > 3 &&
          phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart &&
          phaseStageChangeEvent.playerId === owner.Id
        );
      case GameEventIdentifiers.DrawCardEvent:
        const drawCardEvent = content as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
        return (
          markNumber > 0 &&
          room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
          drawCardEvent.bySpecialReason === CardDrawReason.GameStage &&
          drawCardEvent.fromId === owner.Id
        );
      case GameEventIdentifiers.DamageEvent:
        const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
        return (damageEvent.toId === owner.Id && markNumber > 2) || (damageEvent.fromId === owner.Id && markNumber > 1);
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
    console.log(`event identifier is ${identifier}`);
    switch (identifier) {
      case GameEventIdentifiers.PhaseStageChangeEvent:
        console.log(`add MaxHp`);
        this.useMark(room, owner, 4);
        await room.changeMaxHp(event.fromId, 1);
        await room.recover({ toId: event.fromId, recoveredHp: 1, recoverBy: event.fromId });
        return true;
      case GameEventIdentifiers.DrawCardEvent:
        const drawCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
        drawCardEvent.drawAmount += 1;
        this.useMark(room, owner, 1);
        return true;
      case GameEventIdentifiers.DamageEvent:
        const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
        if (damageEvent.toId === owner.Id && this.getMarkNumber(owner) > 2) {
          this.useMark(room, owner, 3);
          damageEvent.damage--;
        } else if (damageEvent.fromId === owner.Id && this.getMarkNumber(owner) > 1) {
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

import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardDrawReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, DrawCardStage, LevelBeginStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

// 渐：摸牌阶段可以多摸一张牌
// 制：手牌上限等于体力值
// 袭：出牌阶段可以多出一张杀
// 疾：初始手牌数量加3
// 御：受到伤害后可以摸一张牌
// 盈：体力及体力上限加1

@CompulsorySkill({ name: 'pve_classic_ai', description: 'pve_classic_ai_desc' })
export class PveClassicAi extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<
      GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.DamageEvent | GameEventIdentifiers.LevelBeginEvent
    >,
    stage?: AllStage,
  ) {
    return (
      stage === DrawCardStage.CardDrawing ||
      stage === DamageEffectStage.AfterDamagedEffect ||
      stage === LevelBeginStage.LevelBegining
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<
      GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.DamageEvent | GameEventIdentifiers.LevelBeginEvent
    >,
  ) {
    switch (EventPacker.getIdentifier(content)) {
      case GameEventIdentifiers.DrawCardEvent:
        const markPlayer = room.AlivePlayers.find(player => player.getMark(MarkEnum.PveJian));
        const drawCardEvent = content as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
        const drawCardPlayer = room.getPlayerById(drawCardEvent.fromId);
        return (
          owner.Id === drawCardPlayer.Id &&
          room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
          drawCardEvent.bySpecialReason === CardDrawReason.GameStage &&
          markPlayer !== undefined &&
          markPlayer.Role === drawCardPlayer.Role
        );
      case GameEventIdentifiers.DamageEvent:
        const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
        const damagedPlayer = room.getPlayerById(damageEvent.toId);
        const hasMarkPlayer = room.AlivePlayers.find(player => player.getMark(MarkEnum.PveYu));
        return (
          owner.Id === damageEvent.toId && hasMarkPlayer !== undefined && hasMarkPlayer.Role === damagedPlayer.Role
        );

      case GameEventIdentifiers.LevelBeginEvent:
        return owner.getMark(MarkEnum.PveYing) > 0 || owner.getMark(MarkEnum.PveJi) > 0;
      default:
        return false;
    }
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (event.triggeredOnEvent === undefined) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(event.triggeredOnEvent);
    switch (identifier) {
      case GameEventIdentifiers.DrawCardEvent:
        const drawCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
        drawCardEvent.drawAmount += 1;
        break;
      case GameEventIdentifiers.DamageEvent:
        const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
        await room.drawCards(1, damageEvent.toId, 'top', damageEvent.toId, this.Name);
        break;
      case GameEventIdentifiers.LevelBeginEvent:
        const markYingPlayer = room.AlivePlayers.find(player => player.getMark(MarkEnum.PveYing));
        const markJiPlayer = room.AlivePlayers.find(player => player.getMark(MarkEnum.PveJi));
        if (markJiPlayer !== undefined) {
          const partners = room.AlivePlayers.filter(player => player.Role === markJiPlayer.Role);
          for (const player of partners) {
            await room.drawCards(3, player.Id, 'top', player.Id, this.Name);
          }
        }

        if (markYingPlayer !== undefined) {
          const partners = room.AlivePlayers.filter(player => player.Role === markYingPlayer.Role);
          for (const player of partners) {
            await room.changeMaxHp(player.Id, 1);
            await room.recover({ toId: player.Id, recoveredHp: 1, recoverBy: event.fromId });
          }
        }
    }
    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: PveClassicAi.Name, description: PveClassicAi.Description })
export class PveClassicAiEx extends RulesBreakerSkill {
  public breakBaseCardHoldNumber(room: Room, owner: Player) {
    const ais = room.Players.filter(player => player.Role === owner.Role);
    if (ais.find(player => player.getMark(MarkEnum.PveZhi)) !== undefined) {
      return owner.MaxHp;
    } else {
      return owner.Hp;
    }
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player) {
    const ais = room.Players.filter(player => player.Role === owner.Role);
    if (ais.find(player => player.getMark(MarkEnum.PveXi)) !== undefined) {
      if (cardId instanceof CardMatcher) {
        return cardId.match(new CardMatcher({ generalName: ['slash'] })) ? 1 : 0;
      } else {
        return Sanguosha.getCardById(cardId).GeneralName === 'slash' ? 1 : 0;
      }
    } else {
      return 0;
    }
  }
}

import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Slash } from 'core/cards/standard/slash';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  DamageEffectStage,
  PhaseChangeStage,
  PlayerPhase,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, OnDefineReleaseTiming, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { ShadowSkill } from 'core/skills/skill_wrappers';
import { PaoXiao } from '../standard/paoxiao';
import { WuSheng } from '../standard/wusheng';

@CommonSkill({ name: 'fuhun', description: 'fuhun_description' })
export class FuHun extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['slash'];
  }
  
  public canUse(room: Room, owner: Player) {
    return owner.canUseCard(room, new CardMatcher({ generalName: ['slash'] }));
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 2;
  }

  public isAvailableCard(
    room: Room,
    owner: Player,
    pendingCardId: CardId,
    selectedCards: CardId[],
    containerCard?: CardId | undefined,
  ): boolean {
    return pendingCardId !== containerCard;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public viewAs(selectedCards: CardId[]) {
    return VirtualCard.create<Slash>(
      {
        cardName: 'slash',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@CommonSkill({ name: FuHun.Name, description: FuHun.Description })
export class FuHunDamage extends TriggerSkill {
  public static readonly WuSheng = 'fuhun_wusheng';
  public static readonly PaoXiao = 'fuhun_paoxiao';

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): boolean {
    if (!content.cardIds) {
      return false;
    }

    let isFuHun = false;
    for (const cardId of content.cardIds) {
      const card = Sanguosha.getCardById(cardId);
      if (card.isVirtualCard()) {
        const vCard = card as VirtualCard;
        isFuHun = vCard.findByGeneratedSkill(this.GeneralName);
        if (isFuHun) {
          break;
        }
      }
    }

    return content.fromId === owner.Id && isFuHun;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);

    if (!room.getPlayerById(fromId).hasSkill(WuSheng.Name)) {
      room.obtainSkill(fromId, WuSheng.Name);
      from.setFlag<boolean>(FuHunDamage.WuSheng, true);
    }

    if (!room.getPlayerById(fromId).hasSkill(PaoXiao.Name)) {
      room.obtainSkill(fromId, PaoXiao.Name);
      from.setFlag<boolean>(FuHunDamage.PaoXiao, true);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: FuHunDamage.Name, description: FuHunDamage.Description })
export class FuHunLoseSkill extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public afterDead(): boolean {
    return true;
  }

  public isFlaggedSkill() {
    return true;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    return (
      event.fromPlayer === owner.Id &&
      event.from === PlayerPhase.PhaseFinish &&
      (
        owner.getFlag<boolean>(FuHunDamage.WuSheng) === true ||
        owner.getFlag<boolean>(FuHunDamage.PaoXiao) === true
      )
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);

    if (from.getFlag<boolean>(FuHunDamage.WuSheng)) {
      await room.loseSkill(fromId, WuSheng.Name);
      from.removeFlag(FuHunDamage.WuSheng);
    }

    if (room.getFlag<boolean>(fromId, FuHunDamage.PaoXiao)) {
      await room.loseSkill(fromId, PaoXiao.Name);
      from.removeFlag(FuHunDamage.PaoXiao);
    }

    return true;
  }
}

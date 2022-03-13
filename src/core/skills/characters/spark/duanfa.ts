import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'duanfa', description: 'duanfa_description' })
export class DuanFa extends ActiveSkill implements OnDefineReleaseTiming {
  public async whenObtainingSkill(room: Room, player: Player) {
    const num = room.Analytics.getCardDropRecord(player.Id, 'phase').reduce<number>((sum, event) => {
      const infos = event.infos.filter(info => info.movedByReason === this.Name);
      for (const info of infos) {
        sum += info.movingCards.filter(card => !Sanguosha.isVirtualCardId(card.card)).map(card => card.card).length;
      }

      return sum;
    }, 0);
    room.setFlag<number>(player.Id, this.Name, num);
  }

  public canUse(room: Room, owner: Player): boolean {
    return owner.getPlayerCards().length > 0 && (owner.getFlag<number>(this.Name) || 0) < owner.MaxHp;
  }

  public numberOfTargets(): number {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0 && cards.length <= owner.MaxHp - (owner.getFlag<number>(this.Name) || 0);
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return Sanguosha.getCardById(cardId).isBlack() && room.canDropCard(owner, cardId);
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, cardIds } = event;
    if (!cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);
    const originalSum = room.getFlag<number>(fromId, this.Name) || 0;
    room.setFlag<number>(fromId, this.Name, originalSum + cardIds.length);

    await room.drawCards(cardIds.length, fromId, 'top', fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: DuanFa.Name, description: DuanFa.Description })
export class DuanFaShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PlayCardStage &&
      owner.getFlag<number>(this.GeneralName) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}

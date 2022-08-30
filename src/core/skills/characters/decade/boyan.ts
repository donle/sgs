import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, FilterSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'boyan', description: 'boyan_description' })
export class BoYan extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.toIds) {
      return false;
    }

    const drawNum = Math.min(
      room.getPlayerById(event.toIds[0]).MaxHp -
        room.getPlayerById(event.toIds[0]).getCardIds(PlayerCardsArea.HandArea).length,
      5,
    );
    drawNum && (await room.drawCards(drawNum, event.toIds[0], 'top', event.fromId, this.Name));

    room.setFlag<boolean>(event.toIds[0], this.Name, true, this.Name);
    for (const skill of [BoYanBlocker.Name, BoYanRemover.Name]) {
      room.getPlayerById(event.toIds[0]).hasShadowSkill(skill) || (await room.obtainSkill(event.toIds[0], skill));
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_boyan_blocker', description: 's_boyan_blocker_description' })
export class BoYanBlocker extends FilterSkill {
  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    return cardId instanceof CardMatcher || room.getPlayerById(owner).cardFrom(cardId) !== PlayerCardsArea.HandArea;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_boyan_remover', description: 's_boyan_remover_description' })
export class BoYanRemover extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, player: Player) {
    room.removeFlag(player.Id, BoYan.Name);
    await room.loseSkill(player.Id, this.Name);
    player.hasShadowSkill(BoYanBlocker.Name) && (await room.loseSkill(player.Id, BoYanBlocker.Name));
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
    return event.from === PlayerPhase.PhaseFinish && owner.getFlag<boolean>(BoYan.Name) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, BoYan.Name);
    await room.loseSkill(event.fromId, this.Name);
    room.getPlayerById(event.fromId).hasShadowSkill(BoYanBlocker.Name) &&
      (await room.loseSkill(event.fromId, BoYanBlocker.Name));

    return true;
  }
}

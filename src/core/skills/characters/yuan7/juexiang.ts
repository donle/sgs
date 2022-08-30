import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseChangeStage, PlayerDiedStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { FilterSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { HeXian, JiXian, LieXian, RouXian } from './qingxiancanpu';

@CommonSkill({ name: 'juexiang', description: 'juexiang_description' })
export class JueXiang extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return [JiXian.Name, LieXian.Name, RouXian.Name, HeXian.Name];
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PlayerDiedStage.PlayerDied;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>): boolean {
    return content.playerId === owner.Id;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    await room.obtainSkill(event.toIds[0], this.RelatedSkills[Math.floor(Math.random() * this.RelatedSkills.length)]);

    for (const skillName of [JueXiangProhibited.Name, JueXiangRemover.Name]) {
      room.getPlayerById(event.toIds[0]).hasShadowSkill(skillName) ||
        (await room.obtainSkill(event.toIds[0], skillName));
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_juexiang_prohibited', description: 's_juexiang_description' })
export class JueXiangProhibited extends FilterSkill {
  public canBeUsedCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId, attacker?: PlayerId): boolean {
    if (attacker === owner) {
      return true;
    }

    if (cardId instanceof CardMatcher) {
      return !new CardMatcher({ suit: [CardSuit.Club] }).match(cardId);
    } else {
      return Sanguosha.getCardById(cardId).Suit !== CardSuit.Club;
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_juexiang_remover', description: 's_juexiang_remover_description' })
export class JueXiangRemover extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return (
      room.CurrentPlayer === room.getPlayerById(owner) &&
      room.CurrentPlayerPhase === PlayerPhase.PhaseBegin &&
      stage === PhaseChangeStage.AfterPhaseChanged
    );
  }

  public async whenDead(room: Room, player: Player) {
    await room.loseSkill(player.Id, JueXiangProhibited.Name);
    await room.loseSkill(player.Id, this.Name);
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
    return owner.Id === event.toPlayer && event.to === PlayerPhase.PhaseBegin;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.loseSkill(event.fromId, JueXiangProhibited.Name);
    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}

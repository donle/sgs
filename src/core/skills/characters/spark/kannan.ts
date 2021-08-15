import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'kannan', description: 'kannan_description' })
export class KanNan extends ActiveSkill {
  public static readonly KanNanDamage = 'kannan_damage';

  public canUse(room: Room, owner: Player): boolean {
    return owner.hasUsedSkillTimes(this.Name) < owner.Hp && !owner.getFlag<PlayerId[]>(this.Name)?.includes(owner.Id);
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.canPindian(owner, target) && !room.getFlag<PlayerId[]>(owner, this.Name)?.includes(target);
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const originalTargets = room.getFlag<PlayerId[]>(fromId, this.Name) || [];
    originalTargets.push(toIds[0]);
    room.setFlag<PlayerId[]>(fromId, this.Name, originalTargets);

    const { pindianRecord } = await room.pindian(fromId, toIds, this.Name);
    if (!pindianRecord.length) {
      return false;
    }

    const winner = pindianRecord[0].winner;
    if (winner) {
      const originalNum = room.getFlag<number>(winner, KanNan.KanNanDamage) || 0;
      room.setFlag<number>(
        winner,
        KanNan.KanNanDamage,
        originalNum + 1,
        TranslationPack.translationJsonPatcher('kannan damage: {0}', originalNum + 1).toString(),
      );

      room.getPlayerById(winner).hasShadowSkill(KanNanBuff.Name) ||
        (await room.obtainSkill(winner, KanNanBuff.Name));
      if (winner === fromId) {
        originalTargets.push(fromId);
        room.setFlag<PlayerId[]>(fromId, this.Name, originalTargets);
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: KanNan.Name, description: KanNan.Description })
export class KanNanShadow extends TriggerSkill implements OnDefineReleaseTiming {
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

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_kannan_buff', description: 's_kannan_buff_description' })
export class KanNanBuff extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, player: Player) {
    await room.loseSkill(player.Id, this.Name);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.BeforeCardUseEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return event.fromId === owner.Id && Sanguosha.getCardById(event.cardId).GeneralName === 'slash';
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const additionalDMG = room.getFlag<number>(event.fromId, KanNan.KanNanDamage);
    if (additionalDMG) {
      cardUseEvent.additionalDamage = cardUseEvent.additionalDamage
        ? cardUseEvent.additionalDamage + additionalDMG
        : additionalDMG;
    }

    room.removeFlag(event.fromId, KanNan.KanNanDamage);
    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}

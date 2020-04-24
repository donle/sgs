import { CardId } from 'core/cards/libs/card_props';
import { CardLostReason, ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, ShadowSkill, CompulsorySkill, TriggerSkill } from 'core/skills/skill';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PlayerPhase, PhaseChangeStage } from 'core/game/stage_processor';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';

@CommonSkill({ name: 'qingnang', description: 'qingnang_description' })
export class QingNang extends ActiveSkill {
  public static readonly exUse = 'QingNang_ExUse';

  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) || room.getFlag<boolean>(owner.Id, QingNang.exUse) === true;
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  public cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    return (
      room.getPlayerById(target).Hp < room.getPlayerById(target).MaxHp &&
      room.getFlag<boolean>(target, this.Name) !== true
    );
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.CurrentPlayer.cardFrom(cardId) === PlayerCardsArea.HandArea;
  }

  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    await room.dropCards(
      CardLostReason.ActiveDrop,
      skillUseEvent.cardIds!,
      skillUseEvent.fromId,
      skillUseEvent.fromId,
      this.Name,
    );

    const recoverContent = {
      recoverBy: skillUseEvent.fromId,
      toId: skillUseEvent.toIds![0],
      recoveredHp: 1,
      triggeredBySkills: [this.Name],
    };

    await room.recover(recoverContent);
    room.setFlag<boolean>(skillUseEvent.toIds![0], this.Name, true);

    if (Sanguosha.getCardById(skillUseEvent.cardIds![0]).isRed()) {
      room.setFlag<boolean>(skillUseEvent.fromId, QingNang.exUse, true);
    } else {
      room.setFlag<boolean>(skillUseEvent.fromId, QingNang.exUse, false);
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: QingNang.GeneralName, description: QingNang.Description })
export class QingNangShadow extends TriggerSkill implements OnDefineReleaseTiming {
  onLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.FinishStage;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: AllStage): boolean {
    return event.from === PlayerPhase.FinishStage && stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return room.getFlag<boolean>(owner.Id, QingNang.exUse) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { triggeredOnEvent } = event;
    const phaseChangeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;

    phaseChangeEvent.fromPlayer && room.removeFlag(phaseChangeEvent.fromPlayer, QingNang.exUse);
    for (const player of room.AlivePlayers) {
      room.removeFlag(player.Id, this.GeneralName);
    }

    return true;
  }
}

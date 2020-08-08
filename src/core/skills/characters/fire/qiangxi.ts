import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  CommonSkill,
  CompulsorySkill,
  OnDefineReleaseTiming,
  ShadowSkill,
  TriggerSkill,
} from 'core/skills/skill';

@CommonSkill({ name: 'qiangxi', description: 'qiangxi_description' })
export class QiangXi extends ActiveSkill {
  public static readonly exUse = 'QiangXi_ExUse';

  public canUse(room: Room, owner: Player) {
    return owner.hasUsedSkillTimes(this.Name) < 2;
  }

  public numberOfTargets() {
    return 1;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length <= 1;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && room.getFlag<boolean>(target, this.Name) !== true;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return Sanguosha.getCardById(cardId).is(CardType.Weapon);
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds, cardIds } = skillUseEvent;
    room.setFlag<boolean>(fromId, QiangXi.exUse, true);
    room.setFlag<boolean>(toIds![0], this.Name, true, false);

    if (cardIds && cardIds.length > 0) {
      await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);
    } else {
      await room.loseHp(fromId, 1);
    }

    await room.damage({
      fromId,
      toId: toIds![0],
      damage: 1,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: QiangXi.GeneralName, description: QiangXi.Description })
export class QiangXiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  afterLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.FinishStage;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: AllStage): boolean {
    return event.from === PlayerPhase.FinishStage && stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return room.getFlag<boolean>(owner.Id, QiangXi.exUse) === true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { triggeredOnEvent } = event;
    const phaseChangeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;

    phaseChangeEvent.fromPlayer && room.removeFlag(phaseChangeEvent.fromPlayer, QiangXi.exUse);
    for (const player of room.AlivePlayers) {
      room.removeFlag(player.Id, this.GeneralName);
    }

    return true;
  }
}

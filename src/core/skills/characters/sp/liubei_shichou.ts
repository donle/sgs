import { CardId } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import {
  AllStage,
  DamageEffectStage,
  PhaseStageChangeStage,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, LimitSkill, LordSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@LordSkill
@LimitSkill({ name: 'liubei_shichou', description: 'liubei_shichou_description' })
export class SPLiuBeiShiChou extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PrepareStage &&
      owner.getPlayerCards().length >= 1
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    const to = room.getPlayerById(targetId);
    return to.Nationality === CharacterNationality.Shu && targetId !== owner;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return true;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { toIds,  fromId } = skillUseEvent;
    const toId = toIds![0];
    await room.moveCards({
      movingCards: skillUseEvent.cardIds!.map(cardId => ({ card:cardId, fromArea: room.getPlayerById(fromId).cardFrom(cardId) })),
      fromId,
      toId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });
    await room.obtainSkill(fromId, SPLiuBeiShiChouBuff.Name);
    room.getPlayerById(toId).setFlag<boolean>(SPLiuBeiShiChou.Name, true);
    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: SPLiuBeiShiChou.Name, description: SPLiuBeiShiChou.Description })
export class SPLiuBeiShiChouBuff extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.DamagedEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.toId;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { triggeredOnEvent, fromId } = event;
    const damageEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    for (const player of room.getOtherPlayers(fromId)) {
      if (room.getFlag<boolean>(player.Id, SPLiuBeiShiChou.Name) === true) {
        await room.damage({
          toId: player.Id,
          damage: damageEvent.damage,
          damageType: DamageType.Normal,
          triggeredBySkills: [this.Name],
        });
        await room.drawCards(damageEvent.damage, player.Id);
        await room.drawCards(damageEvent.damage, damageEvent.toId);
      }
    }
    return true;
  }
}

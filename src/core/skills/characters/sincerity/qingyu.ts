import { XuanCun } from './xuancun';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import {
  AllStage,
  DamageEffectStage,
  PhaseStageChangeStage,
  PlayerDyingStage,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { QuestSkill } from 'core/skills/skill_wrappers';

@QuestSkill({ name: 'qingyu', description: 'qingyu_description' })
export class QingYu extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return [XuanCun.Name];
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return (
      stage === DamageEffectStage.DamagedEffect ||
      stage === PhaseStageChangeStage.StageChanged ||
      stage === PlayerDyingStage.PlayerDying
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<
      | GameEventIdentifiers.DamageEvent
      | GameEventIdentifiers.PhaseStageChangeEvent
      | GameEventIdentifiers.PlayerDyingEvent
    >,
  ): boolean {
    if (owner.getFlag<boolean>(this.Name) !== undefined) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      return (
        (event as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId === owner.Id &&
        owner.getPlayerCards().filter(cardId => room.canDropCard(owner.Id, cardId)).length > 1
      );
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart &&
        owner.LostHp === 0 &&
        owner.getCardIds(PlayerCardsArea.HandArea).length === 0
      );
    } else if (identifier === GameEventIdentifiers.PlayerDyingEvent) {
      return (event as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>).dying === owner.Id && owner.Hp < 1;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      | GameEventIdentifiers.DamageEvent
      | GameEventIdentifiers.PhaseStageChangeEvent
      | GameEventIdentifiers.PlayerDyingEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.DamageEvent) {
      const response = await room.askForCardDrop(
        event.fromId,
        2,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        undefined,
        this.Name,
      );
      response.droppedCards.length > 0 &&
        (await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, event.fromId, event.fromId, this.Name));

      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      damageEvent.damage = 0;
      EventPacker.terminate(damageEvent);
    } else if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.PhaseStageChangeEvent) {
      room.setFlag<boolean>(event.fromId, this.Name, true, 'qingyu:succeeded');
      await room.obtainSkill(event.fromId, this.RelatedSkills[0]);
    } else {
      room.setFlag<boolean>(event.fromId, this.Name, false, 'qingyu:failed');
      await room.changeMaxHp(event.fromId, -1);
    }

    return true;
  }
}

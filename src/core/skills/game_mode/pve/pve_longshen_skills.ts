import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import {
  AimStage,
  AllStage,
  DrawCardStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'pve_longshen_ziyu', description: 'pve_longshen_ziyu_description' })
export class PveLongShenZiYu extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId && PlayerPhaseStages.PrepareStageStart === content.toStage && owner.isInjured()
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const owner = room.getPlayerById(content.fromId);
    await room.recover({
      recoveredHp: owner.MaxHp - owner.Hp,
      recoverBy: owner.Id,
      toId: owner.Id,
    });

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_chouxin', description: 'pve_longshen_chouxin_description' })
export class PveLongShenChouXin extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage) {
    return stage === DrawCardStage.BeforeDrawCardEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>) {
    return (
      content.fromId === room.CurrentPhasePlayer.Id &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      content.fromId !== owner.Id
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const target = room.CurrentPhasePlayer;
    const card = target.getPlayerCards()[Math.floor(target.getPlayerCards().length * Math.random())];
    await room.moveCards({
      movingCards: [{ card }],
      fromId: target.Id,
      toId: content.fromId,
      moveReason: CardMoveReason.ActivePrey,
      toArea: CardMoveArea.HandArea,
      movedByReason: this.Name,
    });

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_suwei', description: 'pve_longshen_suwei_description' })
export class PveSuWei extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAimmed && event.byCardId !== undefined;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return event.toId === owner.Id && event.fromId !== owner.Id;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, toId } = skillUseEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    const attacker = room.getPlayerById(fromId);

    await room.drawCards(1, toId, 'top', toId, this.Name);

    if (room.getPlayerById(fromId).getPlayerCards().length > 0) {
      const askForChooseCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent> = {
        options: {
          [PlayerCardsArea.EquipArea]: attacker.getCardIds(PlayerCardsArea.EquipArea),
          [PlayerCardsArea.HandArea]: attacker.getCardIds(PlayerCardsArea.HandArea).length,
        },
        fromId: toId,
        toId: fromId,
        triggeredBySkills: [this.Name],
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
          askForChooseCardEvent,
        ),
        toId,
      );

      const response = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        toId,
      );

      if (response.selectedCardIndex !== undefined) {
        const cardIds = attacker.getCardIds(PlayerCardsArea.HandArea);
        response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
      } else if (response.selectedCard === undefined) {
        const cardIds = attacker.getPlayerCards();
        response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
      }
      if (response.selectedCard !== undefined) {
        await room.dropCards(CardMoveReason.PassiveDrop, [response.selectedCard], fromId, toId, this.Name);
      }
    }
    return true;
  }
}

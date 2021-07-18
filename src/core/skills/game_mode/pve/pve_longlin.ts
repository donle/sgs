import { CardType } from 'core/cards/card';
import { CardSuit } from 'core/cards/libs/card_props';
import { CardDrawReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  CardUseStage,
  DrawCardStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'pve_longlin', description: 'pve_longlin_description' })
export class PveLongLin extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage) {
    return stage === CardUseStage.CardUsing;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    if (event.fromId !== owner.Id) {
      return false;
    }

    const card = Sanguosha.getCardById(event.cardId);

    return card.BaseType === CardType.Equip;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (room.getPlayerById(event.fromId).isInjured()) {
      await room.recover({ recoverBy: event.fromId, recoveredHp: 1, toId: event.fromId });
      await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);
    } else {
      await room.drawCards(3, event.fromId, 'top', event.fromId, this.Name);
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: PveLongLin.Name, description: PveLongLin.Description })
export class PveLongLinShadow extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id === event.playerId && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const owner = room.getPlayerById(event.fromId);
    let extraDrawCardsNum: number = 0;
    for (const cardType of [CardType.Weapon, CardType.Shield, CardType.Precious]) {
      if (owner.getEquipment(cardType) === undefined) {
        extraDrawCardsNum++;
      }
    }
    await room.drawCards(extraDrawCardsNum, owner.Id);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: PveLongLinShadow.Name, description: PveLongLinShadow.Description })
export class PveLongLinDraw extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage) {
    return stage === DrawCardStage.CardDrawing;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>) {
    return (
      owner.Id === event.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      event.bySpecialReason === CardDrawReason.GameStage
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const extraDrawNum = room
      .getPlayerById(event.fromId)
      .getCardIds(PlayerCardsArea.EquipArea)
      .reduce<CardSuit[]>((allSuits, cardId) => {
        const card = Sanguosha.getCardById(cardId);
        if (!allSuits.includes(card.Suit) && card.Suit !== CardSuit.NoSuit) {
          allSuits.push(card.Suit);
        }
        return allSuits;
      }, []).length;

    if (extraDrawNum !== 0) {
      const drawCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
      drawCardEvent.drawAmount += extraDrawNum;
    }

    return true;
  }
}

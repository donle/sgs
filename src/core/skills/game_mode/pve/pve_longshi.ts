import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { ServerEventFinder, GameEventIdentifiers, CardMoveReason, CardMoveArea } from 'core/event/event';
import { Room } from 'core/room/room';
import { Player } from 'core/player/player';
import { CardId } from 'core/cards/libs/card_props';
import { PlayerCardsArea } from 'core/player/player_props';
import { TriggerSkill } from 'core/skills/skill';
import { PhaseStageChangeStage, PlayerPhaseStages, AllStage } from 'core/game/stage_processor';
import { Sanguosha } from 'core/game/engine';
import { CardType } from 'core/cards/card';
import { DamageType } from 'core/game/game_props';

@CompulsorySkill({ name: 'pve_longshi', description: 'pve_longshi_description' })
export class PveLongShi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStage;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id === event.playerId;
  }

  async onTrigger() {
    return true;
  }

  public async longShiDropCard(room: Room, owner: Player, target: Player): Promise<CardId[]> {
    let dropCardIds: CardId[] = [];

    for (const area of [PlayerCardsArea.JudgeArea, PlayerCardsArea.EquipArea, PlayerCardsArea.HandArea]) {
      const cardIds = target.getCardIds(area);
      if (cardIds.length > 0) {
        dropCardIds.push(cardIds[Math.floor(Math.random() * cardIds.length)]);
      }
    }

    let targetOutSideCardIds: CardId[] = [];
    for (const [, cards] of Object.entries(target.getOutsideAreaCards())) {
      targetOutSideCardIds.push(...cards);
    }

    if (targetOutSideCardIds.length > 0 && dropCardIds.length < 3) {
      dropCardIds.push(targetOutSideCardIds[Math.floor(targetOutSideCardIds.length * Math.random())]);
    }

    await room.dropCards(CardMoveReason.PassiveDrop, dropCardIds, target.Id, owner.Id, this.Name);

    return dropCardIds;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const fromId = skillUseEvent.fromId;
    const targetPlayers: Player[] = room.AlivePlayers.filter(player => player.Id !== fromId);

    for (const target of targetPlayers) {
      const longShiDropCardIds = await this.longShiDropCard(room, room.getPlayerById(fromId), target);
      const cardTypeNum = longShiDropCardIds.reduce<CardType[]>((allTypes, cardId) => {
        const card = Sanguosha.getCardById(cardId);
        if (!allTypes.includes(card.BaseType)) {
          allTypes.push(card.BaseType);
        }

        return allTypes;
      }, []).length;

      switch (cardTypeNum) {
        case 0:
        case 1:
          await room.changeMaxHp(target.Id, -1);
          break;
        case 2:
          await room.damage({
            fromId: fromId,
            toId: target.Id,
            damage: 1,
            damageType: DamageType.Normal,
            triggeredBySkills: [this.Name],
          });
          break;
        case 3:
          await room.moveCards({
            movingCards: longShiDropCardIds.map(cardId => ({
              card: cardId,
              fromArea: CardMoveArea.DropStack,
            })),
            moveReason: CardMoveReason.ActivePrey,
            toId: fromId,
            toArea: PlayerCardsArea.HandArea,
            proposer: fromId,
            movedByReason: this.Name,
          });
          break;
        default:
          break;
      }
    }

    return true;
  }
}

import { CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CircleSkill, CommonSkill, TriggerSkill } from 'core/skills/skill';

@CircleSkill
@CommonSkill({ name: 'botu', description: 'botu_description' })
export class BoTu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.AfterStageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    if (
      owner.Id === content.playerId &&
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      owner.hasUsedSkillTimes(this.Name) < Math.min(room.AlivePlayers.length, 3)
    ) {
      const records = room.Analytics.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
        event =>
          EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
          !!event.infos.find(info => info.toArea === CardMoveArea.DropStack),
        undefined,
        'round',
      );

      for (const record of records) {
        const cardSuits: CardSuit[] = [];
        for (const info of record.infos) {
          if (info.toArea !== CardMoveArea.DropStack) {
            continue;
          }

          for (const cardInfo of info.movingCards) {
            const suit = Sanguosha.getCardById(cardInfo.card).Suit;
            cardSuits.includes(suit) && cardSuits.push(suit);

            if (cardSuits.length > 3) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    room.insertPlayerRound(skillUseEvent.fromId);
    return true;
  }
}

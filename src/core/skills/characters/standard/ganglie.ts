import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardLostReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill
export class GangLie extends TriggerSkill {
  constructor() {
    super('ganglie', 'ganglie_description');
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.toId && content.fromId !== undefined;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const judge = await room.judge(skillUseEvent.fromId, undefined, this.name);

    const { triggeredOnEvent } = skillUseEvent;
    const { fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    const damageFrom = fromId && room.getPlayerById(fromId);
    if (!damageFrom || damageFrom.Dead) {
      return false;
    }

    if (Sanguosha.getCardById(judge.judgeCardId).isBlack()) {
      if (damageFrom.getPlayerCards().length === 0) {
        return false;
      }

      const options: CardChoosingOptions = {
        [PlayerCardsArea.EquipArea]: damageFrom.getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.HandArea]: damageFrom.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId: skillUseEvent.fromId,
        toId: damageFrom.Id,
        options,
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
        skillUseEvent.fromId,
      );

      const response = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        skillUseEvent.fromId,
      );

      if (response.selectedCard === undefined) {
        response.selectedCard = damageFrom.getCardIds(PlayerCardsArea.HandArea)[response.selectedCardIndex!];
      }

      await room.dropCards(
        CardLostReason.PassiveDrop,
        [response.selectedCard],
        chooseCardEvent.toId,
        skillUseEvent.fromId,
        this.name,
      );
    } else if (Sanguosha.getCardById(judge.judgeCardId).isRed()) {
      await room.damage({
        fromId: skillUseEvent.fromId,
        damage: 1,
        damageType: DamageType.Normal,
        toId: damageFrom.Id,
        triggeredBySkills: [this.name],
      });
    }

    return true;
  }
}

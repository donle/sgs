import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { ServerEventFinder, GameEventIdentifiers, EventPacker, CardLostReason } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Room } from 'core/room/room';
import { Player } from 'core/player/player';
import { Sanguosha } from 'core/game/engine';
import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { PlayerCardsArea } from 'core/player/player_props';
import { DamageType } from 'core/game/game_props';

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
    if (fromId === undefined) return true;

    const damageFrom = room.getPlayerById(fromId);
    if (damageFrom.Dead) return true;

    if (Sanguosha.getCardById(judge.judgeCardId).isBlack()) {
        if (damageFrom.getCardIds(PlayerCardsArea.HandArea).length === 0) return true;

        const options: CardChoosingOptions = {
            [PlayerCardsArea.EquipArea]: damageFrom.getCardIds(PlayerCardsArea.EquipArea),
            [PlayerCardsArea.HandArea]: damageFrom.getCardIds(PlayerCardsArea.HandArea).length,
        };

        const chooseCardEvent = {
            fromId: skillUseEvent.fromId,
            toId: fromId,
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

        await room.dropCards(CardLostReason.PassiveDrop, [response.selectedCard], chooseCardEvent.toId);
    } else if (Sanguosha.getCardById(judge.judgeCardId).isRed()) {
        await room.damage({
            fromId: skillUseEvent.fromId,
            cardIds: undefined,
            damage: 1,
            damageType: DamageType.Normal,
            toId: fromId,
            triggeredBySkills: [this.name],
        });
    }

    return true;
  }
}

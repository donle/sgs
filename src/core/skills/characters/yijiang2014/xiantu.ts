import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, CompulsorySkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xiantu', description: 'xiantu_description' })
export class XianTu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.toStage === PlayerPhaseStages.PlayCardStageStart && content.playerId !== owner.Id;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = content;
    const phaseStageChangeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;

    await room.drawCards(2, content.fromId, 'top', content.fromId, this.GeneralName);
    room.setFlag(content.fromId, this.GeneralName, true, true);

    const skillUseEvent: ServerEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
      invokeSkillNames: [XianTuCard.Name],
      toId: content.fromId,
      conversation: TranslationPack.translationJsonPatcher(
        'please give {0} two cards.',
        room.getPlayerById(phaseStageChangeEvent.playerId).Name,
      ).extract(),
    };

    room.notify(
      GameEventIdentifiers.AskForSkillUseEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForSkillUseEvent>(skillUseEvent),
      content.fromId,
    );

    let { cardIds } = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, content.fromId);

    if (cardIds === undefined) {
      cardIds = room.getPlayerById(content.fromId).getCardIds().slice(0, 2);
    }

    // optimize hide card
    await room.moveCards({
      movingCards: cardIds.map(card => ({ card, fromArea: room.getPlayerById(content.fromId).cardFrom(card) })),
      fromId: content.fromId,
      moveReason: CardMoveReason.ActiveMove,
      toId: phaseStageChangeEvent.playerId,
      toArea: PlayerCardsArea.HandArea,
    });

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: XianTu.Name, description: XianTu.Description })
export class XianTuShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.getFlag<boolean>(this.GeneralName) &&
      content.toStage === PlayerPhaseStages.PlayCardStageEnd &&
      room.Analytics.getRecordEvents(
        event => {
          if (EventPacker.getIdentifier(event) !== GameEventIdentifiers.PlayerDiedEvent) {
            return false;
          }
          const diedEvent = event as ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>;
          return diedEvent.killedBy === content.playerId;
        },
        undefined,
        true,
      ).length === 0
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    room.removeFlag(skillUseEvent.fromId, this.GeneralName);
    await room.loseHp(skillUseEvent.fromId, 1);
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: XianTuShadow.Name, description: XianTu.Description })
export class XianTuCard extends TriggerSkill {
  isTriggerable() {
    return false;
  }

  canUse() {
    return false;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 2;
  }

  isAvailableCard(): boolean {
    return true;
  }

  isAvailableTarget() {
    return false;
  }

  async onTrigger() {
    return true;
  }

  async onEffect() {
    return true;
  }
}

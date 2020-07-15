import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, GameStartStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qixing', description: 'qixing_description' })
export class QiXing extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.GameStartEvent>, stage?: AllStage) {
    return stage === GameStartStage.GameStarting;
  }

  isAutoTrigger() {
    return true;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.GameStartEvent>) {
    return true;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const qixingCards = room.getCards(7, 'top');
    await room.moveCards({
      movingCards: qixingCards.map(card => ({ card })),
      toArea: PlayerCardsArea.OutsideArea,
      toId: skillUseEvent.fromId,
      moveReason: CardMoveReason.ActiveMove,
      movedByReason: this.Name,
      isOutsideAreaInPublic: false,
      toOutsideArea: this.Name,
      proposer: skillUseEvent.fromId,
    });

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: QiXing.Name, description: QiXing.Description })
export class QiXingShadow extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      content.toStage === PlayerPhaseStages.DrawCardStageEnd &&
      content.playerId === owner.Id &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, QiXing.Name).length > 0
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const from = room.getPlayerById(skillUseEvent.fromId);
    const handcards = from.getCardIds(PlayerCardsArea.HandArea);
    const qixingCards = from.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName);

    const askForChoosingCardsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent> = {
      amount: handcards.length,
      customCardFields: {
        [this.GeneralName]: qixingCards,
        [PlayerCardsArea.HandArea]: handcards,
      },
      toId: from.Id,
      customMessage: 'please select cards to swap',
    };

    room.notify(GameEventIdentifiers.AskForChoosingCardEvent, askForChoosingCardsEvent, from.Id);
    const { selectedCards } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardEvent,
      from.Id,
    );
    if (!selectedCards) {
      return false;
    } else {
      const fromHandcards = selectedCards.filter(card => !handcards.includes(card));
      await room.moveCards({
        fromId: from.Id,
        movingCards: handcards.map(card => ({ card, fromArea: PlayerCardsArea.HandArea })),
        toArea: PlayerCardsArea.OutsideArea,
        toId: from.Id,
        toOutsideArea: this.GeneralName,
        moveReason: CardMoveReason.ActiveMove,
        movedByReason: this.Name,
        proposer: from.Id,
        engagedPlayerIds: [from.Id],
      });
      await room.moveCards({
        fromId: from.Id,
        movingCards: selectedCards.map(card => ({ card, fromArea: PlayerCardsArea.OutsideArea })),
        toArea: PlayerCardsArea.HandArea,
        toId: from.Id,
        moveReason: CardMoveReason.ActiveMove,
        movedByReason: this.Name,
        proposer: from.Id,
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} used skill {1}, swapped {2} handcards from qixing cards pile',
          TranslationPack.patchPlayerInTranslation(from),
          this.Name,
          fromHandcards.length,
        ).extract(),
      });
    }
    return true;
  }
}

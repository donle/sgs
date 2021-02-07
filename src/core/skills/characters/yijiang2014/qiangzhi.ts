import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  CardUseStage,
  PhaseStageChangeStage,
  PlayerPhaseStages,
  PlayerPhase,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qiangzhi', description: 'qiangzhi_description' })
export class QiangZhi extends TriggerSkill {
  isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PlayCardStage;
  }

  whenRefresh(room: Room, owner: Player) {
    owner.removeFlag(this.GeneralName);
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.PlayCardStageStart;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const ownerId = content.fromId;

    room.notify(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>({
        triggeredBySkills: [this.GeneralName],
        toId: ownerId,
        players: room.AlivePlayers.filter(
          player => player.getCardIds(PlayerCardsArea.HandArea).length > 0 && player.Id !== ownerId,
        ).map(player => player.Id),
        requiredAmount: 1,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose a player to show a hand card',
          this.GeneralName,
        ).extract(),
      }),
      ownerId,
    );

    const { selectedPlayers } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      ownerId,
    );

    if (selectedPlayers === undefined) {
      return false;
    }

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>({
        triggeredBySkills: [this.GeneralName],
        fromId: ownerId,
        toId: selectedPlayers[0],
        options: {
          [PlayerCardsArea.HandArea]: room.getPlayerById(selectedPlayers[0]).getCardIds(PlayerCardsArea.HandArea)
            .length,
        },
      }),
      ownerId,
    );

    // just for interactive
    await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingCardFromPlayerEvent, ownerId);

    const candidateCard = room.getPlayerById(selectedPlayers[0]).getCardIds(PlayerCardsArea.HandArea);
    const selectedCard = candidateCard[Math.floor(Math.random() * candidateCard.length)];

    room.broadcast(GameEventIdentifiers.CardDisplayEvent, {
      displayCards: [selectedCard],
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} display {1} hand card {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(ownerId)),
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(selectedPlayers[0])),
        TranslationPack.patchCardInTranslation(selectedCard),
      ).extract(),
    });

    room.getPlayerById(ownerId).setFlag(this.GeneralName, Sanguosha.getCardById(selectedCard).BaseType);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: QiangZhi.Name, description: QiangZhi.Description })
export class QiangZhiDraw extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage) {
    return stage === CardUseStage.CardUsing;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    if (event.fromId !== owner.Id || room.CurrentPhasePlayer !== owner) {
      return false;
    }

    return (
      owner.getFlag(this.GeneralName) !== undefined &&
      owner.getFlag(this.GeneralName) === Sanguosha.getCardById(event.cardId).BaseType
    );
  }

  getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher('{0}: do you want to draw a card?', this.GeneralName).extract();
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.GeneralName);
    return true;
  }
}

import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qingzhong', description: 'qingzhong_description' })
export class QingZhong extends TriggerSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PlayCardStage;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PlayCardStageStart;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return owner.Id === content.playerId;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher('qingzhong {0}: do you want to draw 2 cards?', this.Name).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(2, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: QingZhong.Name, description: QingZhong.Description })
export class QingZhongShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return (
      room.CurrentPlayerStage === PlayerPhaseStages.PlayCardStageEnd && stage === PhaseStageChangeStage.StageChanged
    );
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PlayCardStageEnd;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return owner.Id === content.playerId && owner.hasUsedSkill(this.GeneralName);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const handCards = room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea);
    const min = room.getOtherPlayers(event.fromId).reduce<number>((minimum, player) => {
      player.getCardIds(PlayerCardsArea.HandArea).length < minimum &&
        (minimum = player.getCardIds(PlayerCardsArea.HandArea).length);
      return minimum;
    }, handCards.length);

    if (min <= handCards.length) {
      const targets = room
        .getOtherPlayers(event.fromId)
        .filter(player => player.getCardIds(PlayerCardsArea.HandArea).length === min);
      if (targets.length > 0) {
        let toId = targets[0].Id;

        if (targets.length > 1 || handCards.length === min) {
          const players = targets.map(player => player.Id);
          const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
            GameEventIdentifiers.AskForChoosingPlayerEvent,
            {
              players,
              toId: event.fromId,
              requiredAmount: 1,
              conversation:
                handCards.length !== min
                  ? 'qingzhong: please choose a target to exchange hand cards'
                  : 'qingzhong: do you want to exchange hand cards?',
              triggeredBySkills: [this.Name],
            },
            event.fromId,
            handCards.length !== min,
          );

          handCards.length !== min &&
            (resp.selectedPlayers = resp.selectedPlayers || [players[Math.floor(Math.random() * players.length)]]);

          toId = resp.selectedPlayers && resp.selectedPlayers.length > 0 ? resp.selectedPlayers[0] : event.fromId;
        }

        if (toId !== event.fromId) {
          const firstCards = room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea).slice();
          const secondCards = room.getPlayerById(toId).getCardIds(PlayerCardsArea.HandArea).slice();
          await room.moveCards(
            {
              moveReason: CardMoveReason.PassiveMove,
              movingCards: firstCards.map(cardId => ({ card: cardId, fromArea: CardMoveArea.HandArea })),
              fromId: event.fromId,
              toArea: CardMoveArea.ProcessingArea,
              proposer: event.fromId,
              movedByReason: this.Name,
              engagedPlayerIds: [event.fromId],
            },
            {
              moveReason: CardMoveReason.PassiveMove,
              movingCards: secondCards.map(cardId => ({ card: cardId, fromArea: CardMoveArea.HandArea })),
              fromId: toId,
              toArea: CardMoveArea.ProcessingArea,
              proposer: toId,
              movedByReason: this.Name,
              engagedPlayerIds: [toId],
            },
          );

          await room.moveCards(
            {
              moveReason: CardMoveReason.PassiveMove,
              movingCards: secondCards.map(cardId => ({ card: cardId, fromArea: CardMoveArea.ProcessingArea })),
              toId: event.fromId,
              toArea: CardMoveArea.HandArea,
              proposer: toId,
              movedByReason: this.Name,
              engagedPlayerIds: [event.fromId, toId],
            },
            {
              moveReason: CardMoveReason.PassiveMove,
              movingCards: firstCards.map(cardId => ({ card: cardId, fromArea: CardMoveArea.ProcessingArea })),
              toId,
              toArea: CardMoveArea.HandArea,
              proposer: event.fromId,
              movedByReason: this.Name,
              engagedPlayerIds: [event.fromId, toId],
            },
          );
        }
      }
    }

    return true;
  }
}

import { CardId } from 'core/cards/libs/card_props';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import {
  AllStage,
  DrawCardStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'haoshi', description: 'haoshi_description' })
export class HaoShi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage) {
    return stage === DrawCardStage.CardDrawing;
  }

  isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.DrawCardStage;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>) {
    return (
      owner.Id === content.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      content.bySpecialReason === CardDrawReason.GameStage
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const drawCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;

    drawCardEvent.drawAmount += 2;
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: HaoShi.GeneralName, description: HaoShi.Description })
export class HaoShiShadow extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.BeforeStageChange;
  }

  isUncancellable() {
    return true;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId &&
      content.toStage === PlayerPhaseStages.DrawCardStageEnd &&
      owner.hasUsedSkill(this.GeneralName) &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 5
    );
  }

  public numberOfTargets() {
    return 1;
  }

  public getSkillLog(room: Room, owner: Player) {
    return TranslationPack.translationJsonPatcher(
      'please choose {0} handcards and give them to a target',
      Math.floor(owner.getCardIds(PlayerCardsArea.HandArea).length / 2),
    ).extract();
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    const handcardsNum = room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length;
    return (
      target !== owner &&
      !room.getOtherPlayers(owner).find(player => player.getCardIds(PlayerCardsArea.HandArea).length < handcardsNum)
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === Math.floor(owner.getCardIds(PlayerCardsArea.HandArea).length / 2);
  }

  public isAvailableCard(
    owner: PlayerId,
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds, cardIds, fromId } = skillUseEvent;

    await room.moveCards({
      movingCards: cardIds!.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      fromId,
      toId: toIds![0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      movedByReason: this.GeneralName,
      engagedPlayerIds: [toIds![0], fromId],
    });

    return true;
  }
}

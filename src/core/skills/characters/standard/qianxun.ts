import { CardType } from 'core/cards/card';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qianxun', description: 'qianxun_description' })
export class QianXun extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>, stage?: AllStage) {
    return stage === CardEffectStage.CardEffecting;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    if (
      Sanguosha.getCardById(content.cardId).BaseType !== CardType.Trick ||
      owner.getCardIds(PlayerCardsArea.HandArea).length === 0
    ) {
      return false;
    }

    return (
      !!content.allTargets &&
      content.allTargets.length === 1 &&
      content.fromId !== owner.Id &&
      content.allTargets.includes(owner.Id)
    );
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    skillUseEvent.messages = skillUseEvent.messages || [];
    skillUseEvent.messages.push(
      TranslationPack.translationJsonPatcher(
        '{0} moved all hand cards out of the game',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      ).toString(),
    );
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    const from = room.getPlayerById(fromId);
    await room.moveCards({
      movingCards: from.getCardIds(PlayerCardsArea.HandArea).map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      fromId,
      toId: fromId,
      toArea: PlayerCardsArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      toOutsideArea: this.Name,
      proposer: fromId,
      movedByReason: this.Name,
    });

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: QianXun.GeneralName, description: QianXun.Description })
export class QianXunShadow extends TriggerSkill implements OnDefineReleaseTiming {
  afterLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  isAutoTrigger() {
    return true;
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return stage === PhaseChangeStage.AfterPhaseChanged && event.to === PlayerPhase.PhaseFinish;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    return owner.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length > 0;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    const from = room.getPlayerById(fromId);
    const qianxunCards = from.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).slice();
    await room.moveCards({
      movingCards: qianxunCards.map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
      fromId,
      toId: fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      movedByReason: this.GeneralName,
      hideBroadcast: true,
    });
    return true;
  }
}

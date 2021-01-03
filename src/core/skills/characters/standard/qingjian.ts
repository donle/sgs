import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { GameCommonRules } from 'core/game/game_rules';
import { AllStage, CardMoveStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, OnDefineReleaseTiming, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qingjian', description: 'qingjian_description' })
export class QingJian extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return (
      owner.Id === content.toId &&
      content.toArea === CardMoveArea.HandArea &&
      room.CurrentPhasePlayer.Id === owner.Id &&
      room.CurrentPlayerPhase !== PlayerPhase.DrawCardStage &&
      !owner.hasUsedSkill(this.Name) &&
      owner.getPlayerCards().length !== 0
    );
  }

  public isRefreshAt(room: Room, owner: Player, phase: PlayerPhase): boolean {
    return phase === PlayerPhase.PhaseBegin;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  public async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds, cardIds, fromId } = skillUseEvent;
    if (cardIds === undefined || cardIds.length === 0) {
      return false;
    }

    const types: CardType[] = [];
    for (const cardId of cardIds) {
      const card = Sanguosha.getCardById(cardId);
      if (!types.includes(card.BaseType)) {
        types.push(card.BaseType);
      }
    }

    const to = room.getPlayerById(toIds![0]);
    const from = room.getPlayerById(fromId);
    const displayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      fromId,
      displayCards: cardIds!,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} displayed cards {1}',
        TranslationPack.patchPlayerInTranslation(from),
        TranslationPack.patchCardInTranslation(...cardIds!),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, displayEvent);

    await room.moveCards({
      movingCards: cardIds!.map(card => ({ card, fromArea: from.cardFrom(card) })),
      fromId,
      toId: to.Id,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      movedByReason: this.GeneralName,
    });

    room.syncGameCommonRules(room.CurrentPlayer.Id, user => {
      user.addInvisibleMark(this.Name, types.length);
      GameCommonRules.addAdditionalHoldCardNumber(user, types.length);
    });
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: 'qingjian', description: 'qingjian_description' })
export class QingJianShadow extends TriggerSkill implements OnDefineReleaseTiming {
  afterLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isAutoTrigger() {
    return true;
  }
  public isFlaggedSkill() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: PhaseChangeStage) {
    return stage === PhaseChangeStage.PhaseChanged && event.from === PlayerPhase.PhaseFinish;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    return true;
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = event;
    const phaseChangeEvent = Precondition.exists(
      triggeredOnEvent,
      'Unknown phase change event in qingjian',
    ) as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;

    phaseChangeEvent.fromPlayer &&
      room.syncGameCommonRules(phaseChangeEvent.fromPlayer, user => {
        const extraHold = user.getInvisibleMark(this.GeneralName);
        user.removeInvisibleMark(this.GeneralName);
        GameCommonRules.addAdditionalHoldCardNumber(user, -extraHold);
      });
    return true;
  }
}

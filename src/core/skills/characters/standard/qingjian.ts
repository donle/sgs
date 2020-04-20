import { CommonSkill, TriggerSkill, ShadowSkill } from 'core/skills/skill';
import { ServerEventFinder, GameEventIdentifiers, CardLostReason, CardObtainedReason } from 'core/event/event';
import { AllStage, ObtainCardStage, PlayerPhase, PhaseChangeStage } from 'core/game/stage_processor';
import { Room } from 'core/room/room';
import { Player } from 'core/player/player';
import { PlayerId, PlayerCardsArea } from 'core/player/player_props';
import { CardId } from 'core/cards/libs/card_props';
import { GameCommonRules } from 'core/game/game_rules';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { CardType } from 'core/cards/card';
import { Sanguosha } from 'core/game/engine';

@CommonSkill
export class QingJian extends TriggerSkill {
  constructor() {
    super('qingjian', 'qingjian_description');
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.ObtainCardEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === ObtainCardStage.AfterObtainCardEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.ObtainCardEvent>,
  ): boolean {
    return (
      owner.Id === content.toId &&
      room.CurrentPlayerPhase !== PlayerPhase.DrawCardStage &&
      !owner.hasUsedSkill(this.name) &&
      owner.getPlayerCards().length !== 0
    );
  }

  public isRefreshAt(phase: PlayerPhase): boolean {
    return phase === PlayerPhase.PrepareStage;
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  public cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.getPlayerById(owner).getPlayerCards().includes(cardId);
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

    let types: CardType[] = [CardType.Basic, CardType.Trick, CardType.Equip]
    for (const cardId of cardIds) {
      if (types.length === 0) {
        break;
      }
      const card = Sanguosha.getCardById(cardId);
      types = types.filter(type => !card.is(type));
    }

    const from = room.getPlayerById(fromId);
    const displayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      fromId: fromId,
      displayCards: cardIds!,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} displayed cards {1}',
        TranslationPack.patchPlayerInTranslation(from),
        TranslationPack.patchCardInTranslation(...cardIds!),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, displayEvent);

    await room.moveCards(
      cardIds!,
      fromId,
      toIds![0],
      CardLostReason.ActiveMove,
      undefined,
      PlayerCardsArea.HandArea,
      CardObtainedReason.PassiveObtained,
      fromId,
      this.GeneralName,
    );

    room.syncGameCommonRules(room.CurrentPlayer.Id, user => {
        user.addInvisibleMark(this.name, 3 - types.length);
        GameCommonRules.addAdditionalHoldCardNumber(user, 3 - types.length);
    });
    return true;
  }
}

@CommonSkill
@ShadowSkill()
export class QingJianShadow extends TriggerSkill {
  constructor() {
    super('qingjian', 'qingjian_description');
  }

  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: PhaseChangeStage) {
    return stage === PhaseChangeStage.AfterPhaseChanged && event.from === PlayerPhase.FinishStage;
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

import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { CommonSkill, OnDefineReleaseTiming, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'heji', description: 'heji_description' })
export class HeJi extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    if (TargetGroupUtil.getRealTargets(content.targetGroup).length !== 1) {
      return false;
    }

    const target = TargetGroupUtil.getRealTargets(content.targetGroup)[0];
    const card = Sanguosha.getCardById(content.cardId);
    return (card.GeneralName === 'slash' || card.GeneralName === 'duel') && card.isRed() && target !== owner.Id;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const target = TargetGroupUtil.getRealTargets(
      (triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).targetGroup,
    )[0];

    const askForUseCard: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
      toId: fromId,
      scopedTargets: [target],
      extraUse: true,
      cardMatcher: new CardMatcher({ generalName: ['slash', 'duel'] }).toSocketPassenger(),
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: do you want to use a slash or duel to {1} ?',
        this.Name,
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(target)),
      ).extract(),
      triggeredBySkills: [this.Name],
    };
    const response = await room.askForCardUse(askForUseCard, fromId);

    if (response.cardId) {
      room.getPlayerById(fromId).setFlag<CardId>(this.Name, response.cardId);
      return true;
    }

    return false;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const cardId = room.getFlag<CardId>(fromId, this.Name);

    const cardUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
      fromId,
      cardId,
      targetGroup: (triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).targetGroup,
      extraUse: true,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} used skill {1}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        this.Name,
      ).extract(),
    };

    EventPacker.addMiddleware({ tag: this.Name, data: true }, cardUseEvent);

    await room.useCard(cardUseEvent, true);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: HeJi.Name, description: HeJi.Description })
export class HeJiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      EventPacker.getMiddleware<boolean>(this.GeneralName, content) === true &&
      !Sanguosha.getCardById(content.cardId).isVirtualCard()
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    const reds = room.findCardsByMatcherFrom(new CardMatcher({ suit: [CardSuit.Diamond, CardSuit.Heart] }));

    if (reds.length > 0) {
      await room.moveCards({
        movingCards: [{ card: reds[Math.floor(Math.random() * reds.length)], fromArea: CardMoveArea.DrawStack }],
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: fromId,
        triggeredBySkills: [this.GeneralName],
      });
    }

    return true;
  }
}

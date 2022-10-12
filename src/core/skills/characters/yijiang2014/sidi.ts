import { CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardColor, CardId, CardSuit } from 'core/cards/libs/card_props';
import { Slash } from 'core/cards/standard/slash';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { FilterSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'sidi', description: 'sidi_description' })
export class SiDi extends TriggerSkill {
  public static readonly SiDiTarget = 'sidi_target';

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      (content.toStage === PlayerPhaseStages.FinishStageStart &&
        content.playerId === owner.Id &&
        owner.getPlayerCards().find(id => !Sanguosha.getCardById(id).is(CardType.Basic)) !== undefined) ||
      (content.toStage === PlayerPhaseStages.PlayCardStageStart &&
        content.playerId !== owner.Id &&
        owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length > 0)
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId } = event;
    const phaseStageChangeEvent =
      event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
    const availableCards =
      phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart
        ? room
            .getPlayerById(fromId)
            .getPlayerCards()
            .filter(id => !Sanguosha.getCardById(id).is(CardType.Basic))
        : room.getPlayerById(fromId).getCardIds(PlayerCardsArea.OutsideArea, this.Name);

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
      GameEventIdentifiers.AskForCardEvent,
      {
        cardAmount: 1,
        toId: fromId,
        reason: this.Name,
        conversation:
          phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart
            ? TranslationPack.translationJsonPatcher(
                '{0}: do you want to put a card except basic card onto your general card?',
                this.Name,
              ).extract()
            : TranslationPack.translationJsonPatcher(
                '{0}: do you want to remove a ‘Si’ to let {1} be unable to use card?',
                this.Name,
                TranslationPack.patchPlayerInTranslation(room.getPlayerById(phaseStageChangeEvent.playerId)),
              ).extract(),
        fromArea:
          phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart
            ? [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea]
            : [PlayerCardsArea.OutsideArea],
        cardMatcher: new CardMatcher({ cards: availableCards }).toSocketPassenger(),
        triggeredBySkills: [this.Name],
      },
      fromId,
    );

    if (response && response.selectedCards.length > 0) {
      event.cardIds = response.selectedCards;
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, cardIds } = event;
    if (!cardIds) {
      return false;
    }

    const phaseStageChangeEvent =
      event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
    if (phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart) {
      await room.moveCards({
        movingCards: [
          {
            card: cardIds[0],
            fromArea: room.getPlayerById(fromId).cardFrom(cardIds[0]),
          },
        ],
        fromId,
        toId: fromId,
        toArea: CardMoveArea.OutsideArea,
        moveReason: CardMoveReason.ActiveMove,
        toOutsideArea: this.Name,
        isOutsideAreaInPublic: true,
        proposer: fromId,
        movedByReason: this.Name,
        triggeredBySkills: [this.Name],
      });
    } else {
      await room.moveCards({
        movingCards: [{ card: cardIds[0], fromArea: CardMoveArea.OutsideArea }],
        fromId,
        toArea: CardMoveArea.DropStack,
        moveReason: CardMoveReason.PlaceToDropStack,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      });

      const originalColor = room.getFlag<CardColor[]>(phaseStageChangeEvent.playerId, this.Name) || [];
      originalColor.includes(Sanguosha.getCardById(cardIds[0]).Color) ||
        originalColor.push(Sanguosha.getCardById(cardIds[0]).Color);

      let text = '{0}[';
      for (let i = 1; i <= originalColor.length; i++) {
        text = text + '{' + i + '}';
      }

      text = text + ']';
      room.setFlag<CardColor[]>(
        phaseStageChangeEvent.playerId,
        this.Name,
        originalColor,
        TranslationPack.translationJsonPatcher(
          text,
          this.Name,
          ...originalColor.map(color => Functional.getCardColorRawText(color)),
        ).toString(),
      );
      room.getPlayerById(phaseStageChangeEvent.playerId).hasShadowSkill(SiDiBlocker.Name) ||
        (await room.obtainSkill(phaseStageChangeEvent.playerId, SiDiBlocker.Name));
      room.getPlayerById(phaseStageChangeEvent.playerId).hasShadowSkill(SiDiRemover.Name) ||
        (await room.obtainSkill(phaseStageChangeEvent.playerId, SiDiRemover.Name));

      room.getPlayerById(fromId).setFlag<boolean>(SiDi.SiDiTarget, true);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: SiDi.Name, description: SiDi.Description })
export class SiDiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && content.toStage === PlayerPhaseStages.PlayCardStageEnd;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return owner.getFlag<boolean>(SiDi.SiDiTarget) && event.toStage === PlayerPhaseStages.PlayCardStageEnd;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, SiDi.SiDiTarget);

    const current = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId;
    const records = room.Analytics.getCardUseRecord(current, 'phase');

    if (!records.find(event => Sanguosha.getCardById(event.cardId).GeneralName === 'slash')) {
      const slash = VirtualCard.create<Slash>({ cardName: 'slash', bySkill: this.GeneralName }).Id;
      room.getPlayerById(event.fromId).canUseCardTo(room, slash, current, true) &&
        (await room.useCard({
          fromId: event.fromId,
          targetGroup: [[current]],
          cardId: slash,
          triggeredBySkills: [this.GeneralName],
        }));
    }

    records.find(event => Sanguosha.getCardById(event.cardId).is(CardType.Trick)) ||
      (await room.drawCards(2, event.fromId, 'top', event.fromId, this.GeneralName));
    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_sidi_blocker', description: 's_sidi_blocker_description' })
export class SiDiBlocker extends FilterSkill {
  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    const colors = room.getFlag<CardColor[]>(owner, SiDi.Name);
    if (colors === undefined) {
      return true;
    }

    if (cardId instanceof CardMatcher) {
      const suits: CardSuit[] = [];
      colors.includes(CardColor.Red) && suits.push(...[CardSuit.Diamond, CardSuit.Heart]);
      colors.includes(CardColor.Black) && suits.push(...[CardSuit.Spade, CardSuit.Club]);
      return !cardId.match(new CardMatcher({ suit: suits }));
    } else {
      return !colors.includes(Sanguosha.getCardById(cardId).Color);
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_sidi_remover', description: 's_sidi_remover_description' })
export class SiDiRemover extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public async whenDead(room: Room, player: Player) {
    room.removeFlag(player.Id, SiDi.Name);

    room.getPlayerById(player.Id).hasShadowSkill(SiDiBlocker.Name) &&
      (await room.loseSkill(player.Id, SiDiBlocker.Name));
    room.getPlayerById(player.Id).hasShadowSkill(this.Name) && (await room.loseSkill(player.Id, this.Name));
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PlayCardStage &&
      owner.getFlag<number>(SiDi.Name) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, SiDi.Name);

    room.getPlayerById(event.fromId).hasShadowSkill(SiDiBlocker.Name) &&
      (await room.loseSkill(event.fromId, SiDiBlocker.Name));
    room.getPlayerById(event.fromId).hasShadowSkill(this.Name) && (await room.loseSkill(event.fromId, this.Name));
    return true;
  }
}

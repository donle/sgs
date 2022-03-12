import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardColor, CardId, CardSuit } from 'core/cards/libs/card_props';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage, DrawCardStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { Functional } from 'core/shares/libs/functional';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'pianchong', description: 'pianchong_description' })
export class PianChong extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage): boolean {
    return stage === DrawCardStage.BeforeDrawCardEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>): boolean {
    return (
      owner.Id === content.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      content.bySpecialReason === CardDrawReason.GameStage &&
      content.drawAmount > 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const drawCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;

    drawCardEvent.drawAmount = 0;
    const redCards = room.findCardsByMatcherFrom(new CardMatcher({ suit: [CardSuit.Diamond, CardSuit.Heart] }));
    const blackCards = room.findCardsByMatcherFrom(new CardMatcher({ suit: [CardSuit.Club, CardSuit.Spade] }));

    const toGain: CardId[] = [];
    redCards.length > 0 && toGain.push(redCards[Math.floor(Math.random() * redCards.length)]);
    blackCards.length > 0 && toGain.push(blackCards[Math.floor(Math.random() * blackCards.length)]);

    toGain.length > 0 &&
      (await room.moveCards({
        movingCards: toGain.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      }));

    const options = ['pianchong:loseBlack', 'pianchong:loseRed'];
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose pianchong options',
          this.Name,
        ).extract(),
        toId: fromId,
        triggeredBySkills: [this.Name],
      },
      fromId,
      true,
    );

    response.selectedOption = response.selectedOption || options[0];

    const color = response.selectedOption === options[1] ? CardColor.Red : CardColor.Black;
    const originalColors = room.getFlag<CardColor[]>(fromId, this.Name) || [];
    originalColors.includes(color) || originalColors.push(color);
    room.setFlag<CardColor[]>(
      fromId,
      this.Name,
      originalColors,
      originalColors.length > 1
        ? TranslationPack.translationJsonPatcher(
            'pianchong: {0} {1}',
            ...originalColors.map(color => Functional.getCardColorRawText(color)),
          ).toString()
        : TranslationPack.translationJsonPatcher(
            'pianchong: {0}',
            Functional.getCardColorRawText(originalColors[0]),
          ).toString(),
    );

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: PianChong.Name, description: PianChong.Description })
export class PianChongShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public async whenDead(room: Room, player: Player) {
    room.removeFlag(player.Id, this.GeneralName);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.MoveCardEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseChangeStage.PhaseChanged || stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.MoveCardEvent>,
  ): boolean {
    const colors = owner.getFlag<CardColor[]>(this.GeneralName);
    if (!colors || colors.length === 0) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.toPlayer === owner.Id && phaseChangeEvent.to === PlayerPhase.PhaseBegin;
    } else if (identifier === GameEventIdentifiers.MoveCardEvent) {
      const moveCardEvent = event as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      return (
        moveCardEvent.infos.find(
          info =>
            info.fromId === owner.Id &&
            !(
              info.toId === owner.Id &&
              (info.toArea === CardMoveArea.HandArea || info.toArea === CardMoveArea.EquipArea)
            ) &&
            info.movingCards.find(
              card =>
                (card.fromArea === CardMoveArea.HandArea || card.fromArea === CardMoveArea.EquipArea) &&
                !Sanguosha.isVirtualCardId(card.card) &&
                colors.includes(Sanguosha.getCardById(card.card).Color),
            ),
        ) !== undefined
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.MoveCardEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      room.removeFlag(fromId, this.GeneralName);
    } else {
      let redNum = 0;
      let blackNum = 0;

      const color = room.getFlag<CardColor[]>(fromId, this.GeneralName);
      for (const info of (unknownEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos) {
        if (
          !(
            info.fromId === fromId &&
            !(info.toId === fromId && (info.toArea === CardMoveArea.HandArea || info.toArea === CardMoveArea.EquipArea))
          )
        ) {
          continue;
        }

        for (const cardInfo of info.movingCards) {
          if (
            !(cardInfo.fromArea === CardMoveArea.HandArea || cardInfo.fromArea === CardMoveArea.EquipArea) ||
            Sanguosha.isVirtualCardId(cardInfo.card)
          ) {
            continue;
          }

          if (Sanguosha.getCardById(cardInfo.card).isBlack() && color.includes(CardColor.Black)) {
            blackNum++;
          } else if (Sanguosha.getCardById(cardInfo.card).isRed() && color.includes(CardColor.Red)) {
            redNum++;
          }
        }
      }

      const toGain: CardId[] = [];
      if (blackNum > 0) {
        const redCards = room.findCardsByMatcherFrom(new CardMatcher({ suit: [CardSuit.Diamond, CardSuit.Heart] }));
        if (redCards.length > 0) {
          toGain.push(...Algorithm.randomPick(Math.min(redCards.length, blackNum), redCards));
        }
      }
      if (redNum > 0) {
        const blackCards = room.findCardsByMatcherFrom(new CardMatcher({ suit: [CardSuit.Club, CardSuit.Spade] }));
        if (blackCards.length > 0) {
          toGain.push(...Algorithm.randomPick(Math.min(blackCards.length, redNum), blackCards));
        }
      }

      toGain.length > 0 &&
        (await room.moveCards({
          movingCards: toGain.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: fromId,
          triggeredBySkills: [this.Name],
        }));
    }

    return true;
  }
}

import { CardType } from 'core/cards/card';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DrawCardStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'duliang', description: 'duliang_description' })
export class DuLiang extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  public async onUse() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.toIds) {
      return false;
    }

    const toId = event.toIds[0];
    const choosingOption: CardChoosingOptions = {
      [PlayerCardsArea.HandArea]: room.getPlayerById(toId).getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent = {
      fromId: event.fromId,
      toId,
      options: choosingOption,
      triggeredBySkills: [this.Name],
    };

    const response = await room.askForChoosingPlayerCard(chooseCardEvent, chooseCardEvent.fromId, false, true);
    if (!response) {
      return false;
    }

    await room.moveCards({
      movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
      fromId: chooseCardEvent.toId,
      toId: chooseCardEvent.fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: chooseCardEvent.fromId,
      movedByReason: this.Name,
    });

    const options = ['duliang:basic', 'duliang:drawMore'];
    const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose duliang options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(toId)),
        ).extract(),
        toId: event.fromId,
        triggeredBySkills: [this.Name],
      },
      event.fromId,
    );

    resp.selectedOption = resp.selectedOption || options[0];

    if (resp.selectedOption === options[1]) {
      let originalDrawNum = room.getFlag<number>(toId, this.Name) || 0;
      originalDrawNum++;
      room.setFlag<number>(
        toId,
        this.Name,
        originalDrawNum,
        TranslationPack.translationJsonPatcher('duliang: {0}', originalDrawNum).toString(),
      );

      room.getPlayerById(toId).hasShadowSkill(DuLiangBuff.Name) || (await room.obtainSkill(toId, DuLiangBuff.Name));
    } else {
      const topCards = room.getCards(2, 'top');
      room.displayCards(toId, topCards, [toId]);

      const basics: CardId[] = [];
      const leftCards: CardId[] = [];
      for (const cardId of topCards) {
        if (Sanguosha.getCardById(cardId).is(CardType.Basic)) {
          basics.push(cardId);
        } else {
          leftCards.push(cardId);
        }
      }

      basics.length > 0 &&
        (await room.moveCards({
          movingCards: basics.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
          toId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: toId,
          triggeredBySkills: [this.Name],
        }));

      leftCards.length > 0 && room.putCards('top', ...leftCards.reverse());
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_duliang_buff', description: 's_duliang_buff_description' })
export class DuLiangBuff extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage): boolean {
    return stage === DrawCardStage.CardDrawing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>): boolean {
    return (
      owner.Id === content.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      content.bySpecialReason === CardDrawReason.GameStage
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const drawNum = room.getFlag<number>(event.fromId, DuLiang.Name);
    if (drawNum !== undefined) {
      (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>).drawAmount += drawNum;
      room.removeFlag(event.fromId, DuLiang.Name);
    }

    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}

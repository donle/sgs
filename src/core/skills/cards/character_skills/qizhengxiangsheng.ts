import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ExtralCardSkillProperty } from '../interface/extral_property';

@CommonSkill({ name: 'qizhengxiangsheng', description: 'qizhengxiangsheng_description' })
export class QiZhengXiangShengSkill extends ActiveSkill implements ExtralCardSkillProperty {
  public canUse() {
    return true;
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }

  public isCardAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return (
      target !== owner &&
      room.getPlayerById(owner).canUseCardTo(room, containerCard, target) &&
      room.getPlayerById(target).getCardIds().length > 0
    );
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return this.isCardAvailableTarget(owner, room, target, selectedCards, selectedTargets, containerCard);
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const toId = Precondition.exists(event.toIds, 'Unknown targets in guohechaiqiao')[0];
    const fromId = Precondition.exists(event.fromId, 'Unknown targets in guohechaiqiao');
    const { cardId } = event;
    if (toId === fromId) {
      return true;
    }

    const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options: ['qibing', 'zhengbing'],
      toId: fromId,
      conversation: 'please choose',
    };

    const { selectedOption } = await room.doAskForCommonly(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      askForChoosingOptionsEvent,
      fromId,
      true,
    );

    const isQiBingSelected = selectedOption === 'qibing';

    const askForCardEvent = {
      cardMatcher: new CardMatcher({
        generalName: ['slash', 'jink'],
      }).toSocketPassenger(),
      byCardId: cardId,
      cardUserId: fromId,
      conversation:
        fromId !== undefined
          ? TranslationPack.translationJsonPatcher(
              '{0} used {1} to you, please response a {2} or {3} card',
              TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
              TranslationPack.patchCardInTranslation(cardId),
              'slash',
              'jink',
            ).extract()
          : TranslationPack.translationJsonPatcher('please response a {0} or {1} card', 'slash', 'jink').extract(),
      triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.Name] : [this.Name],
    };

    const response = await room.askForCardResponse(
      {
        ...askForCardEvent,
        toId,
        triggeredBySkills: [this.Name],
      },
      toId,
    );

    const responseCard = response.cardId!;
    const cardResponsedEvent: ServerEventFinder<GameEventIdentifiers.CardResponseEvent> = {
      fromId: toId,
      cardId: responseCard,
      responseToEvent: event,
      triggeredBySkills: [this.Name],
    };
    await room.responseCard(cardResponsedEvent);

    if (responseCard) {
      if (isQiBingSelected && Sanguosha.getCardById(responseCard).GeneralName !== 'slash') {
        await this.doQiBingSelection(fromId, toId, room, cardId);
      } else if (!isQiBingSelected && Sanguosha.getCardById(responseCard).GeneralName !== 'jink') {
        await this.doZhengBingSelection(fromId, toId, room);
      }
    } else {
      if (isQiBingSelected) {
        await this.doQiBingSelection(fromId, toId, room, cardId);
      } else {
        await this.doZhengBingSelection(fromId, toId, room);
      }
    }

    return true;
  }

  private async doQiBingSelection(from: PlayerId, to: PlayerId, room: Room, cardId: CardId) {
    const fromPlayer = room.getPlayerById(from);
    const toPlayer = room.getPlayerById(to);

    await room.damage({
      fromId: from,
      toId: to,
      damage: 1,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
      cardIds: [cardId],
      translationsMessage: TranslationPack.translationJsonPatcher(
        'player {0} selected {1}, {2} get 1 damage hit from {0}',
        TranslationPack.patchPlayerInTranslation(fromPlayer),
        'qibing',
        TranslationPack.patchPlayerInTranslation(toPlayer),
      ).extract(),
    });
  }

  private async doZhengBingSelection(from: PlayerId, to: PlayerId, room: Room) {
    const toPlayer = room.getPlayerById(to);

    if (toPlayer.getPlayerCards().length === 0) {
      return;
    }

    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: toPlayer.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: toPlayer.getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent = {
      fromId: from,
      toId: to,
      options,
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
      moveReason: CardMoveReason.ActivePrey,
      toArea: CardMoveArea.HandArea,
      proposer: chooseCardEvent.fromId,
    });
  }
}

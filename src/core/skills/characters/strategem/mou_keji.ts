import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, FilterSkill, RulesBreakerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'mou_keji', description: 'mou_keji_description' })
export class MouKeJi extends ActiveSkill {
  private readonly Options = ['mou_keji:discard', 'mou_keji:loseHp'];

  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) && (owner.Hp > 0 || owner.getPlayerCards().length > 0);
  }

  public chooseOptions(room: Room, owner: Player): string[] {
    return this.Options;
  }

  public cardFilter(
    room: Room,
    owner: Player,
    cards: CardId[],
    selectedTargets: PlayerId[],
    cardId?: CardId,
    selectedOption?: string,
  ): boolean {
    return selectedOption === this.Options[0] ? cards.length === 1 : cards.length === 0;
  }

  public numberOfTargets() {
    return 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard() {
    return true;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (event.cardIds) {
      await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId, event.fromId, this.Name);
      await room.changeArmor(event.fromId, 1);
    } else {
      await room.loseHp(event.fromId, 1);
      await room.changeArmor(event.fromId, 2);
    }

    if (room.AlivePlayers.length < 5) {
      return true;
    }

    if (event.cardIds) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options: ['yes', 'no'],
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose mou_keji options',
            this.Name,
          ).extract(),
          toId: event.fromId,
          triggeredBySkills: [this.Name],
        },
        event.fromId,
        true,
      );

      if (response.selectedOption === 'yes') {
        await room.loseHp(event.fromId, 1);
        await room.changeArmor(event.fromId, 2);
      }
    } else {
      const response = await room.askForCardDrop(
        event.fromId,
        1,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        false,
        undefined,
        this.Name,
        TranslationPack.translationJsonPatcher(
          '{0}: do you want to discard a card to gain 1 armor?',
          this.Name,
        ).extract(),
      );

      if (response.droppedCards.length > 0) {
        await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, event.fromId, event.fromId, this.Name);
        await room.changeArmor(event.fromId, 1);
      }
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: MouKeJi.Name, description: MouKeJi.Description })
export class MouKeJiShadow extends RulesBreakerSkill {
  public breakAdditionalCardHoldNumber(room: Room, owner: Player): number {
    return owner.Armor;
  }
}

@ShadowSkill
@CommonSkill({ name: MouKeJiShadow.Name, description: MouKeJiShadow.Description })
export class MouKeJiBlocker extends FilterSkill {
  public canUseCard(
    cardId: CardId | CardMatcher,
    room: Room,
    owner: PlayerId,
    onResponse?: ServerEventFinder<GameEventIdentifiers>,
    isCardResponse?: boolean,
  ): boolean {
    if (isCardResponse || room.getPlayerById(owner).Dying) {
      return true;
    }

    if (cardId instanceof CardMatcher) {
      return !cardId.match(new CardMatcher({ name: ['peach'] }));
    } else {
      return Sanguosha.getCardById(cardId).GeneralName !== 'peach';
    }
  }
}

import { DuJiang } from './dujiang';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, FilterSkill, RulesBreakerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';

const enum MouKeJiOption {
  Discard,
  LoseHp,
}

@CommonSkill({ name: 'mou_keji', description: 'mou_keji_description' })
export class MouKeJi extends ActiveSkill {
  public whenRefresh(room: Room, owner: Player): void {
    room.removeFlag(owner.Id, this.Name);
  }

  public canUse(room: Room, owner: Player) {
    return (
      (owner.hasUsedSkill(DuJiang.Name) ? !owner.hasUsedSkill(this.Name) : owner.hasUsedSkillTimes(this.Name) < 2) &&
      (owner.Hp > 0 || owner.getPlayerCards().length > 0)
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    const optionsChosen = owner.getFlag<MouKeJiOption[]>(this.Name) || [];
    if (optionsChosen.length === 0) {
      return cards.length < 2;
    }
    return owner.getFlag<MouKeJiOption[]>(this.Name)[0] === MouKeJiOption.Discard
      ? cards.length === 0
      : cards.length === 1;
  }

  public numberOfTargets() {
    return 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public availableCardAreas(): PlayerCardsArea[] {
    return [PlayerCardsArea.HandArea];
  }

  public async onUse() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const optionsChosen = room.getFlag<MouKeJiOption[]>(event.fromId, this.Name) || [];
    if (event.cardIds) {
      await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId, event.fromId, this.Name);
      await room.changeArmor(event.fromId, 1);

      optionsChosen.push(MouKeJiOption.Discard);
    } else {
      await room.loseHp(event.fromId, 1);
      await room.changeArmor(event.fromId, 2);

      optionsChosen.push(MouKeJiOption.LoseHp);
    }

    room.setFlag<MouKeJiOption[]>(event.fromId, this.Name, optionsChosen);

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

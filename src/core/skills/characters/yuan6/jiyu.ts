import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, FilterSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jiyu', description: 'jiyu_description' })
export class JiYu extends ActiveSkill {
  public static readonly BannedSuits = 'jiyu_banned_suits';

  public whenRefresh(room: Room, owner: Player) {
    for (const flagName of [this.Name, JiYu.BannedSuits]) {
      owner.getFlag(flagName) && room.removeFlag(owner.Id, flagName);
    }
  }

  public canUse(room: Room, owner: Player) {
    return !!owner.getCardIds(PlayerCardsArea.HandArea).find(cardId => owner.canUseCard(room, cardId));
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      !(room.getPlayerById(owner).getFlag<PlayerId[]>(this.Name) || []).includes(target)
    );
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.toIds) {
      return false;
    }

    const response = await room.askForCardDrop(
      event.toIds[0],
      1,
      [PlayerCardsArea.HandArea],
      true,
      undefined,
      this.Name,
      TranslationPack.translationJsonPatcher(
        '{0}: please discard a hand card, {1} will gain debuff according to this card',
        this.Name,
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      ).extract(),
    );

    if (response.droppedCards) {
      const bannedSuits = room.getFlag<CardSuit[]>(event.fromId, JiYu.BannedSuits) || [];
      const suitDiscarded = Sanguosha.getCardById(response.droppedCards[0]).Suit;
      if (!bannedSuits.includes(suitDiscarded)) {
        bannedSuits.push(suitDiscarded);
        room.setFlag<CardSuit[]>(event.fromId, JiYu.BannedSuits, bannedSuits);
      }

      await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, event.toIds[0], event.toIds[0], this.Name);
      const originalTargets = room.getFlag<PlayerId[]>(event.fromId, this.Name) || [];
      originalTargets.push(event.toIds[0]);
      room.setFlag<PlayerId[]>(event.fromId, this.Name, originalTargets);

      if (suitDiscarded === CardSuit.Spade) {
        await room.turnOver(event.fromId);
        await room.loseHp(event.toIds[0], 1);
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: JiYu.Name, description: JiYu.Description })
export class JiYuBlocker extends FilterSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public canUseCard(
    cardId: CardId | CardMatcher,
    room: Room,
    owner: PlayerId,
    onResponse?: ServerEventFinder<GameEventIdentifiers>,
    isCardResponse?: boolean,
  ): boolean {
    return (
      cardId instanceof CardMatcher ||
      isCardResponse ||
      !(
        (room.getFlag<CardSuit[]>(owner, JiYu.BannedSuits) || []).includes(Sanguosha.getCardById(cardId).Suit) &&
        room.getPlayerById(owner).cardFrom(cardId) === PlayerCardsArea.HandArea
      )
    );
  }
}

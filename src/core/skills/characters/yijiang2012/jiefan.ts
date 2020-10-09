import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@LimitSkill({ name: 'jiefan', description: 'jiefan_description' })
export class JieFan extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return true;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return true;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { toIds } = event;
    const to = room.getPlayerById(toIds![0]);
    const targets = room.getOtherPlayers(toIds![0])
      .filter(player => player.getAttackDistance(room) >= room.distanceBetween(player, to));

    for (const player of targets) {
      const response = await room.askForCardDrop(
        player.Id,
        1,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        false,
        player.getPlayerCards().filter(cardId => !Sanguosha.getCardById(cardId).is(CardType.Weapon)),
        this.Name,
        TranslationPack.translationJsonPatcher(
          '{0}: please drop a weapon, or {1} will draw a card',
          this.Name,
          TranslationPack.patchPlayerInTranslation(to),
        ).extract(),
      );

      if (response.droppedCards.length > 0) {
        await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, player.Id, player.Id, this.Name);
      } else {
        await room.drawCards(1, toIds![0], 'top', player.Id, this.Name);
      }
    }

    return true;
  }
}

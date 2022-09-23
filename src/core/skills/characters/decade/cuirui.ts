import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';

@LimitSkill({ name: 'cuirui', description: 'cuirui_description' })
export class CuiRui extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return true;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return [];
  }

  public targetFilter(room: Room, owner: Player, targets: string[]): boolean {
    return targets.length > 0 && targets.length <= owner.Hp;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.toIds) {
      return false;
    }

    for (const toId of event.toIds) {
      const to = room.getPlayerById(toId);

      const options: CardChoosingOptions = {
        [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId: event.fromId,
        toId,
        options,
        triggeredBySkills: [this.Name],
      };

      const response = await room.askForChoosingPlayerCard(chooseCardEvent, event.fromId, false, true);

      if (response && response.selectedCard) {
        await room.moveCards({
          movingCards: [{ card: response.selectedCard, fromArea: CardMoveArea.HandArea }],
          fromId: toId,
          toId: event.fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: event.fromId,
          triggeredBySkills: [this.Name],
        });
      }
    }

    return true;
  }
}

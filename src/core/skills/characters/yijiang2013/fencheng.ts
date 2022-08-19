import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';

@LimitSkill({ name: 'fencheng', description: 'fencheng_description' })
export class FenCheng extends ActiveSkill {
  public canUse() {
    return true;
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, SkillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = SkillEffectEvent;
    let x: number = 1;
    for (const player of room.getOtherPlayers(fromId)) {
      const playerCardsLength = player.getPlayerCards().filter(id => room.canDropCard(player.Id, id)).length;

      const options = ['option-one', 'option-two'];
      playerCardsLength < x && options.shift();

      const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options,
        conversation: 'please choose: fencheng-options',
        toId: player.Id,
        askedBy: SkillEffectEvent.fromId,
        triggeredBySkills: [this.Name],
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(
          askForChoosingOptionsEvent,
        ),
        player.Id,
      );

      const { selectedOption } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        player.Id,
      );

      if (selectedOption === 'option-one') {
        const response = await room.askForCardDrop(
          player.Id,
          [x, playerCardsLength],
          [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          false,
          undefined,
          this.Name,
        );

        if (response.droppedCards.length > 0) {
          x = response.droppedCards.length + 1;
          await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, player.Id, player.Id, this.GeneralName);
        } else {
          await room.damage({
            fromId: SkillEffectEvent.fromId,
            toId: player.Id,
            damage: 2,
            damageType: DamageType.Fire,
            triggeredBySkills: [this.Name],
          });
        }
      } else {
        await room.damage({
          fromId: SkillEffectEvent.fromId,
          toId: player.Id,
          damage: 2,
          damageType: DamageType.Fire,
          triggeredBySkills: [this.Name],
        });
      }
    }
    return true;
  }
}

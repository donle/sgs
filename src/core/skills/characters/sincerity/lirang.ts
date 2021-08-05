import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'lirang', description: 'lirang_description' })
export class LiRang extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }
  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);
    const handcards = from.getCardIds(PlayerCardsArea.HandArea).slice();
    await room.dropCards(CardMoveReason.SelfDrop, handcards, fromId, fromId, this.Name);

    const toGive = handcards.filter(id => room.isCardInDropStack(id));
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardWithConditionsEvent>(
      GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
      {
        toId: fromId,
        cardIds: toGive,
        customTitle: this.Name,
        amount: [1, from.Hp],
        triggeredBySkills: [this.Name],
      },
      fromId,
      true,
    );

    response.selectedCards = response.selectedCards || [toGive[0]];

    const players = room.getOtherPlayers(fromId).map(player => player.Id);
    const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players,
        toId: fromId,
        requiredAmount: 1,
        conversation: 'lirang: please choose a target to give cards',
        triggeredBySkills: [this.Name],
      },
      fromId,
      true,
    );

    resp.selectedPlayers = resp.selectedPlayers || [players[Math.floor(Math.random() * players.length)]];

    await room.moveCards({
      movingCards: response.selectedCards.map(card => ({ card, fromArea: CardMoveArea.DropStack })),
      toId: resp.selectedPlayers[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });

    await room.drawCards(1, fromId, 'top', fromId, this.Name);

    return true;
  }
}

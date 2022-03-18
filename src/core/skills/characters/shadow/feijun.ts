import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'feijun', description: 'feijun_description' })
export class FeiJun extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getPlayerCards().length > 0;
  }

  public numberOfTargets(): number {
    return 0;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, cardIds } = event;
    if (!cardIds) {
      return false;
    }
    const from = room.getPlayerById(fromId);

    await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);

    const targets = room
      .getOtherPlayers(fromId)
      .filter(
        player =>
          player.getCardIds(PlayerCardsArea.EquipArea).length > from.getCardIds(PlayerCardsArea.EquipArea).length ||
          player.getCardIds(PlayerCardsArea.HandArea).length > from.getCardIds(PlayerCardsArea.HandArea).length,
      )
      .map(player => player.Id);
    const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players: targets,
        toId: fromId,
        requiredAmount: 1,
        conversation: 'feijun: please choose a target',
        triggeredBySkills: [this.Name],
      },
      fromId,
    );

    if (resp.selectedPlayers && resp.selectedPlayers.length > 0) {
      const originalPlayers = room.getFlag<PlayerId[]>(resp.selectedPlayers[0], this.Name) || [];
      if (!originalPlayers.includes(fromId)) {
        originalPlayers.push(fromId);
        room.setFlag<PlayerId[]>(resp.selectedPlayers[0], this.Name, originalPlayers, this.Name, originalPlayers);
        EventPacker.addMiddleware({ tag: this.Name, data: true }, event);
      }

      const target = room.getPlayerById(resp.selectedPlayers[0]);

      let selected: string = '';
      if (
        target.getCardIds(PlayerCardsArea.EquipArea).length > from.getCardIds(PlayerCardsArea.EquipArea).length &&
        target.getCardIds(PlayerCardsArea.HandArea).length > from.getCardIds(PlayerCardsArea.HandArea).length
      ) {
        const options = ['feijun:hand', 'feijun:equip'];
        const { selectedOption } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
          GameEventIdentifiers.AskForChoosingOptionsEvent,
          EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
            options,
            toId: fromId,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: please choose feijun options: {1}',
              this.Name,
              TranslationPack.patchPlayerInTranslation(target),
            ).extract(),
          }),
          fromId,
        );

        selected = selectedOption || options[0];
      }

      if (
        selected === 'feijun:hand' ||
        (selected === '' &&
          target.getCardIds(PlayerCardsArea.HandArea).length > from.getCardIds(PlayerCardsArea.HandArea).length)
      ) {
        const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
          GameEventIdentifiers.AskForCardEvent,
          EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardEvent>({
            cardAmount: 1,
            toId: resp.selectedPlayers[0],
            reason: this.Name,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: you need to give a card to {1}',
              this.Name,
              TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
            ).extract(),
            fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
            triggeredBySkills: [this.Name],
          }),
          resp.selectedPlayers[0],
        );

        const wholeCards = target.getPlayerCards();
        response.selectedCards = response.selectedCards || wholeCards[Math.floor(Math.random() * wholeCards.length)];

        await room.moveCards({
          movingCards: [{ card: response.selectedCards[0], fromArea: target.cardFrom(response.selectedCards[0]) }],
          moveReason: CardMoveReason.ActiveMove,
          fromId: resp.selectedPlayers[0],
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          proposer: fromId,
        });
      } else {
        const response = await room.askForCardDrop(
          resp.selectedPlayers[0],
          1,
          [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          true,
          target.getPlayerCards().filter(id => !Sanguosha.getCardById(id).is(CardType.Equip)),
          this.Name,
          TranslationPack.translationJsonPatcher('{0}: please drop a equip card', this.Name).extract(),
        );

        response.droppedCards.length > 0 &&
          (await room.dropCards(
            CardMoveReason.SelfDrop,
            response.droppedCards,
            resp.selectedPlayers[0],
            resp.selectedPlayers[0],
            this.Name,
          ));
      }
    }

    return true;
  }
}

import { VirtualCard } from 'core/cards/card';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'kuangfu', description: 'kuangfu_description' })
export class KuangFu extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.getPlayerById(target).getCardIds(PlayerCardsArea.EquipArea).length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: room.getPlayerById(toIds[0]).getCardIds(PlayerCardsArea.EquipArea),
    };

    const response = await room.askForChoosingPlayerCard(
      {
        fromId,
        toId: toIds[0],
        options,
        triggeredBySkills: [this.Name],
      },
      fromId,
      true,
      true,
    );
    if (!response) {
      return false;
    }

    await room.dropCards(
      fromId === toIds[0] ? CardMoveReason.SelfDrop : CardMoveReason.PassiveDrop,
      [response.selectedCard!],
      toIds[0],
      fromId,
      this.Name,
    );

    const virtualSlash = VirtualCard.create({ cardName: 'slash', bySkill: this.Name }).Id;
    const canSlashTo = room
      .getOtherPlayers(fromId)
      .filter(player => room.canUseCardTo(virtualSlash, room.getPlayerById(fromId), player, true))
      .map(player => player.Id);
    if (canSlashTo.length > 0) {
      const askForPlayerChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
        toId: fromId,
        players: canSlashTo,
        requiredAmount: 1,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose a target to use a virtual slash to him',
          this.Name,
        ).extract(),
        triggeredBySkills: [this.Name],
      };

      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        askForPlayerChoose,
        fromId,
        true,
      );

      response.selectedPlayers = response.selectedPlayers || [
        canSlashTo[Math.floor(Math.random() * canSlashTo.length)],
      ];

      const useCardEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
        fromId,
        targetGroup: [response.selectedPlayers],
        cardId: virtualSlash,
        extraUse: true,
      };
      await room.useCard(useCardEvent);

      if (fromId === toIds[0]) {
        EventPacker.getDamageSignatureInCardUse(useCardEvent) &&
          (await room.drawCards(2, fromId, 'top', fromId, this.Name));
      } else if (!EventPacker.getDamageSignatureInCardUse(useCardEvent)) {
        const resp = await room.askForCardDrop(fromId, 2, [PlayerCardsArea.HandArea], true, undefined, this.Name);
        if (!resp) {
          return false;
        }

        await room.dropCards(CardMoveReason.SelfDrop, resp.droppedCards, fromId, fromId, this.Name);
      }
    }

    return true;
  }
}

import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'wurong', description: 'wurong_description' })
export class WuRong extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
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

    const askForCardEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardEvent>({
      cardAmount: 1,
      toId: '',
      reason: this.Name,
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: please choose a hand card to display',
        this.Name,
      ).extract(),
      fromArea: [PlayerCardsArea.HandArea],
      triggeredBySkills: [this.Name],
      ignoreNotifiedStatus: true,
    });

    const askingResponses: Promise<ClientEventFinder<GameEventIdentifiers.AskForCardEvent>>[] = [];
    const askForPlayers = [fromId, toIds[0]];
    room.doNotify(askForPlayers);
    for (const playerId of askForPlayers) {
      askForCardEvent.toId = playerId;
      room.notify(GameEventIdentifiers.AskForCardEvent, askForCardEvent, playerId);
      askingResponses.push(room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForCardEvent, playerId));
    }

    const responses = await Promise.all(askingResponses);
    const displayCards: CardId[] = [];
    for (const response of responses) {
      const handcards = room.getPlayerById(response.fromId).getCardIds(PlayerCardsArea.HandArea);
      response.selectedCards = response.selectedCards || handcards[Math.floor(Math.random() * handcards.length)];

      const showCardEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
        displayCards: [response.selectedCards[0]],
        fromId,
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} display hand card {1}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(response.fromId)),
          TranslationPack.patchCardInTranslation(response.selectedCards[0]),
        ).extract(),
      };
      room.broadcast(GameEventIdentifiers.CardDisplayEvent, showCardEvent);

      response.fromId === fromId
        ? displayCards.unshift(response.selectedCards[0])
        : displayCards.push(response.selectedCards[0]);
    }

    if (
      Sanguosha.getCardById(displayCards[0]).GeneralName === 'slash' &&
      Sanguosha.getCardById(displayCards[1]).GeneralName !== 'jink'
    ) {
      await room.damage({
        fromId,
        toId: toIds[0],
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      });
    } else if (
      Sanguosha.getCardById(displayCards[0]).GeneralName !== 'slash' &&
      Sanguosha.getCardById(displayCards[1]).GeneralName === 'jink'
    ) {
      const to = room.getPlayerById(toIds[0]);
      const options: CardChoosingOptions = {
        [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId,
        toId: toIds[0],
        options,
        triggeredBySkills: [this.Name],
      };

      const resp = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, false, true);

      if (!resp) {
        return false;
      }

      await room.moveCards({
        movingCards: [{ card: resp.selectedCard!, fromArea: resp.fromArea }],
        fromId: chooseCardEvent.toId,
        toId: chooseCardEvent.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: chooseCardEvent.fromId,
        movedByReason: this.Name,
      });
    }
    return true;
  }
}

import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'cuijian', description: 'cuijian_description' })
export class CuiJian extends ActiveSkill {
  private readonly CuiJianNames = ['cuijian', 'cuijian_I', 'cuijian_II', 'cuijian_EX'];

  public canUse(room: Room, owner: Player): boolean {
    return !this.CuiJianNames.find(name => owner.hasUsedSkill(name));
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
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
    if (!event.toIds) {
      return false;
    }

    const { fromId } = event;

    const to = room.getPlayerById(event.toIds[0]);
    if (to.getCardIds(PlayerCardsArea.HandArea).find(id => Sanguosha.getCardById(id).GeneralName === 'jink')) {
      const toGain = to
        .getCardIds(PlayerCardsArea.HandArea)
        .filter(id => Sanguosha.getCardById(id).GeneralName === 'jink');
      to.getEquipment(CardType.Shield) && toGain.push(to.getEquipment(CardType.Shield)!);

      await room.moveCards({
        movingCards: toGain.map(card => ({
          card,
          fromArea: card === to.getEquipment(CardType.Shield) ? CardMoveArea.EquipArea : CardMoveArea.HandArea,
        })),
        fromId: event.toIds[0],
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: event.toIds[0],
        triggeredBySkills: [this.GeneralName],
      });

      let selectedCards: CardId[] = room.getPlayerById(fromId).getPlayerCards();
      if (selectedCards.length > toGain.length) {
        const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
          GameEventIdentifiers.AskForCardEvent,
          {
            cardAmount: toGain.length,
            toId: fromId,
            reason: this.Name,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: please give {1} {2} card(s)',
              this.Name,
              TranslationPack.patchPlayerInTranslation(to),
              toGain.length,
            ).extract(),
            fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
            triggeredBySkills: [this.Name],
          },
          fromId,
          true,
        );

        selectedCards =
          resp.selectedCards.length > 0 ? resp.selectedCards : Algorithm.randomPick(toGain.length, selectedCards);
      }

      selectedCards.length > 0 &&
        (await room.moveCards({
          movingCards: selectedCards.map(card => ({ card, fromArea: room.getPlayerById(fromId).cardFrom(card) })),
          fromId,
          toId: event.toIds[0],
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: fromId,
          triggeredBySkills: [this.Name],
        }));
    } else {
      const response = await room.askForCardDrop(
        event.fromId,
        1,
        [PlayerCardsArea.HandArea],
        true,
        undefined,
        this.GeneralName,
      );

      response.droppedCards.length > 0 &&
        (await room.dropCards(
          CardMoveReason.SelfDrop,
          response.droppedCards,
          event.fromId,
          event.fromId,
          this.GeneralName,
        ));
    }

    return true;
  }
}

@CommonSkill({ name: 'cuijian_I', description: 'cuijian_I_description' })
export class CuiJianI extends CuiJian {
  public get GeneralName() {
    return CuiJian.Name;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    const { fromId } = event;

    const to = room.getPlayerById(event.toIds[0]);
    if (to.getCardIds(PlayerCardsArea.HandArea).find(id => Sanguosha.getCardById(id).GeneralName === 'jink')) {
      const toGain = to
        .getCardIds(PlayerCardsArea.HandArea)
        .filter(id => Sanguosha.getCardById(id).GeneralName === 'jink');
      to.getEquipment(CardType.Shield) && toGain.push(to.getEquipment(CardType.Shield)!);

      await room.moveCards({
        movingCards: toGain.map(card => ({
          card,
          fromArea: card === to.getEquipment(CardType.Shield) ? CardMoveArea.EquipArea : CardMoveArea.HandArea,
        })),
        fromId: event.toIds[0],
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: event.toIds[0],
        triggeredBySkills: [this.GeneralName],
      });

      let selectedCards: CardId[] = room.getPlayerById(fromId).getPlayerCards();
      if (selectedCards.length > toGain.length) {
        const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
          GameEventIdentifiers.AskForCardEvent,
          {
            cardAmount: toGain.length,
            toId: fromId,
            reason: this.Name,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: please give {1} {2} card(s)',
              this.Name,
              TranslationPack.patchPlayerInTranslation(to),
              toGain.length,
            ).extract(),
            fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
            triggeredBySkills: [this.Name],
          },
          fromId,
          true,
        );

        selectedCards =
          resp.selectedCards.length > 0 ? resp.selectedCards : Algorithm.randomPick(toGain.length, selectedCards);
      }

      selectedCards.length > 0 &&
        (await room.moveCards({
          movingCards: selectedCards.map(card => ({ card, fromArea: room.getPlayerById(fromId).cardFrom(card) })),
          fromId,
          toId: event.toIds[0],
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: fromId,
          triggeredBySkills: [this.Name],
        }));
    } else {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    }

    return true;
  }
}

@CommonSkill({ name: 'cuijian_II', description: 'cuijian_II_description' })
export class CuiJianII extends CuiJian {
  public get GeneralName() {
    return CuiJian.Name;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    const { fromId } = event;

    const to = room.getPlayerById(event.toIds[0]);
    if (to.getCardIds(PlayerCardsArea.HandArea).find(id => Sanguosha.getCardById(id).GeneralName === 'jink')) {
      const toGain = to
        .getCardIds(PlayerCardsArea.HandArea)
        .filter(id => Sanguosha.getCardById(id).GeneralName === 'jink');
      to.getEquipment(CardType.Shield) && toGain.push(to.getEquipment(CardType.Shield)!);

      await room.moveCards({
        movingCards: toGain.map(card => ({
          card,
          fromArea: card === to.getEquipment(CardType.Shield) ? CardMoveArea.EquipArea : CardMoveArea.HandArea,
        })),
        fromId: event.toIds[0],
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: event.toIds[0],
        triggeredBySkills: [this.GeneralName],
      });

      let selectedCards: CardId[] = room.getPlayerById(fromId).getPlayerCards();
      if (selectedCards.length > 1) {
        const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
          GameEventIdentifiers.AskForCardEvent,
          {
            cardAmount: 1,
            toId: fromId,
            reason: this.Name,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: please give {1} {2} card(s)',
              this.Name,
              TranslationPack.patchPlayerInTranslation(to),
              1,
            ).extract(),
            fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
            triggeredBySkills: [this.Name],
          },
          fromId,
          true,
        );

        selectedCards =
          resp.selectedCards.length > 0
            ? resp.selectedCards
            : [selectedCards[Math.floor(Math.random() * selectedCards.length)]];
      }

      selectedCards.length > 0 &&
        (await room.moveCards({
          movingCards: selectedCards.map(card => ({ card, fromArea: room.getPlayerById(fromId).cardFrom(card) })),
          fromId,
          toId: event.toIds[0],
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: fromId,
          triggeredBySkills: [this.Name],
        }));
    } else {
      const response = await room.askForCardDrop(
        event.fromId,
        1,
        [PlayerCardsArea.HandArea],
        true,
        undefined,
        this.GeneralName,
      );

      response.droppedCards.length > 0 &&
        (await room.dropCards(
          CardMoveReason.SelfDrop,
          response.droppedCards,
          event.fromId,
          event.fromId,
          this.GeneralName,
        ));
    }

    return true;
  }
}

@CommonSkill({ name: 'cuijian_EX', description: 'cuijian_EX_description' })
export class CuiJianEX extends CuiJian {
  public get GeneralName() {
    return CuiJian.Name;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    const { fromId } = event;

    const to = room.getPlayerById(event.toIds[0]);
    if (to.getCardIds(PlayerCardsArea.HandArea).find(id => Sanguosha.getCardById(id).GeneralName === 'jink')) {
      const toGain = to
        .getCardIds(PlayerCardsArea.HandArea)
        .filter(id => Sanguosha.getCardById(id).GeneralName === 'jink');
      to.getEquipment(CardType.Shield) && toGain.push(to.getEquipment(CardType.Shield)!);

      await room.moveCards({
        movingCards: toGain.map(card => ({
          card,
          fromArea: card === to.getEquipment(CardType.Shield) ? CardMoveArea.EquipArea : CardMoveArea.HandArea,
        })),
        fromId: event.toIds[0],
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: fromId,
        triggeredBySkills: [this.GeneralName],
      });

      let selectedCards: CardId[] = room.getPlayerById(fromId).getPlayerCards();
      if (selectedCards.length > 1) {
        const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
          GameEventIdentifiers.AskForCardEvent,
          {
            cardAmount: 1,
            toId: fromId,
            reason: this.Name,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: please give {1} {2} card(s)',
              this.Name,
              TranslationPack.patchPlayerInTranslation(to),
              1,
            ).extract(),
            fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
            triggeredBySkills: [this.Name],
          },
          fromId,
          true,
        );

        selectedCards =
          resp.selectedCards.length > 0
            ? resp.selectedCards
            : [selectedCards[Math.floor(Math.random() * selectedCards.length)]];
      }

      selectedCards.length > 0 &&
        (await room.moveCards({
          movingCards: selectedCards.map(card => ({ card, fromArea: room.getPlayerById(fromId).cardFrom(card) })),
          fromId,
          toId: event.toIds[0],
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: fromId,
          triggeredBySkills: [this.Name],
        }));
    } else {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    }

    return true;
  }
}

import { VirtualCard } from 'core/cards/card';
import { CardSuit } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CircleSkill, CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CircleSkill
@CommonSkill({ name: 'chenqing', description: 'chenqing_description' })
export class ChenQing extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.PlayerDying;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return (
      !owner.hasUsedSkill(this.Name) &&
      room.getPlayerById(content.dying).Hp < 1 &&
      room.getOtherPlayers(owner.Id).find(player => player.Id !== content.dying) !== undefined
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players: room
          .getOtherPlayers((event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>).dying)
          .filter(player => player.Id !== event.fromId)
          .map(player => player.Id),
        toId: event.fromId,
        requiredAmount: 1,
        conversation: 'do you want to choose a target to use chenqing?',
        triggeredBySkills: [this.Name],
      },
      event.fromId,
    );

    if (response.selectedPlayers && response.selectedPlayers.length > 0) {
      event.toIds = response.selectedPlayers;
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { toIds } = event;
    if (!toIds) {
      return false;
    }

    await room.drawCards(4, toIds[0], 'top', event.fromId, this.Name);

    const dying = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>).dying;
    const response = await room.askForCardDrop(
      toIds[0],
      4,
      [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
      true,
      undefined,
      this.Name,
      TranslationPack.translationJsonPatcher(
        '{0}: please discard 4 cards, if these cards have different suit between each other, you use a virtual peach to {1}?',
        this.Name,
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(dying)),
      ).extract(),
    );
    if (!response) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toIds[0], toIds[0], this.Name);
    const virtualPeach = VirtualCard.create({ cardName: 'peach', bySkill: this.Name }).Id;

    const suits: CardSuit[] = [];
    for (const cardId of response.droppedCards) {
      const suit = Sanguosha.getCardById(cardId).Suit;
      if (suits.includes(suit)) {
        break;
      }

      suits.push(suit);
    }

    if (
      suits.length === response.droppedCards.length &&
      room.getPlayerById(toIds[0]).canUseCardTo(room, virtualPeach, dying, true)
    ) {
      await room.useCard({
        fromId: toIds[0],
        targetGroup: [[dying]],
        cardId: virtualPeach,
      });
    }

    return true;
  }
}

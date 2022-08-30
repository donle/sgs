import { Alcohol } from 'core/cards/legion_fight/alcohol';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { ActiveSkill, SwitchSkillState } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'bazhan', description: 'bazhan_description' })
export class BaZhan extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return (
      !owner.hasUsedSkill(this.Name) &&
      !(
        owner.getSwitchSkillState(this.Name, true) === SwitchSkillState.Yang &&
        owner.getCardIds(PlayerCardsArea.HandArea).length === 0
      )
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return owner.getSwitchSkillState(this.Name, true) === SwitchSkillState.Yang
      ? cards.length > 0 && cards.length < 3
      : cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      target !== owner &&
      !(
        room.getPlayerById(owner).getSwitchSkillState(this.Name, true) === SwitchSkillState.Yin &&
        room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length === 0
      )
    );
  }

  public isAvailableCard(owner: PlayerId, room: Room) {
    return room.getPlayerById(owner).getSwitchSkillState(this.Name, true) === SwitchSkillState.Yang;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const currentSkillState = room.getPlayerById(event.fromId).getSwitchSkillState(this.Name);

    if (!event.toIds || (currentSkillState === SwitchSkillState.Yang && !event.cardIds)) {
      return false;
    }

    let hasHeartOrAlcohol = false;
    if (currentSkillState === SwitchSkillState.Yang) {
      await room.moveCards({
        movingCards: event.cardIds!.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
        fromId: event.fromId,
        toId: event.toIds[0],
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      });

      hasHeartOrAlcohol = !!event.cardIds!.find(
        cardId =>
          Sanguosha.getCardById(cardId).GeneralName === Alcohol.name ||
          Sanguosha.getCardById(cardId).Suit === CardSuit.Heart,
      );
    } else {
      const handCards = room.getPlayerById(event.toIds[0]).getCardIds(PlayerCardsArea.HandArea);
      const response = await room.doAskForCommonly(
        GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
        {
          toId: event.toIds[0],
          customCardFields: {
            [PlayerCardsArea.HandArea]: handCards.length,
          },
          customTitle: this.Name,
          amount: [1, 2],
          triggeredBySkills: [this.Name],
        },
        event.fromId,
        true,
      );

      response.selectedCardsIndex = response.selectedCardsIndex || [0];
      response.selectedCards = Algorithm.randomPick(response.selectedCardsIndex.length, handCards);

      await room.moveCards({
        movingCards: response.selectedCards.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
        fromId: event.toIds[0],
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      });

      hasHeartOrAlcohol = !!response.selectedCards!.find(
        cardId =>
          Sanguosha.getCardById(cardId).GeneralName === Alcohol.name ||
          Sanguosha.getCardById(cardId).Suit === CardSuit.Heart,
      );
    }

    if (hasHeartOrAlcohol) {
      const options = ['cancel'];

      const to = room.getPlayerById(event.toIds[0]);
      to.LostHp > 0 && options.push('bazhan:recover');
      if (to.ChainLocked || !to.isFaceUp()) {
        options.push('bazhan:resume');
      }

      if (options.length === 1) {
        return true;
      }

      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose bazhan options: {1}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(to),
          ).extract(),
          toId: event.fromId,
          triggeredBySkills: [this.Name],
        },
        event.fromId,
        true,
      );

      const handler = currentSkillState === SwitchSkillState.Yang ? event.toIds[0] : event.fromId;
      if (response.selectedOption === 'bazhan:recover') {
        await room.recover({
          toId: handler,
          recoveredHp: 1,
          recoverBy: event.fromId,
        });
      } else if (response.selectedOption === 'bazhan:resume') {
        to.ChainLocked && (await room.chainedOn(handler));
        to.isFaceUp() || (await room.turnOver(handler));
      }
    }

    return true;
  }
}

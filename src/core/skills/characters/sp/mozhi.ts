import { CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, ResponsiveSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'mozhi', description: 'mozhi_description' })
export class MoZhi extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    if (content.playerId !== owner.Id || owner.getCardIds(PlayerCardsArea.HandArea).length === 0) {
      return false;
    }

    const records = room.Analytics.getRecordEvents<GameEventIdentifiers.CardUseEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.CardUseEvent &&
        event.fromId === owner.Id &&
        (Sanguosha.getCardById(event.cardId).is(CardType.Basic) || Sanguosha.getCardById(event.cardId).isCommonTrick()),
      owner.Id,
      'round',
      [PlayerPhase.PlayCardStage],
      2,
    );

    if (
      records.length > 0 &&
      owner.canUseCard(
        room,
        new CardMatcher({ name: [Sanguosha.getCardById(records[0].cardId).Name] }),
        new CardMatcher({ name: [Sanguosha.getCardById(records[0].cardId).Name] }),
      ) &&
      !(Sanguosha.getCardById(records[0].cardId).Skill instanceof ResponsiveSkill)
    ) {
      room.setFlag<string[]>(
        owner.Id,
        this.Name,
        records.map(event => Sanguosha.getCardById(event.cardId).Name),
      );

      return true;
    }

    return false;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room
      .getPlayerById(owner)
      .canUseCard(
        room,
        VirtualCard.create({ cardName: room.getFlag<string[]>(owner, this.Name)[0], bySkill: this.Name }, [cardId]).Id,
      );
  }

  public targetFilter(room: Room, owner: Player, targets: string[], selectedCards: CardId[]) {
    const virtualCard = VirtualCard.create(
      { cardName: room.getFlag<string[]>(owner.Id, this.Name)[0], bySkill: this.Name },
      [selectedCards[0]],
    );
    return !(virtualCard.Skill instanceof ResponsiveSkill) &&
      (virtualCard.Skill as ActiveSkill).numberOfTargets() instanceof Array
      ? (virtualCard.Skill as ActiveSkill).numberOfTargets()[0] <= targets.length &&
          (virtualCard.Skill as ActiveSkill).numberOfTargets()[1] >= targets.length
      : (virtualCard.Skill as ActiveSkill).numberOfTargets() === targets.length;
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    if (selectedCards.length === 0) {
      return false;
    }

    const virtualCard = VirtualCard.create(
      { cardName: room.getFlag<string[]>(owner, this.Name)[0], bySkill: this.Name },
      [selectedCards[0]],
    );
    return (virtualCard.Skill as ActiveSkill).isAvailableTarget(
      owner,
      room,
      target,
      selectedCards,
      selectedTargets,
      virtualCard.Id,
    );
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to a hand card as {1} ?',
      this.Name,
      room.getFlag<string[]>(owner.Id, this.Name)[0],
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds || !event.cardIds) {
      return false;
    }

    const mozhiCards = room.getFlag<string[]>(event.fromId, this.Name);
    await room.useCard({
      fromId: event.fromId,
      targetGroup: [event.toIds],
      cardId: VirtualCard.create({ cardName: mozhiCards[0], bySkill: this.Name }, event.cardIds).Id,
    });

    if (
      mozhiCards.length > 1 &&
      room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      room
        .getPlayerById(event.fromId)
        .canUseCard(room, new CardMatcher({ name: [mozhiCards[1]] }), new CardMatcher({ name: [mozhiCards[1]] })) &&
      !(Sanguosha.getCardByName(mozhiCards[1]).Skill instanceof ResponsiveSkill)
    ) {
      mozhiCards.shift();
      room.setFlag<string[]>(event.fromId, this.Name, mozhiCards);

      room.notify(
        GameEventIdentifiers.AskForSkillUseEvent,
        {
          invokeSkillNames: [MoZhi.Name],
          toId: event.fromId,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: do you want to a hand card as {1} ?',
            this.Name,
            room.getFlag<string[]>(event.fromId, this.Name)[0],
          ).extract(),
        },
        event.fromId,
      );
      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, event.fromId);

      if (response.cardIds && response.toIds) {
        await room.useCard({
          fromId: event.fromId,
          targetGroup: [response.toIds],
          cardId: VirtualCard.create(
            { cardName: room.getFlag<string[]>(event.fromId, this.Name)[0], bySkill: this.Name },
            response.cardIds,
          ).Id,
        });
      }
    }

    return true;
  }
}

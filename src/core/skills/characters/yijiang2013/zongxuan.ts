import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zongxuan', description: 'zongxuan_description' })
export class ZongXuan extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return false;
  }

  public numberOfTargets() {
    return 0;
  }

  public isAvailableTarget() {
    return true;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);

    await room.drawCards(1, fromId, 'top', fromId, this.Name);

    if (from.getPlayerCards().length > 0) {
      const askForCard: ServerEventFinder<GameEventIdentifiers.AskForCardEvent> = {
        cardAmount: 1,
        toId: fromId,
        reason: this.Name,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose a card to put it on the top of the draw pile',
          this.Name,
        ).extract(),
        fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        triggeredBySkills: [this.Name],
      };
      room.notify(
        GameEventIdentifiers.AskForCardEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardEvent>(askForCard),
        fromId,
      );
      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForCardEvent, fromId);

      response.selectedCards = response.selectedCards || [from.getPlayerCards()[0]];

      await room.moveCards({
        movingCards: [{ card: response.selectedCards[0], fromArea: from.cardFrom(response.selectedCards[0]) }],
        moveReason: CardMoveReason.ActiveMove,
        fromId,
        toArea: CardMoveArea.DrawStack,
        proposer: fromId,
        movedByReason: this.Name,
      });
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: ZongXuan.Name, description: ZongXuan.Description })
export class ZongXuanShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    return (
      content.fromId === owner.Id &&
      (content.moveReason === CardMoveReason.PassiveDrop || content.moveReason === CardMoveReason.SelfDrop) &&
      content.movingCards.find(node => room.isCardInDropStack(node.card)) !== undefined
    );
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to put at least one of these cards on the top of the draw pile?',
      this.GeneralName,
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const moveCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    const cardIds = moveCardEvent.movingCards.filter(node => room.isCardInDropStack(node.card)).map(node => node.card);
    const numOfCards = cardIds.length;

    const askForGuanxing = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForPlaceCardsInDileEvent>({
      toId: fromId,
      cardIds,
      top: numOfCards,
      topStackName: 'drop stack',
      bottom: numOfCards,
      bottomStackName: 'draw stack top',
      bottomMinCard: 1,
      movable: true,
      triggeredBySkills: [this.GeneralName],
    });

    room.notify(GameEventIdentifiers.AskForPlaceCardsInDileEvent, askForGuanxing, fromId);
    const { bottom } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForPlaceCardsInDileEvent,
      fromId,
    );

    room.putCards('top', ...bottom);

    return true;
  }
}

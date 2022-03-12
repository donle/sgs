import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'shuaiyan', description: 'shuaiyan_description' })
export class ShuaiYan extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.DropCardStageStart;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      owner.Id === content.playerId &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 1 &&
      room.getOtherPlayers(owner.Id).find(player => player.getPlayerCards().length > 0) !== undefined
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).getPlayerCards().length > 0;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to display all your hand cards to let another player give you a card?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    const displayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      fromId: event.fromId,
      displayCards: room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea),
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} displayed cards {1}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
        TranslationPack.patchCardInTranslation(
          ...room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea),
        ),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, displayEvent);

    let selectedCards: CardId[] = room.getPlayerById(event.toIds[0]).getPlayerCards();
    if (selectedCards.length > 1) {
      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        {
          cardAmount: 1,
          toId: event.toIds[0],
          reason: this.Name,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please give {1} a card',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          triggeredBySkills: [this.Name],
        },
        event.toIds[0],
        true,
      );

      selectedCards =
        resp.selectedCards.length > 0
          ? resp.selectedCards
          : [selectedCards[Math.floor(Math.random() * selectedCards.length)]];
    }

    selectedCards.length > 0 &&
      (await room.moveCards({
        movingCards: [
          { card: selectedCards[0], fromArea: room.getPlayerById(event.toIds[0]).cardFrom(selectedCards[0]) },
        ],
        fromId: event.toIds[0],
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: event.toIds[0],
        triggeredBySkills: [this.Name],
      }));

    return true;
  }
}

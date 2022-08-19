import { CardType } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'yuhua', description: 'yuhua_description' })
export class YuHua extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage: AllStage): boolean {
    return (
      EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForCardDropEvent ||
      stage === PhaseStageChangeStage.StageChanged
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.AskForCardDropEvent) {
      return room.CurrentPlayerPhase === PlayerPhase.DropCardStage && room.CurrentPhasePlayer.Id === owner.Id;
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart &&
        owner.getCardIds(PlayerCardsArea.HandArea).length > owner.MaxHp
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AskForCardDropEvent | GameEventIdentifiers.PhaseStageChangeEvent
    >;

    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.AskForCardDropEvent) {
      const askForCardDropEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>;
      const player = room.getPlayerById(askForCardDropEvent.toId);
      const unbasic = player
        .getCardIds(PlayerCardsArea.HandArea)
        .filter(cardId => !Sanguosha.getCardById(cardId).is(CardType.Basic));

      if (unbasic.length > 0) {
        const otherHandCards = player.getCardIds(PlayerCardsArea.HandArea).filter(card => !unbasic.includes(card));
        const discardAmount = otherHandCards.length - player.getMaxCardHold(room);

        askForCardDropEvent.cardAmount = discardAmount;
        askForCardDropEvent.except = askForCardDropEvent.except ? [...askForCardDropEvent.except, ...unbasic] : unbasic;
      }
    } else {
      const cards = room.getCards(1, 'top');
      const guanxingEvent: ServerEventFinder<GameEventIdentifiers.AskForPlaceCardsInDileEvent> = {
        cardIds: cards,
        top: 1,
        topStackName: 'draw stack top',
        bottom: 1,
        bottomStackName: 'draw stack bottom',
        toId: event.fromId,
        movable: true,
        triggeredBySkills: [this.Name],
      };

      room.notify(GameEventIdentifiers.AskForPlaceCardsInDileEvent, guanxingEvent, event.fromId);

      const { top, bottom } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForPlaceCardsInDileEvent,
        event.fromId,
      );

      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage:
          top.length > 0
            ? TranslationPack.translationJsonPatcher('yuhua finished, the card placed on the top').extract()
            : TranslationPack.translationJsonPatcher('yuhua finished, the card placed at the bottom').extract(),
      });

      top.length > 0 && room.putCards('top', top[0]);
      bottom.length > 0 && room.putCards('bottom', bottom[0]);
    }

    return true;
  }
}

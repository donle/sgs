import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  CardMoveStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'std_xuanfeng', description: 'std_xuanfeng_description' })
export class StdXuanFeng extends TriggerSkill {
  public get RelatedCharacters(): string[] {
    return ['heqi'];
  }

  public audioIndex(characterName?: string): number {
    return characterName && this.RelatedCharacters.includes(characterName) ? 1 : 2;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.MoveCardEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged || stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.MoveCardEvent>,
  ): boolean {
    const unknownEvent = EventPacker.getIdentifier(content);

    if (unknownEvent === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      let isUseable =
        owner.Id === phaseStageChangeEvent.playerId &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.DropCardStageEnd;
      if (isUseable) {
        let droppedCardNum = 0;
        const moveEvents = room.Analytics.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
          event =>
            EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
            event.infos.find(
              info => info.fromId === phaseStageChangeEvent.playerId && info.moveReason === CardMoveReason.SelfDrop,
            ) !== undefined,
          phaseStageChangeEvent.playerId,
          'round',
          [PlayerPhase.DropCardStage],
        );

        for (const moveEvent of moveEvents) {
          if (droppedCardNum >= 2) {
            break;
          }

          if (moveEvent.infos.length === 1) {
            droppedCardNum += moveEvent.infos[0].movingCards.filter(
              cardInfo => !Sanguosha.isVirtualCardId(cardInfo.card) && cardInfo.fromArea === CardMoveArea.HandArea,
            ).length;
          } else {
            const infos = moveEvent.infos.filter(
              info => info.fromId === phaseStageChangeEvent.playerId && info.moveReason === CardMoveReason.SelfDrop,
            );

            droppedCardNum += infos.reduce<number>(
              (sum, info) =>
                sum +
                info.movingCards.filter(
                  cardInfo => !Sanguosha.isVirtualCardId(cardInfo.card) && cardInfo.fromArea === CardMoveArea.HandArea,
                ).length,
              0,
            );
          }
        }

        isUseable = droppedCardNum >= 2;
      }
      return isUseable;
    } else if (unknownEvent === GameEventIdentifiers.MoveCardEvent) {
      const moveCardEvent = content as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      return (
        moveCardEvent.infos.find(
          info => owner.Id === info.fromId && info.movingCards.find(card => card.fromArea === CardMoveArea.EquipArea),
        ) !== undefined
      );
    }

    return false;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && room.getPlayerById(target).getPlayerCards().length > 0;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to drop a card?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  private async xuanFengDropCard(room: Room, fromId: PlayerId, toId: PlayerId): Promise<void> {
    const to = room.getPlayerById(toId);
    if (to.getPlayerCards().length < 1) {
      return;
    }

    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent = {
      fromId,
      toId,
      options,
      triggeredBySkills: [this.Name],
    };

    const response = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, true, true);
    if (!response) {
      return;
    }

    await room.dropCards(CardMoveReason.PassiveDrop, [response.selectedCard!], chooseCardEvent.toId, fromId, this.Name);
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const targetIds = Precondition.exists(event.toIds, 'Unable to get xuanfeng targets');
    const xuanfengTargets: PlayerId[] = [];

    await this.xuanFengDropCard(room, fromId, targetIds[0]);
    xuanfengTargets.push(targetIds[0]);

    const targets = room
      .getOtherPlayers(fromId)
      .filter(player => player.getPlayerCards().length > 0)
      .map(player => player.Id);

    if (targets.length > 0) {
      const choosePlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
        players: targets,
        toId: fromId,
        requiredAmount: 1,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: do you want to choose a target to drop a card?',
          this.Name,
        ).extract(),
        triggeredBySkills: [this.Name],
      };

      room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, choosePlayerEvent, fromId);

      const choosePlayerResponse = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        fromId,
      );

      const chosenOne = choosePlayerResponse.selectedPlayers;
      if (chosenOne) {
        await this.xuanFengDropCard(room, fromId, chosenOne[0]);
        xuanfengTargets.push(chosenOne[0]);
      }
    }

    return true;
  }
}

import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
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
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xuanfeng', description: 'xuanfeng_description' })
export class XuanFeng extends TriggerSkill {
  private readonly xuanFengTargets = 'xuanfeng_targets';

  public isAutoTrigger(): boolean {
    return true;
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
      let isUseable = (
        owner.Id === phaseStageChangeEvent.playerId &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.DropCardStageEnd
      );
      if (isUseable) {
        let droppedCardNum = 0;
        const moveEvents = room.Analytics.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
          event =>
            EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
            event.fromId === phaseStageChangeEvent.playerId &&
            event.moveReason === CardMoveReason.SelfDrop,
          phaseStageChangeEvent.playerId,
          true,
          [PlayerPhase.DropCardStage],
        );

        for (const moveEvent of moveEvents) {
          droppedCardNum += moveEvent.movingCards.filter(card => card.fromArea === CardMoveArea.HandArea).length;
        }
  
        isUseable = droppedCardNum >= 2;
      }
      return isUseable;
    } else if (unknownEvent === GameEventIdentifiers.MoveCardEvent) {
      const moveCardEvent = content as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      const equipCards = moveCardEvent.movingCards.filter(card => card.fromArea === CardMoveArea.EquipArea);
      return owner.Id === moveCardEvent.fromId && equipCards.length > 0;
    }
    
    return false;
  }

  public async beforeUse(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    const { fromId } = event;
    let targets: string[] | undefined;

    while (!targets) {
      const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options: ['xuanfeng:move', 'xuanfeng:drop', 'cancel'],
        toId: fromId,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose',
          this.Name,
        ).extract(),
        ignoreNotifiedStatus: true,
      };
  
      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChoosingOptionsEvent),
        fromId,
      );
  
      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, fromId);
      response.selectedOption = response.selectedOption || 'cancel';

      if (response.selectedOption === 'cancel') {
        break;
      }

      const skillUseEvent = {
        invokeSkillNames: response.selectedOption === 'xuanfeng:move' ? [XuanFengMove.Name] : [XuanFengDrop.Name],
        toId: fromId,
        conversation: response.selectedOption === 'xuanfeng:move'
        ? TranslationPack.translationJsonPatcher(
          '{0}: please choose two target to move their equipment',
          this.Name,
        ).extract()
        : TranslationPack.translationJsonPatcher(
          '{0}: please choose a target to drop card',
          this.Name,
        ).extract(),
        ignoreNotifiedStatus: true,
      }
      
      room.notify(
        GameEventIdentifiers.AskForSkillUseEvent,
        skillUseEvent,
        fromId,
      );
  
      const { toIds } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForSkillUseEvent,
        fromId,
      );
      targets = toIds;
    }

    if (targets && targets.length > 0) {
      EventPacker.addMiddleware({ tag: this.xuanFengTargets, data: targets }, event);
      return true;
    }

    return false;
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId } = event;
    const toIds = EventPacker.getMiddleware<PlayerId[]>(this.xuanFengTargets, event);

    if (toIds!.length === 2) {
      return [
        { from: fromId, tos: [toIds![0]] },
        { from: toIds![0], tos: [toIds![1]] },
      ];
    }
    
    return toIds ? [{ from: fromId, tos: toIds }] : [];
  }

  public async onTrigger(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    event.animation = this.getAnimationSteps(event);

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
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
      fromId,
    );

    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      fromId,
    );

    if (response.selectedCard === undefined) {
      const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    await room.dropCards(
      CardMoveReason.PassiveDrop,
      [response.selectedCard],
      chooseCardEvent.toId,
      fromId,
      this.Name,
    );
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId } = event;
    const toIds = EventPacker.getMiddleware<PlayerId[]>(this.xuanFengTargets, event);

    if (toIds!.length === 1) {
      await this.xuanFengDropCard(room, fromId, toIds![0]);

      const targets = room.getOtherPlayers(fromId)
        .filter(player => player.getPlayerCards().length > 0)
        .map(player => player.Id);
  
      if (targets.length > 0) {
        const choosePlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
          players: targets,
          toId: fromId,
          requiredAmount: 1,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose a target to drop card',
            this.Name,
          ).extract(),
        };
  
        room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, choosePlayerEvent, fromId);
  
        const choosePlayerResponse = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          fromId,
        );
        
        const chosenOne = choosePlayerResponse.selectedPlayers
        if (chosenOne && chosenOne.length === 1) {
          await this.xuanFengDropCard(room, fromId, chosenOne[0]);
        }
      }
    } else if (toIds!.length === 2) {
      const moveFrom = room.getPlayerById(toIds![0]);
      const moveTo = room.getPlayerById(toIds![1]);
      const canMovedEquipCardIds: CardId[] = [];

      const fromEquipArea = moveFrom.getCardIds(PlayerCardsArea.EquipArea);
      canMovedEquipCardIds.push(...fromEquipArea.filter(id => room.canPlaceCardTo(id, moveTo.Id)));

      const options: CardChoosingOptions = {
        [PlayerCardsArea.EquipArea]: canMovedEquipCardIds,
      };

      const chooseCardEvent = {
        fromId,
        toId: fromId,
        options,
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
        fromId,
      );

      const response = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        fromId,
      );

      await room.moveCards({
        movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
        moveReason: CardMoveReason.PassiveMove,
        toId: moveTo.Id,
        fromId: moveFrom.Id,
        toArea: response.fromArea!,
        proposer: chooseCardEvent.fromId,
        movedByReason: this.Name,
      });
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: XuanFeng.Name, description: XuanFeng.Description })
export class XuanFengMove extends TriggerSkill {
  public isTriggerable(): boolean {
    return false;
  }

  public canUse(): boolean {
    return false;
  }

  public numberOfTargets(): number {
    return 2;
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    const to = room.getPlayerById(target);
    const equiprCardIds = to.getCardIds(PlayerCardsArea.EquipArea);

    if (target === owner) {
      return false;
    }

    if (selectedTargets.length === 0) {
      return equiprCardIds.length > 0;
    } else if (selectedTargets.length === 1) {
      let canBeTarget: boolean = false;
      const from = room.getPlayerById(selectedTargets[0]);

      const fromEquipArea = from.getCardIds(PlayerCardsArea.EquipArea);
      canBeTarget = canBeTarget || fromEquipArea.find(id => room.canPlaceCardTo(id, target)) !== undefined;

      return canBeTarget;
    }

    return false;
  }

  public nominateForwardTarget(targets: PlayerId[]) {
    return [targets[0]];
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(): Promise<boolean> {
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: XuanFengMove.Name, description: XuanFengMove.Description })
export class XuanFengDrop extends TriggerSkill {
  public isTriggerable(): boolean {
    return false;
  }

  public canUse(): boolean {
    return false;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).getPlayerCards().length > 0;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(): Promise<boolean> {
    return true;
  }
}

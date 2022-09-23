import { VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, CardMoveStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'fulin', description: 'fulin_description' })
export class FuLin extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenObtainingSkill(room: Room, player: Player) {
    if (room.CurrentPlayer !== player) {
      return;
    }

    const cardIdsGainedThisRound = room.Analytics.getCardObtainedRecord(player.Id, 'round').reduce<CardId[]>(
      (cardIds, moveCardEvent) => {
        for (const info of moveCardEvent.infos) {
          if (info.toId !== player.Id || info.toArea !== CardMoveArea.HandArea) {
            continue;
          }

          for (const cardInfo of info.movingCards) {
            cardIds.push(...Algorithm.unique(VirtualCard.getActualCards([cardInfo.card]), cardIds));
          }
        }

        return cardIds;
      },
      [],
    );

    room.setCardTag(player.Id, this.Name, cardIdsGainedThisRound);
  }

  public async whenLosingSkill(room: Room, player: Player) {
    room.removeCardTag(player.Id, this.Name);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return (
      room.CurrentPlayer === owner &&
      !!content.infos.find(info => info.toId === owner.Id && info.toArea === CardMoveArea.HandArea)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const originalFuLinCardIds = room.getCardTag(event.fromId, this.Name) || [];
    const cardIdsGained = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos
      .filter(info => info.toId === event.fromId && info.toArea === CardMoveArea.HandArea)
      .reduce<CardId[]>((cardIds, info) => {
        for (const cardInfo of info.movingCards) {
          cardIds.push(...Algorithm.unique(VirtualCard.getActualCards([cardInfo.card]), originalFuLinCardIds));
        }

        return cardIds;
      }, []);
    room.setCardTag(event.fromId, this.Name, originalFuLinCardIds.concat(...cardIdsGained));

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: FuLin.GeneralName, description: FuLin.Description })
export class FuLinShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage: AllStage,
  ): boolean {
    return (
      EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForCardDropEvent ||
      stage === PhaseChangeStage.PhaseChanged
    );
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ) {
    if (!owner.getCardTag(this.GeneralName)) {
      return false;
    }

    if (EventPacker.getIdentifier(content) === GameEventIdentifiers.AskForCardDropEvent) {
      return room.CurrentPlayerPhase === PlayerPhase.DropCardStage && room.CurrentPhasePlayer.Id === owner.Id;
    } else if (EventPacker.getIdentifier(content) === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return owner.Id === phaseChangeEvent.fromPlayer && phaseChangeEvent.from === PlayerPhase.PhaseFinish;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AskForCardDropEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.AskForCardDropEvent) {
      const askForCardDropEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>;
      const player = room.getPlayerById(askForCardDropEvent.toId);
      const exceptCardIds = player
        .getCardIds(PlayerCardsArea.HandArea)
        .filter(cardId => player.getCardTag(this.GeneralName)!.includes(cardId));

      if (exceptCardIds.length > 0) {
        const otherHandCards = player
          .getCardIds(PlayerCardsArea.HandArea)
          .filter(card => !exceptCardIds.includes(card));
        const discardAmount = otherHandCards.length - player.getMaxCardHold(room);

        askForCardDropEvent.cardAmount = discardAmount;
        askForCardDropEvent.except = askForCardDropEvent.except
          ? [...askForCardDropEvent.except, ...exceptCardIds]
          : exceptCardIds;
      }
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      room.removeCardTag(event.fromId, this.GeneralName);
    }

    return true;
  }
}

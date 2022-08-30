import { CardChoosingOptions, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'bingqing', description: 'bingqing_description' })
export class BingQing extends TriggerSkill {
  public async whenObtainingSkill(room: Room, owner: Player) {
    if (room.CurrentPhasePlayer !== owner || room.CurrentPlayerPhase !== PlayerPhase.PlayCardStage) {
      return;
    }

    const records = room.Analytics.getCardUseRecord(owner.Id, 'phase');

    if (records.length > 0) {
      for (const cardUseEvent of records) {
        const originalSuits = owner.getFlag<CardSuit[]>(this.Name) || [];
        const suit = Sanguosha.getCardById(cardUseEvent.cardId).Suit;
        if (suit !== CardSuit.NoSuit && !originalSuits.includes(suit)) {
          originalSuits.push(suit);
          owner.setFlag<CardSuit[]>(this.Name, originalSuits);
          EventPacker.addMiddleware({ tag: this.Name, data: true }, cardUseEvent);
        }
      }
    }
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      room.CurrentPhasePlayer === owner &&
      EventPacker.getMiddleware<boolean>(this.Name, content) === true &&
      (owner.getFlag<CardSuit[]>(this.Name) || []).length > 1
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId } = event;

    const suits = room.getFlag<CardSuit[]>(fromId, this.Name) || [];
    let targets = room.AlivePlayers;
    let prompt = '{0}: do you want to draw 2 cards?';
    if (suits.length === 3) {
      targets = targets.filter(
        player =>
          player.getCardIds().length > 0 &&
          !(player.Id === fromId && !player.getCardIds().find(id => room.canDropCard(fromId, id))),
      );
      prompt = '{0}: do you want to discard a card from the area of a player?';
    } else if (suits.length === 4) {
      const index = targets.findIndex(player => player.Id === fromId);
      index !== -1 && targets.splice(index, 1);
      prompt = '{0}: do you want to deal 1 damage to another player?';
    }

    const players = targets.map(player => player.Id);
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players,
        toId: fromId,
        requiredAmount: 1,
        conversation: TranslationPack.translationJsonPatcher(prompt, this.Name).toString(),
        triggeredBySkills: [this.Name],
      },
      fromId,
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
    if (!event.toIds) {
      return false;
    }

    const suits = room.getFlag<CardSuit[]>(event.fromId, this.Name) || [];
    if (suits.length === 2) {
      await room.drawCards(2, event.toIds[0], 'top', event.fromId, this.Name);
    } else if (suits.length === 3) {
      const to = room.getPlayerById(event.toIds[0]);
      const options: CardChoosingOptions = {
        [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
        [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId: event.fromId,
        toId: event.toIds[0],
        options,
        triggeredBySkills: [this.Name],
      };

      const response = await room.askForChoosingPlayerCard(chooseCardEvent, event.fromId, true, true);
      if (!response) {
        return false;
      }

      response.selectedCard !== undefined &&
        (await room.dropCards(
          event.fromId === event.toIds[0] ? CardMoveReason.SelfDrop : CardMoveReason.PassiveDrop,
          [response.selectedCard],
          event.toIds[0],
          event.fromId,
          this.Name,
        ));
    } else if (suits.length === 4) {
      await room.damage({
        fromId: event.fromId,
        toId: event.toIds[0],
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: BingQing.Name, description: BingQing.Description })
export class BingQingShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return content.from === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ) {
    return stage === CardUseStage.BeforeCardUseEffect || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const suits = owner.getFlag<CardSuit[]>(this.GeneralName) || [];
      return (
        cardUseEvent.fromId === owner.Id &&
        !suits.includes(Sanguosha.getCardById(cardUseEvent.cardId).Suit) &&
        suits.length < 4 &&
        room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
        room.CurrentPhasePlayer === owner &&
        Sanguosha.getCardById(cardUseEvent.cardId).Suit !== CardSuit.NoSuit
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.from === PlayerPhase.PlayCardStage && !!owner.getFlag<CardSuit[]>(this.GeneralName);
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const originalSuits = room.getFlag<CardSuit[]>(event.fromId, this.GeneralName) || [];
      originalSuits.push(Sanguosha.getCardById(cardUseEvent.cardId).Suit);
      room.getPlayerById(event.fromId).setFlag<CardSuit[]>(this.GeneralName, originalSuits);
      EventPacker.addMiddleware({ tag: this.GeneralName, data: true }, cardUseEvent);
    } else {
      room.removeFlag(event.fromId, this.GeneralName);
    }

    return true;
  }
}

import { CardSuit } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'huguan', description: 'huguan_description' })
export class HuGuan extends TriggerSkill {
  public get RelatedCharacters(): string[] {
    return ['wangyue'];
  }

  public async whenObtainingSkill(room: Room, owner: Player) {
    if (room.CurrentPlayerPhase !== PlayerPhase.PlayCardStage) {
      return;
    }

    const records = room.Analytics.getCardUseRecord(owner.Id, 'phase', undefined, 1);

    if (records.length > 0) {
      owner.getFlag<boolean>(HuGuanShadow.Name) || owner.setFlag<boolean>(HuGuanShadow.Name, true);
      EventPacker.getMiddleware<boolean>(this.Name, records[0]) ||
        EventPacker.addMiddleware({ tag: this.Name, data: true }, records[0]);
    }
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      room.CurrentPhasePlayer.Id === content.fromId &&
      EventPacker.getMiddleware<boolean>(this.Name, content) === true &&
      !!content.cardId &&
      Sanguosha.getCardById(content.cardId).isRed()
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const options = ['spade', 'club', 'diamond', 'heart'];

    const user = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).fromId;
    const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
      options,
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: please choose a card suit: {1}',
        this.Name,
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(user)),
      ).extract(),
      toId: event.fromId,
      triggeredBySkills: [this.Name],
    });

    const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      askForChooseEvent,
      event.fromId,
    );

    if (resp.selectedOption) {
      EventPacker.addMiddleware({ tag: this.Name, data: resp.selectedOption }, event);
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const suit = Functional.convertSuitStringToSuit(EventPacker.getMiddleware<string>(this.Name, event)!);

    const user = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).fromId;
    const originalSuits = room.getFlag<CardSuit[]>(user, this.Name) || [];
    originalSuits.push(suit);
    room.setFlag<CardSuit[]>(
      user,
      this.Name,
      originalSuits,
      TranslationPack.translationJsonPatcher(
        'huguan suits: {0}',
        originalSuits.reduce<string>((suitString, suit) => suitString + Functional.getCardSuitCharText(suit), ''),
      ).toString(),
    );

    room.getPlayerById(user).hasShadowSkill(HuGuanBuff.Name) || (await room.obtainSkill(user, HuGuanBuff.Name));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: HuGuan.Name, description: HuGuan.Description })
export class HuGuanShadow extends TriggerSkill implements OnDefineReleaseTiming {
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
      return (
        !owner.getFlag<boolean>(this.Name) &&
        room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
        room.CurrentPhasePlayer.Id === cardUseEvent.fromId
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.from === PlayerPhase.PlayCardStage && owner.getFlag<boolean>(this.Name);
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
      room.getPlayerById(event.fromId).setFlag<boolean>(this.Name, true);
      EventPacker.addMiddleware({ tag: this.GeneralName, data: true }, cardUseEvent);
    } else {
      room.removeFlag(event.fromId, this.Name);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_huguan_buff', description: 's_huguan_buff_description' })
export class HuGuanBuff extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
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
    let canTrigger = false;
    const suits = owner.getFlag<CardSuit[]>(HuGuan.Name);
    if (EventPacker.getIdentifier(content) === GameEventIdentifiers.AskForCardDropEvent) {
      canTrigger =
        room.CurrentPlayerPhase === PlayerPhase.DropCardStage &&
        room.CurrentPhasePlayer.Id === owner.Id &&
        suits.length > 0;
    } else if (EventPacker.getIdentifier(content) === GameEventIdentifiers.PhaseChangeEvent) {
      canTrigger =
        (content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).from === PlayerPhase.PhaseFinish;
    }

    return canTrigger && !!suits;
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
      const player = room.getPlayerById(event.fromId);
      const tricks = player
        .getCardIds(PlayerCardsArea.HandArea)
        .filter(cardId => player.getFlag<CardSuit[]>(HuGuan.Name).includes(Sanguosha.getCardById(cardId).Suit));

      if (tricks.length > 0) {
        const otherHandCards = player.getCardIds(PlayerCardsArea.HandArea).filter(card => !tricks.includes(card));
        const discardAmount = otherHandCards.length - player.getMaxCardHold(room);

        askForCardDropEvent.cardAmount = discardAmount;
        askForCardDropEvent.except = askForCardDropEvent.except ? [...askForCardDropEvent.except, ...tricks] : tricks;
      }
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      room.removeFlag(event.fromId, HuGuan.Name);
      await room.loseSkill(event.fromId, this.Name);
    }

    return true;
  }
}

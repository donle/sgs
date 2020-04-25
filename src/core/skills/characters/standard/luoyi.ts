import { CommonSkill, TriggerSkill, ShadowSkill, CompulsorySkill, OnDefineReleaseTiming } from 'core/skills/skill';
import {
  ServerEventFinder,
  GameEventIdentifiers,
  EventPacker,
  CardObtainedReason,
  CardLostReason,
} from 'core/event/event';
import { AllStage, DrawCardStage, PlayerPhase, PhaseChangeStage, DamageEffectStage } from 'core/game/stage_processor';
import { Room } from 'core/room/room';
import { Player } from 'core/player/player';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { CardType } from 'core/cards/card';
import { PlayerId } from 'core/player/player_props';

@CommonSkill({ name: 'luoyi', description: 'luoyi_description' })
export class LuoYi extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage): boolean {
    return stage === DrawCardStage.BeforeDrawCardEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>): boolean {
    return owner.Id === content.fromId && room.CurrentPlayerPhase === PlayerPhase.DrawCardStage;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const displayCards = room.getCards(3, 'top');
    const cardDisplayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      displayCards: displayCards,
      fromId: skillUseEvent.fromId,
      translationsMessage: TranslationPack.translationJsonPatcher(
        'luoyi display: {0}',
        TranslationPack.patchCardInTranslation(...displayCards),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, cardDisplayEvent);

    let luoyiObtain: CardId[] = [];
    for (let cardId of displayCards) {
      const card = Sanguosha.getCardById(cardId);
      if (card.is(CardType.Basic) || card.is(CardType.Equip) || card.GeneralName === 'duel') {
        luoyiObtain.unshift(cardId);
      }
    }

    if (luoyiObtain.length > 0) {
      const askForChooseOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options: ['Obtain', 'Cancel'],
        toId: skillUseEvent.fromId,
        conversation: 'Obtain Basic Card, Equip Card and Duel in display cards?',
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChooseOptionsEvent),
        skillUseEvent.fromId,
      );

      const { selectedOption } = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        skillUseEvent.fromId,
      );

      if (selectedOption === 'Obtain') {
        const { triggeredOnEvent } = skillUseEvent;
        const drawCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
        drawCardEvent.drawAmount = 0;

        await room.obtainCards(
          {
            toId: skillUseEvent.fromId,
            reason: CardObtainedReason.ActivePrey,
            cardIds: luoyiObtain,
          },
          true,
        );

        room.setFlag<boolean>(skillUseEvent.fromId, this.Name, true);
      } else {
        luoyiObtain = [];
      }
    }

    await room.dropCards(
      CardLostReason.PlaceToDropStack,
      room.getProcessingCards(this.Name).filter(id => !luoyiObtain.includes(id)),
      undefined,
      undefined,
      this.Name,
    );

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: LuoYi.GeneralName, description: LuoYi.Description })
export class LuoYiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  onLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayer === room.getPlayerById(playerId) && room.CurrentPlayerPhase === PlayerPhase.PrepareStage;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.DamageEvent>,
    stage: AllStage,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const currentEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return currentEvent.to === PlayerPhase.PrepareStage && stage === PhaseChangeStage.AfterPhaseChanged;
    } else {
      const currentEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return (
        stage === DamageEffectStage.DamageEffect &&
        !!currentEvent.cardIds &&
        currentEvent.cardIds.length === 1 &&
        (Sanguosha.getCardById(currentEvent.cardIds[0]).GeneralName === 'slash' ||
          Sanguosha.getCardById(currentEvent.cardIds[0]).GeneralName === 'duel')
      );
    }
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.DamageEvent>,
  ): boolean {
    if (!room.getFlag<boolean>(owner.Id, this.GeneralName)) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const currentEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return !!currentEvent.fromId && currentEvent.fromId == owner.Id;
    }

    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.DamageEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const currentEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      currentEvent.toPlayer && room.removeFlag(currentEvent.toPlayer, this.GeneralName);
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      const damgeEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      damgeEvent.damage += 1;
    }

    return true;
  }
}

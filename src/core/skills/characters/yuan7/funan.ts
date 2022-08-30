import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, CardResponseStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'funan', description: 'funan_description' })
export class FuNan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage: AllStage): boolean {
    return stage === CardUseStage.CardUsing || stage === CardResponseStage.CardResponsing;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    if (
      content.fromId === owner.Id ||
      !content.responseToEvent ||
      EventPacker.getIdentifier(content.responseToEvent) !== GameEventIdentifiers.CardEffectEvent ||
      room.getPlayerById(content.fromId).Dead
    ) {
      return false;
    }

    const responseToEvent = content.responseToEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
    return responseToEvent.fromId === owner.Id && room.isCardOnProcessing(responseToEvent.cardId);
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to let {1} gain {2}, then you gain {3}?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      TranslationPack.patchCardInTranslation(
        (event.responseToEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>).cardId,
      ),
      TranslationPack.patchCardInTranslation(event.cardId),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardUseOrResponseEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >;
    await room.moveCards({
      movingCards: [
        {
          card: (cardUseOrResponseEvent.responseToEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>)
            .cardId,
          fromArea: CardMoveArea.ProcessingArea,
        },
      ],
      toId: cardUseOrResponseEvent.fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: cardUseOrResponseEvent.fromId,
      triggeredBySkills: [this.Name],
    });

    room.isCardOnProcessing(cardUseOrResponseEvent.cardId) &&
      (await room.moveCards({
        movingCards: [{ card: cardUseOrResponseEvent.cardId, fromArea: CardMoveArea.ProcessingArea }],
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      }));

    return true;
  }
}

@CommonSkill({ name: 'funan_EX', description: 'funan_ex_description' })
export class FuNanEX extends FuNan {
  public get GeneralName(): string {
    return FuNan.Name;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    if (
      content.fromId === owner.Id ||
      !content.responseToEvent ||
      EventPacker.getIdentifier(content.responseToEvent) !== GameEventIdentifiers.CardEffectEvent
    ) {
      return false;
    }

    const responseToEvent = content.responseToEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
    return responseToEvent.fromId === owner.Id;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to gain {1}?',
      this.Name,
      TranslationPack.patchCardInTranslation(event.cardId),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardUseOrResponseEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >;

    room.isCardOnProcessing(cardUseOrResponseEvent.cardId) &&
      (await room.moveCards({
        movingCards: [{ card: cardUseOrResponseEvent.cardId, fromArea: CardMoveArea.ProcessingArea }],
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      }));

    return true;
  }
}

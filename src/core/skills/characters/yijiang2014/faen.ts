import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, ChainLockStage, TurnOverStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'faen', description: 'faen_description' })
export class FaEn extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PlayerTurnOverEvent | GameEventIdentifiers.ChainLockedEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === TurnOverStage.TurnedOver || stage === ChainLockStage.AfterChainedOn;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PlayerTurnOverEvent | GameEventIdentifiers.ChainLockedEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PlayerTurnOverEvent) {
      return room.getPlayerById(content.toId).isFaceUp();
    } else if (identifier === GameEventIdentifiers.ChainLockedEvent) {
      const chainedEvent = content as ServerEventFinder<GameEventIdentifiers.ChainLockedEvent>;
      return chainedEvent.linked === true;
    }

    return false;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PlayerTurnOverEvent | GameEventIdentifiers.ChainLockedEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to let {1} draw 1 card?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.toId)),
    ).extract();
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return [
      {
        from: event.fromId,
        tos: [
          (
            event.triggeredOnEvent as ServerEventFinder<
              GameEventIdentifiers.PlayerTurnOverEvent | GameEventIdentifiers.ChainLockedEvent
            >
          ).toId,
        ],
      },
    ];
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(
      1,
      (
        event.triggeredOnEvent as ServerEventFinder<
          GameEventIdentifiers.PlayerTurnOverEvent | GameEventIdentifiers.ChainLockedEvent
        >
      ).toId,
      'top',
      event.fromId,
      this.Name,
    );

    return true;
  }
}

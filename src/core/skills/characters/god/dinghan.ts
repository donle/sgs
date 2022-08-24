import { CardType } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'dinghan', description: 'dinghan_description' })
export class DingHan extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === AimStage.OnAimmed || stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public isAutoTrigger(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ) {
    return EventPacker.getIdentifier(event) === GameEventIdentifiers.AimEvent;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = content as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      const card = Sanguosha.getCardById(aimEvent.byCardId);
      return (
        aimEvent.toId === owner.Id &&
        card.BaseType === CardType.Trick &&
        (!room.getFlag<string[]>(owner.Id, this.Name) ||
          !room.getFlag<string[]>(owner.Id, this.Name).includes(card.Name))
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.to === PlayerPhase.PhaseBegin && phaseChangeEvent.toPlayer === owner.Id;
    }

    return false;
  }

  public async onTrigger(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    skillUseEvent.messages = skillUseEvent.messages || [];
    const unknownEvent = skillUseEvent.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.AimEvent) {
      const aimEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} used skill {1}, which has been removed from target list of {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(aimEvent.toId)),
        this.Name,
        TranslationPack.patchCardInTranslation(aimEvent.byCardId),
      ).extract();
    }

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.AimEvent) {
      const aimEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      AimGroupUtil.cancelTarget(aimEvent, fromId);

      const existingCardNames = room.getFlag<string[]>(fromId, this.Name) ?? [];
      room.setFlag<string[]>(
        fromId,
        this.Name,
        [...existingCardNames, Sanguosha.getCardById(aimEvent.byCardId).Name],
        this.Name,
      );
    } else {
      const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        toId: fromId,
        options: Sanguosha.getCardNameByType(types => types.includes(CardType.Trick)),
        askedBy: fromId,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose a dinghan option',
          this.Name,
        ).extract(),
      };

      const { selectedOption } = await room.doAskForCommonly(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        askForChoosingOptionsEvent,
        fromId,
      );

      if (!selectedOption) {
        return false;
      }

      const existingCardNames = room.getFlag<string[]>(fromId, this.Name) || [];
      if (existingCardNames.includes(selectedOption)) {
        room.setFlag<string[]>(
          fromId,
          this.Name,
          existingCardNames.filter(cardName => cardName !== selectedOption),
          this.Name,
        );
      } else {
        room.setFlag<string[]>(fromId, this.Name, [...existingCardNames, selectedOption], this.Name);
      }
    }

    return true;
  }
}

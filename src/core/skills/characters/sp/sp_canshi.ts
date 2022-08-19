import { CardType } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { MarkEnum } from 'core/shares/types/mark_list';
import { ExtralCardSkillProperty } from 'core/skills/cards/interface/extral_property';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'sp_canshi', description: 'sp_canshi_description' })
export class SPCanShi extends TriggerSkill {
  public isAutoTrigger(
    room: Room,
    owner: Player,
    event?: ServerEventFinder<GameEventIdentifiers.AimEvent | GameEventIdentifiers.CardUseEvent>,
  ): boolean {
    return event !== undefined && EventPacker.getIdentifier(event) === GameEventIdentifiers.CardUseEvent;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.AimEvent | GameEventIdentifiers.CardUseEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === AimStage.AfterAim || stage === CardUseStage.AfterCardTargetDeclared;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AimEvent | GameEventIdentifiers.CardUseEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = content as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      return (
        aimEvent.toId === owner.Id &&
        room.getMark(aimEvent.fromId, MarkEnum.Kui) > 0 &&
        (Sanguosha.getCardById(aimEvent.byCardId).is(CardType.Basic) ||
          Sanguosha.getCardById(aimEvent.byCardId).isCommonTrick()) &&
        AimGroupUtil.getAllTargets(aimEvent.allTargets).length === 1
      );
    } else if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        cardUseEvent.fromId === owner.Id &&
        (Sanguosha.getCardById(cardUseEvent.cardId).is(CardType.Basic) ||
          Sanguosha.getCardById(cardUseEvent.cardId).isCommonTrick())
      );
    }

    return false;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const identifier = EventPacker.getIdentifier(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const players = room
        .getAlivePlayersFrom()
        .map(player => player.Id)
        .filter(playerId => {
          return (
            room.getMark(playerId, MarkEnum.Kui) > 0 &&
            !TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup).includes(playerId) &&
            room.isAvailableTarget(cardUseEvent.cardId, event.fromId, playerId) &&
            ((Sanguosha.getCardById(cardUseEvent.cardId)
              .Skill as unknown) as ExtralCardSkillProperty).isCardAvailableTarget(
              event.fromId,
              room,
              playerId,
              [],
              [],
              cardUseEvent.cardId,
            )
          );
        });

      const allTargets = TargetGroupUtil.getAllTargets(cardUseEvent.targetGroup);
      if (players.length > 0 && allTargets !== undefined) {
        if (allTargets[0].length === 1) {
          const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
            GameEventIdentifiers.AskForChoosingPlayerEvent,
            {
              players,
              toId: event.fromId,
              requiredAmount: [1, players.length],
              conversation: TranslationPack.translationJsonPatcher(
                '{0}: please select at least Kuis to append to {1} targets',
                this.Name,
                TranslationPack.patchCardInTranslation(cardUseEvent.cardId),
              ).extract(),
              triggeredBySkills: [this.Name],
            },
            event.fromId,
          );

          if (resp.selectedPlayers && resp.selectedPlayers.length > 0) {
            event.toIds = resp.selectedPlayers;
            return true;
          }
        } else if (allTargets[0].length > 1) {
          const targets = TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup);

          const chosen: PlayerId[][] = [];
          while (players.length > 0) {
            const { selectedPlayers } = await room.doAskForCommonly<
              GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent
            >(
              GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent,
              {
                user: event.fromId,
                cardId: cardUseEvent.cardId,
                exclude: targets,
                conversation: TranslationPack.translationJsonPatcher(
                  '{0}: please select a Kui to append to {1} targets',
                  this.Name,
                  TranslationPack.patchCardInTranslation(cardUseEvent.cardId),
                ).extract(),
                triggeredBySkills: [this.Name],
              },
              event.fromId,
            );

            if (!selectedPlayers || selectedPlayers.length < 2) {
              break;
            } else {
              chosen.push(selectedPlayers);
              targets.push(selectedPlayers[0]);
              const index = players.findIndex(player => player === selectedPlayers[0]);
              index !== -1 && players.splice(index, 1);
            }
          }

          if (chosen.length > 0) {
            for (const selected of chosen) {
              TargetGroupUtil.pushTargets(cardUseEvent.targetGroup!, selected);
              room.removeMark(selected[0], MarkEnum.Kui);
            }

            event.toIds = [];
            return true;
          }
        }
      }
    }

    return identifier === GameEventIdentifiers.AimEvent;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to cancel {1} ?',
      this.Name,
      TranslationPack.patchCardInTranslation(event.byCardId),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AimEvent | GameEventIdentifiers.CardUseEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      AimGroupUtil.cancelTarget(aimEvent, event.fromId);
      room.removeMark(aimEvent.fromId, MarkEnum.Kui);
    } else {
      if (!event.toIds) {
        return false;
      }

      if (event.toIds.length > 0) {
        for (const toId of event.toIds) {
          TargetGroupUtil.pushTargets(
            (unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).targetGroup!,
            toId,
          );
          room.removeMark(toId, MarkEnum.Kui);
        }
      }
    }

    return true;
  }
}

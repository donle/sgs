import { CardType } from 'core/cards/card';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { ExtralCardSkillProperty } from 'core/skills/cards/interface/extral_property';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'sheyan', description: 'sheyan_description' })
export class SheYan extends TriggerSkill {
  private readonly SheYanAdd = 'sheyan_add';

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.OnAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    const card = Sanguosha.getCardById(content.byCardId);
    return (
      content.toId === owner.Id &&
      card.is(CardType.Trick) &&
      !card.is(CardType.DelayedTrick) &&
      (room
        .getAlivePlayersFrom()
        .map(player => player.Id)
        .find(playerId => {
          return (
            !AimGroupUtil.getAllTargets(content.allTargets).includes(playerId) &&
            room.isAvailableTarget(content.byCardId, content.fromId, playerId) &&
            ((Sanguosha.getCardById(content.byCardId)
              .Skill as unknown) as ExtralCardSkillProperty).isCardAvailableTarget(
              content.fromId,
              room,
              playerId,
              [],
              [],
              content.byCardId,
            )
          );
        }) !== undefined ||
        AimGroupUtil.getAllTargets(content.allTargets).length > 1)
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId } = event;
    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    const allTargets = AimGroupUtil.getAllTargets(aimEvent.allTargets);

    const options: string[] = [];
    room
      .getAlivePlayersFrom()
      .map(player => player.Id)
      .find(playerId => {
        return (
          !AimGroupUtil.getAllTargets(aimEvent.allTargets).includes(playerId) &&
          room.isAvailableTarget(aimEvent.byCardId, aimEvent.fromId, playerId) &&
          ((Sanguosha.getCardById(aimEvent.byCardId)
            .Skill as unknown) as ExtralCardSkillProperty).isCardAvailableTarget(
            aimEvent.fromId,
            room,
            playerId,
            [],
            [],
            aimEvent.byCardId,
          )
        );
      }) !== undefined && options.push('sheyan:add');
    AimGroupUtil.getAllTargets(aimEvent.allTargets).length > 1 && options.push('sheyan:reduce');
    if (options.length === 0) {
      return false;
    }

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        toId: fromId,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose sheyan options: {1}',
          this.Name,
          TranslationPack.patchCardInTranslation(aimEvent.byCardId),
        ).extract(),
      },
      fromId,
    );
    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      fromId,
    );

    if (selectedOption === 'sheyan:add') {
      const { selectedPlayers } = await room.doAskForCommonly<
        GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent
      >(
        GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent,
        {
          user: aimEvent.fromId,
          cardId: aimEvent.byCardId,
          exclude: allTargets,
          conversation: 'sheyan: please select a player to append to card targets',
          triggeredBySkills: [this.Name],
        },
        fromId,
      );

      if (selectedPlayers) {
        EventPacker.addMiddleware({ tag: this.SheYanAdd, data: true }, event);
        event.toIds = selectedPlayers;
      }
    } else if (selectedOption === 'sheyan:reduce') {
      const { selectedPlayers } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players: AimGroupUtil.getAllTargets(aimEvent.allTargets),
          toId: fromId,
          requiredAmount: 1,
          conversation: 'sheyan: please select a target to remove',
          triggeredBySkills: [this.Name],
        },
        fromId,
      );

      if (selectedPlayers && selectedPlayers.length > 0) {
        EventPacker.addMiddleware({ tag: this.SheYanAdd, data: false }, event);
        event.toIds = selectedPlayers;
      }
    }

    return event.toIds !== undefined && event.toIds.length > 0;
  }

  public resortTargets(): boolean {
    return false;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    const chosen = EventPacker.getMiddleware<boolean>(this.SheYanAdd, event);

    if (chosen === true) {
      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage: TranslationPack.translationJsonPatcher(
          "{1} is appended to target list of {2} by {0}'s skill {3}",
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(toIds[0])),
          TranslationPack.patchCardInTranslation(aimEvent.byCardId),
          this.Name,
        ).extract(),
      });

      AimGroupUtil.addTargets(room, aimEvent, toIds);
    } else if (chosen === false) {
      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage: TranslationPack.translationJsonPatcher(
          "{1} is removed from target list of {2} by {0}'s skill {3}",
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(toIds[0])),
          TranslationPack.patchCardInTranslation(aimEvent.byCardId),
          this.Name,
        ).extract(),
      });

      AimGroupUtil.cancelTarget(aimEvent, toIds[0]);
    }

    return true;
  }
}

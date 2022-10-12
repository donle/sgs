import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, CardMoveStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { ExtralCardSkillProperty } from 'core/skills/cards/interface/extral_property';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qirang', description: 'qirang_description' })
export class QiRang extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return content.infos.find(info => info.toId === owner.Id && info.toArea === CardMoveArea.EquipArea) !== undefined;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to gain a random equip card from draw stack?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const tricks = room.findCardsByMatcherFrom(new CardMatcher({ type: [CardType.Trick] }));

    if (tricks.length > 0) {
      const randomTrick = tricks[Math.floor(Math.random() * tricks.length)];
      await room.moveCards({
        movingCards: [{ card: randomTrick, fromArea: CardMoveArea.DrawStack }],
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      });

      if (Sanguosha.getCardById(randomTrick).isCommonTrick()) {
        const qirangTricks = room.getFlag<CardId[]>(event.fromId, this.Name) || [];
        qirangTricks.includes(randomTrick) || qirangTricks.push(randomTrick);
        room.getPlayerById(event.fromId).setFlag<CardId[]>(this.Name, qirangTricks);
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: QiRang.Name, description: QiRang.Description })
export class QiRangBuff extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public afterDead(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.OnAim || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = event as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      return (
        aimEvent.fromId === owner.Id &&
        AimGroupUtil.getAllTargets(aimEvent.allTargets).length === 1 &&
        Sanguosha.getCardById(aimEvent.byCardId).isCommonTrick() &&
        owner.getFlag<CardId[]>(this.GeneralName)?.includes(aimEvent.byCardId)
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const PhaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        owner.Id === PhaseChangeEvent.fromPlayer &&
        PhaseChangeEvent.from === PlayerPhase.PhaseFinish &&
        owner.getFlag<CardId[]>(this.GeneralName) !== undefined
      );
    }

    return false;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const identifier = EventPacker.getIdentifier(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>);
    if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      const players = room
        .getAlivePlayersFrom()
        .map(player => player.Id)
        .filter(
          playerId =>
            !AimGroupUtil.getAllTargets(aimEvent.allTargets).includes(playerId) &&
            room.isAvailableTarget(aimEvent.byCardId, event.fromId, playerId) &&
            (
              Sanguosha.getCardById(aimEvent.byCardId).Skill as unknown as ExtralCardSkillProperty
            ).isCardAvailableTarget(event.fromId, room, playerId, [], [], aimEvent.byCardId),
        );

      if (players.length > 0) {
        const targets = AimGroupUtil.getAllTargets(aimEvent.allTargets);
        const { selectedPlayers } =
          await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent>(
            GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent,
            {
              user: event.fromId,
              cardId: aimEvent.byCardId,
              exclude: targets,
              conversation: TranslationPack.translationJsonPatcher(
                '{0}: do you want to select a player to append to {1} targets?',
                this.Name,
                TranslationPack.patchCardInTranslation(aimEvent.byCardId),
              ).extract(),
              triggeredBySkills: [this.Name],
            },
            event.fromId,
          );

        if (selectedPlayers && selectedPlayers.length > 0) {
          event.toIds = selectedPlayers;
          return true;
        }
      }
    }

    return identifier === GameEventIdentifiers.PhaseChangeEvent;
  }

  public resortTargets(): boolean {
    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.AimEvent) {
      if (!event.toIds) {
        return false;
      }

      const aimEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage: TranslationPack.translationJsonPatcher(
          "{1} is appended to target list of {2} by {0}'s skill {3}",
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toIds[0])),
          TranslationPack.patchCardInTranslation(aimEvent.byCardId),
          this.Name,
        ).extract(),
      });

      AimGroupUtil.addTargets(room, aimEvent, event.toIds);
    } else {
      room.getPlayerById(event.fromId).removeFlag(this.GeneralName);
    }

    return true;
  }
}

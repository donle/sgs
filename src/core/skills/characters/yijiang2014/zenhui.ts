import { CardType } from 'core/cards/card';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { ExtralCardSkillProperty } from 'core/skills/cards/interface/extral_property';
import { CommonSkill, OnDefineReleaseTiming, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zenhui', description: 'zenhui_description' })
export class ZenHui extends TriggerSkill {
  private static readonly Targets = 'Zenhui_Targets';

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAim && AimGroupUtil.getAllTargets(event.allTargets).length === 1;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    const card = Sanguosha.getCardById(event.byCardId);
    return (
      owner.Id === event.fromId &&
      !owner.getFlag<boolean>(this.Name) &&
      room.CurrentPlayer === owner &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      (card.GeneralName === 'slash' ||
        (card.is(CardType.Trick) && !card.is(CardType.DelayedTrick) && card.isBlack())) &&
      room
        .getAlivePlayersFrom()
        .map(player => player.Id)
        .find(
          playerId =>
            !AimGroupUtil.getAllTargets(event.allTargets).includes(playerId) &&
            room.isAvailableTarget(event.byCardId, owner.Id, playerId) &&
            (Sanguosha.getCardById(event.byCardId).Skill as unknown as ExtralCardSkillProperty).isCardAvailableTarget(
              owner.Id,
              room,
              playerId,
              [],
              [],
              event.byCardId,
            ),
        ) !== undefined
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    const { selectedPlayers } =
      await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent>(
        GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent,
        {
          user: event.fromId,
          cardId: aimEvent.byCardId,
          exclude: AimGroupUtil.getAllTargets(aimEvent.allTargets),
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please select a player who can be the target of {1}',
            this.Name,
            TranslationPack.patchCardInTranslation(aimEvent.byCardId),
            this.Name,
          ).extract(),
          triggeredBySkills: [this.Name],
        },
        event.fromId,
      );

    if (selectedPlayers) {
      event.toIds = selectedPlayers;
      return true;
    }

    return false;
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const step = [{ from: event.fromId, tos: [event.toIds![0]] }];
    if (event.toIds!.length > 1) {
      step.push({ from: event.toIds![0], tos: event.toIds!.slice(1, event.toIds!.length) });
    }

    return step;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds, triggeredOnEvent } = event;
    if (!toIds) {
      return false;
    }
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    let option2 = true;
    if (room.getPlayerById(fromId).getCardIds(PlayerCardsArea.HandArea).length > 0) {
      const { selectedCards } = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        {
          cardAmount: 1,
          toId: toIds[0],
          reason: this.Name,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please give a card to {1}, or you will be the new target of {2}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
            TranslationPack.patchCardInTranslation(aimEvent.byCardId),
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          triggeredBySkills: [this.Name],
        },
        toIds[0],
      );

      if (selectedCards.length > 0) {
        option2 = false;
        await room.moveCards({
          movingCards: [{ card: selectedCards[0], fromArea: room.getPlayerById(toIds[0]).cardFrom(selectedCards[0]) }],
          fromId: toIds[0],
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          proposer: toIds[0],
          moveReason: CardMoveReason.ActiveMove,
          triggeredBySkills: [this.Name],
        });

        aimEvent.fromId = toIds[0];
      }
    }

    if (option2) {
      AimGroupUtil.addTargets(room, aimEvent, toIds);
      room.getPlayerById(fromId).setFlag<boolean>(this.Name, true);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ZenHui.Name, description: ZenHui.Description })
export class ZenHuiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PlayCardStage &&
      owner.getFlag<boolean>(this.GeneralName) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}

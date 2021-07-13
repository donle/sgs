import { CardType } from 'core/cards/card';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { ExtralCardSkillProperty } from 'core/skills/cards/interface/extral_property';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qiaoshuo', description: 'qiaoshuo_description' })
export class QiaoShuo extends ActiveSkill {
  public static readonly WIN: string = 'qiaoshuo_win';
  public static readonly LOSE: string = 'qiaoshuo_lose';

  public canUse(): boolean {
    return true;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.canPindian(owner, target);
  }

  public cardFilter(): boolean {
    return true;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectSkill: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, toIds } = skillEffectSkill;
    const { pindianRecord } = await room.pindian(fromId, toIds!);
    if (!pindianRecord.length) {
      return false;
    }

    if (pindianRecord[0].winner === fromId) {
      room.setFlag(fromId, QiaoShuo.WIN, true, QiaoShuo.WIN);
    } else {
      await room.skip(fromId, PlayerPhase.PlayCardStage);
      room.setFlag(fromId, QiaoShuo.LOSE, true, QiaoShuo.LOSE);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: QiaoShuo.GeneralName, description: QiaoShuo.Description })
export class QiaoShuoWin extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
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

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage: AllStage): boolean {
    return stage === CardUseStage.AfterCardTargetDeclared;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return event.fromId === owner.Id && owner.getFlag(QiaoShuo.WIN);
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.FinishStage && room.CurrentPhasePlayer === owner;
  }

  public whenRefresh(room: Room, owner: Player): void {
    owner.getFlag<boolean>(QiaoShuo.WIN) && room.removeFlag(owner.Id, QiaoShuo.WIN);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectSkill: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, triggeredOnEvent } = skillEffectSkill;
    const from = room.getPlayerById(fromId);
    const cardUseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const card = Sanguosha.getCardById(cardUseEvent.cardId);
    if (card.is(CardType.Basic) || (card.is(CardType.Trick) && !card.is(CardType.DelayedTrick))) {
      room.removeFlag(fromId, QiaoShuo.WIN);

      const options: string[] = [];

      if (!cardUseEvent.targetGroup) {
        // only responsive card has not 'toIds'
        return false;
      }

      const targetGroup = cardUseEvent.targetGroup;
      const realTargets = TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup);
      if (targetGroup.length > 1) {
        options.push('qiaoshuo: reduce');
      }

      const cardSkill = (card.Skill as unknown) as ExtralCardSkillProperty;
      const pendingTargets = room
        .getAlivePlayersFrom()
        .map(player => player.Id)
        .filter(playerId => {
          return (
            !realTargets.includes(playerId) &&
            room.isAvailableTarget(card.Id, fromId, playerId) &&
            cardSkill.isCardAvailableTarget(fromId, room, playerId, [], [], card.Id)
          );
        });

      if (pendingTargets.length) {
        options.push('qiaoshuo: add');
      }

      if (!options.length) {
        return false;
      }

      const { selectedOption } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options,
          toId: fromId,
          conversation: 'qiaoshuo: please select',
          triggeredBySkills: [this.Name],
        },
        fromId,
      );

      if (!selectedOption) {
        return false;
      }

      if (selectedOption === 'qiaoshuo: reduce') {
        const { selectedPlayers } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          {
            players: realTargets,
            toId: fromId,
            requiredAmount: 1,
            conversation: 'qiaoshuo: please select a player to reduce from card targets',
            triggeredBySkills: [this.Name],
          },
          fromId,
          true,
        );

        room.broadcast(GameEventIdentifiers.CustomGameDialog, {
          translationsMessage: TranslationPack.translationJsonPatcher(
            "{1} is removed from target list of {2} by {0}'s skill {3}",
            TranslationPack.patchPlayerInTranslation(from),
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(selectedPlayers![0])),
            TranslationPack.patchCardInTranslation(card.Id),
            this.GeneralName,
          ).extract(),
        });

        TargetGroupUtil.removeTarget(targetGroup, selectedPlayers![0]);
      } else {
        const { selectedPlayers } = await room.doAskForCommonly<
          GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent
        >(
          GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent,
          {
            cardId: cardUseEvent.cardId,
            exclude: realTargets,
            conversation: 'qiaoshuo: please select a player to append to card targets',
            triggeredBySkills: [this.Name],
          },
          fromId,
        );

        if (selectedPlayers) {
          room.broadcast(GameEventIdentifiers.CustomGameDialog, {
            translationsMessage: TranslationPack.translationJsonPatcher(
              "{1} is appended to target list of {2} by {0}'s skill {3}",
              TranslationPack.patchPlayerInTranslation(from),
              TranslationPack.patchPlayerInTranslation(room.getPlayerById(selectedPlayers![0])),
              TranslationPack.patchCardInTranslation(card.Id),
              this.GeneralName,
            ).extract(),
          });

          TargetGroupUtil.pushTargets(targetGroup, selectedPlayers);
        }
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: QiaoShuoWin.Name, description: QiaoShuoWin.GeneralName })
export class QiaoShuoLose extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger() {
    return true;
  }

  public isFlaggedSkill() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>): boolean {
    return EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForCardDropEvent;
  }

  public canUse(room: Room, owner: Player) {
    return (
      room.CurrentPlayerPhase === PlayerPhase.DropCardStage &&
      room.CurrentPhasePlayer.Id === owner.Id &&
      owner.getFlag<boolean>(QiaoShuo.LOSE)
    );
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.FinishStage && room.CurrentPhasePlayer === owner;
  }

  public whenRefresh(room: Room, owner: Player) {
    owner.getFlag<boolean>(QiaoShuo.LOSE) && room.removeFlag(owner.Id, QiaoShuo.LOSE);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const askForCardDropEvent = skillEffectEvent.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AskForCardDropEvent
    >;
    const player = room.getPlayerById(askForCardDropEvent.toId);
    const tricks = player
      .getCardIds(PlayerCardsArea.HandArea)
      .filter(cardId => Sanguosha.getCardById(cardId).is(CardType.Trick));

    (askForCardDropEvent.cardAmount as number) -= tricks.length;
    askForCardDropEvent.except = askForCardDropEvent.except ? [...askForCardDropEvent.except, ...tricks] : tricks;

    room.removeFlag(player.Id, QiaoShuo.LOSE);
    return true;
  }
}

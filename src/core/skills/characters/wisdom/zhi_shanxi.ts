import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages, RecoverEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, OnDefineReleaseTiming, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhi_shanxi', description: 'zhi_shanxi_description' })
export class ZhiShanXi extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, owner: Player) {
    for (const player of room.getOtherPlayers(owner.Id)) {
      if (player.getFlag<boolean>(this.Name)) {
        room.removeFlag(player.Id, this.Name);
      }
    }
  }

  public async whenLosingSkill(room: Room, owner: Player) {
    for (const player of room.getOtherPlayers(owner.Id)) {
      if (player.getFlag<boolean>(this.Name)) {
        room.removeFlag(player.Id, this.Name);
      }
    }
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PlayCardStageStart &&
      room.getOtherPlayers(owner.Id).find(player => !player.getFlag<boolean>(this.Name)) !== undefined
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && !room.getFlag<boolean>(target, this.Name);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const toId = Precondition.exists(event.toIds, 'Unable to get zhi_shanxi target')[0];
    for (const player of room.getOtherPlayers(event.fromId)) {
      if (player.getFlag<boolean>(this.Name)) {
        room.removeFlag(player.Id, this.Name);
      }
    }

    room.setFlag<boolean>(toId, this.Name, true, 'zhi_shanxi:xi');

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: ZhiShanXi.Name, description: ZhiShanXi.Description })
export class ZhiShanXiShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.RecoverEvent>, stage?: AllStage): boolean {
    return stage === RecoverEffectStage.AfterRecoverEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.RecoverEvent>): boolean {
    const to = room.getPlayerById(content.toId);
    return to.getFlag<boolean>(this.GeneralName) && !to.Dying;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const recoverEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.RecoverEvent>;
    const toId = recoverEvent.toId;
    const to = room.getPlayerById(toId);

    if (to.getPlayerCards().length >= 2) {
      const { selectedCards } = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        {
          cardAmount: 2,
          toId,
          reason: this.GeneralName,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: you need to give 2 cards to {1}, or you will lose 1 hp',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          triggeredBySkills: [this.Name],
        },
        toId,
      );

      if (selectedCards.length > 0) {
        await room.moveCards({
          movingCards: selectedCards.map(card => ({ card, fromArea: to.cardFrom(card) })),
          fromId: toId,
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: toId,
          movedByReason: this.Name,
        });
      } else {
        await room.loseHp(toId, 1);
      }
    } else {
      await room.loseHp(toId, 1);
    }

    return true;
  }
}

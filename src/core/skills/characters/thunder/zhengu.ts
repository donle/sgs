import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import {
  AllStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhengu', description: 'zhengu_description' })
export class ZhenGu extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, player: Player) {
    for (const other of room.getOtherPlayers(player.Id)) {
      const originalPlayers = room.getFlag<PlayerId[]>(other.Id, this.Name);
      if (!originalPlayers) {
        continue;
      }

      const index = originalPlayers.findIndex(p => p === player.Id);
      originalPlayers.splice(index, 1);
      if (originalPlayers.length === 0) {
        room.removeFlag(other.Id, this.Name);
      } else {
        room.setFlag<PlayerId[]>(
          other.Id,
          this.Name,
          originalPlayers,
          TranslationPack.translationJsonPatcher(
            'zhengu sources: {0}',
            TranslationPack.patchPlayerInTranslation(...originalPlayers.map(playerId => room.getPlayerById(playerId))),
          ).toString(),
        );
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
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to draw or drop hand cards until the number of hand cards equal to you?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const opponentsHands = room.getPlayerById(toIds[0]).getCardIds(PlayerCardsArea.HandArea);
    const n = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.HandArea).length - opponentsHands.length;
    if (n > 0) {
      await room.drawCards(Math.min(n, 5 - opponentsHands.length), toIds[0], 'top', fromId, this.Name);
    } else if (n < 0) {
      if (n === -opponentsHands.length) {
        await room.dropCards(CardMoveReason.SelfDrop, opponentsHands, toIds[0], toIds[0], this.Name);
      } else {
        const response = await room.askForCardDrop(
          toIds[0],
          -n,
          [PlayerCardsArea.HandArea],
          true,
          undefined,
          this.Name,
          TranslationPack.translationJsonPatcher('{0}: please drop {1} card(s)', this.Name, -n).extract(),
        );

        response.droppedCards = response.droppedCards || opponentsHands.slice(0, -n);
        await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toIds[0], toIds[0], this.Name);
      }
    }

    const originalPlayers = room.getFlag<PlayerId[]>(toIds[0], this.Name) || [];
    originalPlayers.push(fromId);
    room.setFlag<PlayerId[]>(
      toIds[0],
      this.Name,
      originalPlayers,
      TranslationPack.translationJsonPatcher(
        'zhengu sources: {0}',
        TranslationPack.patchPlayerInTranslation(...originalPlayers.map(playerId => room.getPlayerById(playerId))),
      ).toString(),
    );

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ZhenGu.Name, description: ZhenGu.Description })
export class ZhenGuShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return (
      room.CurrentPlayerPhase === PlayerPhase.PhaseFinish &&
      stage === PhaseChangeStage.PhaseChanged &&
      room.CurrentPlayer.getFlag<PlayerId[]>(this.GeneralName)?.includes(owner)
    );
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

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      content.fromPlayer !== undefined &&
      content.from === PlayerPhase.PhaseFinish &&
      room.getPlayerById(content.fromPlayer).getFlag<PlayerId[]>(this.GeneralName)?.includes(owner.Id)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const target = (triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).fromPlayer;
    if (!target) {
      return false;
    }

    const opponentsHands = room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea);
    const n = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.HandArea).length - opponentsHands.length;
    if (n > 0) {
      await room.drawCards(Math.min(n, 5 - opponentsHands.length), target, 'top', fromId, this.GeneralName);
    } else if (n < 0) {
      if (n === -opponentsHands.length) {
        await room.dropCards(CardMoveReason.SelfDrop, opponentsHands, target, target, this.GeneralName);
      } else {
        const response = await room.askForCardDrop(
          target,
          -n,
          [PlayerCardsArea.HandArea],
          true,
          undefined,
          this.GeneralName,
          TranslationPack.translationJsonPatcher('{0}: please drop {1} card(s)', this.GeneralName, -n).extract(),
        );

        response.droppedCards = response.droppedCards || opponentsHands.slice(0, -n);
        await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, target, target, this.GeneralName);
      }
    }

    const originalPlayers = room.getFlag<PlayerId[]>(target, this.GeneralName);
    const index = originalPlayers.findIndex(player => player === fromId);
    originalPlayers.splice(index, 1);
    if (originalPlayers.length === 0) {
      room.removeFlag(target, this.GeneralName);
    } else {
      room.setFlag<PlayerId[]>(
        target,
        this.GeneralName,
        originalPlayers,
        TranslationPack.translationJsonPatcher(
          'zhengu sources: {0}',
          TranslationPack.patchPlayerInTranslation(...originalPlayers.map(playerId => room.getPlayerById(playerId))),
        ).toString(),
      );
    }

    return true;
  }
}

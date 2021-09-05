import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'biluan', description: 'biluan_description' })
export class BiLuan extends TriggerSkill {
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
      owner.Id === content.playerId &&
      PlayerPhaseStages.FinishStageStart === content.toStage &&
      owner.getPlayerCards().length > 0 &&
      room.getOtherPlayers(owner.Id).find(player => room.distanceBetween(player, owner) === 1) !== undefined
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to drop a card to let others calculate the distance to you increase {1}',
      this.Name,
      Math.min(room.AlivePlayers.length, 4),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, cardIds } = event;
    if (!cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);
    let originalDistance = room.getFlag<number>(fromId, this.Name) || 0;
    originalDistance += Math.min(room.AlivePlayers.length, 4);
    room.setFlag<number>(
      fromId,
      this.Name,
      originalDistance,
      originalDistance !== 0
        ? TranslationPack.translationJsonPatcher(
            originalDistance > 0 ? 'distance buff: {0}' : 'distance debuff: {0}',
            originalDistance,
          ).toString()
        : undefined,
    );

    room.getPlayerById(fromId).hasShadowSkill(BiLuanDistance.Name) ||
      (await room.obtainSkill(fromId, BiLuanDistance.Name));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_biluan_distance', description: 's_biluan_distance_description' })
export class BiLuanDistance extends RulesBreakerSkill {
  public breakDefenseDistance(room: Room, owner: Player): number {
    return owner.getFlag<number>(BiLuan.Name) || 0;
  }
}

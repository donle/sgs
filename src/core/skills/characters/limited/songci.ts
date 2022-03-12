import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'songci', description: 'songci_description' })
export class SongCi extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return (owner.getFlag<PlayerId[]>(this.Name) || []).length < room.AlivePlayers.length;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return !room.getFlag<PlayerId[]>(owner, this.Name)?.includes(target);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { toIds } = event;
    if (!toIds) {
      return false;
    }

    const originalPlayers = room.getFlag<PlayerId[]>(event.fromId, this.Name) || [];
    originalPlayers.includes(toIds[0]) || originalPlayers.push(toIds[0]);
    room.setFlag<PlayerId[]>(event.fromId, this.Name, originalPlayers);

    if (room.getPlayerById(toIds[0]).Hp < room.getPlayerById(toIds[0]).getCardIds(PlayerCardsArea.HandArea).length) {
      const { droppedCards } = await room.askForCardDrop(
        toIds[0],
        2,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        undefined,
        this.Name,
      );
      await room.dropCards(CardMoveReason.SelfDrop, droppedCards, toIds[0], toIds[0], this.Name);
    } else {
      await room.drawCards(2, toIds[0], 'top', toIds[0], this.Name);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: SongCi.Name, description: SongCi.Description })
export class SongCiShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
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
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      event.playerId === owner.Id &&
      event.toStage === PlayerPhaseStages.DropCardStageEnd &&
      (owner.getFlag<PlayerId[]>(this.GeneralName) || []).length >= room.AlivePlayers.length
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}

import { VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

type FuManMapper = { [playerId: string]: CardId[] };

@CommonSkill({ name: 'fuman', description: 'fuman_description' })
export class FuMan extends ActiveSkill {
  public static readonly FuManMappers = 'fuman_mappers';

  public canUse(room: Room, owner: Player): boolean {
    return owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && !room.getFlag<PlayerId[]>(owner, this.Name)?.includes(target);
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return Sanguosha.getCardById(cardId).GeneralName === 'slash';
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds, cardIds } = event;
    if (!toIds || !cardIds) {
      return false;
    }

    const originalPlayers = room.getFlag<PlayerId[]>(fromId, this.Name) || [];
    originalPlayers.includes(toIds[0]) || originalPlayers.push(toIds[0]);
    room.setFlag<PlayerId[]>(fromId, this.Name, originalPlayers);

    await room.moveCards({
      movingCards: [{ card: cardIds![0], fromArea: room.getPlayerById(fromId).cardFrom(cardIds![0]) }],
      fromId,
      toId: toIds[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      movedByReason: this.Name,
    });

    const originalMappers = room.getFlag<FuManMapper[]>(fromId, FuMan.FuManMappers) || [];
    originalMappers[toIds[0]] = originalMappers[toIds[0]] || [];
    originalMappers[toIds[0]].includes(cardIds[0]) || originalMappers[toIds[0]].push(cardIds[0]);
    room.getPlayerById(fromId).setFlag<FuManMapper[]>(FuMan.FuManMappers, originalMappers);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: FuMan.Name, description: FuMan.Description })
export class FuManShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room, owner: PlayerId): boolean {
    return !room.getFlag<FuManMapper[]>(owner, FuMan.FuManMappers);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage !== CardUseStage.CardUsing;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.CardUsing || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const fuManMappers = owner.getFlag<FuManMapper[]>(FuMan.FuManMappers);
    if (!fuManMappers) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        Object.keys(fuManMappers).includes(cardUseEvent.fromId) &&
        VirtualCard.getActualCards([cardUseEvent.cardId]).find(id =>
          Object.values(fuManMappers[cardUseEvent.fromId]).includes(id),
        ) !== undefined
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        (phaseChangeEvent.fromPlayer === owner.Id ||
          (phaseChangeEvent.fromPlayer !== undefined &&
            Object.keys(fuManMappers).includes(phaseChangeEvent.fromPlayer))) &&
        phaseChangeEvent.from === PlayerPhase.PhaseFinish
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const identifier = EventPacker.getIdentifier(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    } else {
      const phaseChangeEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      if (phaseChangeEvent.fromPlayer === fromId) {
        room.removeFlag(fromId, this.GeneralName);
      } else {
        const originalMappers = room.getFlag<FuManMapper[]>(fromId, FuMan.FuManMappers);
        if (Object.keys(originalMappers).length === 1) {
          room.removeFlag(fromId, FuMan.FuManMappers);
        } else {
          delete originalMappers[phaseChangeEvent.fromPlayer!];
          room.getPlayerById(fromId).setFlag<FuManMapper[]>(FuMan.FuManMappers, originalMappers);
        }
      }
    }

    return true;
  }
}

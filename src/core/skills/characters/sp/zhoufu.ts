import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, CardMoveStage, JudgeEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { YingBing } from 'core/skills';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'zhoufu', description: 'zhoufu_description' })
export class ZhouFu extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      target !== owner && room.getPlayerById(target).getCardIds(PlayerCardsArea.OutsideArea, this.Name).length === 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds || !event.cardIds) {
      return false;
    }

    await room.moveCards({
      movingCards: [{ card: event.cardIds[0], fromArea: CardMoveArea.HandArea }],
      fromId: event.fromId,
      toId: event.toIds[0],
      toArea: CardMoveArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      toOutsideArea: this.Name,
      isOutsideAreaInPublic: true,
      triggeredBySkills: [this.Name],
    });

    room.getPlayerById(event.toIds[0]).hasShadowSkill(ZhouFuDebuff.Name) ||
      (await room.obtainSkill(event.toIds[0], ZhouFuDebuff.Name));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_zhoufu_debuff', description: 's_zhoufu_debuff_description' })
export class ZhouFuDebuff extends TriggerSkill {
  public async whenDead(room: Room, player: Player) {
    player.removeFlag(this.Name);
    await room.loseSkill(player.Id, this.Name);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return (
      stage === JudgeEffectStage.BeforeJudge ||
      stage === PhaseChangeStage.PhaseChanged ||
      stage === CardMoveStage.CardMoving
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<
      GameEventIdentifiers.JudgeEvent | GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.MoveCardEvent
    >,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.to === PlayerPhase.PhaseFinish && owner.getFlag<boolean>(this.Name) === true;
    } else if (identifier === GameEventIdentifiers.JudgeEvent) {
      const judgeEvent = event as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;
      return judgeEvent.toId === owner.Id && owner.getCardIds(PlayerCardsArea.OutsideArea, ZhouFu.Name).length > 0;
    } else if (identifier === GameEventIdentifiers.MoveCardEvent) {
      return (
        (event as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos.find(
          info =>
            info.fromId === owner.Id &&
            info.movingCards.find(
              card =>
                card.fromArea === CardMoveArea.OutsideArea && owner.getOutsideAreaNameOf(card.card) === ZhouFu.Name,
            ),
        ) !== undefined
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.JudgeEvent | GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.MoveCardEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.JudgeEvent) {
      const judgeEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;
      judgeEvent.realJudgeCardId = room
        .getPlayerById(event.fromId)
        .getCardIds(PlayerCardsArea.OutsideArea, ZhouFu.Name)[0];
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      room.getPlayerById(event.fromId).removeFlag(this.Name);
      await room.loseHp(event.fromId, 1);

      room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.OutsideArea, ZhouFu.Name).length === 0 &&
        (await room.loseSkill(event.fromId, this.Name));
    } else {
      for (const player of room.getAllPlayersFrom()) {
        if (player.getFlag<PlayerId>(YingBing.Name) === event.fromId) {
          player.removeFlag(YingBing.Name);
        }
      }
      room.getPlayerById(event.fromId).setFlag<boolean>(this.Name, true);
    }

    return true;
  }
}

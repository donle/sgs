import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { MovingCardProps } from 'core/event/event.server';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  CommonSkill,
  OnDefineReleaseTiming,
  PersistentSkill,
  ShadowSkill,
  TriggerSkill,
} from 'core/skills/skill';

@CommonSkill({ name: 'chuhai', description: 'chuhai_description' })
export class ChuHai extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.canPindian(owner, target);
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }
  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    await room.drawCards(1, fromId, 'top', fromId, this.Name);

    const { pindianRecord } = await room.pindian(fromId, toIds, this.Name);
    if (!pindianRecord.length) {
      return false;
    }

    if (pindianRecord[0].winner === fromId) {
      const opponentsHands = room.getPlayerById(toIds[0]).getCardIds(PlayerCardsArea.HandArea);
      if (opponentsHands.length > 0) {
        room.displayCards(toIds[0], opponentsHands, [fromId]);

        const result: CardType[] = [];
        for (const cardId of opponentsHands) {
          const type = Sanguosha.getCardById(cardId).BaseType;
          if (!result.includes(type)) {
            result.push(type);
            if (result.length === 3) {
              break;
            }
          }
        }

        const toGain: MovingCardProps[] = [];
        for (const type of result) {
          let cardIds = room.findCardsByMatcherFrom(new CardMatcher({ type: [type] }));
          const length = cardIds.length;
          cardIds = cardIds.concat(room.findCardsByMatcherFrom(new CardMatcher({ type: [type] }), false));
          if (cardIds.length === 0) {
            continue;
          }

          const randomIndex = Math.floor(Math.random() * cardIds.length);
          toGain.push({
            card: cardIds[randomIndex],
            fromArea: randomIndex < length ? CardMoveArea.DrawStack : CardMoveArea.DropStack,
          });
        }

        if (toGain.length > 0) {
          await room.moveCards({
            movingCards: toGain,
            toId: fromId,
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActiveMove,
            proposer: fromId,
            triggeredBySkills: [this.Name],
          });
        }
      }

      room.getPlayerById(fromId).setFlag<PlayerId>(this.Name, toIds[0]);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ChuHai.Name, description: ChuHai.Description })
export class ChuHaiShadow extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DamageEffectStage.AfterDamageEffect || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    if (!owner.getFlag<PlayerId>(this.GeneralName)) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return (
        damageEvent.fromId === owner.Id &&
        damageEvent.toId === owner.getFlag<PlayerId>(this.GeneralName) &&
        owner.getEmptyEquipSections().length > 0
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.fromPlayer === owner.Id && phaseChangeEvent.from === PlayerPhase.PlayCardStage;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.DamageEvent) {
      const types = room.getPlayerById(fromId).getEmptyEquipSections();
      let cardIds = room.findCardsByMatcherFrom(new CardMatcher({ type: types }));
      const length = cardIds.length;
      cardIds = cardIds.concat(room.findCardsByMatcherFrom(new CardMatcher({ type: types }), false));

      if (cardIds.length > 0) {
        const randomIndex = Math.floor(Math.random() * cardIds.length);
        const movingCards = [
          {
            card: cardIds[randomIndex],
            fromArea: randomIndex < length ? CardMoveArea.DrawStack : CardMoveArea.DropStack,
          },
        ];

        await room.moveCards({
          movingCards,
          toId: fromId,
          toArea: CardMoveArea.EquipArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: fromId,
          triggeredBySkills: [this.GeneralName],
        });
      }
    } else {
      room.removeFlag(fromId, this.GeneralName);
    }

    return true;
  }
}

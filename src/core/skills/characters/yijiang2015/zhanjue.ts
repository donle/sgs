import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  CardUseStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'zhanjue', description: 'zhanjue_description' })
export class ZhanJue extends ViewAsSkill {
  public canViewAs(room: Room, owner: Player, selectedCards?: CardId[], cardMatcher?: CardMatcher): string[] {
    return cardMatcher ? [] : ['duel'];
  }

  public canUse(room: Room, owner: Player): boolean {
    return (
      (owner.getFlag<number>(this.Name) || 0) < 2 &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      owner.canUseCard(room, new CardMatcher({ name: ['duel'] }))
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return false;
  }

  public viewAs(selectedCards: CardId[], owner: Player): VirtualCard {
    return VirtualCard.create(
      {
        cardName: 'duel',
        bySkill: this.Name,
      },
      owner.getCardIds(PlayerCardsArea.HandArea),
    );
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ZhanJue.Name, description: ZhanJue.Description })
export class ZhanJueShadow extends TriggerSkill implements OnDefineReleaseTiming {
  private readonly ZhanJueStage = 'zhanjue_stage';

  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public afterDead(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      stage === CardUseStage.BeforeCardUseEffect ||
      stage === CardUseStage.CardUseFinishedEffect ||
      stage === PhaseStageChangeStage.StageChanged
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

      const card = Sanguosha.getCardById(cardUseEvent.cardId);
      if (
        !(
          card.GeneralName === 'duel' &&
          card.isVirtualCard() &&
          (card as VirtualCard).findByGeneratedSkill(this.GeneralName)
        ) ||
        (stage === CardUseStage.BeforeCardUseEffect && cardUseEvent.fromId !== owner.Id) ||
        (stage === CardUseStage.CardUseFinishedEffect &&
          (EventPacker.getMiddleware<PlayerId>(this.Name, cardUseEvent) || cardUseEvent.fromId) !== owner.Id)
      ) {
        return false;
      }

      owner.setFlag<AllStage>(this.ZhanJueStage, stage!);

      return true;
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      return owner.getFlag<number>(this.GeneralName) !== undefined;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseStageChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const stage = room.getFlag<AllStage>(event.fromId, this.ZhanJueStage);
      if (stage === CardUseStage.BeforeCardUseEffect) {
        EventPacker.addMiddleware({ tag: this.Name, data: event.fromId }, unknownEvent);
      } else {
        const from = room.getPlayerById(event.fromId);
        let drawNum = from.getFlag<number>(this.GeneralName) || 0;
        if (!from.Dead) {
          await room.drawCards(1, event.fromId, 'top', event.fromId);
          drawNum++;
        }

        const victims = room.Analytics.getRecordEvents<GameEventIdentifiers.DamageEvent>(
          event => {
            if (!event.cardIds) {
              return false;
            }

            return event.cardIds[0] === (unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId;
          },
          undefined,
          'phase',
        ).reduce<PlayerId[]>((playerIds, event) => {
          playerIds.includes(event.toId) || playerIds.push(event.toId);
          return playerIds;
        }, []);
        if (victims.length > 0) {
          room.sortPlayersByPosition(victims);
          for (const vic of victims) {
            if (room.getPlayerById(vic).Dead) {
              continue;
            }

            await room.drawCards(1, vic, 'top', event.fromId, this.Name);
            if (vic === event.fromId) {
              drawNum++;
            }
          }
        }

        if (!from.Dead) {
          room.setFlag<number>(event.fromId, this.GeneralName, drawNum);
        }
      }
    } else {
      room.removeFlag(event.fromId, this.GeneralName);
    }

    return true;
  }
}

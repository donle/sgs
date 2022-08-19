import { CharacterNationality } from 'core/characters/character';
import { CardDrawReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import {
  AllStage,
  DrawCardStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CompulsorySkill, OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'lei_yongsi', description: 'lei_yongsi_description' })
export class LeiYongSi extends TriggerSkill {
  public static readonly LeiYongSiCardHold = 'lei_yongsi_cardhold';

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DrawCardStage.CardDrawing || stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DrawCardEvent) {
      const drawCardEvent = content as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
      return (
        owner.Id === drawCardEvent.fromId &&
        room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
        drawCardEvent.bySpecialReason === CardDrawReason.GameStage
      );
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      let damage = 1;
      if (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.PlayCardStageEnd
      ) {
        const events = room.Analytics.getDamageRecord(owner.Id, 'phase');
        if (events.length > 0) {
          damage = events.reduce<number>((sum, event) => {
            return sum + event.damage;
          }, 0);
        } else if (owner.getCardIds(PlayerCardsArea.HandArea).length < owner.Hp) {
          damage = 0;
        }

        damage !== 1 && owner.setFlag<number>(this.Name, damage);
      }

      return damage !== 1;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.PhaseStageChangeEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.DrawCardEvent) {
      const drawCardEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
      const nations = room.AlivePlayers.reduce<CharacterNationality[]>((allNations, player) => {
        if (!allNations.includes(player.Nationality)) {
          allNations.push(player.Nationality);
        }
        return allNations;
      }, []);
      drawCardEvent.drawAmount = nations.length;
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const from = room.getPlayerById(fromId);
      const damage = from.getFlag<number>(this.Name);
      if (damage === 0) {
        await room.drawCards(
          from.Hp - from.getCardIds(PlayerCardsArea.HandArea).length,
          fromId,
          'top',
          fromId,
          this.Name,
        );
      } else {
        room.setFlag<boolean>(fromId, LeiYongSi.LeiYongSiCardHold, true);
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: LeiYongSi.Name, description: LeiYongSi.Description })
export class LeiYongSiShadow extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakBaseCardHoldNumber(room: Room, owner: Player) {
    return owner.getFlag<boolean>(LeiYongSi.LeiYongSiCardHold) ? owner.LostHp : -1;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: LeiYongSiShadow.Name, description: LeiYongSiShadow.Description })
export class LeiYongSiRemove extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PhaseFinish &&
      owner.getFlag<boolean>(LeiYongSi.LeiYongSiCardHold) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, LeiYongSi.LeiYongSiCardHold);

    return true;
  }
}

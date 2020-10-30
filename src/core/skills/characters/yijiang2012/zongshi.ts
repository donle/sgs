import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AllStage, PhaseChangeStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'zongshi', description: 'zongshi_description' })
export class ZongShi extends RulesBreakerSkill {
  public breakAdditionalCardHoldNumber(room: Room, owner: Player): number {
    const nations = room.AlivePlayers.reduce<CharacterNationality[]>((allNations, player) => {
      if (!allNations.includes(player.Nationality)) {
        allNations.push(player.Nationality);
      }
      return allNations;
    }, []);

    return nations.length;
  }
}

@ShadowSkill
@CompulsorySkill({ name: ZongShi.Name, description: ZongShi.Description })
export class ZongShiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterDead(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public afterLosingSkill(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseChangeStage.PhaseChanged || stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    const unknownEvent = EventPacker.getIdentifier(content);
    if (unknownEvent === GameEventIdentifiers.PhaseChangeEvent) {
      const event = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return event.from === PlayerPhase.PhaseFinish && room.getFlag<boolean>(owner.Id, this.GeneralName) === true;
    } else if (unknownEvent === GameEventIdentifiers.PhaseStageChangeEvent) {
      const event = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        event.playerId === owner.Id &&
        event.toStage === PlayerPhaseStages.PhaseBeginStart &&
        owner.getCardIds(PlayerCardsArea.HandArea).length > owner.Hp
      );
    }
    
    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>, 
  ): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.PhaseStageChangeEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      room.removeFlag(fromId, this.GeneralName);
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      room.setFlag<boolean>(fromId, this.GeneralName, true, true);
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: ZongShiShadow.Name, description: ZongShiShadow.Description })
export class ZongShiBuff extends RulesBreakerSkill {
  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (!room.getFlag<boolean>(owner.Id, this.GeneralName)) {
      return 0;
    }

    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ generalName: ['slash'] })) ? INFINITE_TRIGGERING_TIMES : 0;
    } else {
      return Sanguosha.getCardById(cardId).GeneralName === 'slash' ? INFINITE_TRIGGERING_TIMES : 0;
    }
  }
}

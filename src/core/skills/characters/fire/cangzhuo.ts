import { CardType } from 'core/cards/card';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
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
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'cangzhuo', description: 'cangzhuo_description' })
export class CangZhuo extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId &&
      content.toStage === PlayerPhaseStages.DropCardStageStart &&
      room.Analytics.getUsedCard(owner.Id, true).filter(cardId => Sanguosha.getCardById(cardId).is(CardType.Trick))
        .length === 0
    );
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    room.getPlayerById(fromId).setFlag<boolean>(this.Name, true);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: CangZhuo.GeneralName, description: CangZhuo.Description })
export class CangZhuoShadow extends TriggerSkill implements OnDefineReleaseTiming {
  afterLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage: AllStage,
  ): boolean {
    return (
      EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForCardDropEvent ||
      stage === PhaseChangeStage.PhaseChanged
    );
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ) {
    let canTrigger = false;
    if (EventPacker.getIdentifier(content) === GameEventIdentifiers.AskForCardDropEvent) {
      canTrigger = room.CurrentPlayerPhase === PlayerPhase.DropCardStage && room.CurrentPhasePlayer.Id === owner.Id;
    } else if (EventPacker.getIdentifier(content) === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      canTrigger = owner.Id === phaseChangeEvent.fromPlayer && phaseChangeEvent.from === PlayerPhase.PhaseFinish;
    }

    return canTrigger && owner.getFlag<boolean>(this.GeneralName) === true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AskForCardDropEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.AskForCardDropEvent) {
      const askForCardDropEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>;
      const player = room.getPlayerById(askForCardDropEvent.toId);
      const tricks = player
        .getCardIds(PlayerCardsArea.HandArea)
        .filter(cardId => Sanguosha.getCardById(cardId).is(CardType.Trick));

      if (tricks.length > 0) {
        const otherHandCards = player.getCardIds(PlayerCardsArea.HandArea).filter(card => !tricks.includes(card));
        const discardAmount = otherHandCards.length - player.getMaxCardHold(room);

        askForCardDropEvent.cardAmount = discardAmount;
        askForCardDropEvent.except = askForCardDropEvent.except ? [...askForCardDropEvent.except, ...tricks] : tricks;
      }
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      const { fromPlayer } = phaseChangeEvent;
      room.getPlayerById(fromPlayer!).removeFlag(this.GeneralName);
    }

    return true;
  }
}

import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  CardLostReason,
  CardObtainedReason,
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill, CompulsorySkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill
export class Rende extends ActiveSkill {
  constructor() {
    super('rende', 'rende_description');
  }

  public canUse(room: Room, owner: Player) {
    return true;
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.getPlayerById(owner).cardFrom(cardId) === PlayerCardsArea.HandArea;
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.moveCards(
      skillUseEvent.cardIds!,
      skillUseEvent.fromId,
      skillUseEvent.toIds![0],
      CardLostReason.ActiveMove,
      PlayerCardsArea.HandArea,
      PlayerCardsArea.HandArea,
      CardObtainedReason.PassiveObtained,
    );

    const from = room.getPlayerById(skillUseEvent.fromId);
    from.addInvisibleMark(this.name, skillUseEvent.cardIds!.length);

    if (from.getInvisibleMark(this.name) >= 2 && from.getInvisibleMark(this.name + '-used') === 0) {
      const options: string[] = [];
      //TODO: add wine afterwards
      
      if (from.canUseCard(room, new CardMatcher({ name: ['peach'] }))) {
        options.push('peach');
      }
      if (from.canUseCard(room, new CardMatcher({ name: ['slash'] }))) {
        options.push('slash');
        options.push('fire_slash');
        options.push('thunder_slash');
      }

      if (options.length === 0) {
        return true;
      }

      const chooseEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options,
        askedBy: skillUseEvent.fromId,
        conversation: 'please choose a basic card to use',
        toId: skillUseEvent.fromId,
        triggeredBySkills: [this.name],
      };

      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, chooseEvent, skillUseEvent.fromId);
      const response = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        skillUseEvent.fromId,
      );

      if (!response.selectedOption) {
        return true;
      } else if (response.selectedOption === 'slash') {
        const targets: PlayerId[] = [];

        for (const player of room.AlivePlayers) {
          if (player === room.CurrentPlayer || !room.canAttack(from, player)) {
            continue;
          }

          targets.push(player.Id);
        }

        const choosePlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
          players: targets,
          toId: from.Id,
          requiredAmount: 1,
          conversation: 'Please choose your slash target',
        };

        room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, choosePlayerEvent, from.Id);

        const choosePlayerResponse = await room.onReceivingAsyncReponseFrom(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          from.Id,
        );

        if (choosePlayerResponse.selectedPlayers !== undefined) {
          const slashUseEvent = {
            fromId: from.Id,
            cardId: VirtualCard.create({
              cardName: response.selectedOption,
              bySkill: this.name,
            }).Id,
            toIds: choosePlayerResponse.selectedPlayers,
          };

          await room.useCard(slashUseEvent);
        }
      } else {
        const cardUseEvent = {
          fromId: from.Id,
          cardId: VirtualCard.create({
            cardName: response.selectedOption!,
            bySkill: this.name,
          }).Id,
        };

        await room.useCard(cardUseEvent);
      }

      from.addInvisibleMark(this.name + '-used', 1);
    }

    return true;
  }
}

@CompulsorySkill
@ShadowSkill
export class RenDeShadow extends TriggerSkill {
  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: PhaseChangeStage) {
    return stage === PhaseChangeStage.AfterPhaseChanged && event.from === PlayerPhase.PlayCardStage;
  }

  constructor() {
    super('rende', 'rende_description');
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    return content.fromPlayer === owner.Id;
  }

  async onTrigger(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = event;
    const phaseChangeEvent = Precondition.exists(
      triggeredOnEvent,
      'Unknown phase change event in rende',
    ) as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;

    if (phaseChangeEvent.fromPlayer) {
      const player = room.getPlayerById(phaseChangeEvent.fromPlayer);
      player.removeInvisibleMark(this.GeneralName);
      player.removeInvisibleMark(this.GeneralName + '-used');
    }
    return true;
  }
}

import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { GameCardExtensions } from 'core/game/game_props';
import { PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'rende', description: 'rende_description' })
export class Rende extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return true;
  }

  public numberOfTargets() {
    return 1;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && !room.getPlayerById(target).getFlag<boolean>(this.Name);
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.moveCards({
      movingCards: skillUseEvent.cardIds!.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      fromId: skillUseEvent.fromId,
      toId: skillUseEvent.toIds![0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: skillUseEvent.fromId,
      movedByReason: this.Name,
    });

    room.setFlag(skillUseEvent.toIds![0], this.Name, true);

    const from = room.getPlayerById(skillUseEvent.fromId);
    from.addInvisibleMark(this.Name, skillUseEvent.cardIds!.length);

    if (from.getInvisibleMark(this.Name) >= 2 && from.getInvisibleMark(this.Name + '-used') === 0) {
      const hasLegionFightExt = room.Info.cardExtensions.includes(GameCardExtensions.LegionFight);

      const options: string[] = [];

      if (from.canUseCard(room, new CardMatcher({ name: ['peach'] }))) {
        options.push('peach');
      }
      if (hasLegionFightExt && from.canUseCard(room, new CardMatcher({ name: ['alcohol'] }))) {
        options.push('alcohol');
      }
      if (from.canUseCard(room, new CardMatcher({ generalName: ['slash'] }))) {
        options.push('slash');
        if (hasLegionFightExt) {
          options.push('fire_slash');
          options.push('thunder_slash');
        }
      }

      if (options.length === 0) {
        return true;
      }

      const chooseEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options,
        askedBy: skillUseEvent.fromId,
        conversation: 'please choose a basic card to use',
        toId: skillUseEvent.fromId,
        triggeredBySkills: [this.Name],
      };

      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, chooseEvent, skillUseEvent.fromId);
      const response = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        skillUseEvent.fromId,
      );

      if (!response.selectedOption) {
        return true;
      } else if (
        response.selectedOption === 'slash' ||
        response.selectedOption === 'thunder_slash' ||
        response.selectedOption === 'fire_slash'
      ) {
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

        const choosePlayerResponse = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          from.Id,
        );

        if (choosePlayerResponse.selectedPlayers !== undefined) {
          const slashUseEvent = {
            fromId: from.Id,
            cardId: VirtualCard.create({
              cardName: response.selectedOption,
              bySkill: this.Name,
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
            bySkill: this.Name,
          }).Id,
        };

        await room.useCard(cardUseEvent);
      }

      from.addInvisibleMark(this.Name + '-used', 1);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: Rende.GeneralName, description: Rende.Description })
export class RenDeShadow extends TriggerSkill {
  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: PhaseChangeStage) {
    return stage === PhaseChangeStage.AfterPhaseChanged && event.from === PlayerPhase.PlayCardStage;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    return content.fromPlayer === owner.Id;
  }

  public isFlaggedSkill() {
    return true;
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
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

      for (const player of room.getOtherPlayers(phaseChangeEvent.fromPlayer)) {
        room.removeFlag(player.Id, this.GeneralName);
      }
    }
    return true;
  }
}

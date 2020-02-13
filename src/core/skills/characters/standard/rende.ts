import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

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

  isAvailableTarget(room: Room, target: PlayerId): boolean {
    return room.CurrentPlayer.Id !== target;
  }

  isAvailableCard(room: Room, cardId: CardId): boolean {
    const cardFromArea = room.CurrentPlayer.cardFrom(cardId);
    return cardFromArea !== PlayerCardsArea.HandArea;
  }

  async onUse(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activates skill {1} to {2}',
      room.getPlayerById(event.fromId).Name,
      this.name,
      room.getPlayerById(event.toIds![0]).Name,
    );

    return true;
  }

  async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ) {
    room
      .getPlayerById(skillUseEvent.fromId)
      .addInvisibleMark(this.name, skillUseEvent.cardIds!.length);
    room.moveCards(
      skillUseEvent.cardIds!,
      skillUseEvent.fromId,
      skillUseEvent.toIds![0],
      PlayerCardsArea.HandArea,
      PlayerCardsArea.HandArea,
    );

    const from = room.getPlayerById(skillUseEvent.fromId);
    from.addInvisibleMark(this.name, skillUseEvent.cardIds!.length);

    if (
      from.getInvisibleMark(this.name) >= 2 &&
      from.getInvisibleMark(this.name + '-used') === 0
    ) {
      //TODO: add wine afterwards
      const options = ['peach'];
      if (from.canUseCard(room, new CardMatcher({ name: ['slash'] }))) {
        options.push('slash');
        options.push('fire_slash');
        options.push('thunder_slash');
      }

      const chooseEvent = EventPacker.createIdentifierEvent(
        GameEventIdentifiers.AskForChooseOptionsEvent,
        {
          options,
          fromId: skillUseEvent.fromId,
          triggeredBySkillName: this.name,
        },
      );

      room.notify(
        GameEventIdentifiers.AskForChooseOptionsEvent,
        chooseEvent,
        skillUseEvent.fromId,
      );
      const response = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForChooseOptionsEvent,
        skillUseEvent.fromId,
      );

      if (response.selectedOption === 'slash') {
        const targets: PlayerId[] = [];

        for (const player of room.AlivePlayers) {
          if (player === room.CurrentPlayer || !room.canAttack(from, player)) {
            continue;
          }

          targets.push(player.Id);
        }

        const choosePlayerEvent = EventPacker.createIdentifierEvent(
          GameEventIdentifiers.AskForChoosPlayerEvent,
          {
            players: targets,
            fromId: from.Id,
            translationsMessage: TranslationPack.translationJsonPatcher(
              'Please choose your slash target',
            ),
          },
        );

        room.notify(
          GameEventIdentifiers.AskForChoosPlayerEvent,
          choosePlayerEvent,
          from.Id,
        );

        const choosePlayerResponse = await room.onReceivingAsyncReponseFrom(
          GameEventIdentifiers.AskForChoosPlayerEvent,
          from.Id,
        );

        const slashUseEvent = EventPacker.createIdentifierEvent(
          GameEventIdentifiers.CardUseEvent,
          {
            fromId: from.Id,
            cardId: VirtualCard.create(response.selectedOption).Id,
            toIds: [choosePlayerResponse.selectedPlayer!],
          },
        );

        await room.useCard(slashUseEvent);
      } else {
        const cardUseEvent = EventPacker.createIdentifierEvent(
          GameEventIdentifiers.CardUseEvent,
          {
            fromId: from.Id,
            cardId: VirtualCard.create(response.selectedOption!).Id,
          },
        );

        await room.useCard(cardUseEvent);
      }

      from.addInvisibleMark(this.name + '-used', 1);
    }

    return true;
  }

  onPhaseChange(
    from: PlayerPhase,
    to: PlayerPhase,
    room: Room,
    playerId: PlayerId,
  ) {
    if (from === PlayerPhase.FinishStage) {
      const player = room.getPlayerById(playerId);
      player.removeInvisibleMark(this.name);
      player.removeInvisibleMark(this.name + '-used');
    }
  }
}

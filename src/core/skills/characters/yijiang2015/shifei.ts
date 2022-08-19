import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { Jink } from 'core/cards/standard/jink';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, FilterSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'shifei', description: 'shifei_description' })
export class ShiFei extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    return (
      !EventPacker.isDisresponsiveEvent(event) &&
      (identifier === GameEventIdentifiers.AskForCardResponseEvent ||
        identifier === GameEventIdentifiers.AskForCardUseEvent)
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ): boolean {
    const { cardMatcher } = content;
    const jinkMatcher = new CardMatcher({ name: ['jink'] });
    return (
      owner.Id === content.toId &&
      CardMatcher.match(cardMatcher, jinkMatcher) &&
      room.CurrentPlayer &&
      !room.CurrentPlayer.Dead
    );
  }

  public getSkillLog(room: Room) {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to let {1} draw a card?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.CurrentPlayer),
    ).extract();
  }

  public async onTrigger(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    event.animation = [{ from: event.fromId, tos: [room.CurrentPlayer.Id] }];

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;

    await room.drawCards(1, room.CurrentPlayer.Id, 'top', fromId, this.Name);
    if (
      room
        .getOtherPlayers(room.CurrentPlayer.Id)
        .find(
          player =>
            player.getCardIds(PlayerCardsArea.HandArea).length >=
            room.CurrentPlayer.getCardIds(PlayerCardsArea.HandArea).length,
        )
    ) {
      const most = room.getAlivePlayersFrom().reduce<number>((most, player) => {
        return player.getCardIds(PlayerCardsArea.HandArea).length > most
          ? player.getCardIds(PlayerCardsArea.HandArea).length
          : most;
      }, 0);

      const targets = room
        .getAlivePlayersFrom()
        .filter(player => player.getCardIds(PlayerCardsArea.HandArea).length === most)
        .map(player => player.Id);
      if (targets.includes(fromId)) {
        const canDrop = room
          .getPlayerById(fromId)
          .getPlayerCards()
          .find(id => room.canDropCard(fromId, id));
        if (!canDrop) {
          const index = targets.findIndex(target => target === fromId);
          targets.splice(index, 1);
        }
      }

      if (targets.length > 0) {
        const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          {
            players: targets,
            toId: fromId,
            requiredAmount: 1,
            conversation:
              'shifei: do you want to choose a target to drop 1 card by you? and you will use/response a virtual Jink',
            triggeredBySkills: [this.Name],
          },
          fromId,
        );

        if (response.selectedPlayers && response.selectedPlayers.length > 0) {
          const to = room.getPlayerById(response.selectedPlayers[0]);
          const options: CardChoosingOptions = {
            [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
            [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
          };

          const chooseCardEvent = {
            fromId,
            toId: response.selectedPlayers[0],
            options,
            triggeredBySkills: [this.Name],
          };

          const resp = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, true, true);
          if (!resp) {
            return false;
          }

          await room.dropCards(
            fromId === chooseCardEvent.toId ? CardMoveReason.SelfDrop : CardMoveReason.PassiveDrop,
            [resp.selectedCard!],
            chooseCardEvent.toId,
            fromId,
            this.Name,
          );

          const jink = VirtualCard.create<Jink>({
            cardName: 'jink',
            bySkill: this.Name,
          }).Id;
          if (
            !room
              .getPlayerById(fromId)
              .getSkills<FilterSkill>('filter')
              .find(skill => !skill.canUseCard(jink, room, fromId, event.triggeredOnEvent))
          ) {
            const jinkCardEvent = event.triggeredOnEvent as ServerEventFinder<
              GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent
            >;

            const cardUseEvent = {
              cardId: jink,
              fromId,
              toCardIds: jinkCardEvent.byCardId === undefined ? undefined : [jinkCardEvent.byCardId],
              responseToEvent: jinkCardEvent.triggeredOnEvent,
            };

            jinkCardEvent.responsedEvent = cardUseEvent;
          }
        }
      }
    }

    return true;
  }
}

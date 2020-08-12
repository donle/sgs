import { CardType, VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { Slash } from 'core/cards/standard/slash';
import { 
  CardMoveArea,
  CardMoveReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'mingce', description: 'mingce_description' })
export class MingCe extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    const card = Sanguosha.getCardById(cardId);
    return card.GeneralName === 'slash' || card.is(CardType.Equip);
  }

  public async onUse(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, toIds, cardIds } = skillUseEvent;
    const toId = toIds![0];

    await room.moveCards({
      movingCards: cardIds!.map(card => ({ card, fromArea: room.getPlayerById(fromId).cardFrom(card) })),
      fromId: skillUseEvent.fromId,
      toId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
    });

    let targets = room.getOtherPlayers(toId);
    const slash = VirtualCard.create<Slash>({
      cardName: 'slash',
      bySkill: this.Name,
    }).Id;
    targets = targets.filter(player => room.canAttack(room.getPlayerById(toId), player, slash));
    const targetIds = targets.reduce<PlayerId[]>(
      (playerIds, player) => [
        ...playerIds, player.Id
      ],
      [],
    );

    if (targetIds.length > 0) {
      const choosePlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
        players: targetIds,
        toId: fromId,
        requiredAmount: 1,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose a target who {1} can use slash to',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(toId)),
        ).extract(),
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>(choosePlayerEvent),
        fromId,
      );

      const choosePlayerResponse = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        fromId,
      );
      choosePlayerResponse.selectedPlayers = choosePlayerResponse.selectedPlayers || [targetIds[0]];
      
      const slashTo = room.getPlayerById(choosePlayerResponse.selectedPlayers[0]);
      const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options: ['mingce:slash', 'mingce:draw'],
        conversation: TranslationPack.translationJsonPatcher(
          'please choose {0} options:{1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(slashTo),
        ).extract(),
        toId,
      });

      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseEvent, toId);

      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, toId);
      response.selectedOption = response.selectedOption || 'mingce:draw';

      if (response.selectedOption === 'mingce:slash') {
        const slashUseEvent = {
          fromId: toId,
          cardId: slash,
          toIds: choosePlayerResponse.selectedPlayers,
        };

        await room.useCard(slashUseEvent);
      } else {
        await room.drawCards(1, toId, 'top', toId, this.Name);
      }
    } else {
      await room.drawCards(1, toId, 'top', toId, this.Name);
    }

    return true;
  }
}

import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, TriggerableTimes } from 'core/skills/skill';

@CommonSkill
@TriggerableTimes(INFINITE_TRIGGERING_TIMES)
export class FangTianHuaJiSkill extends ActiveSkill {
  constructor() {
    super('fangtianhuaji', 'fangtianhuaji_description');
  }
  public canUse(room: Room, owner: Player) {
    const lastCards = owner.getCardIds(PlayerCardsArea.HandArea);
    return (
      owner.canUseCard(room, new CardMatcher({ name: ['slash'] })) &&
      lastCards.length === 1 &&
      Sanguosha.getCardById(lastCards[0]).GeneralName === 'slash'
    );
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length > 0 && targets.length <= 3;
  }
  public cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length === 1;
  }
  public isAvailableCard(owner: PlayerId, room: Room, card: CardId): boolean {
    return room.getPlayerById(owner).cardFrom(card) === PlayerCardsArea.HandArea;
  }
  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId, selectedCards: CardId[]): boolean {
    return target !== owner && room.canAttack(room.getPlayerById(owner), room.getPlayerById(target), selectedCards[0]);
  }

  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds, cardIds } = event;
    const useSlashEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
      fromId: fromId!,
      toIds,
      cardId: cardIds![0],
    };

    await room.useCard(useSlashEvent);
    return true;
  }
}

import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TagEnum } from 'core/shares/types/tag_list';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { ExtralCardSkillProperty } from '../interface/extral_property';

@CommonSkill({ name: 'slash', description: 'slash_description' })
export class SlashSkill extends ActiveSkill implements ExtralCardSkillProperty {
  protected damageType: DamageType = DamageType.Normal;

  public canUse(room: Room, owner: Player, contentOrContainerCard: CardId) {
    return (
      room.CommonRules.getCardUsableTimes(room, owner, Sanguosha.getCardById(contentOrContainerCard)) >
      owner.cardUsedTimes(new CardMatcher({ generalName: [this.Name] }))
    );
  }

  public isRefreshAt() {
    return true;
  }

  isAvailableCard() {
    return false;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isCardAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return owner !== target;
  }

  isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ) {
    return room.canAttack(room.getPlayerById(owner), room.getPlayerById(target), containerCard);
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const player = room.getPlayerById(event.fromId);
    EventPacker.addMiddleware(
      {
        tag: TagEnum.DrunkTag,
        data: player.hasDrunk(),
      },
      event,
    );
    room.clearHeaded(player.Id);

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, fromId, cardId } = event;
    const addtionalDrunkDamage = EventPacker.getMiddleware<number>(TagEnum.DrunkTag, event) || 0;
    const damageEvent: ServerEventFinder<GameEventIdentifiers.DamageEvent> = {
      fromId,
      toId: toIds![0],
      damage: 1 + addtionalDrunkDamage,
      damageType: this.damageType,
      cardIds: [cardId],
      triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.Name] : [this.Name],
    };

    EventPacker.addMiddleware(
      {
        tag: TagEnum.DrunkTag,
        data: addtionalDrunkDamage,
      },
      damageEvent,
    );

    await room.damage(damageEvent);

    return true;
  }
}

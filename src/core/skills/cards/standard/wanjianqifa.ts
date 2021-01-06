import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'wanjianqifa', description: 'wanjianqifa_description' })
export class WanJianQiFaSkill extends ActiveSkill {
  public canUse(room: Room, owner: Player, containerCard?: CardId) {
    if (containerCard) {
      for (const target of room.getOtherPlayers(owner.Id)) {
        if (owner.canUseCardTo(room, containerCard, target.Id)) {
          return true;
        }
      }
    }

    return false;
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }
  public isAvailableTarget(): boolean {
    return false;
  }
  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const others = room.getOtherPlayers(event.fromId);
    const from = room.getPlayerById(event.fromId);
    event.toIds = others.filter(player => from.canUseCardTo(room, event.cardId, player.Id)).map(player => player.Id);
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, fromId, cardId } = event;
    const to = Precondition.exists(toIds, 'Unknown targets in wanjianqifa')[0];

    const askForCardEvent = {
      cardMatcher: new CardMatcher({
        name: ['jink'],
      }).toSocketPassenger(),
      byCardId: cardId,
      cardUserId: fromId,
      conversation:
        fromId !== undefined
          ? TranslationPack.translationJsonPatcher(
              '{0} used {1} to you, please response a {2} card',
              TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
              TranslationPack.patchCardInTranslation(cardId),
              'jink',
            ).extract()
          : TranslationPack.translationJsonPatcher('please response a {0} card', 'jink').extract(),
      triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.Name] : [this.Name],
    };

    const response = await room.askForCardResponse(
      {
        ...askForCardEvent,
        toId: to,
      },
      to,
    );

    if (response.cardId === undefined) {
      const eventContent = {
        fromId,
        toId: to,
        damage: 1,
        damageType: DamageType.Normal,
        cardIds: [event.cardId],
        triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.Name] : [this.Name],
      };

      await room.damage(eventContent);
    } else {
      const cardResponsedEvent = {
        fromId: to,
        cardId: response.cardId,
      };
      EventPacker.terminate(event);

      await room.responseCard(cardResponsedEvent);
    }

    return true;
  }
}

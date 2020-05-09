import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'duel', description: 'duel_description' })
export class DuelSkill extends ActiveSkill {
  public canUse() {
    return true;
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }
  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }
  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return owner !== target && room.getPlayerById(owner).canUseCardTo(room, containerCard, target);
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const targets = [
      Precondition.exists(event.toIds, 'Unknown targets in duel')[0],
      Precondition.exists(event.fromId, 'Unknown user in duel'),
    ];

    let turn = 0;
    while (true) {
      const result = await room.askForCardResponse(
        {
          toId: targets[turn],
          cardMatcher: new CardMatcher({ name: ['slash'] }).toSocketPassenger(),
          byCardId: event.cardId,
          cardUserId: event.fromId,
          conversation: TranslationPack.translationJsonPatcher(
            'please use a {0} card to response {1}',
            'slash',
            TranslationPack.patchCardInTranslation(event.cardId),
          ).extract(),
        },
        targets[turn],
      );

      const responseCard = result.responseEvent?.cardId;
      if (result.terminated || responseCard !== undefined) {
        if (responseCard !== undefined) {
          const responseEvent = {
            fromId: targets[turn],
            cardId: responseCard,
            responseToEvent: event,
          };
          await room.responseCard(responseEvent);

          if (EventPacker.isTerminated(responseEvent)) {
            await room.damage({
              fromId: targets[(turn + 1) % targets.length],
              cardIds: [event.cardId],
              damage: 1,
              damageType: DamageType.Normal,
              toId: targets[turn],
              triggeredBySkills: [this.Name],
            });
            break;
          }
        }

        turn = (turn + 1) % targets.length;
        continue;
      }

      if (!result.terminated && responseCard === undefined) {
        await room.damage({
          fromId: targets[(turn + 1) % targets.length],
          cardIds: [event.cardId],
          damage: 1,
          damageType: DamageType.Normal,
          toId: targets[turn],
          triggeredBySkills: [this.Name],
        });
        break;
      }
    }
    return true;
  }
}

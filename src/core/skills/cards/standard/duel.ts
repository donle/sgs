import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { DamageType, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, TriggerableTimes } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
@TriggerableTimes(INFINITE_TRIGGERING_TIMES)
export class DuelSkill extends ActiveSkill {
  constructor() {
    super('duel', 'duel_description');
  }
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
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return target !== owner;
  }

  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const targets = [event.toIds![0], event.fromId!];
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
          await room.responseCard({
            fromId: targets[turn],
            cardId: responseCard,
          });
        }

        turn = (turn + 1) % targets.length;
        continue;
      }

      if (!result.terminated && responseCard === undefined) {
        await room.damage({
          fromId: event.fromId,
          cardIds: [event.cardId],
          damage: 1,
          damageType: DamageType.Normal,
          toId: targets[turn],
          triggeredBySkills: [this.name],
        });
        break;
      }
    }
    return true;
  }
}

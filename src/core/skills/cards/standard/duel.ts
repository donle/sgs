import { DuelSkillTrigger } from 'core/ai/skills/cards/duel';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { DamageType } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, AI, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ExtralCardSkillProperty } from '../interface/extral_property';

@AI(DuelSkillTrigger)
@CommonSkill({ name: 'duel', description: 'duel_description' })
export class DuelSkill extends ActiveSkill implements ExtralCardSkillProperty {
  public canUse() {
    return true;
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }

  public isCardAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return owner !== target && room.getPlayerById(owner).canUseCardTo(room, containerCard, target);
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return this.isCardAvailableTarget(owner, room, target, selectedCards, selectedTargets, containerCard);
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
    let validResponse: boolean;
    while (true) {
      let responseCard: CardId | undefined;
      if (!EventPacker.isDisresponsiveEvent(event)) {
        const response = await room.askForCardResponse(
          {
            toId: targets[turn],
            cardMatcher: new CardMatcher({ generalName: ['slash'] }).toSocketPassenger(),
            byCardId: event.cardId,
            cardUserId: event.fromId,
            conversation: TranslationPack.translationJsonPatcher(
              'please response a {0} card to response {1}',
              'slash',
              TranslationPack.patchCardInTranslation(event.cardId),
            ).extract(),
            triggeredBySkills: [this.Name],
          },
          targets[turn],
        );

        responseCard = response.cardId;
      }

      if (responseCard !== undefined) {
        const responseEvent = {
          fromId: targets[turn],
          cardId: responseCard,
          responseToEvent: event,
        };
        validResponse = await room.responseCard(responseEvent);

        if (validResponse) {
          turn = (turn + 1) % targets.length;
        } else {
          break;
        }
      } else {
        validResponse = false;
        break;
      }
    }

    const damageEvent: ServerEventFinder<GameEventIdentifiers.DamageEvent> = {
      fromId: targets[(turn + 1) % targets.length],
      cardIds: [event.cardId],
      damage: 1 + (event.additionalDamage ? event.additionalDamage : 0),
      damageType: DamageType.Normal,
      toId: targets[turn],
      triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.Name] : [this.Name],
    };

    !validResponse && (await room.damage(damageEvent));

    return true;
  }
}

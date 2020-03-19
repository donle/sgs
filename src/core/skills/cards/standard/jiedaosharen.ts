import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, TriggerableTimes } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
@TriggerableTimes(INFINITE_TRIGGERING_TIMES)
export class JieDaoShaRenSkill extends ActiveSkill {
  constructor() {
    super('jiedaosharen', 'ljiedaosharen_description');
  }

  public canUse() {
    return true;
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 2;
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
    if (selectedTargets.length === 0) {
      return owner !== target && room.getPlayerById(target).hasEquipment(CardType.Weapon) !== undefined;
    } else {
      return room.getPlayerById(selectedTargets[0]).canUseCardTo(room, containerCard, target);
    }
  }

  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, cardId } = event;
    const [attcker, target] = toIds!;

    const result = await room.askForCardUse(
      {
        toId: attcker,
        byCardId: cardId,
        cardUserId: event.fromId,
        scopedTargets: [target],
        cardMatcher: new CardMatcher({ name: ['slash'] }).toSocketPassenger(),
        conversation: TranslationPack.translationJsonPatcher(
          'please use a {0} to player {1} to response {2}',
          'slash',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(target)),
          TranslationPack.patchCardInTranslation(cardId),
        ).extract(),
        triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.name] : [this.name],
      },
      attcker,
    );
    return true;
  }
}

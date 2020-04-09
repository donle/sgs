import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  CardLostReason,
  CardObtainedReason,
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class JieDaoShaRenSkill extends ActiveSkill {
  constructor() {
    super('jiedaosharen', 'ljiedaosharen_description');
  }

  public canUse(room: Room, owner: Player) {
    return (
      room.getOtherPlayers(owner.Id).find(player => player.getEquipment(CardType.Weapon) !== undefined) !== undefined
    );
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
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    if (selectedTargets.length === 0) {
      return owner !== target && room.getPlayerById(target).getEquipment(CardType.Weapon) !== undefined;
    } else {
      return room.getPlayerById(selectedTargets[0]).canUseCardTo(room, containerCard, target);
    }
  }

  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, cardId } = event;
    const [attacker, target] = Precondition.exists(toIds, 'Unknown targets in jiedaosharen');

    const result = await room.askForCardUse(
      {
        toId: attacker,
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
      attacker,
    );

    if (result.terminated) {
      return true;
    }

    if (result.responseEvent) {
      if (result.responseEvent.cardId) {
        const cardUseEvent = {
          fromId: result.responseEvent.fromId,
          cardId: result.responseEvent.cardId,
          toIds: result.responseEvent.toIds,
          triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.name] : [this.name],
        };

        await room.useCard(cardUseEvent);
      } else {
        const weapon = room.getPlayerById(attacker).getEquipment(CardType.Weapon);
        if (weapon === undefined) {
          return true;
        }

        await room.moveCards(
          [weapon],
          attacker,
          event.fromId!,
          CardLostReason.PassiveMove,
          PlayerCardsArea.EquipArea,
          PlayerCardsArea.HandArea,
          CardObtainedReason.ActivePrey,
          event.fromId!,
        );
      }
    } else {
      throw new Error(`Unexcepte return type of asForCardUse in ${this.name}`);
    }

    return true;
  }
}

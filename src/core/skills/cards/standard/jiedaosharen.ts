import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ExtralCardSkillProperty } from '../interface/extral_property';

@CommonSkill({ name: 'jiedaosharen', description: 'ljiedaosharen_description' })
export class JieDaoShaRenSkill extends ActiveSkill implements ExtralCardSkillProperty {
  public canUse(room: Room, owner: Player) {
    return (
      room.getOtherPlayers(owner.Id).find(player => player.getEquipment(CardType.Weapon) !== undefined) !== undefined
    );
  }

  public numberOfTargets() {
    return 2;
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
    if (selectedTargets.length === 0) {
      return owner !== target && room.getPlayerById(target).getEquipment(CardType.Weapon) !== undefined;
    } else {
      return room.canAttack(room.getPlayerById(selectedTargets[0]), room.getPlayerById(target));
    }
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

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const toIds = event.targetGroup![0];
    const { fromId } = event;
    return [
      { from: fromId, tos: [toIds![0]] },
      { from: toIds![0], tos: [toIds![1]] },
    ];
  }

  public targetGroupDispatcher(targets: PlayerId[]) {
    return [targets];
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const targets = TargetGroupUtil.getAllTargets(event.targetGroup)![0];
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} used card {1} to {2} and announced {3} as pending target',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      TranslationPack.patchCardInTranslation(event.cardId),
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(targets[0])),
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(targets[1])),
    ).extract();
    event.animation = this.getAnimationSteps(event);
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, cardId } = event;
    Precondition.assert(toIds?.length === 2, 'Invaild targets length in jiedaosharen');
    const [attacker, target] = Precondition.exists(toIds, 'Unknown targets in jiedaosharen');

    const response = await room.askForCardUse(
      {
        toId: attacker,
        byCardId: cardId,
        cardUserId: event.fromId,
        scopedTargets: [target],
        cardMatcher: new CardMatcher({ generalName: ['slash'] }).toSocketPassenger(),
        extraUse: true,
        commonUse: true,
        conversation: TranslationPack.translationJsonPatcher(
          'please use a {0} to player {1} to response {2}',
          'slash',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(target)),
          TranslationPack.patchCardInTranslation(cardId),
        ).extract(),
        triggeredBySkills: [this.Name],
      },
      attacker,
    );

    if (response.cardId !== undefined) {
      const cardUseEvent = {
        fromId: response.fromId,
        cardId: response.cardId,
        targetGroup: response.toIds && [response.toIds],
        triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.Name] : [this.Name],
      };

      await room.useCard(cardUseEvent, true);
    } else {
      const weapon = room.getPlayerById(attacker).getEquipment(CardType.Weapon);
      if (weapon === undefined) {
        return true;
      }

      await room.moveCards({
        movingCards: [{ card: weapon, fromArea: CardMoveArea.EquipArea }],
        fromId: attacker,
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
      });
    }

    return true;
  }
}

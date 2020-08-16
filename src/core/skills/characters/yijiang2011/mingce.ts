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

  public numberOfTargets(): number[] {
    return [];
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    let canSlash: boolean = true;
    if (targets[0]) {
      const first = room.getPlayerById(targets[0]);

      canSlash = room.getOtherPlayers(targets[0])
        .find(player => {
          return (
            room.canAttack(first, player) &&
            first.getAttackDistance(room) >= room.distanceBetween(first, player)
          );
        }) ? true : false;
    }

    return canSlash ? targets.length === 2 : targets.length === 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    if (selectedTargets.length === 1) {
      const first = room.getPlayerById(selectedTargets[0]);
      const second = room.getPlayerById(target);

      return (
        room.canAttack(first, second) &&
        first.getAttackDistance(room) >= room.distanceBetween(first, second)
      );
    }

    return owner !== target;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    const card = Sanguosha.getCardById(cardId);
    return card.GeneralName === 'slash' || card.is(CardType.Equip);
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, toIds } = event;
    if (event.toIds?.length === 2) {
      return [
        { from: fromId, tos: [toIds![0]] },
        { from: toIds![0], tos: [toIds![1]] },
      ];
    }
    
    return event.toIds ? [{ from: event.fromId, tos: event.toIds }] : [];
  }

  public nominateForwardTarget(targets: PlayerId[]) {
    return [targets[0]];
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.animation = this.getAnimationSteps(event);
    
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, toIds, cardIds } = skillUseEvent;
    const first = toIds![0];
    const second = toIds![1];

    await room.moveCards({
      movingCards: cardIds!.map(card => ({ card, fromArea: room.getPlayerById(fromId).cardFrom(card) })),
      fromId: skillUseEvent.fromId,
      toId: first,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
    });

    const options = ['mingce:draw'];
    if (second && room.canAttack(room.getPlayerById(first), room.getPlayerById(second))) {
      options.unshift('mingce:slash');
    }

    const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
      options,
      conversation: second ?
        TranslationPack.translationJsonPatcher(
          'please choose mingce options:{0}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(second)),
        ).extract()
      : TranslationPack.translationJsonPatcher(
          '{0}: please choose',
          this.Name,
        ).extract(),
      toId: first,
    });

    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseEvent, first);

    const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, first);
    response.selectedOption = response.selectedOption || 'mingce:draw';

    if (response.selectedOption === 'mingce:slash') {
      const slash = VirtualCard.create<Slash>({
        cardName: 'slash',
        bySkill: this.Name,
      }).Id;

      const slashUseEvent = {
        fromId: first,
        cardId: slash,
        toIds: [second],
      };

      await room.useCard(slashUseEvent);
    } else {
      await room.drawCards(1, first, 'top', first, this.Name);
    }

    return true;
  }
}

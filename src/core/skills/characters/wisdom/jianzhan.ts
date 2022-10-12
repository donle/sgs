import { VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { Slash } from 'core/cards/standard/slash';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jianzhan', description: 'jianzhan_description' })
export class JianZhan extends ActiveSkill {
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

      canSlash = room
        .getOtherPlayers(targets[0])
        .find(
          player => first.Hp > player.Hp && room.canAttack(first, player) && room.withinAttackDistance(first, player),
        )
        ? true
        : false;
    }

    return canSlash ? targets.length === 2 : targets.length === 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
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

      return first.Hp > second.Hp && room.canAttack(first, second) && room.withinAttackDistance(first, second);
    }

    return owner !== target;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
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

  public resortTargets() {
    return false;
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.animation = this.getAnimationSteps(event);

    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, toIds } = skillUseEvent;
    const first = toIds![0];
    const second = toIds![1];

    const options = ['jianzhan:draw'];
    if (second && room.canAttack(room.getPlayerById(first), room.getPlayerById(second))) {
      options.unshift('jianzhan:slash');
    }

    const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
      options,
      conversation: second
        ? TranslationPack.translationJsonPatcher(
            '{0}: please choose jianzhan options: {1} {2}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(second)),
          ).extract()
        : TranslationPack.translationJsonPatcher(
            '{0}: please choose: {1}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
          ).extract(),
      toId: first,
      triggeredBySkills: [this.Name],
    });

    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseEvent, first);

    const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, first);
    response.selectedOption = response.selectedOption || options[0];

    if (response.selectedOption === 'jianzhan:slash') {
      const slash = VirtualCard.create<Slash>({
        cardName: 'slash',
        bySkill: this.Name,
      }).Id;

      const slashUseEvent = {
        fromId: first,
        cardId: slash,
        targetGroup: [[second]],
      };

      await room.useCard(slashUseEvent);
    } else {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    }

    return true;
  }
}

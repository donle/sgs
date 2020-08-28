import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@LimitSkill({ name: 'yeyan', description: 'yeyan_description' })
export class YeYan extends ActiveSkill {
  public canUse(): boolean {
    return true;
  }

  public numberOfTargets(): number[] {
    return [1, 3];
  }

  public numberOfCards() {
    return [0, 4];
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length <= 4;
  }

  public isAvailableCard(
    owner: PlayerId,
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    if (selectedTargets.length === 3) {
      return false;
    }

    return !selectedCards.find(id => Sanguosha.getCardById(id).Suit === Sanguosha.getCardById(cardId).Suit);
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    if (selectedCards.length === 4) {
      return selectedTargets.length < 2;
    }
    return true;
  }

  public async beforeUse(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    let options: string[] = [];
    let conversation: string | PatchedTranslationObject = '';

    const targets = skillUseEvent.toIds!;
    if (!skillUseEvent.cardIds) {
      options = ['yeyan: 1 point'];
      conversation = TranslationPack.translationJsonPatcher(
        'please assign damage for {0}' + (targets.length > 1 ? ', {1}' : '') + (targets.length > 2 ? ', {2}' : ''),
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(targets[0])),
        targets.length > 1 ? TranslationPack.patchPlayerInTranslation(room.getPlayerById(targets[1])) : '',
        targets.length > 2 ? TranslationPack.patchPlayerInTranslation(room.getPlayerById(targets[2])) : '',
      ).extract();
    } else {
      if (targets.length === 1) {
        options = ['yeyan: 2 point', 'yeyan: 3 point'];
        conversation = TranslationPack.translationJsonPatcher(
          'please assign damage for {0}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(targets[0])),
        ).extract();
      } else if (targets.length === 2) {
        options = ['yeyan: 1 point', 'yeyan: 2 point'];
        conversation = TranslationPack.translationJsonPatcher(
          'please assign x damage for {0}, and {1} will get (3 - x) damage',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(targets[0])),
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(targets[1])),
        ).extract();
      }
    }
    options.push('yeyan: cancel');

    const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      toId: skillUseEvent.fromId,
      conversation,
      ignoreNotifiedStatus: true,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChoosingOptionsEvent),
      skillUseEvent.fromId,
    );

    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      skillUseEvent.fromId,
    );

    if (selectedOption === 'yeyan: 1 point') {
      if (!skillUseEvent.cardIds) {
        targets.forEach(target => {
          EventPacker.addMiddleware({ tag: target, data: 1 }, skillUseEvent);
        });
      } else {
        EventPacker.addMiddleware({ tag: targets[0], data: 1 }, skillUseEvent);
        EventPacker.addMiddleware({ tag: targets[1], data: 2 }, skillUseEvent);
      }
    } else if (selectedOption === 'yeyan: 2 point') {
      if (targets.length === 1) {
        EventPacker.addMiddleware({ tag: targets[0], data: 2 }, skillUseEvent);
      } else {
        EventPacker.addMiddleware({ tag: targets[0], data: 2 }, skillUseEvent);
        EventPacker.addMiddleware({ tag: targets[1], data: 1 }, skillUseEvent);
      }
    } else if (selectedOption === 'yeyan: 3 point') {
      EventPacker.addMiddleware({ tag: targets[0], data: 3 }, skillUseEvent);
    } else {
      return false;
    }
    return true;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    if (skillUseEvent.cardIds && skillUseEvent.cardIds.length === 4) {
      await room.dropCards(
        CardMoveReason.SelfDrop,
        skillUseEvent.cardIds!,
        skillUseEvent.fromId,
        skillUseEvent.fromId,
        this.Name,
      );

      await room.loseHp(skillUseEvent.fromId, 3);
    }

    const targets = skillUseEvent.toIds!;
    for (const target of targets) {
      await room.damage({
        fromId: skillUseEvent.fromId,
        toId: target,
        damage: EventPacker.getMiddleware<number>(target, skillUseEvent)!,
        damageType: DamageType.Fire,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}

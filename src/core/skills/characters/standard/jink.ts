import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class JinkSkill extends ActiveSkill {
  constructor() {
    super('jink', 'jink_description');
  }

  canUse(room: Room, owner: Player) {
    return false;
  }

  isAvailableCard() {
    return false;
  }

  cardFilter() {
    return true;
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return true;
  }

  isAvailableTarget(room: Room, target: PlayerId) {
    return false;
  }

  async onUse(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} uses card {1}',
      Sanguosha.getCardById(event.fromId).Name,
      this.name,
    );

    return true;
  }

  async onEffect() {
    return true;
  }
}

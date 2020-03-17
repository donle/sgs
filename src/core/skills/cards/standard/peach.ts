import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class PeachSkill extends ActiveSkill {
  constructor() {
    super('peach', 'peach_skill_description');
  }

  canUse(room: Room, owner: Player) {
    return owner.Hp < owner.MaxHp;
  }

  cardFilter(room: Room, cards: CardId[]) {
    return cards.length === 0;
  }
  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 0;
  }

  isAvailableCard() {
    return false;
  }
  isAvailableTarget() {
    return false;
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    if (!event.toIds) {
      event.toIds = [event.fromId];
    }

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const recoverContent = {
      recoverBy: event.fromId,
      toId: event.toIds![0],
      recoveredHp: 1,
      triggeredBySkillName: this.name,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} recovers {1} hp',
        room.getPlayerById(event.toIds![0]).Name,
        '1',
      ).extract(),
    };

    await room.recover(recoverContent);

    return true;
  }
}

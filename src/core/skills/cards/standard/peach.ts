import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupSet } from 'core/shares/libs/data structure/target_group';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill, SelfTargetSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ExtralCardSkillProperty } from '../interface/extral_property';

@CommonSkill({ name: 'peach', description: 'peach_skill_description' })
@SelfTargetSkill
export class PeachSkill extends ActiveSkill implements ExtralCardSkillProperty {
  canUse(room: Room, owner: Player) {
    return owner.Hp < owner.MaxHp;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 0;
  }

  isAvailableCard() {
    return false;
  }

  isCardAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    const player = room.getPlayerById(target);
    return owner !== target && player.Hp < player.MaxHp;
  }

  isAvailableTarget() {
    return false;
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    if (!event.targetGroup) {
      event.targetGroup = new TargetGroupSet([event.fromId]);
    }

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const toId = Precondition.exists(event.toIds, 'Unknown targets in peach')[0];
    const recoverContent = {
      recoverBy: event.fromId,
      toId,
      recoveredHp: 1,
      cardIds: [event.cardId],
      triggeredBySkills: [this.Name],
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} recovers {1} hp',
        room.getPlayerById(toId).Name,
        '1',
      ).extract(),
    };

    await room.recover(recoverContent);

    return true;
  }
}

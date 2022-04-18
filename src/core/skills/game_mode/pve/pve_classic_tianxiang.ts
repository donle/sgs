import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'pve_classic_tianxiang', description: 'pve_classic_tianxiang_description' })
export class PveClassicTianXiang extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAimmed && event.byCardId !== undefined;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return event.toId === owner.Id && event.fromId !== owner.Id;
  }

  getSkillLog() {
    return TranslationPack.translationJsonPatcher('you can drop a card to then draw a card').extract();
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 1;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return room.canDropCard(owner, cardId);
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    if (event.cardIds !== undefined && event.cardIds.length === 1) {
      await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId);
      const { toId } = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      await room.drawCards(1, toId, 'top', toId, this.Name);
    }
    return true;
  }
}

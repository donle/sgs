import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { PlayerStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, SkillType } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

export class PeachSkill extends ActiveSkill {
  constructor() {
    super('peach', 'peach_skill_description', SkillType.Common);
  }

  canUse(room: Room, owner: Player) {
    return (
      room.CurrentPlayer === owner &&
      room.CurrentPlayerStage === PlayerStage.PlayCardStage
    );
  }

  cardFilter() {
    return true;
  }
  targetFilter(): boolean {
    return true;
  }

  isAvailableCard() {
    return false;
  }
  isAvailableTarget() {
    return false;
  }

  onUse(room: Room, owner: PlayerId, cardIds?: CardId[]) {
    room.Processor.onHandleIncomingEvent(GameEventIdentifiers.CardUseEvent, {
      fromId: room.getPlayerById(owner).Id,
      cardId: cardIds![0],
      triggeredBySkillName: this.name,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} uses card {1}',
        room.CurrentPlayer.Name,
        Sanguosha.getCardById(cardIds![0]).Name,
      ),
    });
  }

  onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
  ) {
    const recoverContent = {
      fromId: event.fromId!,
      toId: event.toIds![0],
      recover: 1,
      triggeredBySkillName: this.name,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} recovers {1} hp',
        room.getPlayerById(event.toIds![0]).Name,
        '1',
      ),
    };

    room.Processor.onHandleIncomingEvent(GameEventIdentifiers.RecoverEvent, recoverContent);
  }
}

import {
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { PlayerStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class PeachSkill extends ActiveSkill {
  constructor() {
    super('peach', 'peach_skill_description');
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

  async onUse(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} uses card {1}',
      room.CurrentPlayer.Name,
      Sanguosha.getCardById(event.cardId).Name,
    );

    return true;
  }

  async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
  ) {
    const recoverContent: ServerEventFinder<GameEventIdentifiers.RecoverEvent> = {
      recoverBy: event.fromId,
      toId: event.toIds![0],
      recoveredHp: 1,
      triggeredBySkillName: this.name,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} recovers {1} hp',
        room.getPlayerById(event.toIds![0]).Name,
        '1',
      ),
    };

    await room.Processor.onHandleIncomingEvent(
      GameEventIdentifiers.RecoverEvent,
      recoverContent,
    );

    return true;
  }
}

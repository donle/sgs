import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerPhase } from 'core/game/stage_processor';
import { Room } from 'core/room/room';
import { DangXian } from 'core/skills';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'decade_dangxian', description: 'decade_dangxian_description' })
export class DecadeDangXian extends DangXian {
  public get RelatedCharacters() {
    return ['guansuo'];
  }

  public audioIndex(characterName?: string): number {
    return characterName && this.RelatedCharacters.includes(characterName) ? 1 : 2;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (room.getPlayerById(event.fromId).Hp > 0) {
      const { selectedOption } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          toId: event.fromId,
          options: ['yes', 'no'],
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: do you want to lose 1 hp to gain a slash from drop stack?',
            this.Name,
          ).extract(),
        },
        event.fromId,
        true,
      );

      if (selectedOption === 'yes') {
        await room.loseHp(event.fromId, 1);
        const card = room.getCardsByNameFromStack('slash', 'drop', 1)[0];

        if (card) {
          await room.moveCards({
            moveReason: CardMoveReason.ActivePrey,
            movedByReason: this.Name,
            toArea: CardMoveArea.HandArea,
            toId: event.fromId,
            movingCards: [{ card, fromArea: CardMoveArea.DropStack }],
          });
        }
      }
    }

    room.insertPlayerPhase(event.fromId, PlayerPhase.PlayCardStage);
    return true;
  }
}

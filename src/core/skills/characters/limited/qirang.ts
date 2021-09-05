import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qirang', description: 'qirang_description' })
export class QiRang extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return content.infos.find(info => info.toId === owner.Id && info.toArea === CardMoveArea.EquipArea) !== undefined;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to gain a random equip card from draw stack?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const tricks = room.findCardsByMatcherFrom(new CardMatcher({ type: [CardType.Trick] }));

    if (tricks.length > 0) {
      await room.moveCards({
        movingCards: [{ card: tricks[Math.floor(Math.random() * tricks.length)], fromArea: CardMoveArea.DrawStack }],
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}

import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'weicheng', description: 'weicheng_description' })
export class WeiCheng extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      content.movingCards.find(card => card.fromArea === CardMoveArea.HandArea) !== undefined &&
      content.toId !== owner.Id &&
      content.toArea === CardMoveArea.HandArea &&
      owner.getCardIds(PlayerCardsArea.HandArea).length < owner.Hp
    );
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher('{0}: do you want to draw a card?', this.Name).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}

import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jianxiang', description: 'jianxiang_description' })
export class JianXiang extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return content.toId === owner.Id && content.fromId !== owner.Id;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      room
        .getOtherPlayers(target)
        .find(
          player =>
            player.getCardIds(PlayerCardsArea.HandArea).length <
            room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length,
        ) === undefined
    );
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a jianxiang target to draw a card?',
      this.Name,
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    await room.drawCards(1, toIds[0], 'top', fromId, this.Name);

    return true;
  }
}

import { DamageCardEnum } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PlayerDiedStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'suiren', description: 'suiren_description' })
export class SuiRen extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>, stage?: AllStage): boolean {
    return stage === PlayerDiedStage.PlayerDied;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>): boolean {
    return (
      content.playerId === owner.Id &&
      owner
        .getCardIds(PlayerCardsArea.HandArea)
        .find(id => (Object.values(DamageCardEnum) as string[]).includes(Sanguosha.getCardById(id).GeneralName)) !==
        undefined
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a another player to give him all the damage cards in your hand?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    await room.moveCards({
      movingCards: room
        .getPlayerById(event.fromId)
        .getCardIds(PlayerCardsArea.HandArea)
        .filter(id => (Object.values(DamageCardEnum) as string[]).includes(Sanguosha.getCardById(id).GeneralName))
        .map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      fromId: event.fromId,
      toId: event.toIds[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: event.fromId,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}

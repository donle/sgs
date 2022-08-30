import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xing_yishi', description: 'xing_yishi_description' })
export class YiShi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamageEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return event.fromId === owner.Id && event.toId !== owner.Id;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to prevent the damage to {1} to prey a card from his/her equip area?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const damageEffect = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;

    damageEffect.damage -= 1;
    damageEffect.damage < 1 && EventPacker.terminate(damageEffect);

    const toId = damageEffect.toId;
    const to = room.getPlayerById(toId);
    if (to.getCardIds(PlayerCardsArea.EquipArea).length > 0) {
      const options = {
        [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      };

      const chooseCardEvent = {
        fromId,
        toId,
        options,
        triggeredBySkills: [this.Name],
      };

      const response = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, false, true);
      if (!response) {
        return false;
      }

      await room.moveCards({
        movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
        fromId: chooseCardEvent.toId,
        toId: chooseCardEvent.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: chooseCardEvent.fromId,
        movedByReason: this.Name,
      });
    }

    return true;
  }
}

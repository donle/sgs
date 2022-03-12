import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yangzhong', description: 'yangzhong_description' })
export class YangZhong extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect || stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      (stage === DamageEffectStage.AfterDamageEffect &&
        event.fromId === owner.Id &&
        !room.getPlayerById(event.toId).Dead) ||
      (stage === DamageEffectStage.AfterDamagedEffect &&
        event.toId === owner.Id &&
        event.fromId !== undefined &&
        !room.getPlayerById(event.fromId).Dead)
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const source = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId!;
    if (room.getPlayerById(source).getPlayerCards().length > 1) {
      const response = await room.askForCardDrop(
        source,
        2,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        false,
        undefined,
        this.Name,
        TranslationPack.translationJsonPatcher(
          '{0}: do you want to discard 2 cards to let {1} lose 1 hp?',
          this.Name,
          TranslationPack.patchPlayerInTranslation(
            room.getPlayerById((event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId),
          ),
        ).extract(),
      );

      if (response.droppedCards.length > 1) {
        event.cardIds = response.droppedCards;
        return true;
      }
    }

    return false;
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    event.animation = [{ from: damageEvent.fromId!, tos: [damageEvent.toId] }];

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.cardIds) {
      return false;
    }
    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;

    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, damageEvent.fromId, damageEvent.fromId, this.Name);

    await room.loseHp(damageEvent.toId, 1);

    return true;
  }
}

import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'tongji', description: 'tongji_description' })
export class TongJi extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return (
      stage === AimStage.OnAimmed &&
      event.byCardId !== undefined &&
      Sanguosha.getCardById(event.byCardId).GeneralName === 'slash'
    );
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    const to = room.getPlayerById(event.toId);

    return (
      event.toId !== owner.Id &&
      event.fromId !== owner.Id &&
      room.withinAttackDistance(to, owner) &&
      !AimGroupUtil.getAllTargets(event.allTargets).includes(owner.Id)
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    if (
      !room
        .getPlayerById(aimEvent.toId)
        .getPlayerCards()
        .find(id => room.canDropCard(aimEvent.toId, id))
    ) {
      return false;
    }

    const response = await room.askForCardDrop(
      aimEvent.toId,
      1,
      [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
      false,
      undefined,
      this.Name,
      TranslationPack.translationJsonPatcher(
        '{0}: do you want to discard 1 card to transfer the target of {1} to {2}',
        this.Name,
        TranslationPack.patchCardInTranslation(aimEvent.byCardId!),
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
      ).extract(),
    );

    if (response.droppedCards.length > 0) {
      event.cardIds = response.droppedCards;
      return true;
    }

    return false;
  }

  public async onTrigger(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} used skill {1}, transfer the target of {1} to {2}',
      this.Name,
      TranslationPack.patchCardInTranslation(aimEvent.byCardId!),
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
    ).extract();

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { triggeredOnEvent, cardIds, fromId } = event;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    await room.dropCards(CardMoveReason.SelfDrop, cardIds!, aimEvent.toId, aimEvent.toId, this.Name);

    AimGroupUtil.cancelTarget(aimEvent, aimEvent.toId);
    AimGroupUtil.addTargets(room, aimEvent, fromId);
    EventPacker.terminate(aimEvent);

    return true;
  }
}

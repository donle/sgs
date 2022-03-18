import { CardType, VirtualCard } from 'core/cards/card';
import { Slash } from 'core/cards/standard/slash';
import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qinguo', description: 'qinguo_description' })
export class QinGuo extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      room.CurrentPlayer === owner &&
      Sanguosha.getCardById(content.cardId).is(CardType.Equip)
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    return room.canAttack(room.getPlayerById(owner), room.getPlayerById(targetId));
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher('{0}: do you want to use a virtual slash?', this.Name).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    await room.useCard({
      fromId,
      targetGroup: [toIds],
      cardId: VirtualCard.create<Slash>({ cardName: 'slash', bySkill: this.Name }).Id,
      extraUse: true,
    });

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: QinGuo.Name, description: QinGuo.Description })
export class QinGuoRecover extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return (
      content.infos.find(
        info =>
          (info.toId === owner.Id && info.toArea === CardMoveArea.EquipArea) ||
          (info.fromId === owner.Id &&
            info.movingCards.find(card => card.fromArea === CardMoveArea.EquipArea) !== undefined),
      ) !== undefined &&
      owner.Hp === owner.getCardIds(PlayerCardsArea.EquipArea).length &&
      EventPacker.getMiddleware<number>(this.GeneralName, content) !== undefined &&
      EventPacker.getMiddleware<number>(this.GeneralName, content) !==
        owner.getCardIds(PlayerCardsArea.EquipArea).length
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.recover({
      toId: event.fromId,
      recoveredHp: 1,
      recoverBy: event.fromId,
    });

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: QinGuoRecover.Name, description: QinGuoRecover.Description })
export class QinGuoRecorder extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.BeforeCardMoving;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return (
      content.infos.find(
        info =>
          (info.toId === owner.Id && info.toArea === CardMoveArea.EquipArea) ||
          (info.fromId === owner.Id &&
            info.movingCards.find(card => card.fromArea === CardMoveArea.EquipArea) !== undefined),
      ) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const moveCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    EventPacker.addMiddleware(
      { tag: this.GeneralName, data: room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.EquipArea).length },
      moveCardEvent,
    );

    return true;
  }
}

import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, FilterSkill, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'shoufu', description: 'shoufu_description' })
export class ShouFu extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 0;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    await room.drawCards(1, fromId, 'top', fromId, this.Name);

    const handcards = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.HandArea);
    const targets = room
      .getOtherPlayers(fromId)
      .filter(player => player.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length === 0)
      .map(player => player.Id);
    if (handcards.length > 0 && targets.length > 0) {
      room.notify(
        GameEventIdentifiers.AskForSkillUseEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForSkillUseEvent>({
          invokeSkillNames: [ShouFuChoose.Name],
          toId: fromId,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose a hand card and choose a target who has no ‘Lu’?',
            this.Name,
          ).extract(),
          triggeredBySkills: [this.Name],
        }),
        fromId,
      );
      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, fromId);

      response.toIds = response.toIds || [targets[Math.floor(Math.random() * targets.length)]];
      response.cardIds = response.cardIds || [handcards[Math.floor(Math.random() * handcards.length)]];

      await room.moveCards({
        movingCards: [{ card: response.cardIds[0], fromArea: CardMoveArea.HandArea }],
        fromId,
        toId: response.toIds[0],
        toArea: PlayerCardsArea.OutsideArea,
        moveReason: CardMoveReason.ActiveMove,
        toOutsideArea: this.Name,
        isOutsideAreaInPublic: true,
        proposer: fromId,
        movedByReason: this.Name,
      });

      const target = room.getPlayerById(response.toIds[0]);
      target.hasShadowSkill(ShouFuRemove.Name) || (await room.obtainSkill(response.toIds[0], ShouFuRemove.Name));
      target.hasShadowSkill(ShouFuDebuff.Name) || (await room.obtainSkill(response.toIds[0], ShouFuDebuff.Name));
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: 'choose_shoufu', description: 'choose_shoufu_description' })
export class ShouFuChoose extends TriggerSkill {
  public isTriggerable(): boolean {
    return false;
  }

  public canUse(): boolean {
    return false;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return true;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    return (
      owner !== targetId &&
      room.getPlayerById(targetId).getCardIds(PlayerCardsArea.OutsideArea, ShouFu.Name).length === 0
    );
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(): Promise<boolean> {
    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 'remove_shoufu', description: 'remove_shoufu_description' })
export class ShouFuRemove extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect || stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return damageEvent.toId === owner.Id && owner.getCardIds(PlayerCardsArea.OutsideArea, ShouFu.Name).length > 0;
    } else if (identifier === GameEventIdentifiers.MoveCardEvent) {
      const moveCardEvent = event as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      const Lu = owner.getCardIds(PlayerCardsArea.OutsideArea, ShouFu.Name);
      return (
        room.CurrentPhasePlayer === owner &&
        Lu.length > 0 &&
        moveCardEvent.infos.find(
          info =>
            info.fromId === owner.Id &&
            info.moveReason === CardMoveReason.SelfDrop &&
            info.movingCards.filter(
              card =>
                Sanguosha.getCardById(card.card).is(Sanguosha.getCardById(Lu[0]).BaseType) &&
                (card.fromArea === CardMoveArea.HandArea || card.fromArea === CardMoveArea.EquipArea),
            ).length > 1,
        ) !== undefined
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);
    const Lu = from.getCardIds(PlayerCardsArea.OutsideArea, ShouFu.Name);
    if (Lu.length === 0) {
      return false;
    }

    await room.moveCards({
      movingCards: Lu.map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
      fromId,
      toArea: CardMoveArea.DropStack,
      moveReason: CardMoveReason.PlaceToDropStack,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });

    from.hasShadowSkill(this.Name) && (await room.loseSkill(fromId, this.Name));
    from.hasShadowSkill(ShouFuDebuff.Name) && (await room.loseSkill(fromId, ShouFuDebuff.Name));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 'debuff_shoufu', description: 'debuff_shoufu_description' })
export class ShouFuDebuff extends FilterSkill {
  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    const Lu = room.getPlayerById(owner).getCardIds(PlayerCardsArea.OutsideArea, ShouFu.Name);
    if (Lu.length === 0) {
      return true;
    }

    return cardId instanceof CardMatcher
      ? !cardId.match(new CardMatcher({ type: [Sanguosha.getCardById(Lu[0]).BaseType] }))
      : !Sanguosha.getCardById(cardId).is(Sanguosha.getCardById(Lu[0]).BaseType);
  }
}

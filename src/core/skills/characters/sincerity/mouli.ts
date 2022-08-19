import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Jink } from 'core/cards/standard/jink';
import { Slash } from 'core/cards/standard/slash';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { System } from 'core/shares/libs/system';
import { ActiveSkill, CommonSkill, OnDefineReleaseTiming, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { PersistentSkill, ShadowSkill, SideEffectSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'mouli', description: 'mouli_description' })
export class MouLi extends ActiveSkill implements OnDefineReleaseTiming {
  public static readonly MouLiLi = 'mouli:li';

  public async whenDead(room: Room, owner: Player) {
    owner.removeFlag(this.Name);
    for (const other of room.getOtherPlayers(owner.Id)) {
      const users = room.getFlag<PlayerId[]>(other.Id, MouLi.MouLiLi);
      if (users && users.includes(owner.Id)) {
        if (users.length === 1) {
          room.removeFlag(other.Id, MouLi.MouLiLi);
          if (room.getAlivePlayersFrom().find(player => player.getFlag<PlayerId[]>(MouLi.MouLiLi))) {
            room.installSideEffectSkill(System.SideEffectSkillApplierEnum.MouLi, MouLiSide.Name, owner.Id);
          } else {
            room.uninstallSideEffectSkill(System.SideEffectSkillApplierEnum.MouLi);
          }
        } else {
          const index = users.findIndex(user => user === owner.Id);
          index !== -1 && users.splice(index, 1);
          room.setFlag<PlayerId[]>(other.Id, MouLi.MouLiLi, users, MouLi.MouLiLi);
        }
      }
    }
  }

  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds, cardIds } = event;
    if (!toIds || !cardIds) {
      return false;
    }

    await room.moveCards({
      movingCards: [{ card: cardIds[0], fromArea: CardMoveArea.HandArea }],
      fromId,
      toId: toIds[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });

    const target = room.getPlayerById(toIds[0]);
    const originalUsers = target.getFlag<PlayerId[]>(MouLi.MouLiLi) || [];
    originalUsers.includes(fromId) || originalUsers.push(fromId);
    room.setFlag<PlayerId[]>(toIds[0], MouLi.MouLiLi, originalUsers, MouLi.MouLiLi);
    room.installSideEffectSkill(System.SideEffectSkillApplierEnum.MouLi, MouLiSide.Name, fromId);

    const from = room.getPlayerById(fromId);
    const originalTargets = from.getFlag<PlayerId[]>(this.Name) || [];
    originalTargets.includes(toIds[0]) || originalTargets.push(toIds[0]);
    from.setFlag<PlayerId[]>(this.Name, originalTargets);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: MouLi.Name, description: MouLi.Description })
export class MouLiShaodw extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return (
      room.CurrentPlayer.Id === owner &&
      room.CurrentPlayerPhase === PlayerPhase.PhaseBegin &&
      stage === PhaseChangeStage.AfterPhaseChanged
    );
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.CardUseFinishedEffect || stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const targets = owner.getFlag<PlayerId[]>(this.GeneralName);
      return (
        targets &&
        targets.includes(cardUseEvent.fromId) &&
        (Sanguosha.getCardById(cardUseEvent.cardId).GeneralName === 'slash' ||
          Sanguosha.getCardById(cardUseEvent.cardId).GeneralName === 'jink')
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.toPlayer === owner.Id &&
        phaseChangeEvent.to === PlayerPhase.PhaseBegin &&
        room
          .getOtherPlayers(owner.Id)
          .find(player => room.getFlag<PlayerId[]>(player.Id, MouLi.MouLiLi)?.includes(owner.Id)) !== undefined
      );
    }

    return false;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const user = (unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).fromId;
      const targets = room.getFlag<PlayerId[]>(fromId, this.GeneralName);
      const index = targets.findIndex(target => target === user);
      if (index !== -1) {
        await room.drawCards(3, fromId, 'top', fromId, this.GeneralName);
        if (targets.length === 1) {
          room.getPlayerById(fromId).removeFlag(this.GeneralName);
        } else {
          targets.splice(index, 1);
          room.getPlayerById(fromId).setFlag<PlayerId[]>(this.GeneralName, targets);
        }
      }
    } else {
      room.getPlayerById(fromId).removeFlag(this.GeneralName);
      for (const other of room.getOtherPlayers(fromId)) {
        const users = room.getFlag<PlayerId[]>(other.Id, MouLi.MouLiLi);
        if (users && users.includes(fromId)) {
          if (users.length === 1) {
            room.removeFlag(other.Id, MouLi.MouLiLi);
            if (room.getAlivePlayersFrom().find(player => player.getFlag<PlayerId[]>(MouLi.MouLiLi))) {
              room.installSideEffectSkill(System.SideEffectSkillApplierEnum.MouLi, MouLiSide.Name, fromId);
            } else {
              room.uninstallSideEffectSkill(System.SideEffectSkillApplierEnum.MouLi);
            }
          } else {
            const index = users.findIndex(user => user === fromId);
            index !== -1 && users.splice(index, 1);
            room.setFlag<PlayerId[]>(other.Id, MouLi.MouLiLi, users, MouLi.MouLiLi);
          }
        }
      }
    }

    return true;
  }
}

@SideEffectSkill
@CommonSkill({ name: 'side_mouli', description: 'side_mouli' })
export class MouLiSide extends ViewAsSkill {
  public canViewAs(room: Room, owner: Player, selectedCards?: CardId[]): string[] {
    if (!selectedCards) {
      return ['jink', 'slash'];
    } else {
      const card = Sanguosha.getCardById(selectedCards[0]);
      if (card.isRed()) {
        return ['jink'];
      } else if (card.isBlack()) {
        return ['slash'];
      }

      return [];
    }
  }

  public canUse(room: Room, owner: Player, event?: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>) {
    const identifier = event && EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
      return (
        CardMatcher.match(event!.cardMatcher, new CardMatcher({ generalName: ['slash'] })) ||
        CardMatcher.match(event!.cardMatcher, new CardMatcher({ name: ['jink'] }))
      );
    }

    return (
      owner.canUseCard(room, new CardMatcher({ name: ['slash'] })) &&
      identifier !== GameEventIdentifiers.AskForCardResponseEvent
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(
    room: Room,
    owner: Player,
    pendingCardId: CardId,
    selectedCards: CardId[],
    containerCard?: CardId,
    cardMatcher?: CardMatcher,
  ): boolean {
    if (cardMatcher) {
      let canUse = false;
      if (cardMatcher.Matcher.name?.includes('jink')) {
        canUse = Sanguosha.getCardById(pendingCardId).isRed();
      } else if (cardMatcher.Matcher.name?.includes('slash') || cardMatcher.Matcher.generalName?.includes('slash')) {
        canUse = Sanguosha.getCardById(pendingCardId).isBlack();
      }

      return canUse;
    } else {
      const card = Sanguosha.getCardById(pendingCardId);
      return card.isBlack() && owner.canUseCard(room, new CardMatcher({ generalName: ['slash'] }));
    }
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea];
  }

  public viewAs(selectedCards: CardId[]) {
    const card = Sanguosha.getCardById(selectedCards[0]);
    if (card.isRed()) {
      return VirtualCard.create<Jink>(
        {
          cardName: 'jink',
          bySkill: this.Name,
        },
        selectedCards,
      );
    } else {
      return VirtualCard.create<Slash>(
        {
          cardName: 'slash',
          bySkill: this.Name,
        },
        selectedCards,
      );
    }
  }
}

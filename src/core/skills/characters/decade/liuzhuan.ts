import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { FilterSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'liuzhuan', description: 'liuzhuan_description' })
export class LiuZhuan extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenLosingSkill(room: Room) {
    room.CurrentPlayer &&
      room.CurrentPlayer.getCardTag(this.Name) !== undefined &&
      room.removeCardTag(room.CurrentPlayer.Id, this.Name);
  }

  public async whenDead(room: Room) {
    room.CurrentPlayer &&
      room.CurrentPlayer.getCardTag(this.Name) !== undefined &&
      room.removeCardTag(room.CurrentPlayer.Id, this.Name);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return !!content.infos.find(
      info =>
        info.fromId !== owner.Id &&
        info.fromId !== undefined &&
        room.CurrentPlayer.Id === info.fromId &&
        info.toArea === CardMoveArea.DropStack &&
        (room.getCardTag(info.fromId, this.Name) || []).length > 0 &&
        info.movingCards.find(
          cardInfo =>
            !cardInfo.asideMove &&
            room.getCardTag(info.fromId!, this.Name)!.includes(cardInfo.card) &&
            (cardInfo.fromArea === CardMoveArea.HandArea || cardInfo.fromArea === CardMoveArea.EquipArea),
        ),
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const infos = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos;
    const toObtain: CardId[] = [];

    if (infos.length === 1) {
      toObtain.push(
        ...infos[0].movingCards
          .filter(
            cardInfo =>
              !cardInfo.asideMove &&
              room.getCardTag(infos[0].fromId!, this.Name)!.includes(cardInfo.card) &&
              (cardInfo.fromArea === CardMoveArea.HandArea || cardInfo.fromArea === CardMoveArea.EquipArea) &&
              room.isCardInDropStack(cardInfo.card),
          )
          .map(cardInfo => cardInfo.card),
      );
    } else {
      for (const info of infos) {
        if (
          info.fromId !== event.fromId &&
          info.fromId !== undefined &&
          room.CurrentPlayer.Id === info.fromId &&
          info.toArea === CardMoveArea.DropStack &&
          (room.getCardTag(info.fromId, this.Name) || []).length > 0 &&
          info.movingCards.find(
            cardInfo =>
              !cardInfo.asideMove &&
              room.getCardTag(info.fromId!, this.Name)!.includes(cardInfo.card) &&
              (cardInfo.fromArea === CardMoveArea.HandArea || cardInfo.fromArea === CardMoveArea.EquipArea),
          )
        ) {
          toObtain.push(
            ...info.movingCards
              .filter(
                cardInfo =>
                  !cardInfo.asideMove &&
                  room.getCardTag(infos[0].fromId!, this.Name)!.includes(cardInfo.card) &&
                  (cardInfo.fromArea === CardMoveArea.HandArea || cardInfo.fromArea === CardMoveArea.EquipArea) &&
                  room.isCardInDropStack(cardInfo.card),
              )
              .map(cardInfo => cardInfo.card),
          );
        }
      }
    }

    toObtain.length > 0 &&
      (await room.moveCards({
        movingCards: toObtain.map(card => ({ card, fromArea: CardMoveArea.DropStack })),
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      }));

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: LiuZhuan.Name, description: LiuZhuan.Description })
export class LiuZhuanShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return !!content.infos.find(
      info =>
        info.toId !== owner.Id &&
        info.toId !== undefined &&
        room.CurrentPlayer.Id === info.toId &&
        info.toArea === CardMoveArea.HandArea &&
        room.CurrentPlayerPhase !== PlayerPhase.DrawCardStage &&
        info.movingCards.find(cardInfo => !room.getCardTag(info.toId!, this.GeneralName)?.includes(cardInfo.card)),
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    for (const info of (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos) {
      if (
        info.toId !== event.fromId &&
        room.CurrentPlayer.Id === info.toId &&
        info.toArea === CardMoveArea.HandArea &&
        room.CurrentPlayerPhase !== PlayerPhase.DrawCardStage
      ) {
        const cardIdsRecorded = room.getCardTag(info.toId, this.GeneralName) || [];

        const singletonCardIds = Algorithm.singleton([
          ...cardIdsRecorded,
          ...info.movingCards.filter(cardInfo => !cardInfo.asideMove).map(cardInfo => cardInfo.card),
        ]);
        singletonCardIds > cardIdsRecorded && room.setCardTag(info.toId, this.GeneralName, singletonCardIds);
      }
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: LiuZhuanShadow.Name, description: LiuZhuanShadow.Description })
export class LiuZhuanProhibited extends FilterSkill {
  public canBeUsedCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId, attacker?: PlayerId): boolean {
    return !(
      !(cardId instanceof CardMatcher) &&
      attacker &&
      room.getCardTag(attacker, this.GeneralName)?.includes(cardId)
    );
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: LiuZhuanProhibited.Name, description: LiuZhuanProhibited.Description })
export class LiuZhuanRemove extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      event.from === PlayerPhase.PhaseFinish &&
      event.fromPlayer !== undefined &&
      room.getCardTag(event.fromPlayer, this.GeneralName) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeCardTag(
      (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).fromPlayer!,
      this.GeneralName,
    );

    return true;
  }
}

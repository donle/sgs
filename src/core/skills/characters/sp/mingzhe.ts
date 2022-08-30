import { VirtualCard } from 'core/cards/card';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage, CardResponseStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'mingzhe', description: 'mingzhe_description' })
export class MingZhe extends TriggerSkill {
  public get RelatedCharacters(): string[] {
    return ['wangyuanji'];
  }

  public audioIndex(characterName?: string): number {
    return characterName && this.RelatedCharacters.includes(characterName) ? 1 : 2;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return (
      stage === CardUseStage.CardUsing ||
      stage === CardResponseStage.CardResponsing ||
      stage === CardMoveStage.AfterCardMoved
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent | GameEventIdentifiers.MoveCardEvent
    >,
  ): boolean {
    if (room.CurrentPlayer === owner) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.CardUseEvent || identifier === GameEventIdentifiers.CardResponseEvent) {
      const cardUseOrResponseEvent = event as ServerEventFinder<
        GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
      >;
      return cardUseOrResponseEvent.fromId === owner.Id && Sanguosha.getCardById(cardUseOrResponseEvent.cardId).isRed();
    } else if (identifier === GameEventIdentifiers.MoveCardEvent) {
      return !!(event as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos.find(
        info =>
          info.fromId === owner.Id &&
          [CardMoveReason.SelfDrop, CardMoveReason.PassiveDrop].includes(info.moveReason) &&
          info.movingCards.find(
            cardInfo =>
              (cardInfo.fromArea === CardMoveArea.HandArea || cardInfo.fromArea === CardMoveArea.EquipArea) &&
              !cardInfo.asideMove &&
              VirtualCard.getActualCards([cardInfo.card]).find(cardId => Sanguosha.getCardById(cardId).isRed()),
          ),
      );
    }

    return false;
  }

  public triggerableTimes(
    event: ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent | GameEventIdentifiers.MoveCardEvent
    >,
    owner: Player,
  ): number {
    if (EventPacker.getIdentifier(event) !== GameEventIdentifiers.MoveCardEvent) {
      return 0;
    }

    return (event as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos.reduce<number>((sum, info) => {
      if (info.fromId === owner.Id && [CardMoveReason.SelfDrop, CardMoveReason.PassiveDrop].includes(info.moveReason)) {
        for (const cardInfo of info.movingCards) {
          if (
            (cardInfo.fromArea !== CardMoveArea.HandArea && cardInfo.fromArea !== CardMoveArea.EquipArea) ||
            cardInfo.asideMove
          ) {
            continue;
          }

          sum += VirtualCard.getActualCards([cardInfo.card]).length;
        }
      }

      return sum;
    }, 0);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}

import { VirtualCard } from 'core/cards/card';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardResponseStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'chongzhen', description: 'chongzhen_description' })
export class ChongZhen extends TriggerSkill {
  private static readonly LongDanName = ['std_longdan', 'longdan'];

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.CardUsing || stage === CardResponseStage.CardResponsing;
  }

  private findChongZhenTarget(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): PlayerId | undefined {
    const card = Sanguosha.getCardById(content.cardId);

    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      if (card.GeneralName === 'slash') {
        const targets = TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup);
        targets.filter(player => player !== owner.Id);
        if (targets.length > 0) {
          room.sortPlayersByPosition(targets);
          return targets[0];
        }
      } else {
        if (
          !cardUseEvent.responseToEvent ||
          EventPacker.getIdentifier(cardUseEvent.responseToEvent) !== GameEventIdentifiers.CardEffectEvent
        ) {
          return undefined;
        }

        const cardEffectEvent = cardUseEvent.responseToEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
        return cardEffectEvent.fromId;
      }
    } else if (identifier === GameEventIdentifiers.CardResponseEvent) {
      const cardResponseEvent = content as ServerEventFinder<GameEventIdentifiers.CardResponseEvent>;
      if (
        !cardResponseEvent.responseToEvent ||
        EventPacker.getIdentifier(cardResponseEvent.responseToEvent) !== GameEventIdentifiers.CardEffectEvent
      ) {
        return undefined;
      }

      const cardEffectEvent =
        cardResponseEvent.responseToEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      if (!cardEffectEvent.fromId) {
        return undefined;
      }
      if (Sanguosha.getCardById(cardEffectEvent.cardId).GeneralName === 'duel') {
        if (cardEffectEvent.fromId === owner.Id) {
          const opponents = cardEffectEvent.toIds;
          if (opponents && opponents.length > 0) {
            return opponents[0];
          }
        } else {
          return cardEffectEvent.fromId;
        }
      } else {
        return cardEffectEvent.fromId;
      }
    }
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    const card = Sanguosha.getCardById(content.cardId);
    if (
      content.fromId !== owner.Id ||
      !card.isVirtualCard() ||
      (card.GeneralName !== 'slash' && card.GeneralName !== 'jink')
    ) {
      return false;
    }

    const virtualCard = card as VirtualCard;
    if (ChongZhen.LongDanName.find(name => virtualCard.findByGeneratedSkill(name)) === undefined) {
      return false;
    }

    const target = this.findChongZhenTarget(room, owner, content);
    return target !== undefined && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): PatchedTranslationObject {
    const target = this.findChongZhenTarget(room, owner, event);
    return target
      ? TranslationPack.translationJsonPatcher(
          '{0}: do you want to prey {1} a hand card?',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(target)),
        ).extract()
      : TranslationPack.translationJsonPatcher('do you want to trigger skill {0} ?', this.Name).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const from = room.getPlayerById(fromId);
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >;

    const targetId = this.findChongZhenTarget(room, from, unknownEvent);
    if (targetId && targetId !== fromId) {
      const target = room.getPlayerById(targetId);
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        {
          fromId,
          toId: targetId,
          options: {
            [PlayerCardsArea.HandArea]: target.getCardIds(PlayerCardsArea.HandArea).length,
          },
          triggeredBySkills: [this.Name],
        },
        fromId,
      );

      if (response.selectedCardIndex !== undefined) {
        const cardIds = target.getCardIds(PlayerCardsArea.HandArea);
        response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
      }

      if (response.selectedCard !== undefined) {
        await room.moveCards({
          movingCards: [{ card: response.selectedCard, fromArea: response.fromArea }],
          fromId: targetId,
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: fromId,
          movedByReason: this.Name,
        });
      }
    }

    return true;
  }
}

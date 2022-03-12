import { CardId } from 'core/cards/libs/card_props';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { AllStage, DrawCardStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'lilu', description: 'lilu_description' })
export class LiLu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage): boolean {
    return stage === DrawCardStage.BeforeDrawCardEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>): boolean {
    return (
      owner.Id === content.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      content.bySpecialReason === CardDrawReason.GameStage &&
      content.drawAmount > 0
    );
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    const n = Math.min(owner.MaxHp, 5) - owner.getCardIds(PlayerCardsArea.HandArea).length;
    return n > 0
      ? TranslationPack.translationJsonPatcher(
          '{0}: do you want to draw {1} card(s) instead of drawing cards by rule?',
          this.Name,
          n,
        ).extract()
      : TranslationPack.translationJsonPatcher(
          '{0}: do you want to give up to draw cards by rule?',
          this.Name,
        ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const drawCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
    drawCardEvent.drawAmount = 0;

    const from = room.getPlayerById(fromId);
    const n = Math.min(from.MaxHp, 5) - from.getCardIds(PlayerCardsArea.HandArea).length;
    if (n > 0) {
      await room.drawCards(n, fromId, 'top', fromId, this.Name);
    }

    const hands = from.getCardIds(PlayerCardsArea.HandArea);
    if (hands.length > 0) {
      const skillUseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForSkillUseEvent>({
        invokeSkillNames: [LiLuSelect.Name],
        toId: fromId,
        conversation: 'lilu: please give a handcard to another player',
      });
      room.notify(GameEventIdentifiers.AskForSkillUseEvent, skillUseEvent, fromId);
      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, fromId);

      const others = room.getOtherPlayers(fromId);
      const cardIds = response.cardIds || [hands[Math.floor(Math.random() * hands.length)]];
      const toIds = response.toIds || [others[Math.floor(Math.random() * others.length)].Id];
      await room.moveCards({
        movingCards: cardIds.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
        fromId,
        toId: toIds[0],
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: fromId,
      });

      const liluCount = from.getFlag<number>(this.Name);
      if (liluCount !== undefined && cardIds.length > liluCount) {
        await room.changeMaxHp(fromId, 1);
        await room.recover({
          toId: fromId,
          recoveredHp: 1,
          recoverBy: fromId,
        });
      }
      room.setFlag<number>(
        fromId,
        this.Name,
        cardIds.length,
        TranslationPack.translationJsonPatcher('lilu count: {0}', cardIds.length).toString(),
      );
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: 'shadow_lilu', description: 'shadow_lilu_description' })
export class LiLuSelect extends TriggerSkill {
  public isTriggerable(): boolean {
    return false;
  }

  public canUse(): boolean {
    return false;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public isAvailableCard(): boolean {
    return true;
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

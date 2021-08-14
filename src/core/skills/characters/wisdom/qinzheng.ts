import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardResponseStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CompulsorySkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'qinzheng', description: 'qinzheng_description' })
export class QinZheng extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenObtainingSkill(room: Room, owner: Player) {
    const cardUsedNum = room.Analytics.getRecordEvents<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >(
      event =>
        (EventPacker.getIdentifier(event) === GameEventIdentifiers.CardUseEvent ||
          EventPacker.getIdentifier(event) === GameEventIdentifiers.CardResponseEvent) &&
        event.fromId === owner.Id,
      owner.Id,
    ).length;

    room.setFlag<number>(
      owner.Id,
      this.Name,
      cardUsedNum,
      TranslationPack.translationJsonPatcher('qinzheng times: {0}', cardUsedNum).toString(),
    );
  }

  public async whenLosingSkill(room: Room, owner: Player) {
    if (owner.getFlag<number>(this.Name) !== undefined) {
      room.removeFlag(owner.Id, this.Name);
    }
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.CardUsing || stage === CardResponseStage.CardResponsing;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    const cardUsedNum = owner.getFlag<number>(this.Name) || 0;
    const factors = [3, 5, 8];
    return owner.Id === content.fromId && factors.find(factor => cardUsedNum % factor === 0) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  private async gainQinZhengCard(room: Room, owner: PlayerId, patterns: string[]) {
    const toGain: CardId[] = [];
    for (const card of patterns) {
      const cards = room.findCardsByMatcherFrom(new CardMatcher({ generalName: [card] }));
      if (cards.length > 0) {
        toGain.push(cards[Math.floor(Math.random() * cards.length)]);
      }
    }
    if (toGain.length > 0) {
      await room.moveCards({
        movingCards: [{ card: toGain[Math.floor(Math.random() * toGain.length)], fromArea: CardMoveArea.DrawStack }],
        toId: owner,
        moveReason: CardMoveReason.ActiveMove,
        toArea: CardMoveArea.HandArea,
        proposer: owner,
      });
    }
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const cardUsedNum = room.getFlag<number>(fromId, this.Name);

    if (cardUsedNum % 3 === 0) {
      await this.gainQinZhengCard(room, fromId, ['slash', 'jink']);
    }
    if (cardUsedNum % 5 === 0) {
      await this.gainQinZhengCard(room, fromId, ['peach', 'alcohol']);
    }
    if (cardUsedNum % 8 === 0) {
      await this.gainQinZhengCard(room, fromId, ['wuzhongshengyou', 'duel']);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: QinZheng.Name, description: QinZheng.Description })
export class QinZhengShadow extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.BeforeCardUseEffect || stage === CardResponseStage.PreCardResponse;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    return owner.Id === content.fromId;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const cardUsedNum = room.getFlag<number>(fromId, this.GeneralName) || 0;
    room.setFlag<number>(
      fromId,
      this.GeneralName,
      cardUsedNum + 1,
      TranslationPack.translationJsonPatcher('qinzheng times: {0}', cardUsedNum + 1).toString(),
    );

    return true;
  }
}

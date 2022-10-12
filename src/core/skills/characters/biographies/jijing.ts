import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jijing', description: 'jijing_description' })
export class JiJing extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return content.toId === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const judge = await room.judge(fromId, undefined, this.Name);
    const cardNumber = Sanguosha.getCardById(judge.judgeCardId).CardNumber;

    const skillUseEvent = {
      invokeSkillNames: [JiJingSelect.Name],
      toId: fromId,
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: do you want to drop cards with sum of {1} Card Number to recover 1 hp?',
        this.Name,
        cardNumber,
      ).extract(),
    };
    room.setFlag<number>(fromId, this.Name, cardNumber);

    room.notify(GameEventIdentifiers.AskForSkillUseEvent, skillUseEvent, fromId);
    const { cardIds } = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, fromId);

    if (cardIds) {
      await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);
      await room.recover({
        toId: fromId,
        recoveredHp: 1,
        recoverBy: fromId,
      });
    }

    room.removeFlag(fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: 'shadow_jijing', description: 'shadow_jijing_description' })
export class JiJingSelect extends TriggerSkill {
  public get Muted() {
    return true;
  }

  public isTriggerable(): boolean {
    return false;
  }

  public canUse(): boolean {
    return false;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return (
      cards.length > 0 &&
      cards.reduce<number>((sum, id) => (sum += Sanguosha.getCardById(id).CardNumber), 0) ===
        room.getFlag<number>(owner.Id, JiJing.Name)
    );
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId, selectedCards: CardId[]): boolean {
    const cardNumber = room.getFlag<number>(owner, JiJing.Name);
    if (!room.canDropCard(owner, cardId)) {
      return false;
    }

    if (selectedCards.length > 0) {
      return (
        Sanguosha.getCardById(cardId).CardNumber <=
        cardNumber - selectedCards.reduce<number>((sum, id) => (sum += Sanguosha.getCardById(id).CardNumber), 0)
      );
    }

    return Sanguosha.getCardById(cardId).CardNumber <= cardNumber;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(): Promise<boolean> {
    return true;
  }
}

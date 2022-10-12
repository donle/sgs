import { CardType } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'qingjiao', description: 'qingjiao_description' })
export class QingJiao extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.PlayCardStageStart;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.getPlayerById(event.fromId).setFlag<boolean>(this.Name, true);
    await room.dropCards(
      CardMoveReason.SelfDrop,
      room.getPlayerById(event.fromId).getPlayerCards(),
      event.fromId,
      event.fromId,
      this.Name,
    );

    const dic: { [cardName: string]: CardId[] } = {};
    for (const cardId of [
      ...room.findCardsByMatcherFrom(new CardMatcher({ type: [CardType.Basic, CardType.Trick, CardType.Equip] })),
      ...room.findCardsByMatcherFrom(
        new CardMatcher({ type: [CardType.Basic, CardType.Trick, CardType.Equip] }),
        false,
      ),
    ]) {
      const card = Sanguosha.getCardById(cardId);
      const index = card.is(CardType.Equip)
        ? Functional.getCardTypeRawText((card as EquipCard).EquipType)
        : card.GeneralName;
      if (dic[index] === undefined) {
        dic[index] = [];
      } else {
        dic[index].push(cardId);
      }
    }

    const toGain: CardId[] = [];
    while (toGain.length < 8) {
      let sum = 0;
      for (const [, cardIds] of Object.entries(dic)) {
        sum += cardIds.length;
      }

      const randomValue = Math.floor(Math.random() * sum + 1);
      let currentSum = 0;
      let currentCardName = 'slash';
      for (const [cardName, cardIds] of Object.entries(dic)) {
        currentSum += cardIds.length;
        if (randomValue <= currentSum) {
          currentCardName = cardName;
          toGain.push(cardIds[cardIds.length - (currentSum - randomValue) - 1]);
          break;
        }
      }

      delete dic[currentCardName];
    }

    await room.moveCards({
      movingCards: toGain.map(card => ({
        card,
        fromArea: room.isCardInDropStack(card) ? CardMoveArea.DropStack : CardMoveArea.DrawStack,
      })),
      toId: event.fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: QingJiao.Name, description: QingJiao.Description })
export class QingJiaoShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room, owner: PlayerId): boolean {
    return !room.getFlag<boolean>(owner, this.GeneralName);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      owner.getPlayerCards().length > 0 &&
      owner.getFlag<boolean>(this.GeneralName) === true
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.getPlayerById(event.fromId).removeFlag(this.GeneralName);
    await room.dropCards(
      CardMoveReason.SelfDrop,
      room.getPlayerById(event.fromId).getPlayerCards(),
      event.fromId,
      event.fromId,
      this.Name,
    );

    return true;
  }
}

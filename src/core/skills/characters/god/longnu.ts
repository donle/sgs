import { Card, CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardColor, CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import {
  AllStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  CompulsorySkill,
  OnDefineReleaseTiming,
  PersistentSkill,
  RulesBreakerSkill,
  ShadowSkill,
  SwitchSkill,
  SwitchSkillState,
  TransformSkill,
  TriggerSkill,
} from 'core/skills/skill';

@SwitchSkill()
@CompulsorySkill({ name: 'longnu', description: 'longnu_description' })
export class LongNu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id === content.playerId && PlayerPhaseStages.PlayCardStageStart === content.toStage;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);
    const switchSkillState = from.getSwitchSkillState(this.Name);
    const judge = switchSkillState === SwitchSkillState.Yang;

    if (judge) {
      await room.loseHp(fromId, 1);
    } else {
      await room.changeMaxHp(fromId, -1);
    }

    if (!from.Dead) {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
      await room.obtainSkill(fromId, judge ? FireLongNu.Name : ThunderLongNu.Name);
      room.setFlag<SwitchSkillState>(fromId, this.Name, switchSkillState);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: 'fire_longnu', description: 'fire_longnu_description' })
export class FireLongNu extends TransformSkill implements OnDefineReleaseTiming {
  async whenObtainingSkill(room: Room, owner: Player) {
    const cards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (this.canTransform(owner, cardId, PlayerCardsArea.HandArea)) {
        return this.forceToTransformCardTo(cardId).Id;
      }

      return cardId;
    });

    room.broadcast(GameEventIdentifiers.PlayerPropertiesChangeEvent, {
      changedProperties: [
        {
          toId: owner.Id,
          handCards: cards,
        },
      ],
    });
  }

  async whenLosingSkill(room: Room, owner: Player) {
    const cards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (!Card.isVirtualCardId(cardId)) {
        return cardId;
      }

      const card = Sanguosha.getCardById<VirtualCard>(cardId);
      if (!card.findByGeneratedSkill(this.Name)) {
        return cardId;
      }

      return card.ActualCardIds[0];
    });

    owner.setupCards(PlayerCardsArea.HandArea, cards);
  }

  public canTransform(owner: Player, cardId: CardId, area: PlayerCardsArea.HandArea): boolean {
    const card = Sanguosha.getCardById(cardId);
    return card.Color === CardColor.Red && area === PlayerCardsArea.HandArea;
  }

  public forceToTransformCardTo(cardId: CardId): VirtualCard {
    return VirtualCard.create(
      {
        cardName: 'fire_slash',
        bySkill: this.Name,
      },
      [cardId],
    );
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: 'thunder_longnu', description: 'thunder_longnu_description' })
export class ThunderLongNu extends TransformSkill implements OnDefineReleaseTiming {
  async whenObtainingSkill(room: Room, owner: Player) {
    const cards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (this.canTransform(owner, cardId, PlayerCardsArea.HandArea)) {
        return this.forceToTransformCardTo(cardId).Id;
      }

      return cardId;
    });

    room.broadcast(GameEventIdentifiers.PlayerPropertiesChangeEvent, {
      changedProperties: [
        {
          toId: owner.Id,
          handCards: cards,
        },
      ],
    });
  }

  async whenLosingSkill(room: Room, owner: Player) {
    const cards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (!Card.isVirtualCardId(cardId)) {
        return cardId;
      }

      const card = Sanguosha.getCardById<VirtualCard>(cardId);
      if (!card.findByGeneratedSkill(this.Name)) {
        return cardId;
      }

      return card.ActualCardIds[0];
    });

    owner.setupCards(PlayerCardsArea.HandArea, cards);
  }

  public canTransform(owner: Player, cardId: CardId, area: PlayerCardsArea.HandArea): boolean {
    const card = Sanguosha.getCardById(cardId);
    return card.is(CardType.Trick) && area === PlayerCardsArea.HandArea;
  }

  public forceToTransformCardTo(cardId: CardId): VirtualCard {
    return VirtualCard.create(
      {
        cardName: 'thunder_slash',
        bySkill: this.Name,
      },
      [cardId],
    );
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: LongNu.Name, description: LongNu.Description })
export class LongNuShaodw extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    let match = false;
    const switchSkillState = owner.getFlag<SwitchSkillState>(this.GeneralName);
    if (switchSkillState !== SwitchSkillState.Yang) {
      return 0;
    }

    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ name: ['fire_slash'] }));
    } else {
      const card = Sanguosha.getCardById(cardId);
      match = card.Name === 'fire_slash';
    }

    return match ? INFINITE_TRIGGERING_TIMES : 0;
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    let match = false;
    const switchSkillState = owner.getFlag<SwitchSkillState>(this.GeneralName);
    if (switchSkillState !== SwitchSkillState.Yin) {
      return 0;
    }

    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ name: ['thunder_slash'] }));
    } else {
      const card = Sanguosha.getCardById(cardId);
      match = card.Name === 'thunder_slash';
    }

    return match ? INFINITE_TRIGGERING_TIMES : 0;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: LongNuShaodw.Name, description: LongNuShaodw.Description })
export class LongNuClear extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PlayCardStage &&
      owner.getFlag<SwitchSkillState>(this.GeneralName) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    room.removeFlag(fromId, this.GeneralName);

    const from = room.getPlayerById(event.fromId);
    if (from.hasShadowSkill(FireLongNu.Name)) {
      await room.loseSkill(fromId, FireLongNu.Name);
    }
    if (from.hasShadowSkill(ThunderLongNu.Name)) {
      await room.loseSkill(fromId, ThunderLongNu.Name);
    }

    return true;
  }
}

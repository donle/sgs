import { CardColor } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  CardUseStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'sunyi_jiqiao', description: 'sunyi_jiqiao_description' })
export class SunYiJiQiao extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.PlayCardStageStart && owner.MaxHp > 0;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.moveCards({
      movingCards: room
        .getCards(room.getPlayerById(event.fromId).MaxHp, 'top')
        .map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
      toId: event.fromId,
      toArea: CardMoveArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: event.fromId,
      toOutsideArea: this.Name,
      isOutsideAreaInPublic: true,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: SunYiJiQiao.Name, description: SunYiJiQiao.Description })
export class SunYiJiQiaoShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      return (
        (content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).fromId === owner.Id &&
        owner.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length > 0
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      return (
        (content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).from === PlayerPhase.PlayCardStage &&
        owner.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length > 0
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.CardUseEvent) {
      const jiqiao = room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName);
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardWithConditionsEvent>(
        GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
        {
          toId: event.fromId,
          customCardFields: {
            [Functional.getCardColorRawText(CardColor.Black)]: jiqiao.filter(cardId =>
              Sanguosha.getCardById(cardId).isBlack(),
            ),
            [Functional.getCardColorRawText(CardColor.Red)]: jiqiao.filter(cardId =>
              Sanguosha.getCardById(cardId).isRed(),
            ),
          },
          customTitle: this.GeneralName,
          amount: 1,
          triggeredBySkills: [this.GeneralName],
        },
        event.fromId,
        true,
      );

      response.selectedCards = response.selectedCards || [jiqiao[Math.floor(Math.random() * jiqiao.length)]];

      await room.moveCards({
        movingCards: [{ card: response.selectedCards[0], fromArea: CardMoveArea.OutsideArea }],
        fromId: event.fromId,
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.GeneralName],
      });

      if (
        jiqiao.filter(cardId => Sanguosha.getCardById(cardId).isBlack()).length ===
        jiqiao.filter(cardId => Sanguosha.getCardById(cardId).isRed()).length
      ) {
        await room.recover({
          toId: event.fromId,
          recoveredHp: 1,
          recoverBy: event.fromId,
        });
      } else {
        await room.loseHp(event.fromId, 1);
      }
    } else {
      await room.moveCards({
        movingCards: room
          .getPlayerById(event.fromId)
          .getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName)
          .map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
        fromId: event.fromId,
        toArea: CardMoveArea.DropStack,
        moveReason: CardMoveReason.PlaceToDropStack,
        proposer: event.fromId,
        triggeredBySkills: [this.GeneralName],
      });
    }

    return true;
  }
}

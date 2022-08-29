import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
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
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { ActiveSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yijiao', description: 'yijiao_description' })
export class YiJiao extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).getMark(MarkEnum.Yi) === 0;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.toIds) {
      return false;
    }

    const options = ['1', '2', '3', '4'];
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose yijiao options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toIds[0])),
        ).extract(),
        toId: event.fromId,
        triggeredBySkills: [this.Name],
      },
      event.fromId,
      true,
    );

    response.selectedOption = response.selectedOption || options[0];
    room.addMark(event.toIds[0], MarkEnum.Yi, parseInt(response.selectedOption, 10) * 10);
    room.getPlayerById(event.toIds[0]).setFlag<PlayerId>(this.Name, event.fromId);
    room.getPlayerById(event.toIds[0]).hasShadowSkill(YiJiaoHandler.Name) ||
      (await room.obtainSkill(event.toIds[0], YiJiaoHandler.Name));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_yijiao_handler', description: 's_yijiao_handler_description' })
export class YiJiaoHandler extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, player: Player) {
    player.removeFlag(YiJiao.Name);
    player.getFlag<number>(this.Name) !== undefined && room.removeFlag(player.Id, this.Name);
    await room.loseSkill(player.Id, this.Name);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.BeforeCardUseEffect || stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return (
      stage === CardUseStage.BeforeCardUseEffect ||
      stage === PhaseStageChangeStage.StageChanged ||
      stage === PhaseChangeStage.PhaseChanged
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<
      | GameEventIdentifiers.CardUseEvent
      | GameEventIdentifiers.PhaseStageChangeEvent
      | GameEventIdentifiers.PhaseChangeEvent
    >,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        room.CurrentPlayer === owner &&
        cardUseEvent.fromId === owner.Id &&
        Sanguosha.getCardById(cardUseEvent.cardId).CardNumber > 0
      );
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart &&
        owner.getMark(MarkEnum.Yi) > 0
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.from === PlayerPhase.FinishStage && phaseChangeEvent.fromPlayer === owner.Id;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      | GameEventIdentifiers.CardUseEvent
      | GameEventIdentifiers.PhaseStageChangeEvent
      | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardNumber = Sanguosha.getCardById(
        (unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId,
      ).CardNumber;
      let count = room.getFlag<number>(event.fromId, this.Name) || 0;
      count += cardNumber;
      room.setFlag(
        event.fromId,
        this.Name,
        count,
        TranslationPack.translationJsonPatcher('yijiao: {0}', count).toString(),
      );
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const count = room.getFlag<number>(event.fromId, this.Name) || 0;
      if (room.getMark(event.fromId, MarkEnum.Yi) > count) {
        const handCards = room
          .getPlayerById(event.fromId)
          .getCardIds(PlayerCardsArea.HandArea)
          .filter(cardId => room.canDropCard(event.fromId, cardId));
        handCards.length > 0 &&
          (await room.dropCards(
            CardMoveReason.SelfDrop,
            [handCards[Math.floor(Math.random() * handCards.length)]],
            event.fromId,
            event.fromId,
            YiJiao.Name,
          ));
      } else if (room.getMark(event.fromId, MarkEnum.Yi) === count) {
        room.insertPlayerRound(event.fromId);
      } else {
        const skillSource = room.getFlag<PlayerId>(event.fromId, YiJiao.Name);
        skillSource && (await room.drawCards(2, skillSource, 'top', skillSource, YiJiao.Name));
      }
    } else {
      const from = room.getPlayerById(event.fromId);
      from.removeFlag(YiJiao.Name);
      from.getFlag<number>(this.Name) !== undefined && room.removeFlag(event.fromId, this.Name);
      room.removeMark(event.fromId, MarkEnum.Yi);
      await room.loseSkill(event.fromId, this.Name);
    }

    return true;
  }
}

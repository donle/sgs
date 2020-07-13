import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE } from 'core/game/game_props';
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
  CommonSkill,
  CompulsorySkill,
  FilterSkill,
  OnDefineReleaseTiming,
  RulesBreakerSkill,
  ShadowSkill,
  TriggerSkill,
} from 'core/skills/skill';

@CommonSkill({ name: 'jiangchi', description: 'jiangchi_description' })
export class JiangChi extends TriggerSkill {
  public static readonly ExtraFlag = 'jiangchi_extra';
  public static readonly BlockFlag = 'jiangchi_block';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id === content.playerId && PlayerPhaseStages.DrawCardStageEnd === content.toStage;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const options = ['jiangchi:draw', 'jiangchi:drop'];
    if (room.getPlayerById(skillUseEvent.fromId).getPlayerCards().length === 0) {
      options.pop();
    }

    const askForChooseOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      toId: skillUseEvent.fromId,
      conversation: 'please choose jiangchi options',
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChooseOptionsEvent),
      skillUseEvent.fromId,
    );

    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      skillUseEvent.fromId,
    );

    if (selectedOption === 'jiangchi:draw') {
      await room.drawCards(1, skillUseEvent.fromId, 'top', undefined, this.Name);
      room.setFlag<string>(skillUseEvent.fromId, this.Name, JiangChi.BlockFlag);
    } else {
      const response = await room.askForCardDrop(
        skillUseEvent.fromId,
        1,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        undefined,
        this.Name,
      );

      await room.dropCards(
        CardMoveReason.SelfDrop,
        response.droppedCards,
        skillUseEvent.fromId,
        skillUseEvent.fromId,
        this.Name,
      );

      room.setFlag<string>(skillUseEvent.fromId, this.Name, JiangChi.ExtraFlag);
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: JiangChi.Name, description: JiangChi.Description })
export class JiangChiRemove extends TriggerSkill implements OnDefineReleaseTiming {
  public onLosingSkill(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.FinishStage;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    stage: PhaseChangeStage,
  ): boolean {
    return stage === PhaseChangeStage.AfterPhaseChanged && event.from === PlayerPhase.FinishStage;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return content.fromPlayer === owner.Id && room.getFlag<string>(owner.Id, this.GeneralName) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    room.removeFlag(skillUseEvent.fromId, this.GeneralName);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: JiangChiRemove.Name, description: JiangChiRemove.Description })
export class JiangChiExtra extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public onLosingSkill(room: Room, playerId: PlayerId): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.FinishStage;
  }

  public breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (room.getFlag<string>(owner.Id, this.GeneralName) !== JiangChi.ExtraFlag) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ name: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (room.getFlag<string>(owner.Id, this.GeneralName) !== JiangChi.ExtraFlag) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ name: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return 1;
    } else {
      return 0;
    }
  }
}

@ShadowSkill
@CompulsorySkill({ name: JiangChiExtra.Name, description: JiangChiExtra.Description })
export class JiangChiBlock extends FilterSkill implements OnDefineReleaseTiming {
  public onLosingSkill(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.FinishStage;
  }

  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    if (room.getFlag<string>(owner, this.GeneralName) !== JiangChi.BlockFlag) {
      return true;
    }

    return cardId instanceof CardMatcher
      ? !cardId.match(new CardMatcher({ name: ['slash'] }))
      : Sanguosha.getCardById(cardId).GeneralName !== 'slash';
  }
}

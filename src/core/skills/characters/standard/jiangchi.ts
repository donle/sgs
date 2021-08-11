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
  FilterSkill,
  OnDefineReleaseTiming,
  PersistentSkill,
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
    return owner.Id === content.playerId && PlayerPhaseStages.PlayCardStageStart === content.toStage;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const options = ['jiangchi:draw2', 'jiangchi:draw1', 'jiangchi:drop'];
    if (room.getPlayerById(skillUseEvent.fromId).getPlayerCards().length === 0) {
      options.pop();
    }

    const askForChooseOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      toId: skillUseEvent.fromId,
      conversation: 'please choose jiangchi options',
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChooseOptionsEvent),
      skillUseEvent.fromId,
    );

    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      skillUseEvent.fromId,
    );

    response.selectedOption = response.selectedOption || options[1];

    if (response.selectedOption === options[0]) {
      await room.drawCards(2, skillUseEvent.fromId, 'top', skillUseEvent.fromId, this.Name);
      room.setFlag<string>(skillUseEvent.fromId, this.Name, JiangChi.BlockFlag);
    } else if (response.selectedOption === options[1]) {
      await room.drawCards(1, skillUseEvent.fromId, 'top', skillUseEvent.fromId, this.Name);
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
@PersistentSkill()
@CommonSkill({ name: JiangChi.Name, description: JiangChi.Description })
export class JiangChiExtra extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (room.getFlag<string>(owner.Id, this.GeneralName) !== JiangChi.ExtraFlag) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
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
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
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
@PersistentSkill()
@CommonSkill({ name: JiangChiExtra.Name, description: JiangChiExtra.Description })
export class JiangChiBlock extends FilterSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    if (room.getFlag<string>(owner, this.GeneralName) !== JiangChi.BlockFlag) {
      return true;
    }

    return cardId instanceof CardMatcher
      ? !cardId.match(new CardMatcher({ generalName: ['slash'] }))
      : Sanguosha.getCardById(cardId).GeneralName !== 'slash';
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: JiangChiBlock.Name, description: JiangChiBlock.Description })
export class JiangChiRemove extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
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
      owner.getFlag<number>(this.GeneralName) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}

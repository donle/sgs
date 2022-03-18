import { CardMatcher } from 'core/cards/libs/card_matcher';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import {
  AllStage,
  GameStartStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'fubi', description: 'fubi_description' })
export class FuBi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.GameStartEvent>, stage?: AllStage): boolean {
    return stage === GameStartStage.AfterGameStarted;
  }

  public canUse(): boolean {
    return true;
  }

  public async onTrigger() {
    return true;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds } = event;
    if (!toIds) {
      return false;
    }

    room.addMark(toIds[0], MarkEnum.Fu, 1);
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: FuBi.Name, description: FuBi.Description })
export class FuBiShadow extends TriggerSkill {
  public static readonly CardHoldExtender = 'fubi-holder';
  public static readonly SlashExtender = 'fubi-slash';
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStage;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return room.getPlayerById(content.playerId).getMark(MarkEnum.Fu) > 0;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const { playerId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
    const askForOption: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options: ['option-one', 'option-two'],
      toId: fromId,
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: 1.owner has extra 3 cards hold limit, 2.one more time to use slash in current round',
        this.Name,
      ).extract(),
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForOption),
      fromId,
    );
    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      fromId,
    );

    if (!selectedOption) {
      throw new Error(`Unable to get selected option of ${this.Name}`);
    }

    if (selectedOption === askForOption.options[0]) {
      room.syncGameCommonRules(playerId, user => {
        user.addInvisibleMark(FuBiShadow.CardHoldExtender, 3);
        room.CommonRules.addAdditionalHoldCardNumber(user, 3);
      });
    } else if (selectedOption === askForOption.options[1]) {
      room.syncGameCommonRules(playerId, user => {
        user.addInvisibleMark(FuBiShadow.SlashExtender, 1);
        room.CommonRules.addCardUsableTimes(new CardMatcher({ generalName: ['slash'] }), 1, user);
      });
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: FuBiShadow.Name, description: FuBiShadow.Description })
export class FuBiClear extends TriggerSkill implements OnDefineReleaseTiming {
  get Muted() {
    return true;
  }

  public isFlaggedSkill() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.AfterStageChanged;
  }

  isAutoTrigger() {
    return true;
  }

  afterLosingSkill(room: Room, owner: PlayerId, content: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    const event = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
    const player = room.getPlayerById(content.playerId);

    return (
      event.toStage === PlayerPhaseStages.PhaseFinish &&
      (player.getInvisibleMark(FuBiShadow.SlashExtender) > 0 ||
        player.getInvisibleMark(FuBiShadow.CardHoldExtender) > 0)
    );
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = undefined;

    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { playerId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
    const from = room.getPlayerById(playerId);
    if (from.getInvisibleMark(FuBiShadow.CardHoldExtender)) {
      room.syncGameCommonRules(playerId, user => {
        user.removeInvisibleMark(FuBiShadow.CardHoldExtender);
        room.CommonRules.addAdditionalHoldCardNumber(user, -3);
      });
    }
    if (from.getInvisibleMark(FuBiShadow.SlashExtender)) {
      room.syncGameCommonRules(playerId, user => {
        user.removeInvisibleMark(FuBiShadow.SlashExtender);
        room.CommonRules.addCardUsableTimes(new CardMatcher({ generalName: ['slash'] }), -1, user);
      });
    }

    return true;
  }
}

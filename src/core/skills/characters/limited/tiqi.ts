import { CardDrawReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'tiqi', description: 'tiqi_description' })
export class TiQi extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.BeforePhaseChange;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    owner.getFlag<number>(this.Name) !== undefined && owner.removeFlag(this.Name);
    if (
      content.to !== PlayerPhase.PlayCardStage ||
      content.toPlayer === owner.Id ||
      room.getPlayerById(content.toPlayer).Dead
    ) {
      return false;
    }

    const drawnNum = room.Analytics.getRecordEvents<GameEventIdentifiers.DrawCardEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.DrawCardEvent &&
        event.fromId === content.toPlayer &&
        event.bySpecialReason === CardDrawReason.GameStage,
      undefined,
      'round',
      [PlayerPhase.DrawCardStage],
    ).reduce<number>((sum, event) => {
      return sum + event.drawAmount;
    }, 0);
    if (drawnNum !== 2) {
      owner.setFlag<number>(this.Name, drawnNum);
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const currentPlayer = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).toPlayer;
    const diff = Math.abs(2 - room.getPlayerById(event.fromId).getFlag<number>(this.Name));

    await room.drawCards(diff, event.fromId, 'top', event.fromId, this.Name);

    const options = ['tiqi:increase', 'tiqi:decrease', 'cancel'];
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose tiqi options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(currentPlayer)),
        ).extract(),
        toId: event.fromId,
        triggeredBySkills: [this.Name],
      },
      event.fromId,
      true,
    );

    if (response.selectedOption !== 'cancel') {
      room.syncGameCommonRules(currentPlayer, user => {
        const changedValue = response.selectedOption === options[0] ? diff : -diff;
        user.addInvisibleMark(this.Name, user.getInvisibleMark(this.Name) + changedValue);
        room.CommonRules.addAdditionalHoldCardNumber(user, changedValue);
      });

      room.getPlayerById(currentPlayer).hasShadowSkill(TiQiRemover.Name) ||
        (await room.obtainSkill(currentPlayer, TiQiRemover.Name));
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_tiqi_remover', description: 's_tiqi_remover_description' })
export class TiQiRemover extends TriggerSkill implements OnDefineReleaseTiming {
  public afterDead(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return content.from === PlayerPhase.PhaseFinish;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.syncGameCommonRules(event.fromId, user => {
      const extraHold = user.getInvisibleMark(TiQi.Name);
      user.removeInvisibleMark(TiQi.Name);
      room.CommonRules.addAdditionalHoldCardNumber(user, -extraHold);
    });

    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}

import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
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
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'guanchao', description: 'guanchao_description' })
export class GuanChao extends TriggerSkill {
  public static readonly GuanChaoIncrease = 'guanchao_increase';
  public static readonly GuanChaoDecrease = 'guanchao_decrease';

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.PlayCardStageStart;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId } = event;

    const options = ['guanchao:increase', 'guanchao:decrease'];
    const { selectedOption } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        toId: fromId,
        conversation: 'guanchao: please choose one option',
        triggeredBySkills: [this.Name],
      },
      fromId,
    );

    if (selectedOption) {
      const chosen = selectedOption === options[0];
      room.setFlag<number>(
        fromId,
        chosen ? GuanChao.GuanChaoIncrease : GuanChao.GuanChaoDecrease,
        chosen ? 0 : 14,
        chosen ? 'guanchao increase' : 'guanchao decrease',
      );

      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(): Promise<boolean> {
    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: GuanChao.Name, description: GuanChao.Description })
export class GuanChaoShadow extends TriggerSkill implements OnDefineReleaseTiming {
  private readonly GuanChaoFirst = 'guanchao_first';

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

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage !== CardUseStage.CardUsing;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      stage === CardUseStage.BeforeCardUseEffect ||
      stage === CardUseStage.CardUsing ||
      stage === PhaseChangeStage.PhaseChanged
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      let canUse =
        cardUseEvent.fromId === owner.Id &&
        !(stage === CardUseStage.CardUsing && owner.getFlag<boolean>(this.GuanChaoFirst));

      if (canUse) {
        const increase = owner.getFlag<number>(GuanChao.GuanChaoIncrease);
        const decrease = owner.getFlag<number>(GuanChao.GuanChaoDecrease);

        canUse = increase !== undefined || decrease !== undefined;
        if (canUse) {
          owner.setFlag<AllStage>(this.Name, stage!);
        }
      }

      return canUse;
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.fromPlayer === owner.Id && phaseChangeEvent.from === PlayerPhase.PlayCardStage;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const stage = room.getFlag<AllStage>(fromId, this.Name);
      if (stage === CardUseStage.BeforeCardUseEffect) {
        const cardNumber = Sanguosha.getCardById(
          (unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId,
        ).CardNumber;
        if (cardNumber === 0) {
          room.removeFlag(fromId, GuanChao.GuanChaoIncrease);
          room.removeFlag(fromId, GuanChao.GuanChaoDecrease);
          return true;
        }

        const increase = room.getFlag<number>(fromId, GuanChao.GuanChaoIncrease);
        const from = room.getPlayerById(fromId);
        if (increase !== undefined) {
          if (cardNumber > increase) {
            if (increase === 0) {
              from.setFlag<boolean>(this.GuanChaoFirst, true);
            } else {
              from.removeFlag(this.GuanChaoFirst);
            }

            room.setFlag<number>(
              fromId,
              GuanChao.GuanChaoIncrease,
              cardNumber,
              TranslationPack.translationJsonPatcher('guanchao increase: {0}', cardNumber).toString(),
            );
          } else {
            room.removeFlag(fromId, GuanChao.GuanChaoIncrease);
          }
        }

        const decrease = room.getFlag<number>(fromId, GuanChao.GuanChaoDecrease);
        if (decrease !== undefined) {
          if (cardNumber < decrease) {
            if (decrease === 14) {
              from.setFlag<boolean>(this.GuanChaoFirst, true);
            } else {
              from.removeFlag(this.GuanChaoFirst);
            }

            room.setFlag<number>(
              fromId,
              GuanChao.GuanChaoDecrease,
              cardNumber,
              TranslationPack.translationJsonPatcher('guanchao decrease: {0}', cardNumber).toString(),
            );
          } else {
            room.removeFlag(fromId, GuanChao.GuanChaoDecrease);
          }
        }
      } else {
        room.getFlag<number>(fromId, GuanChao.GuanChaoIncrease) !== undefined &&
          (await room.drawCards(1, event.fromId, 'top', event.fromId, this.GeneralName));
        room.getFlag<number>(fromId, GuanChao.GuanChaoDecrease) !== undefined &&
          (await room.drawCards(1, event.fromId, 'top', event.fromId, this.GeneralName));
      }
    } else {
      room.removeFlag(fromId, GuanChao.GuanChaoIncrease);
      room.removeFlag(fromId, GuanChao.GuanChaoDecrease);
      room.getPlayerById(fromId).removeFlag(this.GuanChaoFirst);
    }

    return true;
  }
}

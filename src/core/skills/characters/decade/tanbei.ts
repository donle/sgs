import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { INFINITE_DISTANCE, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  GlobalFilterSkill,
  OnDefineReleaseTiming,
  RulesBreakerSkill,
  TriggerSkill,
} from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'tanbei', description: 'tanbei_description' })
export class TanBei extends ActiveSkill {
  public static readonly TanBeiTarget = 'tanbei_target';

  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const options = ['tanbei:prey', 'tanbei:unlimited'];
    room.getPlayerById(toIds[0]).getCardIds().length === 0 && options.shift();

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose tanbei options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        ).extract(),
        toId: toIds[0],
        triggeredBySkills: [this.Name],
      },
      toIds[0],
      true,
    );

    response.selectedOption = response.selectedOption || options[0];

    if (response.selectedOption === 'tanbei:prey') {
      const wholeCards = room.getPlayerById(toIds[0]).getCardIds();
      const randomCard = wholeCards[Math.floor(Math.random() * wholeCards.length)];
      await room.moveCards({
        movingCards: [{ card: randomCard, fromArea: room.getPlayerById(fromId).cardFrom(randomCard) }],
        fromId: toIds[0],
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      });

      room.setFlag<PlayerId>(fromId, this.Name, toIds[0]);
    } else {
      room.setFlag(fromId, TanBei.TanBeiTarget, toIds[0], this.Name);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: TanBei.Name, description: TanBei.Description })
export class TanBeiBuff extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakCardUsableDistanceTo(
    cardId: CardId | CardMatcher | undefined,
    room: Room,
    owner: Player,
    target: Player,
  ): number {
    if (owner.getFlag<PlayerId>(TanBei.TanBeiTarget) === target.Id) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }

  public breakCardUsableTimesTo(cardId: CardId | CardMatcher, room: Room, owner: Player, target: Player): number {
    if (owner.getFlag<PlayerId>(TanBei.TanBeiTarget) === target.Id) {
      return INFINITE_TRIGGERING_TIMES;
    } else {
      return 0;
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: TanBeiBuff.Name, description: TanBeiBuff.Description })
export class TanBeiDebuff extends GlobalFilterSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public canUseCardTo(_: CardId | CardMatcher, __: Room, owner: Player, from: Player, to: Player): boolean {
    return !(owner === from && to.Id === owner.getFlag<PlayerId>(this.GeneralName));
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: TanBeiDebuff.Name, description: TanBeiDebuff.Description })
export class TanBeiRemover extends TriggerSkill implements OnDefineReleaseTiming {
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
      (owner.getFlag<boolean>(this.GeneralName) !== undefined ||
        owner.getFlag<PlayerId>(TanBei.TanBeiTarget) !== undefined)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);
    room.removeFlag(event.fromId, TanBei.TanBeiTarget);

    return true;
  }
}

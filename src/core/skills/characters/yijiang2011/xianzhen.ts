import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AimStage, AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { QingGangSkill } from 'core/skills/cards/standard/qinggang';
import { ActiveSkill, FilterSkill, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill, UniqueSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xianzhen', description: 'xianzhen_description' })
export class XianZhen extends ActiveSkill {
  public static readonly Win = 'xianzhen_win';
  public static readonly Lose = 'xianzhen_lose';
  public static readonly Target = 'xianzhen target: {0}';

  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: string, room: Room, target: string) {
    return room.canPindian(owner, target);
  }

  public async onUse() {
    return true;
  }

  public cardFilter() {
    return true;
  }

  public isAvailableCard() {
    return false;
  }

  public static setXianZhenTarget(room: Room, gaoshunId: PlayerId, targetId: PlayerId) {
    room.setFlag<PlayerId>(gaoshunId, XianZhen.Win, targetId);
    room.setFlag<boolean>(
      gaoshunId,
      XianZhen.Target,
      true,
      TranslationPack.translationJsonPatcher(
        XianZhen.Target,
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(targetId)),
      ).toString(),
    );
  }

  public static removeXianZhenTarget(room: Room, gaoshunId: PlayerId) {
    room.removeFlag(gaoshunId, XianZhen.Win);
    room.removeFlag(gaoshunId, XianZhen.Target);
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = skillUseEvent;
    const { pindianRecord } = await room.pindian(fromId, toIds!);
    if (!pindianRecord.length) {
      return false;
    }

    if (pindianRecord[0].winner === fromId) {
      XianZhen.setXianZhenTarget(room, fromId, toIds![0]);
    } else {
      room.setFlag<boolean>(fromId, XianZhen.Lose, true, XianZhen.Lose);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XianZhen.Name, description: XianZhen.Description })
export class XianZhenExtra extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakCardUsableDistanceTo(cardId: CardId | CardMatcher, room: Room, owner: Player, target: Player) {
    const xianzhenee = owner.getFlag<PlayerId>(XianZhen.Win);
    if (target.Id === xianzhenee) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }

  public breakCardUsableTimesTo(cardId: CardId | CardMatcher, room: Room, owner: Player, target: Player) {
    const xianzhenee = owner.getFlag<PlayerId>(XianZhen.Win);
    if (target.Id === xianzhenee) {
      return INFINITE_TRIGGERING_TIMES;
    } else {
      return 0;
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XianZhenExtra.Name, description: XianZhen.Description })
export class XianZhenBlock extends FilterSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId) {
    if (!room.getFlag<boolean>(owner, XianZhen.Lose)) {
      return true;
    }

    if (cardId instanceof CardMatcher) {
      return !cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      return Sanguosha.getCardById(cardId).GeneralName !== 'slash';
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XianZhenBlock.Name, description: XianZhen.Description })
export class XianZhenKeep extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>) {
    return EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForCardDropEvent;
  }

  public isAutoTrigger() {
    return true;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>) {
    return (
      room.CurrentPlayerPhase === PlayerPhase.DropCardStage &&
      room.CurrentPhasePlayer.Id === owner.Id &&
      owner.getFlag<boolean>(XianZhen.Lose) === true
    );
  }

  public isFlaggedSkill() {
    return true;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const askForCardDropEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>;
    const gaoshun = room.getPlayerById(askForCardDropEvent.toId);
    const slashes = gaoshun.getCardIds(PlayerCardsArea.HandArea).filter(cardId => {
      return Sanguosha.getCardById(cardId).GeneralName === 'slash';
    });

    (askForCardDropEvent.cardAmount as number) -= slashes.length;
    askForCardDropEvent.except = askForCardDropEvent.except ? [...askForCardDropEvent.except, ...slashes] : slashes;

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XianZhenKeep.Name, description: XianZhen.Description })
export class XianZhenAddTarget extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage: AimStage) {
    return stage === AimStage.OnAim;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    const { fromId, byCardId, isFirstTarget, allTargets } = content;
    if (byCardId === undefined || !isFirstTarget || allTargets === undefined) {
      return false;
    }
    const card = Sanguosha.getCardById(byCardId);
    return (
      fromId === owner.Id &&
      allTargets.length === 1 &&
      owner.getFlag<PlayerId>(XianZhen.Win) !== undefined &&
      !allTargets.includes(owner.getFlag<PlayerId>(XianZhen.Win)) &&
      (card.GeneralName === 'slash' || (card.is(CardType.Trick) && !card.is(CardType.DelayedTrick)))
    );
  }

  public getSkillLog(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    const xianzhenee = owner.getFlag<PlayerId>(XianZhen.Win);
    return TranslationPack.translationJsonPatcher(
      'xianzhen: do you want to add {0} as targets of {1}?',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(xianzhenee)),
      TranslationPack.patchCardInTranslation(event.byCardId!),
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    const xianzhenee = room.getFlag<PlayerId>(fromId, XianZhen.Win);
    aimEvent.allTargets.push(xianzhenee);

    return true;
  }
}

@ShadowSkill
@UniqueSkill
@PersistentSkill()
@CommonSkill({ name: XianZhenAddTarget.Name, description: XianZhen.Description })
export class XianZhenNullify extends QingGangSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAim && event.byCardId !== undefined;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return !!content && owner.Id === content.fromId && owner.getFlag<PlayerId>(XianZhen.Win) === content.toId;
  }

  public isAutoTrigger() {
    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XianZhenNullify.Name, description: XianZhenNullify.Description })
export class XianZhenRemove extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
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

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return true;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    return (
      content.fromPlayer === owner.Id &&
      content.from === PlayerPhase.PhaseFinish &&
      (owner.getFlag<boolean>(XianZhen.Win) || owner.getFlag<boolean>(XianZhen.Lose))
    );
  }

  public async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;

    if (room.getFlag<boolean>(fromId, XianZhen.Win) !== undefined) {
      XianZhen.removeXianZhenTarget(room, fromId);
    }

    if (room.getFlag<boolean>(fromId, XianZhen.Lose) !== undefined) {
      room.removeFlag(fromId, XianZhen.Lose);
    }

    return true;
  }
}

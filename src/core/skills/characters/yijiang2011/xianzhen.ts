import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AimStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, FilterSkill, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'xianzhen', description: 'xianzhen_description' })
export class XianZhen extends ActiveSkill {
  public static readonly Win = 'xianzhen_win';
  public static readonly Lose = 'xianzhen_lose';

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

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = skillUseEvent;
    const pindianResult = await room.pindian(fromId, toIds!);
    if (!pindianResult) {
      return false;
    }

    if (pindianResult.winners.includes(fromId)) {
      room.setFlag<boolean>(fromId, XianZhen.Win, true, true);
      room.setFlag<PlayerId>(fromId, this.Name, toIds![0], false);
    } else {
      room.setFlag<boolean>(fromId, XianZhen.Lose, true, true);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: XianZhen.Name, description: XianZhen.Description })
export class XianZhenExtra extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.FinishStage;
  }

  public breakCardUsableDistanceTo(cardId: CardId | CardMatcher, room: Room, owner: Player, target: Player) {
    if (owner.getFlag<boolean>(XianZhen.Win) === true && owner.getFlag<PlayerId>(XianZhen.Name) === target.Id) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }

  public breakCardUsableTimesTo(cardId: CardId | CardMatcher, room: Room, owner: Player, target: Player) {
    if (owner.getFlag<boolean>(XianZhen.Win) === true && owner.getFlag<PlayerId>(XianZhen.Name) === target.Id) {
      return INFINITE_TRIGGERING_TIMES;
    } else {
      return 0;
    }
  }
}

@ShadowSkill
@CommonSkill({ name: XianZhenExtra.Name, description: XianZhen.Description })
export class XianZhenBlock extends FilterSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room) {
    return room.CurrentPlayerPhase === PlayerPhase.FinishStage;
  }

  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId) {
    if (room.getFlag<boolean>(owner, XianZhen.Lose) === false) {
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
@CommonSkill({ name: XianZhenBlock.Name, description: XianZhen.Description })
export class XianZhenKeep extends TriggerSkill {
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

    askForCardDropEvent.cardAmount -= slashes.length;
    askForCardDropEvent.except = askForCardDropEvent.except ? [...askForCardDropEvent.except, ...slashes] : slashes;

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: XianZhenKeep.Name, description: XianZhen.Description })
export class XianZhenAddTarget extends TriggerSkill {
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
      owner.getFlag<boolean>(XianZhen.Win) === true &&
      !allTargets.includes(owner.getFlag<PlayerId>(this.GeneralName)) &&
      (card.GeneralName === 'slash' || (card.is(CardType.Trick) && !card.is(CardType.DelayedTrick)))
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    aimEvent.allTargets = [...aimEvent.allTargets, room.getFlag<PlayerId>(fromId, this.GeneralName)];

    return true;
  }
}

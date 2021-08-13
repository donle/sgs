import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase, StagePriority } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
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
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'wanglie', description: 'wanglie_description' })
export class WangLie extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    const card = Sanguosha.getCardById(content.cardId);
    return (
      content.fromId === owner.Id &&
      room.CurrentPhasePlayer === owner &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      (card.GeneralName === 'slash' || (card.is(CardType.Trick) && !card.is(CardType.DelayedTrick)))
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to make {1} disreponsive, then you cannot use card this phase?',
      this.Name,
      TranslationPack.patchCardInTranslation(event.cardId),
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const cardUseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

    cardUseEvent.disresponsiveList = room.getAlivePlayersFrom().map(player => player.Id);

    room.setFlag<boolean>(fromId, this.Name, true);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: WangLie.Name, description: WangLie.Description })
export class WangLieShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public getPriority() {
    return StagePriority.High;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.BeforeCardUseEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      room.CurrentPhasePlayer === owner &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      !owner.getFlag<boolean>(this.Name)
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    room.setFlag<boolean>(event.fromId, this.Name, true);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: WangLieShadow.Name, description: WangLieShadow.Description })
export class WangLieBuff extends RulesBreakerSkill {
  public breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    return owner.getFlag<boolean>(WangLieShadow.Name) ? 0 : INFINITE_TRIGGERING_TIMES;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: WangLieBuff.Name, description: WangLieBuff.Description })
export class WangLieDebuff extends FilterSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    return room.getPlayerById(owner).getFlag<boolean>(this.GeneralName) ? false : true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: WangLieDebuff.Name, description: WangLieDebuff.Description })
export class WangLieRemove extends TriggerSkill implements OnDefineReleaseTiming {
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
        owner.getFlag<boolean>(WangLieShadow.Name) !== undefined)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const from = room.getPlayerById(event.fromId);
    if (from.getFlag<boolean>(this.GeneralName)) {
      room.removeFlag(event.fromId, this.GeneralName);
    }
    if (from.getFlag<boolean>(WangLieShadow.Name)) {
      room.removeFlag(event.fromId, WangLieShadow.Name);
    }

    return true;
  }
}

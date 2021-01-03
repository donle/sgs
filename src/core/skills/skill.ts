import { Card, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, EventProcessSteps, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PlayerPhase, StagePriority } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
export * from './skill_wrappers';
export * from './skill_hooks';

export const enum SkillType {
  Common,
  Compulsory,
  Awaken,
  Limit,
}

export abstract class Skill {
  private skillType: SkillType = SkillType.Common;
  private shadowSkill = false;
  private lordSkill = false;
  private uniqueSkill = false;
  private selfTargetSkill = false;
  private sideEffectSkill = false;
  private persistentSkill = false;
  private stubbornSkill = false;
  private description: string;
  private skillName: string;

  public abstract isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean;
  // tslint:disable-next-line:no-empty
  public whenRefresh(room: Room, owner: Player) {}

  public async beforeUse(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent | GameEventIdentifiers.CardUseEvent>,
  ): Promise<boolean> {
    return true;
  }

  public abstract async onUse(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent | GameEventIdentifiers.CardUseEvent>,
  ): Promise<boolean>;

  public abstract onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent | GameEventIdentifiers.CardEffectEvent>,
  ): Promise<boolean>;

  public abstract canUse(
    room: Room,
    owner: Player,
    contentOrContainerCard?: ServerEventFinder<GameEventIdentifiers> | CardId,
  ): boolean;

  public async onEffectRejected(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent | GameEventIdentifiers.CardEffectEvent>,
    // tslint:disable-next-line: no-empty
  ) {}

  public async beforeEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent | GameEventIdentifiers.CardEffectEvent>,
    // tslint:disable-next-line: no-empty
  ) {
    return true;
  }
  public async afterEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent | GameEventIdentifiers.CardEffectEvent>,
    // tslint:disable-next-line: no-empty
  ) {
    return true;
  }

  public getAnimationSteps(
    event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent | GameEventIdentifiers.CardUseEvent>,
  ): EventProcessSteps {
    return event.toIds ? [{ from: event.fromId, tos: event.toIds }] : [];
  }
  public nominateForwardTarget(targets?: PlayerId[]) {
    return targets;
  }

  public get Description() {
    return this.description;
  }

  public get Name() {
    return this.skillName;
  }

  public get GeneralName() {
    return this.skillName.replace(/(#|~)+/, '');
  }

  public get Muted() {
    return false;
  }

  public static get Description() {
    return '';
  }
  public static get GeneralName() {
    return '';
  }
  public static get Name() {
    return '';
  }

  public isLordSkill() {
    return this.lordSkill;
  }

  public isShadowSkill() {
    return this.shadowSkill;
  }

  public isUniqueSkill() {
    return this.uniqueSkill;
  }

  public isSelfTargetSkill() {
    return this.selfTargetSkill;
  }
  public isSideEffectSkill() {
    return this.sideEffectSkill;
  }
  public isPersistentSkill() {
    return this.persistentSkill;
  }

  public isStubbornSkill() {
    return this.stubbornSkill;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return false;
  }

  public get SkillType() {
    return this.skillType;
  }
}

export abstract class ResponsiveSkill extends Skill {
  public canUse() {
    return false;
  }

  public isRefreshAt() {
    return false;
  }

  public abstract responsiveFor(): CardMatcher;

  public abstract async onUse(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent | GameEventIdentifiers.CardUseEvent>,
  ): Promise<boolean>;

  public abstract onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent | GameEventIdentifiers.CardEffectEvent>,
  ): Promise<boolean>;
}

export abstract class TriggerSkill extends Skill {
  public abstract isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean;
  public isAutoTrigger(room: Room, owner: Player, event?: ServerEventFinder<GameEventIdentifiers>): boolean {
    return false;
  }

  public isUncancellable(room: Room, event?: ServerEventFinder<GameEventIdentifiers>): boolean {
    return false;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers>,
  ): PatchedTranslationObject | string {
    return TranslationPack.translationJsonPatcher('do you want to trigger skill {0} ?', this.Name).extract();
  }

  public getPriority(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers>) {
    return StagePriority.Medium;
  }

  public abstract async onTrigger(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean>;
  public abstract canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers>): boolean;

  public async onUse(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    return await this.onTrigger(room, event);
  }

  public abstract async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers>): Promise<boolean>;

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers>): number {
    return 1;
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return false;
  }

  public numberOfTargets(): number[] | number {
    return 0;
  }
  protected additionalNumberOfTargets(room: Room, owner: Player, cardId?: CardId | CardMatcher): number {
    if (cardId === undefined) {
      return 0;
    } else {
      return owner.getCardAdditionalUsableNumberOfTargets(room, cardId);
    }
  }

  public targetFilter(
    room: Room,
    owner: Player,
    targets: PlayerId[],
    selectedCards: CardId[],
    cardId?: CardId,
  ): boolean {
    const availableNumOfTargets = this.numberOfTargets();
    const additionalNumberOfTargets = this.additionalNumberOfTargets(room, owner);
    if (availableNumOfTargets instanceof Array) {
      return (
        targets.length <= availableNumOfTargets[1] + additionalNumberOfTargets &&
        targets.length >= availableNumOfTargets[0]
      );
    } else {
      if (additionalNumberOfTargets > 0) {
        return (
          targets.length >= availableNumOfTargets && targets.length <= availableNumOfTargets + additionalNumberOfTargets
        );
      } else {
        return targets.length === availableNumOfTargets;
      }
    }
  }

  public numberOfCards(): number[] {
    return [];
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[], selectedTargets: PlayerId[], cardId?: CardId): boolean {
    return cards.length === 0;
  }
  public isAvailableCard(
    owner: PlayerId,
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean {
    return false;
  }
  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean {
    return false;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.EquipArea, PlayerCardsArea.HandArea];
  }
}

export abstract class ActiveSkill extends Skill {
  public abstract numberOfTargets(): number[] | number;
  private additionalNumberOfTargets(room: Room, owner: Player, cardId?: CardId): number {
    if (cardId === undefined) {
      return 0;
    } else {
      return owner.getCardAdditionalUsableNumberOfTargets(room, cardId);
    }
  }

  public numberOfCards(): number[] {
    return [];
  }

  public targetFilter(
    room: Room,
    owner: Player,
    targets: PlayerId[],
    selectedCards: CardId[],
    cardId?: CardId,
  ): boolean {
    const availableNumOfTargets = this.numberOfTargets();
    const additionalNumberOfTargets = this.additionalNumberOfTargets(room, owner, cardId);
    if (availableNumOfTargets instanceof Array) {
      return (
        targets.length <= availableNumOfTargets[1] + additionalNumberOfTargets &&
        targets.length >= availableNumOfTargets[0]
      );
    } else {
      if (additionalNumberOfTargets > 0) {
        return (
          targets.length >= availableNumOfTargets && targets.length <= availableNumOfTargets + additionalNumberOfTargets
        );
      } else {
        return targets.length === availableNumOfTargets;
      }
    }
  }

  public abstract cardFilter(
    room: Room,
    owner: Player,
    cards: CardId[],
    selectedTargets: PlayerId[],
    cardId?: CardId,
  ): boolean;
  public abstract canUse(room: Room, owner: Player, containerCard?: CardId): boolean;
  public abstract isAvailableCard(
    owner: PlayerId,
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean;
  public abstract isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean;

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea];
  }

  public isRefreshAt(room: Room, owner: Player, phase: PlayerPhase) {
    return phase === PlayerPhase.PhaseBegin;
  }
}

export abstract class TransformSkill extends Skill {
  public canUse() {
    return true;
  }
  public isRefreshAt() {
    return false;
  }
  public async onEffect() {
    return true;
  }
  public async onUse() {
    return true;
  }

  public includesJudgeCard() {
    return false;
  }

  public abstract canTransform(cardId: CardId, area?: PlayerCardsArea.EquipArea | PlayerCardsArea.HandArea): boolean;

  public abstract forceToTransformCardTo(cardId: CardId): VirtualCard | Card;
}

export abstract class ViewAsSkill extends Skill {
  public isRefreshAt(room: Room, owner: Player, phase: PlayerPhase) {
    return false;
  }

  public abstract canUse(
    room: Room,
    owner: Player,
    contentOrContainerCard?: ServerEventFinder<GameEventIdentifiers> | CardId,
  ): boolean;

  public abstract canViewAs(room: Room, owner: Player, selectedCards?: CardId[], cardMatcher?: CardMatcher): string[];
  public abstract viewAs(cards: CardId[], owner: Player, viewAs?: string): VirtualCard;
  public abstract cardFilter(
    room: Room,
    owner: Player,
    cards: CardId[],
    selectedTargets: PlayerId[],
    cardId?: CardId,
  ): boolean;
  public abstract isAvailableCard(
    room: Room,
    owner: Player,
    pendingCardId: CardId,
    selectedCards: CardId[],
    containerCard?: CardId,
    cardMatcher?: CardMatcher,
  ): boolean;

  public availableCardAreas(): PlayerCardsArea[] {
    return [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea];
  }

  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    return true;
  }
}

export abstract class RulesBreakerSkill extends Skill {
  public canUse() {
    return true;
  }

  public isRefreshAt() {
    return false;
  }

  public async onEffect() {
    return true;
  }
  public async onUse() {
    return true;
  }

  public breakDistanceTo(room: Room, owner: Player, target: Player): number {
    return 0;
  }

  public breakCardUsableTimesTo(cardId: CardId | CardMatcher, room: Room, owner: Player, target: Player): number {
    return 0;
  }
  public breakDrawCardNumber(room: Room, owner: Player): number {
    return 0;
  }
  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    return 0;
  }
  public breakCardUsableDistance(cardId: CardId | CardMatcher | undefined, room: Room, owner: Player): number {
    return 0;
  }
  public breakCardUsableDistanceTo(
    cardId: CardId | CardMatcher | undefined,
    room: Room,
    owner: Player,
    target: Player,
  ): number {
    return 0;
  }
  public breakCardUsableTargets(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    return 0;
  }
  public breakAttackDistance(cardId: CardId | CardMatcher | undefined, room: Room, owner: Player): number {
    return 0;
  }
  public breakOffenseDistance(room: Room, owner: Player): number {
    return 0;
  }
  public breakDefenseDistance(room: Room, owner: Player): number {
    return 0;
  }
  public breakBaseCardHoldNumber(room: Room, owner: Player): number {
    return 0;
  }
  public breakAdditionalCardHoldNumber(room: Room, owner: Player): number {
    return 0;
  }
  public breakAdditionalAttackRange(room: Room, owner: Player): number {
    return 0;
  }
  public breakFinalAttackRange(room: Room, owner: Player): number {
    return -1;
  }
}

export abstract class FilterSkill extends Skill {
  public canUse() {
    return true;
  }
  public isRefreshAt() {
    return false;
  }

  public async onEffect() {
    return true;
  }
  public async onUse() {
    return true;
  }

  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId, target?: PlayerId): boolean {
    return true;
  }
  public canBeUsedCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId, attacker?: PlayerId): boolean {
    return true;
  }
  public canDropCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    return true;
  }

  public canBePindianTarget(room: Room, owner: PlayerId, fromId: PlayerId): boolean {
    return true;
  }
}

export abstract class GlobalFilterSkill extends FilterSkill {
  public canUseCardTo(
    cardId: CardId | CardMatcher,
    room: Room,
    owner: Player,
    attacker: Player,
    target: Player,
  ): boolean {
    return true;
  }
}

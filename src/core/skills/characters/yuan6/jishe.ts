import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jishe', description: 'jishe_description' })
export class JiShe extends ActiveSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.PhaseBegin;
  }

  public async whenRefresh(room: Room, owner: Player) {
    room.syncGameCommonRules(owner.Id, user => {
      const decreasedHold = user.getInvisibleMark(this.Name);
      user.removeInvisibleMark(this.Name);
      room.CommonRules.addAdditionalHoldCardNumber(user, decreasedHold);
    });
  }

  public canUse(room: Room, owner: Player) {
    return owner.getMaxCardHold(room) > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);

    room.syncGameCommonRules(event.fromId, user => {
      user.addInvisibleMark(this.Name, 1);
      room.CommonRules.addAdditionalHoldCardNumber(user, -1);
    });

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: JiShe.Name, description: JiShe.Description })
export class JiSheShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      event.playerId === owner.Id &&
      event.toStage === PlayerPhaseStages.FinishStageStart &&
      owner.Hp > 0 &&
      owner.getCardIds(PlayerCardsArea.HandArea).length === 0
    );
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length > 0 && targets.length <= owner.Hp;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return !room.getPlayerById(target).ChainLocked;
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose at most {1} targets to chain on?',
      this.Name,
      owner.Hp,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    for (const toId of event.toIds) {
      await room.chainedOn(toId);
    }

    return true;
  }
}

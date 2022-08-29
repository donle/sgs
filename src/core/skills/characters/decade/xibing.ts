import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { FilterSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xibing', description: 'xibing_description' })
export class XiBing extends TriggerSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.PhaseBegin;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAim;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    const card = Sanguosha.getCardById(content.byCardId);
    return (
      content.fromId !== owner.Id &&
      room.CurrentPhasePlayer === room.getPlayerById(content.fromId) &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      !room.getPlayerById(content.fromId).Dead &&
      card.isBlack() &&
      (card.GeneralName === 'slash' || card.isCommonTrick()) &&
      AimGroupUtil.getAllTargets(content.allTargets).length === 1
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to use this skill to {1} ?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const toId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>).fromId;

    const diff =
      Math.min(room.getPlayerById(toId).Hp, 5) - room.getPlayerById(toId).getCardIds(PlayerCardsArea.HandArea).length;
    if (diff > 0) {
      await room.drawCards(diff, toId, 'top', event.fromId, this.Name);
      for (const skillName of [XiBingBlocker.Name, XiBingRemover.Name]) {
        room.getPlayerById(toId).hasShadowSkill(skillName) || (await room.obtainSkill(toId, skillName));
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_xibing_blocker', description: 's_xibing_blocker_description' })
export class XiBingBlocker extends FilterSkill {
  public canUseCard(
    cardId: CardId | CardMatcher,
    room: Room,
    owner: PlayerId,
    onResponse?: ServerEventFinder<GameEventIdentifiers>,
    isCardResponse?: boolean,
  ): boolean {
    return isCardResponse === true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_xibing_remover', description: 's_xibing_remover_description' })
export class XiBingRemover extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return event.from === PlayerPhase.PhaseFinish;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.loseSkill(event.fromId, this.Name);
    room.getPlayerById(event.fromId).hasShadowSkill(XiBingBlocker.Name) &&
      (await room.loseSkill(event.fromId, XiBingBlocker.Name));

    return true;
  }
}

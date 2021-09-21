import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yingjian', description: 'yingjian_description' })
export class YingJian extends TriggerSkill {
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
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PrepareStageStart &&
      owner.canUseCard(room, new CardMatcher({ generalName: ['slash'] }), new CardMatcher({ generalName: ['slash'] }))
    );
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    const availableNumOfTargets = 1;
    const additionalNumberOfTargets = this.additionalNumberOfTargets(
      room,
      owner,
      new CardMatcher({ generalName: ['slash'] }),
    );
    if (additionalNumberOfTargets > 0) {
      return (
        targets.length >= availableNumOfTargets && targets.length <= availableNumOfTargets + additionalNumberOfTargets
      );
    } else {
      return targets.length === availableNumOfTargets;
    }
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      owner !== target &&
      room.getPlayerById(owner).canUseCardTo(room, new CardMatcher({ generalName: ['slash'] }), target)
    );
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher('{0}: do you want to use a virtual slash?', this.Name).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    await room.useCard({
      fromId: event.fromId,
      targetGroup: [event.toIds],
      cardId: VirtualCard.create({ cardName: 'slash', bySkill: this.Name }).Id,
      extraUse: true,
    });

    return true;
  }
}

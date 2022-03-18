import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { Slash } from 'core/cards/standard/slash';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhenge', description: 'zhenge_description' })
export class ZhenGe extends TriggerSkill {
  public static readonly ZhenGeTargets = 'zhenge_targets';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: string, room: Room, target: string): boolean {
    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const targets = room.getFlag<PlayerId[]>(fromId, ZhenGe.ZhenGeTargets) || [];
    targets.includes(toIds[0]) || targets.push(toIds[0]);
    room.getPlayerById(fromId).setFlag<PlayerId[]>(ZhenGe.ZhenGeTargets, targets);

    let additionalAttackRange = room.getFlag<number>(toIds[0], this.Name) || 0;
    if (additionalAttackRange < 5) {
      additionalAttackRange++;
      room.setFlag<number>(
        toIds[0],
        this.Name,
        additionalAttackRange,
        TranslationPack.translationJsonPatcher('zhenge: {0}', additionalAttackRange).toString(),
      );

      room.syncGameCommonRules(toIds[0], user => {
        room.CommonRules.addAdditionalAttackRange(user, 1);
      });
    }

    if (
      !room.getOtherPlayers(toIds[0]).find(player => !room.withinAttackDistance(room.getPlayerById(toIds[0]), player))
    ) {
      const targets = room
        .getOtherPlayers(toIds[0])
        .filter(player =>
          room.getPlayerById(toIds[0]).canUseCardTo(room, new CardMatcher({ generalName: ['slash'] }), player.Id),
        )
        .map(player => player.Id);

      if (targets.length > 0) {
        const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          {
            players: targets,
            toId: fromId,
            requiredAmount: 1,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: do you want to choose a target to be the target of the slash what use by {1}?',
              this.Name,
              TranslationPack.patchPlayerInTranslation(room.getPlayerById(toIds[0])),
            ).extract(),
            triggeredBySkills: [this.Name],
          },
          fromId,
        );

        if (resp.selectedPlayers && resp.selectedPlayers.length > 0) {
          await room.useCard({
            fromId: toIds[0],
            targetGroup: [resp.selectedPlayers],
            cardId: VirtualCard.create<Slash>({ cardName: 'slash', bySkill: this.Name }).Id,
            extraUse: true,
            triggeredBySkills: [this.Name],
          });
        }
      }
    }

    return true;
  }
}

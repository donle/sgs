import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AimStage, AllStage, GameBeginStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { JudgeMatcher, JudgeMatcherEnum } from 'core/shares/libs/judge_matchers';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { MarkEnum } from 'core/shares/types/mark_list';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'dulie', description: 'dulie_description' })
export class DuLie extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.GameBeginEvent | GameEventIdentifiers.AimEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === GameBeginStage.AfterGameBegan || stage === AimStage.OnAimmed;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.GameBeginEvent | GameEventIdentifiers.AimEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = content as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      return (
        aimEvent.toId === owner.Id &&
        room.getPlayerById(aimEvent.fromId).getMark(MarkEnum.Wei) === 0 &&
        Sanguosha.getCardById(aimEvent.byCardId).GeneralName === 'slash'
      );
    }

    return identifier === GameEventIdentifiers.GameBeginEvent;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.GameBeginEvent | GameEventIdentifiers.AimEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.GameBeginEvent) {
      const num = Math.floor(room.AlivePlayers.length / 2);
      const players = room.getOtherPlayers(fromId).map(player => player.Id);
      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players,
          toId: fromId,
          requiredAmount: num,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose {1} targets to gain ‘Wei’ mark',
            this.Name,
            num,
          ).extract(),
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      resp.selectedPlayers = resp.selectedPlayers || players.slice(0, num);

      for (const player of resp.selectedPlayers) {
        room.setMark(player, MarkEnum.Wei, 1);
      }
    } else {
      const judgeEvent = await room.judge(fromId, undefined, this.Name, JudgeMatcherEnum.DuLie);
      if (JudgeMatcher.onJudge(judgeEvent.judgeMatcherEnum!, Sanguosha.getCardById(judgeEvent.judgeCardId))) {
        AimGroupUtil.cancelTarget(unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>, fromId);
      }
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: DuLie.Name, description: DuLie.Description })
export class DuLieShadow extends RulesBreakerSkill {
  public breakCardUsableDistanceTo(
    cardId: CardId | CardMatcher | undefined,
    room: Room,
    owner: Player,
    target: Player,
  ) {
    if (target.getMark(MarkEnum.Wei) > 0 || !cardId) {
      return 0;
    }

    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ generalName: ['slash'] })) ? INFINITE_TRIGGERING_TIMES : 0;
    } else {
      return Sanguosha.getCardById(cardId).GeneralName === 'slash' ? INFINITE_TRIGGERING_TIMES : 0;
    }
  }
}

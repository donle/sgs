import { LeBuSiShuSkillTrigger } from 'core/ai/skills/cards/lebusishu';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { JudgeMatcher, JudgeMatcherEnum } from 'core/shares/libs/judge_matchers';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, AI, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ExtralCardSkillProperty } from '../interface/extral_property';

@AI(LeBuSiShuSkillTrigger)
@CommonSkill({ name: 'lebusishu', description: 'lebusishu_description' })
export class LeBuSiShuSkill extends ActiveSkill implements ExtralCardSkillProperty {
  public canUse(room: Room, owner: Player) {
    return true;
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }

  public isCardAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return (
      owner !== target &&
      room.getPlayerById(owner).canUseCardTo(room, containerCard, target) &&
      room
        .getPlayerById(target)
        .getCardIds(PlayerCardsArea.JudgeArea)
        .find(cardId => Sanguosha.getCardById(cardId).GeneralName === 'lebusishu') === undefined
    );
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return this.isCardAvailableTarget(owner, room, target, selectedCards, selectedTargets, containerCard);
  }

  public async onUse() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, cardId } = event;
    const to = Precondition.exists(toIds, 'Unknown targets in lebusishu')[0];
    const judgeEvent = await room.judge(to, cardId, this.Name, JudgeMatcherEnum.LeBuSiShu);
    const card = Sanguosha.getCardById(judgeEvent.judgeCardId);

    if (JudgeMatcher.onJudge(judgeEvent.judgeMatcherEnum!, card)) {
      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} skipped play stage',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(to)),
        ).extract(),
      });

      await room.skip(to, PlayerPhase.PlayCardStage);
    }
    return true;
  }
}

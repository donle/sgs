import { BaGuaZhenSkillTrigger } from 'core/ai/skills/cards/baguazhen';
import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { BaGuaZhen } from 'core/cards/standard/baguazhen';
import { Jink } from 'core/cards/standard/jink';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { JudgeMatcher, JudgeMatcherEnum } from 'core/shares/libs/judge_matchers';
import { AI, CommonSkill, FilterSkill, TriggerSkill } from 'core/skills/skill';

@AI(BaGuaZhenSkillTrigger)
@CommonSkill({ name: 'baguazhen', description: 'baguazhen_description' })
export class BaGuaZhenSkill extends TriggerSkill {
  get Muted() {
    return true;
  }

  public isAutoTrigger() {
    return false;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(event);
    return (
      !EventPacker.isDisresponsiveEvent(event) &&
      (identifier === GameEventIdentifiers.AskForCardResponseEvent ||
        identifier === GameEventIdentifiers.AskForCardUseEvent)
    );
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    if (!content) {
      return true;
    }

    const { cardMatcher } = content;
    const jinkMatcher = new CardMatcher({ name: ['jink'] });
    return (
      owner.Id === content.toId &&
      CardMatcher.match(cardMatcher, jinkMatcher) &&
      owner.getSkills<FilterSkill>('filter').find(skill => !skill.canUseCard(jinkMatcher, room, owner.Id, content)) ===
        undefined
    );
  }

  async onTrigger(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, fromId } = event;
    const jinkCardEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent
    >;
    const judgeEvent = await room.judge(event.fromId, undefined, BaGuaZhen.name, JudgeMatcherEnum.BaGuaZhen);

    if (JudgeMatcher.onJudge(judgeEvent.judgeMatcherEnum!, Sanguosha.getCardById(judgeEvent.judgeCardId))) {
      const jink = VirtualCard.create<Jink>({
        cardName: 'jink',
        bySkill: this.Name,
      });

      const cardUseEvent = {
        cardId: jink.Id,
        fromId,
        toCardIds: jinkCardEvent.byCardId === undefined ? undefined : [jinkCardEvent.byCardId],
        responseToEvent: jinkCardEvent.triggeredOnEvent,
      };

      jinkCardEvent.responsedEvent = cardUseEvent;
    }

    return true;
  }
}

import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardUseStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xingluan', description: 'xingluan_description' })
export class XingLuan extends TriggerSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PlayCardStage;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      room.CurrentPhasePlayer === owner &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      !owner.hasUsedSkill(this.Name)
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to gain a card with card number 6 from draw stack?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const sixCards = room.findCardsByMatcherFrom(new CardMatcher({ cardNumber: [6] }));
    sixCards.length > 0 &&
      (await room.moveCards({
        movingCards: [
          { card: sixCards[Math.floor(Math.random() * sixCards.length)], fromArea: CardMoveArea.DrawStack },
        ],
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      }));

    return true;
  }
}

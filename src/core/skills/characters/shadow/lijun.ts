import { CharacterNationality } from 'core/characters/character';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, LordSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@LordSkill
@CommonSkill({ name: 'lijun', description: 'lijun_description' })
export class LiJun extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    const from = room.getPlayerById(content.fromId);
    return (
      from !== owner &&
      !from.Dead &&
      from.Nationality === CharacterNationality.Wu &&
      Sanguosha.getCardById(content.cardId).GeneralName === 'slash' &&
      room.isCardOnProcessing(content.cardId)
    );
  }

  public async beforeUse(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const cardUseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

    const { selectedOption } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        toId: cardUseEvent.fromId,
        options: ['yes', 'no'],
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: do you want to give {1} to {2}?',
          this.Name,
          TranslationPack.patchCardInTranslation(cardUseEvent.cardId),
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        ).extract(),
      },
      cardUseEvent.fromId,
      true,
    );

    if (selectedOption === 'yes') {
      return true;
    }

    return false;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const cardUseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const user = cardUseEvent.fromId;

    if (room.isCardOnProcessing(cardUseEvent.cardId)) {
      await room.moveCards({
        movingCards: [{ card: cardUseEvent.cardId, fromArea: CardMoveArea.ProcessingArea }],
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: user,
        triggeredBySkills: [this.Name],
      });
    }

    const { selectedOption } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        toId: fromId,
        options: ['yes', 'no'],
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: do you want to let {1} draws a card?',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(user)),
        ).extract(),
      },
      fromId,
      true,
    );

    if (selectedOption === 'yes') {
      await room.drawCards(1, user, 'top', fromId, this.Name);
    }

    return true;
  }
}

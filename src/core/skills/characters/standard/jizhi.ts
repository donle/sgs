import { CardType, VirtualCard } from 'core/cards/card';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { CardUseStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jizhi', description: 'jizhi_description' })
export class JiZhi extends TriggerSkill {
  public get RelatedCharacters(): string[] {
    return ['lukang', 'god_simayi'];
  }

  public audioIndex(characterName?: string) {
    return characterName && this.RelatedCharacters.includes(characterName) ? 1 : 2;
  }

  isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PhaseFinish;
  }

  whenRefresh(room: Room, owner: Player) {
    room.syncGameCommonRules(owner.Id, user => {
      const extraHold = user.getInvisibleMark(this.Name);
      user.removeInvisibleMark(this.Name);
      room.CommonRules.addAdditionalHoldCardNumber(user, -extraHold);
    });
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage: CardUseStage) {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const card = Sanguosha.getCardById(content.cardId);
    return content.fromId === owner.Id && card.is(CardType.Trick) && !card.isVirtualCard();
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const cardId = (await room.drawCards(1, event.fromId, undefined, event.fromId, this.Name))[0];
    const realCardId = room
      .getPlayerById(event.fromId)
      .getCardIds(PlayerCardsArea.HandArea)
      .find(id => VirtualCard.getActualCards([id])[0] === cardId && room.canDropCard(event.fromId, id));

    if (realCardId && Sanguosha.getCardById(realCardId).is(CardType.Basic)) {
      const askForOptionsEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options: ['jizhi:discard', 'jizhi:keep'],
        toId: event.fromId,
        conversation: TranslationPack.translationJsonPatcher(
          'do you wanna discard {0}',
          TranslationPack.patchCardInTranslation(cardId),
        ).extract(),
        triggeredBySkills: [this.Name],
      });

      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForOptionsEvent, event.fromId);

      const response = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        event.fromId,
      );

      if (response.selectedOption === 'jizhi:discard') {
        await room.dropCards(CardMoveReason.SelfDrop, [cardId], event.fromId, event.fromId, this.Name);
        room.syncGameCommonRules(event.fromId, user => {
          user.addInvisibleMark(this.Name, 1);
          room.CommonRules.addAdditionalHoldCardNumber(user, 1);
        });
      }
    }

    return true;
  }
}

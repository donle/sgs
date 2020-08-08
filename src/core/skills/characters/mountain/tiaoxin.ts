import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'tiaoxin', description: 'tiaoxin_description' })
export class TiaoXin extends ActiveSkill {
  public canUse(room: Room, owner: Player, containerCard?: CardId) {
    return !owner.hasUsedSkill(this.Name);
  }

  public isRefreshAt(room: Room, owner: Player, phase: PlayerPhase) {
    return phase === PlayerPhase.PlayCardStage;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return target !== owner;
  }

  public cardFilter() {
    return true;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = skillEffectEvent;
    const toId = toIds![0];
    const from = room.getPlayerById(fromId);

    const response = await room.askForCardUse(
      {
        toId,
        cardUserId: toId,
        scopedTargets: [fromId],
        cardMatcher: new CardMatcher({ generalName: ['slash'] }).toSocketPassenger(),
        extraUse: true,
        commonUse: true,
        conversation: TranslationPack.translationJsonPatcher(
          'tiaoxin: you are provoked by {0}, do you wanna use slash to {0}?',
          TranslationPack.patchPlayerInTranslation(from),
        ).extract(),
        triggeredBySkills: [this.Name],
      },
      toId,
    );

    const to = room.getPlayerById(toId);
    if (response.cardId === undefined) {
      if (to.getPlayerCards().length <= 0) {
        return true;
      }
      const options = {
        [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId,
        toId,
        options,
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
        fromId,
      );

      const response = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        fromId,
      );

      if (response.selectedCard === undefined) {
        const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
        response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
      }

      await room.dropCards(
        CardMoveReason.PassiveDrop,
        [response.selectedCard],
        chooseCardEvent.toId,
        chooseCardEvent.fromId,
        this.Name,
      );
    } else {
      const slashUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
        fromId: response.fromId,
        toIds: response.toIds,
        cardId: response.cardId,
        triggeredBySkills: [this.Name],
      };

      await room.useCard(slashUseEvent, true);
    }

    return true;
  }
}

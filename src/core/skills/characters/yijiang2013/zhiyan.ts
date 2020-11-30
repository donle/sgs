import { CardType } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhiyan', description: 'zhiyan_description' })
export class ZhiYan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id === content.playerId && content.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget() {
    return true;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = skillUseEvent;
    const toId = toIds![0];
    const cardId = (await room.drawCards(1, toId, 'top', fromId, this.Name))[0];

    const card = Sanguosha.getCardById(cardId);
    const to = room.getPlayerById(toId);

    if (!to.hasCard(room, cardId, PlayerCardsArea.HandArea)) {
      return false;
    }

    const showCardEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      fromId: toId,
      displayCards: [cardId],
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} display hand card {1}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        TranslationPack.patchCardInTranslation(cardId),
      ).extract(),
    };

    room.broadcast(GameEventIdentifiers.CardDisplayEvent, showCardEvent);

    if (card.is(CardType.Equip) && to.canUseCard(room, cardId)) {
      await room.useCard({
        fromId: toId,
        cardId,
        triggeredBySkills: [this.Name],
      });
      await room.recover({
        toId,
        recoveredHp: 1,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}

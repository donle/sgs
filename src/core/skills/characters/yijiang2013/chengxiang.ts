import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { System } from 'core/shares/libs/system';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'chengxiang', description: 'chengxiang_description' })
export class ChengXiang extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.toId;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    const chengxiangCards = room.getCards(4, 'top');

    const askForChooseCard: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardWithConditionsEvent> = {
      toId: fromId,
      customCardFields: {
        [this.Name]: chengxiangCards,
      },
      cardFilter: System.AskForChoosingCardEventFilter.ChengXiang,
      customTitle: this.Name,
    };

    room.notify(GameEventIdentifiers.AskForChoosingCardWithConditionsEvent, askForChooseCard, fromId);

    const { selectedCards } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
      fromId,
    );

    if (selectedCards !== undefined && selectedCards.length > 0) {
      await room.moveCards({
        movingCards: selectedCards!.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        movedByReason: this.Name,
        engagedPlayerIds: [this.Name],
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} obtains cards {1}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
          TranslationPack.patchCardInTranslation(...selectedCards!),
        ).extract(),
      });
    }

    return true;
  }
}

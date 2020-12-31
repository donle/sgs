import { VirtualCard } from 'core/cards/card';
import { FireSlash } from 'core/cards/legion_fight/fire_slash';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhuqueyushan', description: 'zhuqueyushan_description' })
export class ZhuQueYuShanSkill extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.AfterCardUseDeclared;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return Sanguosha.getCardById(event.cardId).Name === 'slash' && owner.Id === event.fromId;
  }

  async onTrigger(): Promise<boolean> {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const { cardId } = cardUseEvent;

    const fireSlash = VirtualCard.create<FireSlash>(
      {
        cardName: 'fire_slash',
        bySkill: this.Name,
      },
      [cardId],
    );
    cardUseEvent.cardId = fireSlash.Id;

    room.broadcast(GameEventIdentifiers.CustomGameDialog, {
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} used skill {1}, transfrom {2} into {3}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
        this.Name,
        TranslationPack.patchCardInTranslation(cardId),
        TranslationPack.patchCardInTranslation(fireSlash.Id),
      ).extract(),
    });

    return true;
  }
}

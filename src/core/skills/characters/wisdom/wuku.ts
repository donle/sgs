import { CardType } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'wuku', description: 'wuku_description' })
export class WuKu extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenLosingSkill(room: Room, owner: Player) {
    room.removeFlag(owner.Id, this.Name);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    const wuku = owner.getFlag<number>(this.Name) || 0;
    return Sanguosha.getCardById(content.cardId).is(CardType.Equip) && wuku < 3;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const wuku = room.getFlag<number>(event.fromId, this.Name) || 0;
    room.setFlag<number>(
      event.fromId,
      this.Name,
      wuku + 1,
      TranslationPack.translationJsonPatcher('wuku: {0}', wuku + 1).toString(),
    );

    return true;
  }
}

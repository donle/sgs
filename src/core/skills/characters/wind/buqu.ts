import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { RulesBreakerSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'buqu', description: 'buqu_description' })
export class BuQu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.RequestRescue;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return content.dying === owner.Id && content.rescuer === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const from = room.getPlayerById(skillEffectEvent.fromId);
    const chuang = room.getCards(1, 'top');
    room.broadcast(GameEventIdentifiers.CustomGameDialog, {
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} displayed cards {1} from top of draw stack',
        TranslationPack.patchPlayerInTranslation(from),
        TranslationPack.patchCardInTranslation(...chuang),
      ).extract(),
    });
    const overload = from
      .getCardIds(PlayerCardsArea.OutsideArea, this.Name)
      .map(id => Sanguosha.getCardById(id).CardNumber)
      .includes(Sanguosha.getCardById(chuang[0]).CardNumber);

    await room.moveCards({
      movingCards: chuang.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
      toId: overload ? undefined : skillEffectEvent.fromId,
      toArea: overload ? CardMoveArea.DropStack : PlayerCardsArea.OutsideArea,
      moveReason: overload ? CardMoveReason.PlaceToDropStack : CardMoveReason.ActiveMove,
      toOutsideArea: this.Name,
      isOutsideAreaInPublic: true,
      proposer: skillEffectEvent.fromId,
      movedByReason: this.Name,
    });

    if (!overload) {
      await room.recover({
        recoveredHp: 1 - from.Hp,
        recoverBy: skillEffectEvent.fromId,
        toId: skillEffectEvent.fromId,
      });
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: BuQu.Name, description: BuQu.Description })
export class BuQuShadow extends RulesBreakerSkill {
  public breakBaseCardHoldNumber(room: Room, owner: Player) {
    return owner.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length;
  }
}

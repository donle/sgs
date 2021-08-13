import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'congjian', description: 'congjian_description' })
export class CongJian extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    const allTargets = AimGroupUtil.getAllTargets(content.allTargets);
    if (
      content.toId === owner.Id &&
      content.byCardId &&
      Sanguosha.getCardById(content.byCardId).is(CardType.Trick) &&
      content.allTargets &&
      allTargets.length > 1
    ) {
      room.setFlag<PlayerId[]>(
        owner.Id,
        this.Name,
        allTargets.filter(target => target !== owner.Id),
      );
      return true;
    }

    return false;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.getFlag<PlayerId[]>(owner, this.Name).includes(target);
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to give a card to another target?',
      this.Name,
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds, cardIds } = event;
    if (!toIds || !cardIds) {
      return false;
    }

    const type = Sanguosha.getCardById(cardIds[0]).BaseType;
    await room.moveCards({
      movingCards: [{ card: cardIds[0], fromArea: room.getPlayerById(fromId).cardFrom(cardIds[0]) }],
      fromId,
      toId: toIds[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });

    if (type === CardType.Equip) {
      await room.drawCards(2, fromId, 'top', fromId, this.Name);
    } else {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    }

    return true;
  }
}

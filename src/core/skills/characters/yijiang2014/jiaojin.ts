import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CharacterGender } from 'core/characters/character';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jiaojin', description: 'jiaojin_description' })
export class JiaoJin extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    const card = Sanguosha.getCardById(content.byCardId);
    return (
      content.fromId !== owner.Id &&
      room.getPlayerById(content.fromId).Gender === CharacterGender.Male &&
      (card.GeneralName === 'slash' || card.isCommonTrick()) &&
      owner
        .getPlayerCards()
        .find(id => Sanguosha.getCardById(id).is(CardType.Equip) && room.canDropCard(owner.Id, id)) !== undefined
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return Sanguosha.getCardById(cardId).is(CardType.Equip) && room.canDropCard(owner, cardId);
  }

  public getSkillLog(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return TranslationPack.translationJsonPatcher(
      'do you want to discard a equip card to let {1} nullify to you and you gain it?',
      this.Name,
      TranslationPack.patchCardInTranslation(content.byCardId),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, cardIds } = event;
    if (!cardIds) {
      return false;
    }
    await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);

    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    aimEvent.nullifiedTargets.push(fromId);
    if (room.isCardOnProcessing(aimEvent.byCardId)) {
      await room.moveCards({
        movingCards: [{ card: aimEvent.byCardId, fromArea: CardMoveArea.ProcessingArea }],
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}

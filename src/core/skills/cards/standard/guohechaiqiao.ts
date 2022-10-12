import { ExtralCardSkillProperty } from '../interface/extral_property';
import { GuoHeChaiQiaoSkillTrigger } from 'core/ai/skills/cards/guohechaiqiao';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, AI, CommonSkill } from 'core/skills/skill';

@AI(GuoHeChaiQiaoSkillTrigger)
@CommonSkill({ name: 'guohechaiqiao', description: 'guohechaiqiao_description' })
export class GuoHeChaiQiaoSkill extends ActiveSkill implements ExtralCardSkillProperty {
  public canUse() {
    return true;
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }

  public isCardAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return (
      target !== owner &&
      room.getPlayerById(owner).canUseCardTo(room, containerCard, target) &&
      room.getPlayerById(target).getCardIds().length > 0
    );
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return this.isCardAvailableTarget(owner, room, target, selectedCards, selectedTargets, containerCard);
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const to = room.getPlayerById(Precondition.exists(event.toIds, 'Unknown targets in guohechaiqiao')[0]);
    if (
      (to.Id === event.fromId && to.getCardIds().filter(id => room.canDropCard(to.Id, id)).length === 0) ||
      to.getCardIds().length === 0
    ) {
      return true;
    }

    const options: CardChoosingOptions = {
      [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent = {
      fromId: event.fromId!,
      toId: to.Id,
      options,
      triggeredBySkills: [this.Name],
    };

    const response = await room.askForChoosingPlayerCard(chooseCardEvent, chooseCardEvent.fromId, true, true);

    if (!response) {
      return false;
    }

    await room.dropCards(
      CardMoveReason.PassiveDrop,
      [response.selectedCard!],
      chooseCardEvent.toId,
      chooseCardEvent.fromId,
      this.Name,
    );

    return true;
  }
}

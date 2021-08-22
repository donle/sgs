import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'liangyin', description: 'liangyin_description' })
export class LiangYin extends TriggerSkill {
  public static readonly LiangYinAreas = [
    CardMoveArea.DrawStack,
    CardMoveArea.DropStack,
    CardMoveArea.EquipArea,
    CardMoveArea.HandArea,
    CardMoveArea.JudgeArea,
    CardMoveArea.ProcessingArea,
  ];

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return (
      content.infos.find(
        info =>
          !LiangYin.LiangYinAreas.includes(info.toArea as CardMoveArea) &&
          room
            .getOtherPlayers(owner.Id)
            .find(
              player =>
                owner.getCardIds(PlayerCardsArea.HandArea).length < player.getCardIds(PlayerCardsArea.HandArea).length,
            ) !== undefined,
      ) !== undefined
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      room.getPlayerById(owner).getCardIds(PlayerCardsArea.HandArea).length <
      room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length
    );
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a liangyin target to draw 1 card?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    await room.drawCards(1, toIds[0], 'top', fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: LiangYin.Name, description: LiangYin.Description })
export class LiangYinShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return (
      content.infos.find(
        info =>
          info.movingCards &&
          info.movingCards.find(
            card => card.fromArea && !LiangYin.LiangYinAreas.includes(card.fromArea as CardMoveArea),
          ) !== undefined &&
          info.toArea === CardMoveArea.HandArea &&
          room
            .getOtherPlayers(owner.Id)
            .find(
              player =>
                owner.getCardIds(PlayerCardsArea.HandArea).length >
                  player.getCardIds(PlayerCardsArea.HandArea).length && player.getPlayerCards().length > 0,
            ) !== undefined,
      ) !== undefined
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    const to = room.getPlayerById(target);
    return (
      room.getPlayerById(owner).getCardIds(PlayerCardsArea.HandArea).length >
        to.getCardIds(PlayerCardsArea.HandArea).length && to.getPlayerCards().length > 0
    );
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a liangyin target to drop 1 card?',
      this.GeneralName,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { toIds } = event;
    if (!toIds) {
      return false;
    }

    const response = await room.askForCardDrop(
      toIds[0],
      1,
      [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
      true,
      undefined,
      this.Name,
      TranslationPack.translationJsonPatcher('{0}: please drop a card', this.Name).extract(),
    );
    if (!response) {
      return false;
    }

    const cardIds = room.getPlayerById(toIds[0]).getPlayerCards();
    response.droppedCards = response.droppedCards || cardIds[Math.floor(Math.random() * cardIds.length)];
    await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toIds[0], toIds[0], this.Name);

    return true;
  }
}

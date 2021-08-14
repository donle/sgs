import { CardChoosingOptions, DamageCardEnum } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhengrong', description: 'zhengrong_description' })
export class ZhengRong extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAim;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    const canUse =
      content.fromId === owner.Id &&
      !!content.isFirstTarget &&
      content.byCardId !== undefined &&
      (Object.values(DamageCardEnum) as string[]).includes(Sanguosha.getCardById(content.byCardId).GeneralName);

    let targets: PlayerId[] = [];
    if (canUse) {
      targets = AimGroupUtil.getAllTargets(content.allTargets).filter(
        playerId =>
          room.getPlayerById(playerId).getCardIds(PlayerCardsArea.HandArea).length >=
          owner.getCardIds(PlayerCardsArea.HandArea).length,
      );
      if (targets.length > 0) {
        room.setFlag<PlayerId[]>(owner.Id, this.Name, targets);
      }
    }

    return canUse && targets.length > 0;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    return (
      room.getFlag<PlayerId[]>(owner, this.Name).includes(targetId) &&
      room.getPlayerById(targetId).getPlayerCards().length > 0
    );
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to prey a card from him, and put this card on your general card as ‘Rong’?',
      this.Name,
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const to = room.getPlayerById(toIds[0]);
    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
    };

    if (fromId === toIds[0]) {
      options[PlayerCardsArea.HandArea] = to.getCardIds(PlayerCardsArea.HandArea);
    }

    const chooseCardEvent = EventPacker.createUncancellableEvent<
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent
    >({
      fromId,
      toId: toIds[0],
      options,
    });

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      chooseCardEvent,
      fromId,
    );

    if (response.selectedCardIndex !== undefined) {
      const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    } else if (response.selectedCard === undefined) {
      const cardIds = to.getPlayerCards();
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    await room.moveCards({
      movingCards: [{ card: response.selectedCard, fromArea: CardMoveArea.HandArea }],
      fromId: toIds[0],
      toId: fromId,
      toArea: PlayerCardsArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      toOutsideArea: this.Name,
      isOutsideAreaInPublic: false,
      proposer: fromId,
      movedByReason: this.Name,
    });

    return true;
  }
}

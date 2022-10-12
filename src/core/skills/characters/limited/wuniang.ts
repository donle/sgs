import { XuShen } from './xushen';
import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardResponseStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'wuniang', description: 'wuniang_description' })
export class WuNiang extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing || stage === CardResponseStage.CardResponsing;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    return (
      event.fromId === owner.Id &&
      Sanguosha.getCardById(event.cardId).GeneralName === 'slash' &&
      room.getOtherPlayers(owner.Id).find(player => player.getPlayerCards().length > 0) !== undefined
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && room.getPlayerById(target).getPlayerCards().length > 0;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to prey a card from another player?',
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

    const to = room.getPlayerById(toIds[0]);
    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent = {
      fromId,
      toId: toIds[0],
      options,
      triggeredBySkills: [this.Name],
    };

    const response = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, false, true);
    if (!response) {
      return false;
    }

    await room.moveCards({
      movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
      fromId: toIds[0],
      toId: fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });

    await room.drawCards(1, toIds[0], 'top', fromId, this.Name);

    if (room.getPlayerById(fromId).hasUsedSkill(XuShen.Name)) {
      for (const player of room.getAllPlayersFrom()) {
        if (player.Character.Name === 'guansuo') {
          await room.drawCards(1, player.Id, 'top', fromId, this.Name);
        }
      }
    }

    return true;
  }
}

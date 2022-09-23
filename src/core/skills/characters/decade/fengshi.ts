import { CardType } from 'core/cards/card';
import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder, WorkPlace } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'fengshi', description: 'fengshi_description' })
export class FengShi extends TriggerSkill {
  public isAutoTrigger(room: Room, owner: Player, event?: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return !!event && EventPacker.getIdentifier(event) === GameEventIdentifiers.AimEvent && event.toId === owner.Id;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAim || stage === AimStage.AfterAimmed;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AimEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      (stage === AimStage.AfterAim
        ? content.fromId === owner.Id && content.toId !== owner.Id
        : content.fromId !== owner.Id && content.toId === owner.Id) &&
      AimGroupUtil.getAllTargets(content.allTargets).length === 1 &&
      [CardType.Basic, CardType.Trick].includes(Sanguosha.getCardById(content.byCardId).BaseType) &&
      (content.fromId === owner.Id
        ? !room.getPlayerById(content.toId).Dead
        : !room.getPlayerById(content.fromId).Dead) &&
      room.getPlayerById(content.fromId).getCardIds(PlayerCardsArea.HandArea).length >
        room.getPlayerById(content.toId).getCardIds(PlayerCardsArea.HandArea).length
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to use ‘Feng Shi’ to {1}: {2} ?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toId)),
      TranslationPack.patchCardInTranslation(event.byCardId),
    ).extract();
  }

  public async beforeUse(
    room: Room<WorkPlace>,
    event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    if (aimEvent.toId === event.fromId) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options: ['yes', 'no'],
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose fengshi options: {1} {2}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
            TranslationPack.patchCardInTranslation(aimEvent.byCardId),
          ).extract(),
          toId: aimEvent.fromId,
          triggeredBySkills: [this.Name],
        },
        aimEvent.fromId,
      );

      if (response.selectedOption !== 'yes') {
        return false;
      }
    }

    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    const players = [event.fromId, aimEvent.fromId === event.fromId ? aimEvent.toId : aimEvent.fromId];
    room.sortPlayersByPosition(players);
    for (const playerId of players) {
      const player = room.getPlayerById(playerId);
      if (player.getPlayerCards().length === 0) {
        continue;
      }

      const options: CardChoosingOptions = {
        [PlayerCardsArea.EquipArea]: player.getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.HandArea]: player.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId: event.fromId,
        toId: playerId,
        options,
        triggeredBySkills: [this.Name],
      };

      const response = await room.askForChoosingPlayerCard(chooseCardEvent, event.fromId, true, true);

      if (response && response.selectedCard) {
        await room.dropCards(
          playerId === event.fromId ? CardMoveReason.SelfDrop : CardMoveReason.PassiveDrop,
          [response.selectedCard],
          playerId,
          event.fromId,
          this.Name,
        );
      }
    }

    aimEvent.additionalDamage = (aimEvent.additionalDamage || 0) + 1;

    return true;
  }
}

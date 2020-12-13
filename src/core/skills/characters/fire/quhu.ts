import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'quhu', description: 'quhu_description' })
export class QuHu extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }
  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    const player = room.getPlayerById(owner);
    const targetPlayer = room.getPlayerById(target);
    return (
      target !== owner &&
      player.Hp < targetPlayer.Hp &&
      targetPlayer.getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      room.canPindian(owner, target)
    );
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }
  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds, fromId } = event;
    const { pindianRecord } = await room.pindian(fromId, toIds!);
    if (!pindianRecord.length) {
      return false;
    }

    const target = room.getPlayerById(toIds![0]);
    if (pindianRecord[0].winner === fromId) {
      const askForChoosingPlayer: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
        toId: fromId,
        players: room.AlivePlayers.filter(
          player => target.getAttackDistance(room) >= room.distanceBetween(target, player) && player !== target,
        ).map(player => player.Id),
        requiredAmount: 1,
        conversation: TranslationPack.translationJsonPatcher(
          'please choose a player to get a damage from {0}',
          TranslationPack.patchPlayerInTranslation(target),
        ).extract(),
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>(askForChoosingPlayer),
        fromId,
      );
      const { selectedPlayers } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        fromId,
      );
      await room.damage({
        fromId: target.Id,
        toId: selectedPlayers![0],
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      });
    } else {
      await room.damage({
        fromId: target.Id,
        toId: fromId,
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}

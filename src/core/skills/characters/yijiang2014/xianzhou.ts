import { CardId } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, LimitSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@LimitSkill({ name: 'xianzhou', description: 'xianzhou_description' })
export class XianZhou extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return owner.getCardIds(PlayerCardsArea.EquipArea).length > 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = event;
    const from = room.getPlayerById(fromId);
    const equipsNum = from.getCardIds(PlayerCardsArea.EquipArea).length;

    await room.moveCards({
      movingCards: from
        .getCardIds(PlayerCardsArea.EquipArea)
        .map(card => ({ card, fromArea: PlayerCardsArea.EquipArea })),
      fromId,
      toId: toIds![0],
      moveReason: CardMoveReason.ActiveMove,
      toArea: CardMoveArea.HandArea,
      proposer: fromId,
      movedByReason: this.Name,
    });

    const to = room.getPlayerById(toIds![0]);
    const availableTargets = room
      .getOtherPlayers(toIds![0])
      .filter(player => room.withinAttackDistance(to, player))
      .map(player => player.Id);

    if (availableTargets.length > 0) {
      const isWounded: boolean = from.MaxHp > from.Hp;
      const askForPlayerChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
        toId: toIds![0],
        players: availableTargets,
        requiredAmount: [1, equipsNum],
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose at least {1} xianzhou {2} target(s) to deal 1 damage each?',
          this.Name,
          equipsNum,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        ).extract(),
        triggeredBySkills: [this.Name],
      };

      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        isWounded
          ? askForPlayerChoose
          : EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>(askForPlayerChoose),
        toIds![0],
      );

      if (!isWounded) {
        response.selectedPlayers =
          response.selectedPlayers || availableTargets.splice(0, Math.min(availableTargets.length, equipsNum));
      }

      if (response.selectedPlayers && response.selectedPlayers.length > 0) {
        room.sortPlayersByPosition(response.selectedPlayers);
        for (const player of response.selectedPlayers) {
          await room.damage({
            fromId: toIds![0],
            damage: 1,
            damageType: DamageType.Normal,
            triggeredBySkills: [this.Name],
            toId: player,
          });
        }
      } else {
        await room.recover({
          toId: fromId,
          recoveredHp: equipsNum,
          recoverBy: toIds![0],
        });
      }
    } else {
      await room.recover({
        toId: fromId,
        recoveredHp: equipsNum,
        recoverBy: toIds![0],
      });
    }

    return true;
  }
}

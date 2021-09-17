import { VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'mizhao', description: 'mizhao_description' })
export class MiZhao extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    await room.moveCards({
      movingCards: room
        .getPlayerById(fromId)
        .getCardIds(PlayerCardsArea.HandArea)
        .map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      fromId,
      toId: toIds[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });

    const availablePinDianTargets = room
      .getOtherPlayers(fromId)
      .filter(player => room.canPindian(toIds[0], player.Id))
      .map(player => player.Id);

    if (availablePinDianTargets.length === 0) {
      return false;
    }

    let chosen = availablePinDianTargets[0];
    if (availablePinDianTargets.length > 1) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players: availablePinDianTargets,
          toId: fromId,
          requiredAmount: 1,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose a target to pindian with {1}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(toIds[0])),
          ).extract(),
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      response.selectedPlayers = response.selectedPlayers || [
        availablePinDianTargets[Math.floor(Math.random() * availablePinDianTargets.length)],
      ];

      chosen = response.selectedPlayers[0];
    }

    const pindianEvent = await room.pindian(toIds[0], [chosen], this.Name);
    const virtualSlash = VirtualCard.create({ cardName: 'slash', bySkill: this.Name }).Id;

    const result = pindianEvent.pindianRecord[0];
    if (
      result.winner &&
      room
        .getPlayerById(result.winner)
        .canUseCardTo(room, virtualSlash, result.winner === toIds[0] ? chosen : toIds[0], true)
    ) {
      await room.useCard({
        fromId: result.winner,
        targetGroup: result.winner === toIds[0] ? [[chosen]] : [toIds],
        cardId: virtualSlash,
        extraUse: true,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}

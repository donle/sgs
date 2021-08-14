import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhi_qiai', description: 'zhi_qiai_description' })
export class ZhiQiAi extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return !Sanguosha.getCardById(cardId).is(CardType.Basic);
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, cardIds } = event;
    const toId = Precondition.exists(event.toIds, 'Unable to get zhi_qiai target')[0];
    const from = room.getPlayerById(fromId);

    await room.moveCards({
      movingCards: [{ card: cardIds![0], fromArea: from.cardFrom(cardIds![0]) }],
      fromId,
      toId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      movedByReason: this.Name,
    });

    const options = ['zhi_qiai:draw'];
    if (from.LostHp > 0) {
      options.push('zhi_qiai:recover');
    }

    if (!room.getPlayerById(toId).Dead) {
      const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose zhi_qiai options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        ).extract(),
        toId,
        triggeredBySkills: [this.Name],
      });

      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        askForChooseEvent,
        toId,
      );

      response.selectedOption = response.selectedOption || options[0];

      if (response.selectedOption === options[0]) {
        await room.drawCards(2, fromId, 'top', toId, this.Name);
      } else {
        await room.recover({
          toId: fromId,
          recoveredHp: 1,
          recoverBy: toId,
        });
      }
    }

    return true;
  }
}

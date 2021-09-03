import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'lveming', description: 'lveming_description' })
export class LveMing extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      target !== owner &&
      room.getPlayerById(target).getCardIds(PlayerCardsArea.EquipArea).length <
        room.getPlayerById(owner).getCardIds(PlayerCardsArea.EquipArea).length
    );
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

    const originalTimes = room.getFlag<number>(fromId, this.Name) || 0;
    room.setFlag<number>(
      fromId,
      this.Name,
      originalTimes + 1,
      TranslationPack.translationJsonPatcher('lveming times: {0}', originalTimes + 1).toString(),
    );

    const options: string[] = [];
    for (let i = 1; i < 14; i++) {
      options.push(Functional.getCardNumberRawText(i));
    }

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher('{0}: please choose lveming options', this.Name).extract(),
        toId: toIds[0],
        triggeredBySkills: [this.Name],
      },
      toIds[0],
      true,
    );

    response.selectedOption = response.selectedOption || options[Math.floor(Math.random() * options.length)];

    room.broadcast(GameEventIdentifiers.CustomGameDialog, {
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} chose {1}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(toIds[0])),
        response.selectedOption,
      ).extract(),
    });

    const judgeEvent = await room.judge(fromId, undefined, this.Name);
    const chosen = options.findIndex(option => option === response.selectedOption) + 1;
    if (Sanguosha.getCardById(judgeEvent.judgeCardId).CardNumber === Number(chosen)) {
      await room.damage({
        fromId,
        toId: toIds[0],
        damage: 2,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      });
    } else {
      const cardsInArea = room.getPlayerById(toIds[0]).getCardIds();
      if (cardsInArea.length > 0) {
        const randomCard = cardsInArea[Math.floor(Math.random() * cardsInArea.length)];
        await room.moveCards({
          movingCards: [{ card: randomCard, fromArea: room.getPlayerById(toIds[0]).cardFrom(randomCard) }],
          fromId: toIds[0],
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: fromId,
          triggeredBySkills: [this.Name],
        });
      }
    }

    return true;
  }
}

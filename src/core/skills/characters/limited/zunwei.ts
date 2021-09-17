import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zunwei', description: 'zunwei_description' })
export class ZunWei extends ActiveSkill {
  private readonly zunWeiOptions = ['zunwei:hand', 'zunwei:equip', 'zunwei:recover'];

  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && (owner.getFlag<string[]>(this.Name) || []).length < 3;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    const bannedOptions = room.getFlag<string[]>(owner, this.Name) || [];
    return (
      target !== owner &&
      ((room.getPlayerById(owner).LostHp > 0 &&
        room.getPlayerById(target).Hp > room.getPlayerById(owner).Hp &&
        !bannedOptions.includes(this.zunWeiOptions[2])) ||
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea].find(
          area =>
            (area === PlayerCardsArea.HandArea
              ? !bannedOptions.includes(this.zunWeiOptions[0])
              : !bannedOptions.includes(this.zunWeiOptions[1])) &&
            room.getPlayerById(target).getCardIds(area).length > room.getPlayerById(owner).getCardIds(area).length,
        ) !== undefined)
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
    const from = room.getPlayerById(fromId);
    const to = room.getPlayerById(toIds[0]);
    const bannedOptions = room.getFlag<string[]>(fromId, this.Name) || [];

    const options: string[] = [];
    from.getCardIds(PlayerCardsArea.HandArea).length < to.getCardIds(PlayerCardsArea.HandArea).length &&
      !bannedOptions.includes(this.zunWeiOptions[0]) &&
      options.push(this.zunWeiOptions[0]);
    from.getCardIds(PlayerCardsArea.EquipArea).length < to.getCardIds(PlayerCardsArea.EquipArea).length &&
      !bannedOptions.includes(this.zunWeiOptions[1]) &&
      options.push(this.zunWeiOptions[1]);
    from.LostHp > 0 &&
      from.Hp < to.Hp &&
      !bannedOptions.includes(this.zunWeiOptions[2]) &&
      options.push(this.zunWeiOptions[2]);

    let chosen = options[0];
    if (options.length > 1) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose zunwei options: {1}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(to),
          ).extract(),
          toId: fromId,
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      response.selectedOption && (chosen = response.selectedOption);
    }

    bannedOptions.push(chosen);
    room.setFlag<string[]>(fromId, this.Name, bannedOptions);

    if (chosen === this.zunWeiOptions[0]) {
      await room.drawCards(
        Math.min(to.getCardIds(PlayerCardsArea.HandArea).length - from.getCardIds(PlayerCardsArea.HandArea).length, 5),
        fromId,
        'top',
        fromId,
        this.Name,
      );
    } else if (chosen === this.zunWeiOptions[1]) {
      const topNum = to.getCardIds(PlayerCardsArea.EquipArea).length;
      let bannedTypes: CardType[] = [];

      while (from.getCardIds(PlayerCardsArea.EquipArea).length < topNum) {
        const copyArray = bannedTypes.slice();
        const availbaleTypes = from.getEmptyEquipSections().filter(type => !copyArray.includes(type));
        if (availbaleTypes.length === 0) {
          break;
        }

        const randomType = availbaleTypes[Math.floor(Math.random() * availbaleTypes.length)];
        const equips = room.findCardsByMatcherFrom(new CardMatcher({ type: [randomType] }));
        if (equips.length === 0) {
          bannedTypes.push(randomType);
          continue;
        }
        const randomEquip = equips[Math.floor(Math.random() * equips.length)];
        if (from.canUseCardTo(room, randomEquip, fromId)) {
          await room.useCard(
            {
              fromId,
              targetGroup: [[fromId]],
              cardId: randomEquip,
              customFromArea: CardMoveArea.DrawStack,
            },
            true,
          );

          bannedTypes = [];
        }
      }
    } else if (chosen === this.zunWeiOptions[2]) {
      const recoveredHp = to.Hp - from.Hp;
      recoveredHp > 0 && (await room.recover({ toId: fromId, recoveredHp, recoverBy: fromId }));
    }

    return true;
  }
}

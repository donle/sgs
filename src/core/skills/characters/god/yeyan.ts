/* 
业炎可能规则集讲了一大堆，反正就是
①选了牌不能指定到三名角色，选了三名角色不能选牌；
②没选牌目标无论多少都是依次打1，选牌第一个目标先选打1还是2，第二个目标就是3-前一个选的数 

选牌且只选一个目标的时候就是选2和3了

反正就是选了牌，就至少有一个目标要被分配2点或以上, 否则不满足弃牌的条件
*/

import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Logger } from 'core/shares/libs/logger/logger';
import { ActiveSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

const log = new Logger();

@LimitSkill({ name: 'yeyan', description: 'yeyan_description' })
export class YeYan extends ActiveSkill {
  room: any;
  public canUse(): boolean {
    return true;
  }

  public numberOfTargets(): number[] {
    return [1, 3];
  }

  public numberOfCards() {
    return [0, 4];
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length <= 4;
  }

  public isAvailableCard(
    owner: PlayerId,
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    if (selectedTargets.length === 3) {
      return false;
    }
    //here may have some problems
    return !selectedCards.find(id => Sanguosha.getCardById(id).Suit === Sanguosha.getCardById(cardId).Suit);
  }

  public isAvailableTarget(): boolean {
    return true;
  }

  public async beforeUse(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    const options: string[] = [];
    // just test if the TranslationPack can be used here, to ensure users can get enough info by tips .
    for (const target of skillUseEvent.toIds!) {
      options.push(
        TranslationPack.translationJsonPatcher(
          '{0} : {1} Point damage',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(target)),
          '999',
        ).toString(),
      );
    }

    const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      toId: skillUseEvent.fromId,
      conversation: 'just test',
    };

    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChoosingOptionsEvent, skillUseEvent.fromId);

    return true;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    log.info('triggered');

    return true;
  }
}

import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PlayerDiedStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhuide', description: 'zhuide_description' })
export class ZhuiDe extends TriggerSkill implements OnDefineReleaseTiming {
  public afterDead(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>, stage?: AllStage): boolean {
    return stage === PlayerDiedStage.PlayerDied;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>): boolean {
    return content.playerId === owner.Id;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    return targetId !== owner;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to let another player draw 4 defferent basic cards?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const toId = Precondition.exists(event.toIds, 'Unable to get zhuide target')[0];

    const basicNames: { [name: string]: CardId[] } = {};
    const allBasicCards = room.findCardsByMatcherFrom(new CardMatcher({ type: [CardType.Basic] }));

    if (allBasicCards.length === 0) {
      return false;
    }

    for (const cardId of allBasicCards) {
      const card = Sanguosha.getCardById(cardId);
      basicNames[card.GeneralName] = basicNames[card.GeneralName] || [];
      basicNames[card.GeneralName].push(cardId);
    }

    let zhuiDeNames: CardId[] = [];
    const names = Object.keys(basicNames);
    if (names.length <= 4) {
      zhuiDeNames = names;
    } else {
      while (zhuiDeNames.length < 4) {
        if (names.length === 0) {
          break;
        }
        const randomName = names[Math.floor(Math.random() * names.length)];
        const index = names.findIndex(name => name === randomName);
        names.splice(index, 1);
        zhuiDeNames.push(randomName);
      }
    }

    const toGain: CardId[] = [];
    for (const name of zhuiDeNames) {
      const cardIds = basicNames[name];
      toGain.push(cardIds[Math.floor(Math.random() * cardIds.length)]);
    }

    await room.moveCards({
      movingCards: toGain.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
      toId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.PassiveMove,
      proposer: fromId,
    });

    return true;
  }
}

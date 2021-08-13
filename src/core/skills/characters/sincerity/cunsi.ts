import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  CommonSkill,
  OnDefineReleaseTiming,
  PersistentSkill,
  ShadowSkill,
  TriggerSkill,
} from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'cunsi', description: 'cunsi_description' })
export class CunSi extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) && owner.isFaceUp();
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return true;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }
    room.getPlayerById(fromId).isFaceUp() && (await room.turnOver(fromId));

    const cards = room.findCardsByMatcherFrom(new CardMatcher({ generalName: ['slash'] }));
    const index = cards.length;
    cards.concat(room.findCardsByMatcherFrom(new CardMatcher({ generalName: ['slash'] }), false));

    if (cards.length > 0) {
      const random = Math.floor(Math.random() * cards.length);
      const slash = cards[random];
      await room.moveCards({
        movingCards: [{ card: slash, fromArea: random < index ? CardMoveArea.DrawStack : CardMoveArea.DropStack }],
        toId: toIds[0],
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      });

      const originalDamage = room.getFlag<number>(toIds[0], this.Name) || 0;
      room.setFlag<number>(
        toIds[0],
        this.Name,
        originalDamage + 1,
        TranslationPack.translationJsonPatcher('cunsi damage: {0}', originalDamage + 1).toString(),
      );

      room.getPlayerById(toIds[0]).hasShadowSkill(CunSiBuff.Name) ||
        (await room.obtainSkill(toIds[0], CunSiBuff.Name, true));
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_cunsi_buff', description: 's_cunsi_buff_description' })
export class CunSiBuff extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, player: Player) {
    await room.loseSkill(player.Id, this.Name);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.BeforeCardUseEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return event.fromId === owner.Id && Sanguosha.getCardById(event.cardId).GeneralName === 'slash';
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const additionalDMG = room.getFlag<number>(event.fromId, CunSi.Name);
    if (additionalDMG) {
      cardUseEvent.additionalDamage = cardUseEvent.additionalDamage
        ? cardUseEvent.additionalDamage + additionalDMG
        : additionalDMG;
    }

    room.removeFlag(event.fromId, CunSi.Name);
    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}

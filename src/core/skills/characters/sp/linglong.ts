import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CharacterEquipSections } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage, StagePriority } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { BaGuaZhenSkill, QiCai } from 'core/skills';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'linglong', description: 'linglong_description' })
export class LingLong extends BaGuaZhenSkill implements OnDefineReleaseTiming {
  public get RelatedSkills(): string[] {
    return ['qicai'];
  }

  public async whenObtainingSkill(room: Room, owner: Player) {
    if (!owner.getEquipment(CardType.Precious) && !owner.hasSkill(QiCai.Name)) {
      owner.addInvisibleMark(this.Name, 1);
      await room.obtainSkill(owner.Id, QiCai.Name);
    }
  }

  public async whenLosingSkill(room: Room, owner: Player) {
    if (owner.getInvisibleMark(this.Name) > 0) {
      owner.removeInvisibleMark(this.Name);
      await room.loseSkill(owner.Id, QiCai.Name);
    }
  }

  async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const askForInvoke: ServerEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
      toId: event.fromId,
      invokeSkillNames: [this.Name],
    };
    room.notify(GameEventIdentifiers.AskForSkillUseEvent, askForInvoke, event.fromId);
    const { invoke } = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, event.fromId);
    return invoke !== undefined;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    return (
      super.canUse(room, owner, content) &&
      owner.getEquipment(CardType.Shield) === undefined &&
      owner.canEquipTo(CharacterEquipSections.Shield)
    );
  }
}

@ShadowSkill
@CompulsorySkill({ name: LingLong.Name, description: LingLong.Description })
export class LingLongShadow extends RulesBreakerSkill {
  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (owner.getEquipment(CardType.Weapon)) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return 1;
    } else {
      return 0;
    }
  }

  public breakAdditionalCardHoldNumber(room: Room, owner: Player): number {
    return owner.getEquipment(CardType.DefenseRide) || owner.getEquipment(CardType.OffenseRide) ? 0 : 1;
  }
}

@ShadowSkill
@CompulsorySkill({ name: LingLongShadow.Name, description: LingLongShadow.Description })
export class LingLongLose extends TriggerSkill {
  public getPriority(): StagePriority {
    return StagePriority.High;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers>): boolean {
    return (
      (!owner.getEquipment(CardType.Precious) && !owner.hasSkill(QiCai.Name)) ||
      (owner.getEquipment(CardType.Precious) !== undefined && owner.getInvisibleMark(this.GeneralName) > 0)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const from = room.getPlayerById(event.fromId);
    if (!from.getEquipment(CardType.Precious) && !from.hasSkill(QiCai.Name)) {
      await room.obtainSkill(event.fromId, QiCai.Name);
      from.addInvisibleMark(this.GeneralName, 1);
    } else if (from.getEquipment(CardType.Precious) && from.getInvisibleMark(this.GeneralName) > 0) {
      from.removeInvisibleMark(this.GeneralName);
      await room.loseSkill(event.fromId, QiCai.Name);
    }

    return true;
  }
}

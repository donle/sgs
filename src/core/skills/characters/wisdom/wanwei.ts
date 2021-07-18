import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CircleSkill, CommonSkill, TriggerSkill } from 'core/skills/skill';
import { ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CircleSkill
@CommonSkill({ name: 'wanwei', description: 'wanwei_description' })
export class WanWei extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
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

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId, selectedCards: CardId[]): boolean {
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

    const hp = room.getPlayerById(fromId).Hp;
    await room.recover({
      toId: toIds[0],
      recoveredHp: hp + 1,
      recoverBy: fromId,
    });

    await room.loseHp(fromId, hp);

    return true;
  }
}

@ShadowSkill
@CircleSkill
@CommonSkill({ name: WanWei.Name, description: WanWei.Description })
export class WanWeiShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.PlayerDying;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return (
      content.dying !== owner.Id && !owner.hasUsedSkill(this.GeneralName) && room.getPlayerById(content.dying).Hp <= 0
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to let {1} recover {2} hp, then you lose {3} hp?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.dying)),
      owner.Hp + 1,
      owner.Hp,
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const dyingEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>;

    const hp = room.getPlayerById(fromId).Hp;
    await room.recover({
      toId: dyingEvent.dying,
      recoveredHp: hp + 1,
      recoverBy: fromId,
    });

    await room.loseHp(fromId, hp);

    return true;
  }
}

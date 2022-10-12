import { ZhengJian } from './zhengjian';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'gaoyuan', description: 'gaoyuan_description' })
export class GaoYuan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.OnAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    const canUse =
      content.toId === owner.Id &&
      Sanguosha.getCardById(content.byCardId).GeneralName === 'slash' &&
      owner.getPlayerCards().length > 0;

    if (canUse) {
      const availableTargets = room.AlivePlayers.filter(
        player =>
          content.fromId !== player.Id &&
          player.getFlag<number>(ZhengJian.Name) !== undefined &&
          !AimGroupUtil.getAllTargets(content.allTargets).includes(player.Id),
      );

      if (availableTargets.length < 1) {
        return false;
      }

      room.setFlag<PlayerId[]>(
        owner.Id,
        this.Name,
        availableTargets.map(player => player.Id),
      );
    }

    return canUse;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(owner: string, room: Room, target: string): boolean {
    return room.getFlag<PlayerId[]>(owner, this.Name) && room.getFlag<PlayerId[]>(owner, this.Name).includes(target);
  }

  public isAvailableCard(owner: string, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to discard a card to transfer the target of slash?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.cardIds || !event.toIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId, event.fromId, this.Name);
    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    AimGroupUtil.cancelTarget(aimEvent, event.fromId);
    AimGroupUtil.addTargets(room, aimEvent, event.toIds);

    return true;
  }
}

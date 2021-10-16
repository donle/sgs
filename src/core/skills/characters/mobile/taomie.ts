import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { GlobalRulesBreakerSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'taomie', description: 'taomie_description' })
export class TaoMie extends TriggerSkill {
  public audioIndex(): number {
    return 3;
  }

  public isAutoTrigger(
    room: Room,
    owner: Player,
    event?: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): boolean {
    return event !== undefined && room.getMark(event.toId, MarkEnum.TaoMie) > 0;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return (
      stage === DamageEffectStage.AfterDamageEffect ||
      stage === DamageEffectStage.AfterDamagedEffect ||
      stage === DamageEffectStage.DamageEffect
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      (stage === DamageEffectStage.AfterDamageEffect &&
        content.fromId === owner.Id &&
        content.toId !== owner.Id &&
        room.getMark(content.toId, MarkEnum.TaoMie) === 0) ||
      (stage === DamageEffectStage.AfterDamagedEffect &&
        content.toId === owner.Id &&
        content.fromId !== undefined &&
        content.fromId !== owner.Id &&
        !room.getPlayerById(content.fromId).Dead &&
        room.getMark(content.fromId, MarkEnum.TaoMie) === 0) ||
      (stage === DamageEffectStage.DamageEffect &&
        content.fromId === owner.Id &&
        room.getMark(content.toId, MarkEnum.TaoMie) > 0)
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to use this skill to {1} ?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(
        room.getPlayerById(event.fromId === owner.Id ? event.toId : event.fromId!),
      ),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;

    const toId = damageEvent.fromId === fromId ? damageEvent.toId : damageEvent.fromId!;
    if (room.getMark(toId, MarkEnum.TaoMie) === 0) {
      for (const other of room.getOtherPlayers(toId)) {
        other.getMark(MarkEnum.TaoMie) > 0 && room.removeMark(other.Id, MarkEnum.TaoMie);
      }

      room.addMark(toId, MarkEnum.TaoMie, 1);
    } else {
      const options = ['taomie:damage'];

      const to = room.getPlayerById(toId);
      (toId === fromId
        ? [...to.getCardIds(PlayerCardsArea.EquipArea), ...to.getCardIds(PlayerCardsArea.JudgeArea)].length > 0
        : to.getCardIds().length > 0) && options.push(...['taomie:prey', 'taomie:both']);

      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose taomie options: {1}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(toId)),
          ).extract(),
          toId: fromId,
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      response.selectedOption = response.selectedOption || options[0];

      if (response.selectedOption === options[0] || response.selectedOption === 'taomie:both') {
        damageEvent.damage++;
      }

      if (response.selectedOption === 'taomie:prey' || response.selectedOption === 'taomie:both') {
        const options: CardChoosingOptions = {
          [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
          [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
        };

        if (toId !== fromId) {
          options[PlayerCardsArea.HandArea] = to.getCardIds(PlayerCardsArea.HandArea).length;
        }

        const chooseCardEvent = {
          fromId,
          toId,
          options,
          triggeredBySkills: [this.Name],
        };

        const resp = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, false, true);
        if (!resp) {
          return false;
        }

        await room.moveCards({
          movingCards: [{ card: resp.selectedCard!, fromArea: room.getPlayerById(toId).cardFrom(resp.selectedCard!) }],
          fromId: toId,
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: fromId,
          triggeredBySkills: [this.Name],
        });
      }

      response.selectedOption === 'taomie:both' &&
        EventPacker.addMiddleware({ tag: this.Name, data: true }, damageEvent);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: TaoMie.Name, description: TaoMie.Description })
export class TaoMieDebuff extends GlobalRulesBreakerSkill {
  public breakWithinAttackDistance(room: Room, owner: Player, from: Player, to: Player): boolean {
    return from.getMark(MarkEnum.TaoMie) > 0 && from !== to && owner === to;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: TaoMieDebuff.Name, description: TaoMieDebuff.Description })
export class TaoMieRemover extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return (
      stage === DamageEffectStage.DamageFinishedEffect &&
      EventPacker.getMiddleware<boolean>(this.GeneralName, content) === true
    );
  }

  public afterDead(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return (
      stage === DamageEffectStage.DamageFinishedEffect &&
      EventPacker.getMiddleware<boolean>(this.GeneralName, content) === true
    );
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamageFinishedEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      EventPacker.getMiddleware<boolean>(this.GeneralName, event) === true &&
      room.getMark(event.toId, MarkEnum.TaoMie) > 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeMark(
      (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId,
      MarkEnum.TaoMie,
    );

    return true;
  }
}

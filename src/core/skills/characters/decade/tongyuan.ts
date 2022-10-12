import { CardType } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardResponseStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { ExtralCardSkillProperty } from 'core/skills/cards/interface/extral_property';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { CuiJian, CuiJianEX, CuiJianI, CuiJianII } from './cuijian';

@CompulsorySkill({ name: 'tongyuan', description: 'tongyuan_description' })
export class TongYuan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect || stage === CardResponseStage.AfterCardResponseEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    return (
      content.fromId === owner.Id &&
      !owner.hasSkill(CuiJianEX.Name) &&
      (owner.getFlag<number[]>(this.Name) || []).length < 2 &&
      Sanguosha.getCardById(content.cardId).isRed() &&
      ((EventPacker.getIdentifier(content) === GameEventIdentifiers.CardUseEvent &&
        Sanguosha.getCardById(content.cardId).is(CardType.Trick) &&
        !owner.hasSkill(CuiJianI.Name)) ||
        (Sanguosha.getCardById(content.cardId).is(CardType.Basic) && !owner.hasSkill(CuiJianII.Name)))
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardUsed = Sanguosha.getCardById(
      (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId,
    );
    const from = room.getPlayerById(event.fromId);

    from.hasSkill(CuiJianI.Name) && (await room.updateSkill(event.fromId, CuiJianI.Name, CuiJianEX.Name));
    from.hasSkill(CuiJianII.Name) && (await room.updateSkill(event.fromId, CuiJianII.Name, CuiJianEX.Name));
    from.hasSkill(CuiJian.Name) &&
      (await room.updateSkill(
        event.fromId,
        CuiJian.Name,
        cardUsed.is(CardType.Basic) ? CuiJianII.Name : CuiJianI.Name,
      ));

    const flagNumber = cardUsed.is(CardType.Basic) ? 2 : 1;
    const flags = from.getFlag<number[]>(this.Name) || [];
    flags.includes(flagNumber) || flags.push(flagNumber);
    from.setFlag<number[]>(this.Name, flags);

    if (flags.length > 1 && !from.hasShadowSkill(TongYuanBuff.Name)) {
      await room.obtainSkill(event.fromId, TongYuanBuff.Name);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill({ stubbornSkill: true })
@CommonSkill({ name: 's_tongyuan_buff', description: 's_tongyuan_buff_description' })
export class TongYuanBuff extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.BeforeCardUseEffect || stage === CardUseStage.AfterCardTargetDeclared;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
    stage?: AllStage,
  ): boolean {
    const cardUsed = Sanguosha.getCardById(content.cardId);
    return (
      content.fromId === owner.Id &&
      cardUsed.isRed() &&
      (stage === CardUseStage.BeforeCardUseEffect
        ? cardUsed.isCommonTrick()
        : cardUsed.is(CardType.Basic) && TargetGroupUtil.getRealTargets(content.targetGroup).length > 0)
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    if (Sanguosha.getCardById(cardUseEvent.cardId).is(CardType.Basic)) {
      const availableTarget = room
        .getAlivePlayersFrom()
        .map(player => player.Id)
        .find(
          playerId =>
            !TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup).includes(playerId) &&
            room.isAvailableTarget(cardUseEvent.cardId, event.fromId, playerId) &&
            (
              Sanguosha.getCardById(cardUseEvent.cardId).Skill as unknown as ExtralCardSkillProperty
            ).isCardAvailableTarget(event.fromId, room, playerId, [], [], cardUseEvent.cardId),
        );

      if (availableTarget) {
        const exclude = TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup);
        if (Sanguosha.getCardById(cardUseEvent.cardId).GeneralName === 'slash') {
          exclude.push(
            ...room
              .getOtherPlayers(event.fromId)
              .filter(player => !room.canAttack(room.getPlayerById(event.fromId), player))
              .map(player => player.Id),
          );
        }

        const { selectedPlayers } =
          await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent>(
            GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent,
            {
              user: event.fromId,
              cardId: cardUseEvent.cardId,
              exclude,
              conversation: TranslationPack.translationJsonPatcher(
                '{0}: please select a player to append to {1} targets',
                this.Name,
                TranslationPack.patchCardInTranslation(cardUseEvent.cardId),
              ).extract(),
              triggeredBySkills: [this.Name],
            },
            event.fromId,
          );

        if (selectedPlayers && selectedPlayers.length > 0) {
          event.toIds = selectedPlayers;
          return true;
        }
      }
    } else {
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    if (Sanguosha.getCardById(cardUseEvent.cardId).is(CardType.Basic) && event.toIds) {
      TargetGroupUtil.pushTargets(cardUseEvent.targetGroup!, event.toIds);
    } else {
      EventPacker.setDisresponsiveEvent(cardUseEvent);
    }

    return true;
  }
}

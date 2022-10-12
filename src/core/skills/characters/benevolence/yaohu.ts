import { CardMatcher } from 'core/cards/libs/card_matcher';
import { DamageCardEnum } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import {
  AimStage,
  AllStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CircleSkill, CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { JuTu } from './jutu';

@CircleSkill
@CommonSkill({ name: 'yaohu', description: 'yaohu_description' })
export class YaoHu extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return event.toPlayer === owner.Id && event.to === PlayerPhase.PhaseBegin && !owner.hasUsedSkill(this.Name);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const nationalities = room.AlivePlayers.reduce<CharacterNationality[]>((nas, player) => {
      nas.includes(player.Nationality) || nas.push(player.Nationality);
      return nas;
    }, []);

    const options = nationalities.map(nationality => Functional.getPlayerNationalityText(nationality));
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose a nationality as ‘Yao Hu’',
          this.Name,
        ).extract(),
        toId: event.fromId,
        triggeredBySkills: [this.Name],
      },
      event.fromId,
      true,
    );

    response.selectedOption = response.selectedOption || options[Math.floor(Math.random() * options.length)];
    const index = options.findIndex(nationalityText => nationalityText === response.selectedOption);

    room.setFlag<CharacterNationality>(
      event.fromId,
      this.Name,
      nationalities[index],
      TranslationPack.translationJsonPatcher('yaohu: {0}', response.selectedOption).toString(),
    );

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: YaoHu.Name, description: YaoHu.Description })
export class YaoHuShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      event.toStage === PlayerPhaseStages.PlayCardStageStart &&
      event.playerId !== owner.Id &&
      room.getPlayerById(event.playerId).Nationality === owner.getFlag<CharacterNationality>(this.GeneralName) &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, JuTu.Name).length > 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const toId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId;
    const shengs = room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.OutsideArea, JuTu.Name);
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardEvent>(
      GameEventIdentifiers.AskForChoosingCardEvent,
      {
        toId,
        cardIds: shengs,
        amount: 1,
        triggeredBySkills: [this.GeneralName],
      },
      toId,
      true,
    );

    response.selectedCards = response.selectedCards || [shengs[Math.floor(Math.random() * shengs.length)]];
    await room.moveCards({
      movingCards: [{ card: response.selectedCards[0], fromArea: CardMoveArea.OutsideArea }],
      fromId: event.fromId,
      toId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: toId,
      triggeredBySkills: [this.GeneralName],
    });

    const slashTargets = room
      .getOtherPlayers(toId)
      .filter(player => room.withinAttackDistance(room.getPlayerById(toId), player) && player.Id !== event.fromId)
      .map(player => player.Id);

    if (slashTargets.length > 0) {
      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players: slashTargets,
          toId: event.fromId,
          requiredAmount: 1,
          conversation: 'yaohu: please choose a target to be the target of the slash',
          triggeredBySkills: [this.GeneralName],
        },
        event.fromId,
        true,
      );

      resp.selectedPlayers = resp.selectedPlayers || [slashTargets[Math.floor(Math.random() * slashTargets.length)]];
      const slashResponse = await room.askForCardUse(
        {
          toId,
          cardUserId: toId,
          scopedTargets: resp.selectedPlayers,
          cardMatcher: new CardMatcher({ generalName: ['slash'] }).toSocketPassenger(),
          extraUse: true,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please use a slash to {1}',
            this.GeneralName,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(resp.selectedPlayers[0])),
          ).extract(),
          triggeredBySkills: [this.GeneralName],
        },
        toId,
      );

      if (slashResponse.cardId !== undefined) {
        const slashUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
          fromId: slashResponse.fromId,
          targetGroup: slashResponse.toIds && [slashResponse.toIds],
          cardId: slashResponse.cardId,
          triggeredBySkills: [this.GeneralName],
        };

        await room.useCard(slashUseEvent, true);

        return true;
      }
    }

    const originalTargets = room.getFlag<PlayerId[]>(toId, this.Name) || [];
    if (!originalTargets.includes(event.fromId)) {
      originalTargets.push(event.fromId);
      room.setFlag<PlayerId[]>(toId, this.Name, originalTargets, this.GeneralName);
    }

    room.getPlayerById(toId).hasShadowSkill(YaoHuDebuff.Name) || (await room.obtainSkill(toId, YaoHuDebuff.Name));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_yaohu_debuff', description: 's_yaohu_debuff_description' })
export class YaoHuDebuff extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public async whenDead(room: Room, player: Player) {
    room.removeFlag(player.Id, YaoHuShadow.Name);
    await room.loseSkill(player.Id, this.Name);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.OnAim || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = event as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      return (
        aimEvent.fromId === owner.Id &&
        (owner.getFlag<PlayerId[]>(YaoHuShadow.Name) || []).includes(aimEvent.toId) &&
        (Object.values(DamageCardEnum) as string[]).includes(Sanguosha.getCardById(aimEvent.byCardId).GeneralName)
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.fromPlayer === owner.Id && phaseChangeEvent.from === PlayerPhase.PlayCardStage;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.AimEvent) {
      const aimEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      if (room.getPlayerById(event.fromId).getPlayerCards().length >= 2) {
        const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
          GameEventIdentifiers.AskForCardEvent,
          {
            cardAmount: 2,
            toId: event.fromId,
            reason: YaoHu.Name,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: you need to give 2 cards to {1}, or he/she will be removed from the targets of {2}',
              YaoHu.Name,
              TranslationPack.patchPlayerInTranslation(room.getPlayerById(aimEvent.toId)),
              TranslationPack.patchCardInTranslation(aimEvent.byCardId),
            ).extract(),
            fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
            triggeredBySkills: [YaoHu.Name],
          },
          event.fromId,
        );

        if (response.selectedCards.length === 2) {
          await room.moveCards({
            movingCards: response.selectedCards.map(card => ({
              card,
              fromArea: room.getPlayerById(event.fromId).cardFrom(card),
            })),
            fromId: event.fromId,
            toId: aimEvent.toId,
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActiveMove,
            proposer: event.fromId,
            triggeredBySkills: [YaoHu.Name],
          });

          return true;
        }
      }

      AimGroupUtil.cancelTarget(aimEvent, aimEvent.toId);
    } else {
      room.removeFlag(event.fromId, YaoHuShadow.Name);
      await room.loseSkill(event.fromId, this.Name);
    }

    return true;
  }
}

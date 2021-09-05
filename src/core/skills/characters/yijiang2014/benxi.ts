import { CardType } from 'core/cards/card';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { ExtralCardSkillProperty } from 'core/skills/cards/interface/extral_property';
import { OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'benxi', description: 'benxi_description' })
export class BenXi extends TriggerSkill {
  private readonly BenXiStage = 'benxi_stage';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing || stage === CardUseStage.AfterCardTargetDeclared;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
    stage?: AllStage,
  ): boolean {
    if (owner.getFlag<AllStage>(this.BenXiStage)) {
      owner.removeFlag(this.BenXiStage);
    }

    if (content.fromId !== owner.Id || room.CurrentPlayer !== owner || !stage) {
      return false;
    }

    let canUse = true;
    if (stage === CardUseStage.AfterCardTargetDeclared) {
      canUse =
        TargetGroupUtil.getRealTargets(content.targetGroup).length === 1 &&
        (Sanguosha.getCardById(content.cardId).GeneralName === 'slash' ||
          (Sanguosha.getCardById(content.cardId).is(CardType.Trick) &&
            !Sanguosha.getCardById(content.cardId).is(CardType.DelayedTrick))) &&
        room.getOtherPlayers(owner.Id).find(player => room.distanceBetween(owner, player) > 1) === undefined;
    }

    if (canUse) {
      owner.setFlag<AllStage>(this.BenXiStage, stage);
    }

    return canUse;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    const stage = room.getPlayerById(fromId).getFlag<AllStage>(this.BenXiStage);

    if (stage === CardUseStage.CardUsing) {
      const originalNum = room.getFlag<number>(fromId, this.Name) || 0;
      room.setFlag<number>(
        fromId,
        this.Name,
        originalNum + 1,
        TranslationPack.translationJsonPatcher('benxi times: {0}', originalNum + 1).toString(),
      );
    } else {
      const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const options = ['benxi:unoffsetable', 'benxi:ignoreArmor', 'benxi:draw'];

      const availableTargets: PlayerId[] = room
        .getAlivePlayersFrom()
        .map(player => player.Id)
        .filter(playerId => {
          return (
            !TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup).includes(playerId) &&
            room.isAvailableTarget(cardUseEvent.cardId, fromId, playerId) &&
            (
              Sanguosha.getCardById(cardUseEvent.cardId).Skill as unknown as ExtralCardSkillProperty
            ).isCardAvailableTarget(fromId, room, playerId, [], [], cardUseEvent.cardId)
          );
        });

      availableTargets.length > 0 && options.unshift('benxi:addTarget');

      const selectedList: string[] = [];
      for (let i = 0; i < 2; i++) {
        const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
          GameEventIdentifiers.AskForChoosingOptionsEvent,
          {
            options,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: please choose benxi options: {1}',
              this.Name,
              TranslationPack.patchCardInTranslation(cardUseEvent.cardId),
            ).extract(),
            toId: fromId,
            triggeredBySkills: [this.Name],
          },
          fromId,
        );

        if (resp.selectedOption) {
          selectedList.push(resp.selectedOption);
          const index = options.findIndex(selected => selected === resp.selectedOption);
          options.splice(index, 1);
        } else {
          break;
        }
      }

      if (selectedList.length > 0) {
        for (const selected of selectedList) {
          if (selected === 'benxi:addTarget') {
            const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent>(
              GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent,
              {
                user: fromId,
                cardId: cardUseEvent.cardId,
                exclude: TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup),
                conversation: 'benxi: please select a player to append to card targets',
                triggeredBySkills: [this.Name],
              },
              fromId,
              true,
            );

            response.selectedPlayers = response.selectedPlayers || [
              availableTargets[Math.floor(Math.random() * availableTargets.length)],
            ];

            TargetGroupUtil.pushTargets(cardUseEvent.targetGroup!, response.selectedPlayers[0]);
          } else if (selected === 'benxi:unoffsetable') {
            EventPacker.setUnoffsetableEvent(cardUseEvent);
          } else if (selected === 'benxi:ignoreArmor') {
            cardUseEvent.triggeredBySkills = cardUseEvent.triggeredBySkills
              ? [...cardUseEvent.triggeredBySkills, this.Name]
              : [this.Name];
          } else if (selected === 'benxi:draw') {
            cardUseEvent.triggeredBySkills = cardUseEvent.triggeredBySkills
              ? [...cardUseEvent.triggeredBySkills, BenXiShadow.Name]
              : [BenXiShadow.Name];
          }
        }
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: BenXi.Name, description: BenXi.Description })
export class BenXiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseChangeStage.AfterPhaseChanged || stage === DamageEffectStage.DamageEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.DamageEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        owner.Id === phaseChangeEvent.fromPlayer &&
        phaseChangeEvent.from === PlayerPhase.PhaseFinish &&
        owner.getFlag<number>(this.GeneralName) !== undefined
      );
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return room.CurrentPlayer === owner && damageEvent.triggeredBySkills.includes(this.Name);
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const identifier = EventPacker.getIdentifier(
      event.triggeredOnEvent as ServerEventFinder<
        GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.DamageEvent
      >,
    );

    if (identifier === GameEventIdentifiers.DamageEvent) {
      await room.drawCards(1, fromId, 'top', fromId, this.GeneralName);
    } else {
      room.removeFlag(fromId, this.GeneralName);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: BenXiShadow.Name, description: BenXiShadow.Description })
export class BenXiCharge extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakOffenseDistance(room: Room, owner: Player): number {
    return owner.getFlag<number>(this.GeneralName) || 0;
  }
}

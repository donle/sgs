import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'tiaoxin', description: 'tiaoxin_description' })
export class TiaoXin extends ActiveSkill {
  public canUse(room: Room, owner: Player, containerCard?: CardId) {
    return owner.getFlag<boolean>(this.Name) ? owner.hasUsedSkillTimes(this.Name) < 2 : !owner.hasUsedSkill(this.Name);
  }

  public isRefreshAt(room: Room, owner: Player, phase: PlayerPhase) {
    return phase === PlayerPhase.PlayCardStage;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return room.withinAttackDistance(room.getPlayerById(target), room.getPlayerById(owner));
  }

  public cardFilter() {
    return true;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = skillEffectEvent;
    const toId = toIds![0];
    const from = room.getPlayerById(fromId);

    const response = await room.askForCardUse(
      {
        toId,
        cardUserId: toId,
        scopedTargets: [fromId],
        cardMatcher: new CardMatcher({ generalName: ['slash'] }).toSocketPassenger(),
        extraUse: true,
        commonUse: true,
        conversation: TranslationPack.translationJsonPatcher(
          'tiaoxin: you are provoked by {0}, do you wanna use slash to {0}?',
          TranslationPack.patchPlayerInTranslation(from),
        ).extract(),
        triggeredBySkills: [this.Name],
      },
      toId,
    );

    let option2 = true;
    const to = room.getPlayerById(toId);
    if (response.cardId !== undefined) {
      const slashUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
        fromId: response.fromId,
        targetGroup: response.toIds && [response.toIds],
        cardId: response.cardId,
        triggeredBySkills: [this.Name],
      };

      await room.useCard(slashUseEvent, true);

      room.Analytics.getRecordEvents<GameEventIdentifiers.DamageEvent>(
        event =>
          EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent &&
          event.cardIds === response.cardId &&
          event.triggeredBySkills.includes(this.Name) &&
          event.toId === fromId,
        undefined,
        'phase',
        undefined,
        1,
      ).length === 0 && (option2 = false);
    }

    if (option2) {
      if (to.getPlayerCards().length > 0) {
        const options = {
          [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
          [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
        };

        const chooseCardEvent = {
          fromId,
          toId,
          options,
          triggeredBySkills: [this.Name],
        };

        const resp = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, true, true);
        if (!resp) {
          return false;
        }

        await room.dropCards(
          CardMoveReason.PassiveDrop,
          [resp.selectedCard!],
          chooseCardEvent.toId,
          chooseCardEvent.fromId,
          this.Name,
        );
      }

      room.setFlag<boolean>(fromId, this.Name, true);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: TiaoXin.Name, description: TiaoXin.Description })
export class TiaoXinShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PlayCardStage &&
      owner.getFlag<number>(this.GeneralName) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}

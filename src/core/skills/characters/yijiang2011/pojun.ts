import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AimStage,
  AllStage,
  DamageEffectStage,
  PhaseStageChangeStage,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { System } from 'core/shares/libs/system';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'pojun', description: 'pojun_description' })
export class PoJun extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAim;
  }

  public canUse(room: Room, owner: Player, aimEvent: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      aimEvent.fromId === owner.Id &&
      !!aimEvent.byCardId &&
      Sanguosha.getCardById(aimEvent.byCardId).GeneralName === 'slash'
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const aimEvent = skillEffectEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    const to = room.getPlayerById(aimEvent.toId);
    const handCardIds = to.getCardIds(PlayerCardsArea.HandArea);
    const equipCardIds = to.getCardIds(PlayerCardsArea.EquipArea);
    const askForPoJunCards: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardWithConditionsEvent> = {
      toId: aimEvent.toId,
      cardFilter: System.AskForChoosingCardEventFilter.PoXi,
      customCardFields: {
        [PlayerCardsArea.HandArea]: handCardIds.length,
        [PlayerCardsArea.EquipArea]: equipCardIds,
      },
      customTitle: this.Name,
      amount: [1, to.Hp],
    };

    room.notify(GameEventIdentifiers.AskForChoosingCardWithConditionsEvent, askForPoJunCards, skillEffectEvent.fromId);

    const { selectedCards, selectedCardsIndex } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
      skillEffectEvent.fromId,
    );

    const movingCards: { card: CardId; fromArea: PlayerCardsArea | undefined }[] = [];
    selectedCards &&
      selectedCards.forEach(id => {
        movingCards.push({ card: id, fromArea: to.cardFrom(id) });
      });

    if (selectedCardsIndex) {
      const randomIdx: number[] = [];
      handCardIds.forEach((_, index) => {
        randomIdx.push(index);
      });
      Algorithm.shuffle(randomIdx);
      selectedCardsIndex.forEach((_, index) => {
        movingCards.push({ card: handCardIds[randomIdx[index]], fromArea: PlayerCardsArea.HandArea });
      });
    }

    await room.moveCards({
      movingCards,
      fromId: to.Id,
      toId: to.Id,
      toArea: PlayerCardsArea.OutsideArea,
      moveReason: CardMoveReason.PassiveMove,
      proposer: skillEffectEvent.fromId,
      toOutsideArea: this.GeneralName,
      movedByReason: this.GeneralName,
    });

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: PoJun.Name, description: PoJun.Description })
export class PoJunShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room, playerId: PlayerId): boolean {
    return (
      room.CurrentPlayerStage === PlayerPhaseStages.FinishStageStart &&
      !room
        .getAlivePlayersFrom()
        .find(player => player.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length > 0)
    );
  }

  public afterDead(room: Room, playerId: PlayerId): boolean {
    return (
      room.CurrentPlayerStage === PlayerPhaseStages.FinishStageStart &&
      !room
        .getAlivePlayersFrom()
        .find(player => player.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length > 0)
    );
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged || stage === DamageEffectStage.DamageEffect;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers>): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart &&
        room.getPlayerById(phaseStageChangeEvent.playerId).getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName)
          .length > 0
      );
    } else {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      if (damageEvent.fromId === owner.Id) {
        const to = room.getPlayerById(damageEvent.toId);
        const handCardLengthOfDamageTo = to.getCardIds(PlayerCardsArea.HandArea).length;
        const handCardLengthOfDamageFrom = owner.getCardIds(PlayerCardsArea.HandArea).length;
        const equipCardLengthOfDamageTo = to.getCardIds(PlayerCardsArea.EquipArea).length;
        const equipCardLengthOfDamageFrom = owner.getCardIds(PlayerCardsArea.EquipArea).length;

        return (
          handCardLengthOfDamageTo <= handCardLengthOfDamageFrom &&
          equipCardLengthOfDamageTo <= equipCardLengthOfDamageFrom
        );
      }
      return false;
    }
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const unknownEvent = skillEffectEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>;
    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      const to = room.getPlayerById(phaseStageChangeEvent.playerId);

      await room.moveCards({
        movingCards: to
          .getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName)
          .map(id => ({ card: id, fromArea: PlayerCardsArea.OutsideArea })),
        fromId: to.Id,
        toId: to.Id,
        toArea: PlayerCardsArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: to.Id,
        movedByReason: this.GeneralName,
      });
    } else {
      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      damageEvent.damage++;
      damageEvent.messages = damageEvent.messages || [];
      damageEvent.messages.push(
        TranslationPack.translationJsonPatcher(
          '{0} used skill {1}, damage increases to {2}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillEffectEvent.fromId)),
          this.GeneralName,
          damageEvent.damage,
        ).toString(),
      );
    }

    return true;
  }
}

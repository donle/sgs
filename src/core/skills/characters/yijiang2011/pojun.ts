import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AimStage,
  AllStage,
  DamageEffectStage,
  PhaseStageChangeStage,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
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
      Sanguosha.getCardById(aimEvent.byCardId).GeneralName === 'slash' &&
      room.getPlayerById(aimEvent.toId).getPlayerCards().length > 0
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

    const movingCards: { card: CardId; fromArea: PlayerCardsArea | undefined }[] = selectedCards
      ? selectedCards.map(id => ({ card: id, fromArea: to.cardFrom(id) }))
      : [];

    for (const card of selectedCardsIndex ? Algorithm.randomPick(selectedCardsIndex.length, handCardIds) : []) {
      movingCards.push({ card, fromArea: PlayerCardsArea.HandArea });
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
export class PoJunDamage extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamageEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    if (
      event.fromId === owner.Id &&
      !!event.cardIds &&
      Sanguosha.getCardById(event.cardIds[0]).GeneralName === 'slash'
    ) {
      const to = room.getPlayerById(event.toId);
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

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const damageEvent = skillEffectEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
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
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: PoJunDamage.Name, description: PoJunDamage.Description })
export class PoJunClear extends TriggerSkill implements OnDefineReleaseTiming {
  public async pojunClear(room: Room): Promise<void> {
    for (const player of room.getAlivePlayersFrom()) {
      const pojunCard = player.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName);
      if (pojunCard.length) {
        await room.moveCards({
          movingCards: pojunCard.map(id => ({ card: id, fromArea: PlayerCardsArea.OutsideArea })),
          fromId: player.Id,
          toId: player.Id,
          toArea: PlayerCardsArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: player.Id,
          movedByReason: this.GeneralName,
        });
      }
    }
  }

  public afterLosingSkill(room: Room): boolean {
    return room.CurrentPlayerStage === PlayerPhaseStages.PhaseFinish;
  }

  public afterDead(room: Room): boolean {
    return room.CurrentPlayerStage === PlayerPhaseStages.PhaseFinish;
  }

  public async whenDead(room: Room, player: Player): Promise<void> {
    if (room.CurrentPhasePlayer === player) {
      await this.pojunClear(room);
    }
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return event.toStage === PlayerPhaseStages.PhaseFinish;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room): Promise<boolean> {
    await this.pojunClear(room);

    return true;
  }
}

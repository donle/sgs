import { CardId } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import {
  CardDrawReason,
  CardMoveReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  DamageEffectStage,
  DrawCardStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zishou', description: 'zishou_description' })
export class ZiShou extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DrawCardStage.CardDrawing;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>,
  ): boolean {
    return (
      owner.Id === content.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      content.bySpecialReason === CardDrawReason.GameStage
    );
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    const nations = room.AlivePlayers.reduce<CharacterNationality[]>((allNations, player) => {
      if (!allNations.includes(player.Nationality)) {
        allNations.push(player.Nationality);
      }
      return allNations;
    }, []);
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to draw {1} card(s) additionally?',
      this.Name,
      nations.length,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const drawCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;

    const nations = room.AlivePlayers.reduce<CharacterNationality[]>((allNations, player) => {
      if (!allNations.includes(player.Nationality)) {
        allNations.push(player.Nationality);
      }
      return allNations;
    }, []);
    drawCardEvent.drawAmount += nations.length;

    room.setFlag<boolean>(fromId, this.Name, true);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: ZiShou.Name, description: ZiShou.Description })
export class ZiShouReforge extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      room.Analytics.getRecordEvents<GameEventIdentifiers.CardUseEvent>(
        event => {
          return (
            event.fromId === owner.Id &&
            event.toIds !== undefined &&
            event.toIds.find(player => player !== owner.Id) !== undefined
          );
        },
        owner.Id,
        true,
      ).length === 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  public isAvailableCard(
    owner: PlayerId,
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
  ): boolean {
    return (
      selectedCards.length === 0 ||
      selectedCards.find(card => Sanguosha.getCardById(card).Suit === Sanguosha.getCardById(cardId).Suit) === undefined
    );
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to discard at least one card with different suits and draw cards?',
      this.GeneralName,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>, 
  ): Promise<boolean> {
    event.cardIds = Precondition.exists(event.cardIds, 'Unable to get zishou cards');

    const { fromId, cardIds } = event;
    await room.dropCards(
      CardMoveReason.SelfDrop,
      event.cardIds,
      event.fromId,
      event.fromId,
      this.Name,
    );

    await room.drawCards(cardIds.length, fromId, 'top', fromId, this.GeneralName);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: ZiShouReforge.Name, description: ZiShouReforge.Description })
export class ZiShouPrevent extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DamageEffectStage.DamageEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): boolean {
    return (
      content.fromId === owner.Id &&
      content.toId !== undefined &&
      content.toId !== owner.Id &&
      room.getFlag<boolean>(owner.Id, this.GeneralName) === true
    );
  }

  public async onTrigger(
    room: Room,
    content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    const damageEvent = content.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;

    content.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}, prevent the damage to {2}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(damageEvent.fromId!)),
      this.GeneralName,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(damageEvent.toId!)),
    ).extract();

    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>, 
  ): Promise<boolean> {
    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    EventPacker.terminate(damageEvent);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: ZiShouPrevent.Name, description: ZiShouPrevent.Description })
export class ZiShouShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    return content.from === PlayerPhase.PhaseFinish && room.getFlag<boolean>(owner.Id, this.GeneralName) === true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>, 
  ): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}

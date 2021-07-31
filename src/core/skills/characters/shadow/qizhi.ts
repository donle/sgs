import { CardType } from 'core/cards/card';
import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, OnDefineReleaseTiming, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qizhi', description: 'qizhi_description' })
export class QiZhi extends TriggerSkill {
  private static readonly Targets = 'Qizhi_Targets';

  public isRefreshAt(room: Room, owner: Player, phase: PlayerPhase): boolean {
    return phase === PlayerPhase.PhaseFinish;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return (
      stage === AimStage.AfterAim &&
      (Sanguosha.getCardById(event.byCardId!).is(CardType.Basic) ||
        Sanguosha.getCardById(event.byCardId!).is(CardType.Trick)) &&
      !!event.isFirstTarget
    );
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    let canUse = owner.Id === event.fromId && room.CurrentPlayer === owner;
    if (canUse) {
      const availableTargets = room
        .getAlivePlayersFrom()
        .filter(player => player.getPlayerCards().length > 0 && !event.allTargets.includes(player.Id));
      canUse = availableTargets.length > 0;
      if (canUse) {
        room.setFlag<PlayerId[]>(
          owner.Id,
          QiZhi.Targets,
          availableTargets.map(player => player.Id),
        );
      }
    }

    return canUse;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    const cardTargets = room.getPlayerById(owner).getFlag<PlayerId[]>(QiZhi.Targets);
    return cardTargets.includes(targetId);
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to drop 1 hand card of another player, and this player will draw a card?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    const to = room.getPlayerById(toIds![0]);
    const times = room.getFlag<number>(fromId, this.Name) || 0;

    room.setFlag<number>(
      fromId,
      this.Name,
      times + 1,
      TranslationPack.translationJsonPatcher('qizhi times: {0}', times + 1).toString(),
    );

    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
    };

    if (fromId === toIds![0]) {
      options[PlayerCardsArea.HandArea] = to.getCardIds(PlayerCardsArea.HandArea);
    }

    const chooseCardEvent = EventPacker.createUncancellableEvent<
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent
    >({
      fromId,
      toId: toIds![0],
      options,
    });

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      chooseCardEvent,
      fromId,
    );

    if (response.selectedCardIndex !== undefined) {
      const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    } else if (response.selectedCard === undefined) {
      const cardIds = to.getPlayerCards();
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    if (response.selectedCard !== undefined) {
      await room.dropCards(
        fromId === toIds![0] ? CardMoveReason.SelfDrop : CardMoveReason.PassiveDrop,
        [response.selectedCard],
        toIds![0],
        fromId,
        this.Name,
      );

      await room.drawCards(1, toIds![0], 'top', fromId, this.Name);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: QiZhi.Name, description: QiZhi.Description })
export class QiZhiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
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
      event.from === PlayerPhase.PhaseFinish &&
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

import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AimStage, AllStage, PhaseChangeStage, PlayerPhase, StagePriority } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'souying', description: 'souying_description' })
export class SouYing extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenObtainingSkill(room: Room, player: Player) {
    const records = room.Analytics.getRecordEvents<GameEventIdentifiers.AimEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.AimEvent &&
        ((event.fromId === player.Id && event.toId !== player.Id) ||
          (event.fromId !== player.Id && event.toId === player.Id)),
    );

    for (const record of records) {
      if (record.fromId !== player.Id && !player.getFlag<PlayerId[]>(this.Name)?.includes(record.fromId)) {
        const originalPlayers = player.getFlag<PlayerId[]>(this.Name) || [];
        originalPlayers.push(record.fromId);
        player.setFlag<PlayerId[]>(this.Name, originalPlayers);

        EventPacker.addMiddleware({ tag: this.Name, data: record.fromId }, record);
      } else if (
        record.fromId === player.Id &&
        !!AimGroupUtil.getAllTargets(record.allTargets).find(
          playerId => !player.getFlag<PlayerId[]>(SouYingShadow.Name)?.includes(playerId),
        )
      ) {
        const originalPlayers = player.getFlag<PlayerId[]>(SouYingShadow.Name) || [];
        originalPlayers.push(...Algorithm.unique(AimGroupUtil.getAllTargets(record.allTargets), originalPlayers));
        player.setFlag<PlayerId[]>(SouYingShadow.Name, originalPlayers);

        EventPacker.addMiddleware({ tag: SouYingShadow.Name, data: originalPlayers }, record);
      }
    }
  }

  public async whenLosingSkill(room: Room, player: Player) {
    player.removeFlag(this.Name);
    player.removeFlag(SouYingShadow.Name);
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.PhaseBegin;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAim;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      !owner.hasUsedSkill(this.Name) &&
      AimGroupUtil.getAllTargets(event.allTargets).length === 1 &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      ((event.fromId !== owner.Id &&
        event.toId === owner.Id &&
        EventPacker.getMiddleware<PlayerId>(this.Name, event) !== event.fromId) ||
        (event.fromId === owner.Id &&
          event.toId !== owner.Id &&
          !EventPacker.getMiddleware<PlayerId[]>(SouYingShadow.Name, event)?.includes(event.toId)))
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      event.fromId === owner.Id
        ? '{0}: do you want to discard a card to obtain {1} ?'
        : '{0}: do you want to discard a card to let {1} nullify to you?',
      this.Name,
      TranslationPack.patchCardInTranslation(event.byCardId),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId, event.fromId, this.Name);

    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    if (aimEvent.fromId === event.fromId) {
      room.isCardOnProcessing(aimEvent.byCardId) &&
        (await room.moveCards({
          movingCards: [{ card: aimEvent.byCardId, fromArea: CardMoveArea.ProcessingArea }],
          toId: event.fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: event.fromId,
          triggeredBySkills: [this.Name],
        }));
    } else {
      aimEvent.nullifiedTargets?.push(event.fromId);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: SouYing.Name, description: SouYing.Description })
export class SouYingShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public getPriority(): StagePriority {
    return StagePriority.High;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAim;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      (event.fromId !== owner.Id &&
        event.toId === owner.Id &&
        !owner.getFlag<PlayerId[]>(this.GeneralName)?.includes(event.fromId)) ||
      (event.fromId === owner.Id &&
        event.toId !== owner.Id &&
        !!AimGroupUtil.getAllTargets(event.allTargets).find(
          playerId => !owner.getFlag<PlayerId[]>(this.Name)?.includes(playerId),
        ))
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    if (aimEvent.fromId === event.fromId) {
      const originalPlayers = room.getFlag<PlayerId[]>(event.fromId, this.Name) || [];
      originalPlayers.push(...Algorithm.unique(AimGroupUtil.getAllTargets(aimEvent.allTargets), originalPlayers));
      room.getPlayerById(event.fromId).setFlag<PlayerId[]>(this.Name, originalPlayers);

      EventPacker.addMiddleware({ tag: this.Name, data: originalPlayers }, aimEvent);
    } else {
      const originalPlayers = room.getFlag<PlayerId[]>(event.fromId, this.GeneralName) || [];
      originalPlayers.push(aimEvent.fromId);
      room.getPlayerById(event.fromId).setFlag<PlayerId[]>(this.GeneralName, originalPlayers);

      EventPacker.addMiddleware({ tag: this.GeneralName, data: aimEvent.fromId }, aimEvent);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: SouYingShadow.Name, description: SouYingShadow.Description })
export class SouYingRemover extends TriggerSkill {
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
      event.from === PlayerPhase.PhaseFinish &&
      (owner.getFlag<PlayerId[]>(this.GeneralName) !== undefined ||
        owner.getFlag<PlayerId[]>(SouYingShadow.Name) !== undefined)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.getPlayerById(event.fromId).removeFlag(this.GeneralName);
    room.getPlayerById(event.fromId).removeFlag(SouYingShadow.Name);

    return true;
  }
}

import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AimStage, AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  CircleSkill,
  CommonSkill,
  OnDefineReleaseTiming,
  PersistentSkill,
  ShadowSkill,
  TriggerSkill,
} from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CircleSkill
@CommonSkill({ name: 'jianyu', description: 'jianyu_description' })
export class JianYu extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets(): number {
    return 2;
  }

  public isAvailableTarget(): boolean {
    return true;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId, selectedCards: CardId[]): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { toIds } = event;
    if (!toIds || toIds.length !== 2) {
      return false;
    }

    const firstTarget = room.getFlag<PlayerId[]>(toIds[0], this.Name) || [];
    const secondTarget = room.getFlag<PlayerId[]>(toIds[1], this.Name) || [];

    firstTarget.push(toIds[1]);
    secondTarget.push(toIds[0]);

    room.setFlag<PlayerId[]>(
      toIds[0],
      this.Name,
      firstTarget,
      TranslationPack.translationJsonPatcher(
        'jianyu target: {0}',
        TranslationPack.patchPlayerInTranslation(...firstTarget.map(playerId => room.getPlayerById(playerId))),
      ).toString(),
    );

    room.setFlag<PlayerId[]>(
      toIds[1],
      this.Name,
      secondTarget,
      TranslationPack.translationJsonPatcher(
        'jianyu target: {0}',
        TranslationPack.patchPlayerInTranslation(...secondTarget.map(playerId => room.getPlayerById(playerId))),
      ).toString(),
    );

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: JianYu.Name, description: JianYu.Description })
export class JianYuShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return (
      room.CurrentPlayer.Id === owner &&
      room.CurrentPlayerPhase === PlayerPhase.PhaseBegin &&
      stage === PhaseChangeStage.AfterPhaseChanged
    );
  }

  private clearFlag(room: Room, owner: PlayerId) {
    for (const player of room.getAlivePlayersFrom()) {
      if (player.getFlag<PlayerId[]>(this.GeneralName)) {
        room.removeFlag(player.Id, this.GeneralName);
      }
    }
  }

  public async whenDead(room: Room, player: Player) {
    this.clearFlag(room, player.Id);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === AimStage.OnAim || stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = content as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      const targets = room.getFlag<PlayerId[]>(aimEvent.fromId, this.GeneralName);
      return targets && targets.includes(aimEvent.toId);
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.toPlayer === owner.Id && phaseChangeEvent.to === PlayerPhase.PhaseBegin;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      await room.drawCards(1, aimEvent.toId, 'top', fromId, this.GeneralName);
    } else {
      this.clearFlag(room, fromId);
    }

    return true;
  }
}

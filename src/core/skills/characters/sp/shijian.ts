import { YuXu } from './yuxu';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'shijian', description: 'shijian_description' })
export class ShiJian extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenObtainingSkill(room: Room, owner: Player) {
    room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      room.CurrentPhasePlayer !== undefined &&
      room.CurrentPhasePlayer !== owner &&
      owner.setFlag<number>(this.Name, room.Analytics.getCardUseRecord(room.CurrentPlayer.Id, 'phase').length);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      content.fromId !== owner.Id &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      room.CurrentPhasePlayer === room.getPlayerById(content.fromId) &&
      EventPacker.getMiddleware<boolean>(this.Name, content) === true &&
      owner.getPlayerCards().length > 0 &&
      !room.getPlayerById(content.fromId).Dead
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
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to discard a card to let {1} obtain ‘Yu Xu’?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId, event.fromId, this.Name);

    const user = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).fromId;
    if (!room.getPlayerById(user).hasSkill(YuXu.Name)) {
      await room.obtainSkill(user, YuXu.Name);
      await room.obtainSkill(user, ShiJianRemover.Name);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ShiJian.Name, description: ShiJian.Description })
export class ShiJianRecorder extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public async whenDead(room: Room, owner: Player) {
    owner.removeFlag(this.GeneralName);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.BeforeCardUseEffect || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        cardUseEvent.fromId !== owner.Id &&
        room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
        room.CurrentPhasePlayer === room.getPlayerById(cardUseEvent.fromId)
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      return (
        (content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).from === PlayerPhase.PlayCardStage &&
        owner.getFlag<number>(this.GeneralName) !== undefined
      );
    }

    return false;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      let originTimes = room.getFlag<number>(event.fromId, this.GeneralName) || 0;
      originTimes++;
      room.getPlayerById(event.fromId).setFlag<number>(this.GeneralName, originTimes);
      originTimes === 2 && EventPacker.addMiddleware({ tag: this.GeneralName, data: true }, unknownEvent);
    } else {
      room.removeFlag(event.fromId, this.GeneralName);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_shijian_remover', description: 's_shijian_remover_description' })
export class ShiJianRemover extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public async whenDead(room: Room, owner: Player) {
    owner.hasSkill(YuXu.Name) && (await room.loseSkill(owner.Id, YuXu.Name));
    await room.loseSkill(owner.Id, this.Name);
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

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return content.from === PlayerPhase.PhaseFinish;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    room.getPlayerById(event.fromId).hasSkill(YuXu.Name) && (await room.loseSkill(event.fromId, YuXu.Name));
    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}

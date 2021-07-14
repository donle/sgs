import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, OnDefineReleaseTiming, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yingyuan', description: 'yingyuan_description' })
export class YingYuan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    const yingYuanUsed = owner.getFlag<string[]>(this.Name) || [];
    return (
      room.CurrentPlayer === owner &&
      content.fromId === owner.Id &&
      room.isCardOnProcessing(content.cardId) &&
      !yingYuanUsed.includes(Sanguosha.getCardById(content.cardId).GeneralName)
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    return targetId !== owner;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to give {1} to another player?',
      this.Name,
      TranslationPack.patchCardInTranslation(event.cardId),
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds, triggeredOnEvent } = event;
    const toId = Precondition.exists(toIds, 'Unable to get yingyuan target')[0];
    const cardUseEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

    if (room.isCardOnProcessing(cardUseEvent.cardId)) {
      await room.moveCards({
        movingCards: [{ card: cardUseEvent.cardId, fromArea: CardMoveArea.ProcessingArea }],
        toId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: fromId,
      });

      const from = room.getPlayerById(fromId);
      const yingYuanUsed = from.getFlag<string[]>(this.Name) || [];
      yingYuanUsed.push(Sanguosha.getCardById(cardUseEvent.cardId).GeneralName);
      from.setFlag<string[]>(this.Name, yingYuanUsed);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: YingYuan.Name, description: YingYuan.Description })
export class YingYuanShadow extends TriggerSkill implements OnDefineReleaseTiming {
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

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return owner.getFlag<string[]>(this.GeneralName) && content.from === PlayerPhase.PhaseFinish;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}

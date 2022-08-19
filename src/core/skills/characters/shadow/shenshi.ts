import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { DamageType } from 'core/game/game_props';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, SwitchSkillState, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { PersistentSkill, ShadowSkill, SwitchSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@SwitchSkill()
@CommonSkill({ name: 'shenshi', description: 'shenshi_description' })
export class ShenShi extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getSwitchSkillState(this.Name, true) === SwitchSkillState.Yang;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      owner !== target &&
      room
        .getOtherPlayers(owner)
        .find(
          player =>
            player.getCardIds(PlayerCardsArea.HandArea).length >
            room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length,
        ) === undefined
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId, selectedCards: CardId[]): boolean {
    return true;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds, cardIds } = event;
    if (!toIds || !cardIds) {
      return false;
    }

    await room.moveCards({
      movingCards: [{ card: cardIds[0], fromArea: room.getPlayerById(fromId).cardFrom(cardIds[0]) }],
      fromId,
      toId: toIds[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      triggeredBySkills: [this.Name],
    });

    await room.damage({
      fromId,
      toId: toIds[0],
      damage: 1,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    });

    if (room.getPlayerById(toIds[0]).Dead) {
      const targets = room
        .getAlivePlayersFrom()
        .filter(player => player.getCardIds(PlayerCardsArea.HandArea).length < 4)
        .map(player => player.Id);
      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players: targets,
          toId: fromId,
          requiredAmount: 1,
          conversation: 'shenshi: do you want to choose a target to draw cards?',
          triggeredBySkills: [this.Name],
        },
        fromId,
      );

      if (resp.selectedPlayers && resp.selectedPlayers.length > 0) {
        const targetId = resp.selectedPlayers[0];
        await room.drawCards(
          4 - room.getPlayerById(targetId).getCardIds(PlayerCardsArea.HandArea).length,
          targetId,
          'top',
          fromId,
          this.Name,
        );
      }
    }

    return true;
  }
}

@ShadowSkill
@SwitchSkill()
@CommonSkill({ name: ShenShi.Name, description: ShenShi.Description })
export class ShenShiYin extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.toId === owner.Id &&
      owner.getSwitchSkillState(this.GeneralName, true) === SwitchSkillState.Yin &&
      content.fromId !== undefined &&
      content.fromId !== owner.Id &&
      !room.getPlayerById(content.fromId).Dead &&
      room.getPlayerById(content.fromId).getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to view {1}’s hand cards?',
      this.GeneralName,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId!)),
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const from = room.getPlayerById(fromId);
    const source = (triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId!;

    room.displayCards(source, room.getPlayerById(source).getCardIds(PlayerCardsArea.HandArea), [fromId]);

    if (from.getCardIds(PlayerCardsArea.HandArea).length > 0) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardEvent>({
          cardAmount: 1,
          toId: fromId,
          reason: this.GeneralName,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: you need to give a handcard to {1}',
            this.GeneralName,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(source)),
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea],
          triggeredBySkills: [this.GeneralName],
        }),
        fromId,
      );

      response.selectedCards = response.selectedCards || from.getCardIds(PlayerCardsArea.HandArea)[0];

      await room.moveCards({
        movingCards: [{ card: response.selectedCards[0], fromArea: CardMoveArea.HandArea }],
        fromId,
        toId: source,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        triggeredBySkills: [this.GeneralName],
      });

      const originalIds = from.getFlag<CardId[]>(this.GeneralName) || [];
      originalIds.push(response.selectedCards[0]);
      from.setFlag<CardId[]>(this.GeneralName, originalIds);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ShenShiYin.Name, description: ShenShiYin.Description })
export class ShenShiShadow extends TriggerSkill implements OnDefineReleaseTiming {
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

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    const shenshiIds = owner.getFlag<CardId[]>(this.GeneralName);
    return (
      content.fromPlayer !== undefined &&
      content.fromPlayer !== owner.Id &&
      content.from === PlayerPhase.PhaseFinish &&
      shenshiIds !== undefined &&
      room
        .getPlayerById(content.fromPlayer)
        .getPlayerCards()
        .find(id => shenshiIds.includes(id)) !== undefined
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const from = room.getPlayerById(event.fromId);

    from.removeFlag(this.GeneralName);
    const n = 4 - from.getCardIds(PlayerCardsArea.HandArea).length;
    if (n > 0) {
      await room.drawCards(n, event.fromId, 'top', event.fromId, this.GeneralName);
    }

    return true;
  }
}

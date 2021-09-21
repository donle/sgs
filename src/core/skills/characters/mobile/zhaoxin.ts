import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhaoxin', description: 'zhaoxin_description' })
export class ZhaoXin extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return (
      !owner.hasUsedSkill(this.Name) &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length < 3 &&
      owner.getPlayerCards().length > 0
    );
  }

  public numberOfTargets(): number {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0 && cards.length <= 3 - owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, cardIds } = event;
    if (!cardIds) {
      return false;
    }

    await room.moveCards({
      movingCards: cardIds.map(card => ({ card, fromArea: room.getPlayerById(fromId).cardFrom(card) })),
      fromId,
      toId: fromId,
      toArea: CardMoveArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      isOutsideAreaInPublic: true,
      toOutsideArea: this.Name,
      triggeredBySkills: [this.Name],
    });

    await room.drawCards(cardIds.length, fromId, 'top', fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: ZhaoXin.Name, description: ZhaoXin.Description })
export class ZhaoXinShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.DrawCardStageEnd;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      owner.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length > 0 &&
      (event.playerId === owner.Id || room.withinAttackDistance(owner, room.getPlayerById(event.playerId)))
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const playerId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId;
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardEvent>(
      GameEventIdentifiers.AskForChoosingCardEvent,
      {
        toId: playerId,
        cardIds: room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName),
        amount: 1,
        customTitle: TranslationPack.translationJsonPatcher(
          '{0}: you can choose a card to gain. If you do this, {1} can deal 1 damage to you',
          this.GeneralName,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
        ).toString(),
        triggeredBySkills: [this.GeneralName],
      },
      playerId,
    );

    if (response.selectedCards && response.selectedCards.length > 0) {
      event.cardIds = response.selectedCards;
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.cardIds) {
      return false;
    }

    const playerId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId;
    await room.moveCards({
      movingCards: [{ card: event.cardIds[0], fromArea: CardMoveArea.OutsideArea }],
      fromId: event.fromId,
      toId: playerId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: playerId,
      triggeredBySkills: [this.GeneralName],
    });

    const { selectedOption } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        toId: event.fromId,
        options: ['yes', 'no'],
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: do you want to deal 1 damage to {1} ?',
          this.GeneralName,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(playerId)),
        ).extract(),
      },
      event.fromId,
      true,
    );

    if (selectedOption === 'yes') {
      await room.damage({
        fromId: event.fromId,
        toId: playerId,
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.GeneralName],
      });
    }

    return true;
  }
}

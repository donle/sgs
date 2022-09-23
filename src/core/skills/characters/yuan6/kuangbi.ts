import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

type KuangBiMapper = { [playerId: string]: number };

@CommonSkill({ name: 'kuangbi', description: 'kuangbi_description' })
export class KuangBi extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && room.getPlayerById(target).getPlayerCards().length > 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  public async onUse() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.toIds) {
      return false;
    }

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
      GameEventIdentifiers.AskForCardEvent,
      {
        cardAmountRange: [1, 3],
        toId: event.toIds[0],
        reason: this.Name,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please put at least 1 and less than 3 cards onto {1} ’s general card as ‘bi’',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
        ).extract(),
        fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        triggeredBySkills: [this.Name],
      },
      event.toIds[0],
      true,
    );

    const destHandCards = room.getPlayerById(event.toIds[0]).getPlayerCards();
    response.selectedCards = response.selectedCards || [
      destHandCards[Math.floor(Math.random() * destHandCards.length)],
    ];

    await room.moveCards({
      movingCards: response.selectedCards.map(card => ({
        card,
        fromArea: room.getPlayerById(event.toIds![0]).cardFrom(card),
      })),
      fromId: event.toIds[0],
      toId: event.fromId,
      toArea: CardMoveArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: event.toIds[0],
      toOutsideArea: this.Name,
      isOutsideAreaInPublic: false,
      triggeredBySkills: [this.Name],
    });

    const originalMapper = room.getFlag<KuangBiMapper>(event.fromId, this.Name) || {};
    originalMapper[event.toIds[0]] = originalMapper[event.toIds[0]] || 0;
    originalMapper[event.toIds[0]] += response.selectedCards.length;

    room.getPlayerById(event.fromId).setFlag<KuangBiMapper>(this.Name, originalMapper);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: KuangBi.Name, description: KuangBi.Description })
export class KuangBiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return content.toStage === PlayerPhaseStages.PrepareStageStart && stage === PhaseStageChangeStage.StageChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

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
      content.toStage === PlayerPhaseStages.PrepareStageStart &&
      (owner.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length > 0 ||
        owner.getFlag<KuangBiMapper>(this.GeneralName) !== undefined)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const bi = room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName);
    bi.length > 0 &&
      (await room.moveCards({
        movingCards: bi.map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
        fromId: event.fromId,
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.GeneralName],
      }));

    const kuangbiMapper = room.getFlag<KuangBiMapper>(event.fromId, this.GeneralName);
    if (kuangbiMapper) {
      for (const [playerId, drawNum] of Object.entries(kuangbiMapper)) {
        room.getPlayerById(playerId).Dead ||
          (await room.drawCards(drawNum, playerId, 'top', event.fromId, this.GeneralName));
      }

      room.getPlayerById(event.fromId).removeFlag(this.GeneralName);
    }

    return true;
  }
}

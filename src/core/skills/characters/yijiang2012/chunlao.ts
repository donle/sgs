import { VirtualCard } from 'core/cards/card';
import { Alcohol } from 'core/cards/legion_fight/alcohol';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerDyingStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'chunlao', description: 'chunlao_description' })
export class ChunLao extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      event.playerId === owner.Id &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length === 0 &&
      owner.getCardIds(PlayerCardsArea.HandArea)
        .find(cardId => Sanguosha.getCardById(cardId).GeneralName === 'slash') !== undefined
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return Sanguosha.getCardById(cardId).GeneralName === 'slash';
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to put at least one slash on your general card?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, cardIds } = event;

    await room.moveCards({
      movingCards: cardIds!.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      fromId,
      toId: fromId,
      toArea: PlayerCardsArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      toOutsideArea: this.Name,
      isOutsideAreaInPublic: true,
      proposer: fromId,
      movedByReason: this.Name,
    });

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: ChunLao.Name, description: ChunLao.Description })
export class ChunLaoShadow extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PlayerDyingStage.PlayerDying;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>,
  ): boolean {
    return (
      room.getPlayerById(event.dying).Hp < 1 &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    const ownerPlayer = room.getPlayerById(owner);
    return ownerPlayer.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).includes(cardId);
  }

  public availableCardAreas() {
    return [PlayerCardsArea.OutsideArea];
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to remove a Chun to let {1} uses an alchol?',
      this.Name,
      TranslationPack.patchCardInTranslation(event.cardId),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, cardIds, triggeredOnEvent } = event;
    const playerDyingEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>;

    const chun = Sanguosha.getCardById(cardIds![0]);
    await room.moveCards({
      movingCards: [{ card: cardIds![0], fromArea: CardMoveArea.OutsideArea }],
      fromId,
      moveReason: CardMoveReason.PlaceToDropStack,
      toArea: CardMoveArea.DropStack,
      proposer: fromId,
      movedByReason: this.GeneralName,
    });

    const alcohol = VirtualCard.create<Alcohol>(
      {
        cardName: 'alcohol',
        bySkill: this.GeneralName,
      },
    );

    const user = room.getPlayerById(playerDyingEvent.dying);
    if (user.canUseCardTo(room, alcohol.Id, playerDyingEvent.dying)) {
      await room.useCard({
        fromId: playerDyingEvent.dying,
        cardId: alcohol.Id,
        toIds: [playerDyingEvent.dying],
      });

      if (chun.Name === 'thunder_slash') {
        await room.drawCards(2, fromId, 'top', fromId, this.GeneralName);
      } else if (chun.Name === 'fire_slash') {
        await room.recover({
          toId: fromId,
          recoveredHp: 1,
          recoverBy: fromId,
        });
      }
    }

    return true;
  }
}

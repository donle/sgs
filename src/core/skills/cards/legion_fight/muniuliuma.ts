import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'muniuliuma', description: 'muniuliuma_description' })
export class MuNiuLiuMaSkill extends ActiveSkill implements OnDefineReleaseTiming {
  get Muted() {
    return true;
  }

  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length < 5;
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PlayCardStage;
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }
  public isAvailableCard(): boolean {
    return true;
  }
  public isAvailableTarget(): boolean {
    return false;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public async whenLosingSkill(room: Room, player: Player) {
    const cards = player.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName);

    await room.moveCards({
      movingCards: cards.map(card => ({ card, fromArea: PlayerCardsArea.OutsideArea })),
      toArea: CardMoveArea.DropStack,
      fromId: player.Id,
      moveReason: CardMoveReason.PlaceToDropStack,
      movedByReason: this.Name,
      proposer: player.Id,
    });
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, cardIds } = event;
    const from = room.getPlayerById(fromId);
    await room.moveCards({
      movingCards: [{ card: cardIds![0], fromArea: PlayerCardsArea.HandArea }],
      moveReason: CardMoveReason.ActiveMove,
      movedByReason: this.Name,
      fromId,
      toArea: CardMoveArea.OutsideArea,
      toId: fromId,
      toOutsideArea: this.Name,
      isOutsideAreaInPublic: false,
      proposer: fromId,
      engagedPlayerIds: [fromId],
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} move cards {1} onto the top of {2} character card',
        TranslationPack.patchPlayerInTranslation(from),
        TranslationPack.patchCardInTranslation(...cardIds!),
        TranslationPack.patchPlayerInTranslation(from),
      ).extract(),
      unengagedMessage: TranslationPack.translationJsonPatcher(
        '{0} move {1} cards onto the top of {2} character card',
        TranslationPack.patchPlayerInTranslation(from),
        cardIds!.length,
        TranslationPack.patchPlayerInTranslation(from),
      ).extract(),
    });

    const askForDeliverTo: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      players: room
        .getOtherPlayers(fromId)
        .filter(player => player.getEquipment(CardType.Precious) === undefined)
        .map(p => p.Id),
      toId: fromId,
      conversation: 'do you wish to deliver muniuliuma to another player?',
      requiredAmount: 1,
    };

    room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, askForDeliverTo, fromId);
    const { selectedPlayers } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      fromId,
    );

    if (selectedPlayers !== undefined && selectedPlayers.length > 0) {
      const toId = selectedPlayers[0];
      const to = room.getPlayerById(toId);
      await room.asyncMoveCards([
        {
          movingCards: [{ card: from.getEquipment(CardType.Precious)!, fromArea: PlayerCardsArea.EquipArea }],
          toArea: PlayerCardsArea.EquipArea,
          toId,
          fromId,
          moveReason: CardMoveReason.ActiveMove,
          movedByReason: this.Name,
          proposer: fromId,
          translationsMessage: TranslationPack.translationJsonPatcher(
            '{0} place card {1} from {2} into equip area of {3}',
            TranslationPack.patchPlayerInTranslation(from),
            TranslationPack.patchCardInTranslation(...cardIds!),
            TranslationPack.patchPlayerInTranslation(from),
            TranslationPack.patchPlayerInTranslation(to),
          ).extract(),
        },
        {
          movingCards: from
            .getCardIds(PlayerCardsArea.OutsideArea, this.Name)
            .map(card => ({ card, fromArea: PlayerCardsArea.OutsideArea })),
          fromId,
          toId,
          toArea: CardMoveArea.OutsideArea,
          toOutsideArea: this.Name,
          isOutsideAreaInPublic: false,
          engagedPlayerIds: [fromId, toId],
          moveReason: CardMoveReason.ActiveMove,
          movedByReason: this.Name,
          proposer: fromId,
          translationsMessage: TranslationPack.translationJsonPatcher(
            '{0} move cards {1} onto the top of {2} character card',
            TranslationPack.patchPlayerInTranslation(from),
            TranslationPack.patchCardInTranslation(...cardIds!),
            TranslationPack.patchPlayerInTranslation(to),
          ).extract(),
          unengagedMessage: TranslationPack.translationJsonPatcher(
            '{0} move {1} cards onto the top of {2} character card',
            TranslationPack.patchPlayerInTranslation(from),
            cardIds!.length,
            TranslationPack.patchPlayerInTranslation(to),
          ).extract(),
        },
      ]);
    }
    return true;
  }
}

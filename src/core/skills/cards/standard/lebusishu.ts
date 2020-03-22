import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { LeBuSiShu } from 'core/cards/standard/lebusishu';
import { CardLostReason, ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, TriggerableTimes } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
@TriggerableTimes(INFINITE_TRIGGERING_TIMES)
export class LeBuSiShuSkill extends ActiveSkill {
  constructor() {
    super('lebusishu', 'lebusishu_description');
  }

  public canUse(room: Room, owner: Player) {
    return true;
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }
  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }
  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return (
      owner !== target &&
      room.getPlayerById(owner).canUseCardTo(room, containerCard, target) &&
      room
        .getPlayerById(target)
        .getCardIds(PlayerCardsArea.JudgeArea)
        .find(cardId => Sanguosha.getCardById(cardId) instanceof LeBuSiShu) === undefined
    );
  }

  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    await room.moveCards(
      [event.cardId],
      event.fromId,
      event.toIds![0],
      CardLostReason.CardUse,
      PlayerCardsArea.HandArea,
      PlayerCardsArea.JudgeArea,
    );

    return true;
  }
  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, cardId } = event;

    const judgeEvent = await room.judge(toIds![0], cardId, this.name);

    const card = Sanguosha.getCardById(judgeEvent.judgeCardId);
    if (card.Suit !== CardSuit.Heart) {
      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} skipped play stage',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(toIds![0])),
        ).extract(),
      });

      room.skip(toIds![0], PlayerPhase.PlayCardStage);
    }
    return true;
  }
}

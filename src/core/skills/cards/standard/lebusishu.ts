import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardLostReason, ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
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
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return (
      owner !== target &&
      room.getPlayerById(owner).canUseCardTo(room, containerCard, target) &&
      room
        .getPlayerById(target)
        .getCardIds(PlayerCardsArea.JudgeArea)
        .find(cardId => Sanguosha.getCardById(cardId).GeneralName === 'lebusishu') === undefined
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
    const to = Precondition.exists(toIds, 'Unknown targets in lebusishu')[0];

    const judgeEvent = await room.judge(to, cardId, this.name);

    const card = Sanguosha.getCardById(judgeEvent.judgeCardId);
    if (card.Suit !== CardSuit.Heart) {
      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} skipped play stage',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(to)),
        ).extract(),
      });

      room.skip(to, PlayerPhase.PlayCardStage);
    }
    return true;
  }
}

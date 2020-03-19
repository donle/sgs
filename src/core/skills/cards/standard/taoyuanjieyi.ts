import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, TriggerableTimes } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
@TriggerableTimes(INFINITE_TRIGGERING_TIMES)
export class TaoYuanJieYiSkill extends ActiveSkill {
  constructor() {
    super('taoyuanjieyi', 'taoyuanjieyi_description');
  }

  public canUse() {
    return true;
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 0;
  }
  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }
  public isAvailableTarget(): boolean {
    return false;
  }
  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const others = room.getOtherPlayers(event.fromId);

    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} used card {1} to {2}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      TranslationPack.patchCardInTranslation(event.cardId),
      TranslationPack.wrapArrayParams(...room.getAlivePlayersFrom(event.fromId).map(target => target.Character.Name)),
    ).extract();
    event.toIds = others.map(player => player.Id);
    return true;
  }

  public async beforeEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const player = room.getPlayerById(event.toIds![0]);
    if (player.MaxHp === player.Hp) {
      EventPacker.terminate(event);
      return false;
    }

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, cardId } = event;
    await room.recover({
      cardIds: [cardId],
      recoveredHp: 1,
      toId: toIds![0],
    });

    return true;
  }
}

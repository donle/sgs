import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'god_huishi', description: 'god_huishi_description' })
export class GodHuiShi extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.MaxHp < 10;
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;

    let judgeCardIds: CardId[] = [];
    const judge = await room.judge(fromId, undefined, this.Name);
    judgeCardIds.push(judge.judgeCardId);

    do {
      const { selectedOption } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          toId: fromId,
          options: ['yes', 'no'],
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: do you want to gain a max hp and judge again?',
            this.Name,
          ).extract(),
        },
        fromId,
        true,
      );
      if (selectedOption !== 'yes') {
        break;
      }

      await room.changeMaxHp(fromId, 1);
      const judgeEvent = await room.judge(fromId, undefined, this.Name);
      judgeCardIds.push(judgeEvent.judgeCardId);
      if (
        judgeCardIds.find(
          id =>
            id !== judgeEvent.judgeCardId &&
            Sanguosha.getCardById(id).Suit === Sanguosha.getCardById(judgeEvent.judgeCardId).Suit,
        )
      ) {
        break;
      }
    } while (judgeCardIds.length < 4 && room.getPlayerById(fromId).MaxHp < 10);

    judgeCardIds = judgeCardIds.filter(id => room.isCardInDropStack(id));
    if (judgeCardIds.length === 0) {
      return false;
    }

    const observeCardsEvent: ServerEventFinder<GameEventIdentifiers.ObserveCardsEvent> = {
      cardIds: judgeCardIds,
      selected: [],
    };
    room.notify(GameEventIdentifiers.ObserveCardsEvent, observeCardsEvent, fromId);

    const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players: room.getAlivePlayersFrom().map(player => player.Id),
        toId: fromId,
        requiredAmount: 1,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose a target to gain these cards',
          this.Name,
        ).extract(),
        triggeredBySkills: [this.Name],
      },
      fromId,
      true,
    );

    room.notify(GameEventIdentifiers.ObserveCardFinishEvent, {}, fromId);

    resp.selectedPlayers = resp.selectedPlayers || [fromId];

    await room.moveCards({
      movingCards: judgeCardIds.map(card => ({ card, fromArea: CardMoveArea.DropStack })),
      toId: resp.selectedPlayers[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });

    room
      .getOtherPlayers(resp.selectedPlayers[0])
      .find(
        player =>
          room.getPlayerById(resp.selectedPlayers![0]).getCardIds(PlayerCardsArea.HandArea).length <
          player.getCardIds(PlayerCardsArea.HandArea).length,
      ) || (await room.changeMaxHp(fromId, -1));

    return true;
  }
}

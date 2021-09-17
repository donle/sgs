import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { JiJun } from './jijun';

@CommonSkill({ name: 'fangtong', description: 'fangtong_description' })
export class FangTong extends TriggerSkill {
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
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, JiJun.Name).length > 0 &&
      owner.getPlayerCards().length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return room.canDropCard(owner, cardId);
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, cardIds } = event;
    if (!cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);

    const fang = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.OutsideArea, JiJun.Name);
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
      GameEventIdentifiers.AskForCardEvent,
      {
        cardAmountRange: [1, fang.length],
        toId: fromId,
        reason: this.Name,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose at least 1 ‘Fang’ to remove',
          this.Name,
        ).extract(),
        fromArea: [PlayerCardsArea.OutsideArea],
        cardMatcher: new CardMatcher({ cards: fang }).toSocketPassenger(),
        triggeredBySkills: [this.Name],
      },
      fromId,
      true,
    );

    response.selectedCards = response.selectedCards || fang[Math.floor(Math.random() * fang.length)];

    await room.dropCards(CardMoveReason.SelfDrop, response.selectedCards, fromId, fromId, this.Name);

    if (
      Sanguosha.getCardById(cardIds[0]).CardNumber +
        response.selectedCards.reduce<number>((sum, id) => {
          return sum + Sanguosha.getCardById(id).CardNumber;
        }, 0) ===
      36
    ) {
      const others = room.getOtherPlayers(fromId).map(player => player.Id);
      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players: others,
          toId: fromId,
          requiredAmount: 1,
          conversation: 'fangtong: please choose a target to deal 3 thunder damage to him?',
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      resp.selectedPlayers = resp.selectedPlayers || [others[Math.floor(Math.random() * others.length)]];

      await room.damage({
        fromId,
        toId: resp.selectedPlayers[0],
        damage: 3,
        damageType: DamageType.Thunder,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}

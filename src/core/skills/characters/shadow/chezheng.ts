import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { GlobalFilterSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'chezheng', description: 'chezheng_description' })
export class CheZheng extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    if (owner.Id === content.playerId && PlayerPhaseStages.PlayCardStageEnd === content.toStage) {
      const targets = room.getOtherPlayers(owner.Id).filter(player => !room.withinAttackDistance(player, owner));

      return (
        room.Analytics.getCardUseRecord(owner.Id, 'phase').length < targets.length &&
        targets.find(player => player.getPlayerCards().length > 0) !== undefined
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;

    const players = room
      .getOtherPlayers(fromId)
      .filter(
        player => !room.withinAttackDistance(player, room.getPlayerById(fromId)) && player.getPlayerCards().length > 0,
      )
      .map(player => player.Id);
    if (players.length === 0) {
      return false;
    }

    const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players,
        toId: fromId,
        requiredAmount: 1,
        conversation: 'chezheng: please choose a target to drop a card from him?',
        triggeredBySkills: [this.Name],
      },
      fromId,
      true,
    );

    resp.selectedPlayers = resp.selectedPlayers || [players[Math.floor(Math.random() * players.length)]];

    const toId = resp.selectedPlayers[0];
    const to = room.getPlayerById(toId);
    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent =
      {
        fromId,
        toId,
        options,
      };

    const response = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, true, true);
    if (!response) {
      return false;
    }

    await room.dropCards(CardMoveReason.PassiveDrop, [response.selectedCard!], toId, fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: CheZheng.Name, description: CheZheng.Description })
export class CheZhengShadow extends GlobalFilterSkill {
  public canUseCardTo(_: CardId | CardMatcher, room: Room, owner: Player, from: Player, to: Player): boolean {
    return !(
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      room.CurrentPhasePlayer === owner &&
      owner === from &&
      owner !== to &&
      !room.withinAttackDistance(to, owner)
    );
  }
}

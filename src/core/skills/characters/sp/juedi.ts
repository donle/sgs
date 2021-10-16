import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { YinBing } from 'core/skills';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'juedi', description: 'juedi_description' })
export class JueDi extends TriggerSkill {
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
      owner.getCardIds(PlayerCardsArea.OutsideArea, YinBing.Name).length > 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const from = room.getPlayerById(event.fromId);
    const targets = room
      .getOtherPlayers(event.fromId)
      .filter(player => player.Hp <= from.Hp)
      .map(player => player.Id);

    if (targets.length > 0) {
      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players: targets,
          toId: event.fromId,
          requiredAmount: 1,
          conversation:
            'juedi: please choose a target to give all your ‘Yin Bing’ to him, or you remove all your ‘Yin Bing’',
          triggeredBySkills: [this.Name],
        },
        event.fromId,
      );

      if (resp.selectedPlayers && resp.selectedPlayers.length > 0) {
        const num = from.getCardIds(PlayerCardsArea.OutsideArea, YinBing.Name).length;

        await room.moveCards({
          movingCards: from
            .getCardIds(PlayerCardsArea.OutsideArea, YinBing.Name)
            .map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
          fromId: event.fromId,
          toId: resp.selectedPlayers[0],
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: event.fromId,
          triggeredBySkills: [this.Name],
        });

        await room.recover({
          toId: resp.selectedPlayers[0],
          recoveredHp: 1,
          recoverBy: event.fromId,
        });

        await room.drawCards(num, resp.selectedPlayers[0], 'top', event.fromId, this.Name);

        return true;
      }
    }

    await room.moveCards({
      movingCards: from
        .getCardIds(PlayerCardsArea.OutsideArea, YinBing.Name)
        .map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
      fromId: event.fromId,
      toArea: CardMoveArea.DropStack,
      moveReason: CardMoveReason.PlaceToDropStack,
      proposer: event.fromId,
      triggeredBySkills: [this.Name],
    });

    const diff = from.MaxHp - from.getCardIds(PlayerCardsArea.HandArea).length;
    diff > 0 && (await room.drawCards(diff, event.fromId, 'top', event.fromId, this.Name));

    return true;
  }
}

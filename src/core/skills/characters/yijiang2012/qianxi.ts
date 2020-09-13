import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardColor, CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  CommonSkill,
  FilterSkill,
  OnDefineReleaseTiming,
  ShadowSkill,
  TriggerSkill,
} from 'core/skills/skill';

@CommonSkill({ name: 'qianxi', description: 'qianxi_description' })
export class QianXi extends TriggerSkill {
  public static readonly Red = 'qianxi_red';
  public static readonly Black = 'qianxi_black';

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
      owner.Id === content.playerId &&
      content.toStage === PlayerPhaseStages.PrepareStageStart
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId } = event;

    await room.drawCards(1, fromId, 'top', fromId, this.Name);

    if (room.getPlayerById(fromId).getPlayerCards().length < 1) {
      return false;
    }

    const response = await room.askForCardDrop(
      fromId,
      1,
      [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
      true,
      undefined,
      this.Name,
    );
    const color = Sanguosha.getCardById(response.droppedCards[0]).Color;
    await room.dropCards(
      CardMoveReason.SelfDrop,
      response.droppedCards,
      fromId,
      fromId,
      this.Name,
    );

    const players = room.getAlivePlayersFrom()
      .filter(player => room.distanceBetween(room.getPlayerById(fromId), player) === 1)
      .map(player => player.Id);

    if (players.length < 1) {
      return false;
    }

    const askForPlayerChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      toId: fromId,
      players,
      requiredAmount: 1,
      conversation: 'qianxi: please choose a target with 1 Distance(to you)',
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>(askForPlayerChoose),
      fromId
    );

    const resp = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingPlayerEvent, fromId);
    resp.selectedPlayers = resp.selectedPlayers || [players[0]];

    await room.obtainSkill(resp.selectedPlayers[0], QianXiBlock.Name);
    const flagName = color === CardColor.Black ? QianXi.Black : QianXi.Red;
    room.setFlag<CardColor>(resp.selectedPlayers[0], this.Name, color);
    room.setFlag<boolean>(resp.selectedPlayers[0], flagName, true, true);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: QianXi.Name, description: QianXi.Description })
export class QianXiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterDead(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public afterLosingSkill(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    return content.from === PlayerPhase.PhaseFinish;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room): Promise<boolean> {
    for (const player of room.AlivePlayers) {
      room.removeFlag(player.Id, this.GeneralName);
      room.removeFlag(player.Id, QianXi.Red);
      room.removeFlag(player.Id, QianXi.Black);
      if (player.hasSkill(QianXiBlock.Name)) {
        await room.loseSkill(player.Id, QianXiBlock.Name);
      }
    }
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: 'qianxiBlocker', description: 'qianxiBlocker_description' })
export class QianXiBlock extends FilterSkill {
  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    const color = room.getFlag<CardColor>(owner, QianXi.Name);
    if (color === undefined) {
      return true;
    }

    return cardId instanceof CardMatcher
      ? false
      : (
          room.getPlayerById(owner).cardFrom(cardId) !== PlayerCardsArea.HandArea ||
          Sanguosha.getCardById(cardId).Color !== color
        );
  }
}

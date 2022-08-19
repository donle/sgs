import { CardSuit } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'zuoding', description: 'zuoding_description' })
export class ZuoDing extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      content.fromId !== owner.Id &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      room.CurrentPhasePlayer.Id === content.fromId &&
      content.isFirstTarget &&
      Sanguosha.getCardById(content.byCardId).Suit === CardSuit.Spade &&
      room.Analytics.getRecordEvents<GameEventIdentifiers.DamageEvent>(
        event => EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent,
        undefined,
        'phase',
        undefined,
        1,
      ).length === 0
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const players = AimGroupUtil.getAllTargets(
      (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>).allTargets,
    );
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players,
        toId: event.fromId,
        requiredAmount: 1,
        conversation: 'zuoding: do you want to choose a target to draw a card?',
        triggeredBySkills: [this.Name],
      },
      event.fromId,
    );

    if (response.selectedPlayers && response.selectedPlayers.length > 0) {
      event.toIds = response.selectedPlayers;
      return true;
    }

    return false;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    await room.drawCards(1, toIds[0], 'top', fromId, this.Name);

    return true;
  }
}

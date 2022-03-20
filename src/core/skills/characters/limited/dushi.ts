import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PlayerDiedStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { GlobalFilterSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'dushi', description: 'dushi_description' })
export class DuShi extends TriggerSkill implements OnDefineReleaseTiming {
  public afterDead(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>, stage?: AllStage): boolean {
    return stage === PlayerDiedStage.PlayerDied;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>): boolean {
    return content.playerId === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const players = room.getOtherPlayers(event.fromId).map(player => player.Id);
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players,
        toId: event.fromId,
        requiredAmount: 1,
        conversation: 'dushi: please choose a target to gain this skill',
        triggeredBySkills: [this.Name],
      },
      event.fromId,
      true,
    );

    response.selectedPlayers = response.selectedPlayers || [players[Math.floor(Math.random() * players.length)]];
    await room.obtainSkill(response.selectedPlayers[0], this.Name, true);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: DuShi.Name, description: DuShi.Description })
export class DuShiShadow extends GlobalFilterSkill {
  canUseCardTo(cardId: CardId | CardMatcher, room: Room, owner: Player, from: Player, to: Player) {
    if (to !== owner || from === to || !to.Dying) {
      return true;
    }

    if (cardId instanceof CardMatcher) {
      return !cardId.match(new CardMatcher({ name: ['peach'] }));
    } else {
      return Sanguosha.getCardById(cardId).GeneralName !== 'peach';
    }
  }
}

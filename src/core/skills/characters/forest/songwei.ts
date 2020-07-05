import { CharacterNationality } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, JudgeEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, LordSkill } from 'core/skills/skill_wrappers';

@LordSkill
@CommonSkill({name: 'songwei', description: 'songwei_description'})
export class Songwei extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.JudgeEvent>, stage?: AllStage) {
    return stage === JudgeEffectStage.AfterJudgeEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.JudgeEvent>) {
    const to = room.getPlayerById(content.toId);
    return owner.Id !== content.toId && to.Nationality === CharacterNationality.Wei && Sanguosha.getCardById(content.judgeCardId).isBlack();
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(1, skillUseEvent.fromId);
    return true;
  }
}

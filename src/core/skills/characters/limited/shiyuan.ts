import { CharacterNationality } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AimStage, AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { YuWei } from './yuwei';

const enum ShiYuanEffect {
  MoreHp,
  SameHp,
  LesserHp,
  MoreHpSec,
  SameHpSec,
  LesserHpSec,
}

@CommonSkill({ name: 'shiyuan', description: 'shiyuan_description' })
export class ShiYuan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    const flag = owner.getFlag<ShiYuanEffect[]>(this.Name) || [];
    const yuweiEffected =
      owner.getPlayerSkills().find(skill => skill.Name === YuWei.Name) &&
      room.CurrentPlayer !== owner &&
      room.CurrentPlayer.Nationality === CharacterNationality.Qun;
    if (flag.length === (yuweiEffected ? 6 : 3)) {
      return false;
    }

    const user = room.getPlayerById(content.fromId);
    return (
      content.toId === owner.Id &&
      content.fromId !== owner.Id &&
      !user.Dead &&
      !(
        flag.length > 0 &&
        ((user.Hp > owner.Hp &&
          (yuweiEffected ? flag.includes(ShiYuanEffect.MoreHpSec) : flag.includes(ShiYuanEffect.MoreHp))) ||
          (user.Hp === owner.Hp &&
            (yuweiEffected ? flag.includes(ShiYuanEffect.SameHpSec) : flag.includes(ShiYuanEffect.SameHp))) ||
          (user.Hp < owner.Hp &&
            (yuweiEffected ? flag.includes(ShiYuanEffect.LesserHpSec) : flag.includes(ShiYuanEffect.LesserHp))))
      )
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    let num = 1;
    if (room.getPlayerById(event.fromId).Hp > owner.Hp) {
      num = 3;
    } else if (room.getPlayerById(event.fromId).Hp === owner.Hp) {
      num = 2;
    }

    return TranslationPack.translationJsonPatcher('{0}: do you want to draw {1} card(s)?', this.Name, num).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const from = room.getPlayerById(
      (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>).fromId,
    );
    let num = 1;
    const originalFlags = room.getFlag<ShiYuanEffect[]>(event.fromId, this.Name) || [];
    let flag = originalFlags.includes(ShiYuanEffect.LesserHp) ? ShiYuanEffect.LesserHpSec : ShiYuanEffect.LesserHp;
    if (from.Hp > room.getPlayerById(event.fromId).Hp) {
      num = 3;
      flag = originalFlags.includes(ShiYuanEffect.MoreHp) ? ShiYuanEffect.MoreHpSec : ShiYuanEffect.MoreHp;
    } else if (from.Hp === room.getPlayerById(event.fromId).Hp) {
      num = 2;
      flag = originalFlags.includes(ShiYuanEffect.SameHp) ? ShiYuanEffect.SameHpSec : ShiYuanEffect.SameHp;
    }

    originalFlags.includes(flag) || originalFlags.push(flag);
    room.getPlayerById(event.fromId).setFlag<ShiYuanEffect[]>(this.Name, originalFlags);
    await room.drawCards(num, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ShiYuan.Name, description: ShiYuan.Description })
export class ShiYuanShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return event.from === PlayerPhase.PhaseFinish && owner.getFlag<ShiYuanEffect[]>(this.GeneralName) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}

import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import { CardDrawReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import {
  AllStage,
  DrawCardStage,
  PhaseChangeStage,
  PlayerPhase,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, FilterSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zishou', description: 'zishou_description' })
export class ZiShou extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DrawCardStage.CardDrawing;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>,
  ): boolean {
    return (
      owner.Id === content.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      content.bySpecialReason === CardDrawReason.GameStage
    );
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    const nations = room.AlivePlayers.reduce<CharacterNationality[]>((allNations, player) => {
      if (!allNations.includes(player.Nationality)) {
        allNations.push(player.Nationality);
      }
      return allNations;
    }, []);
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to draw {1} card(s)?',
      this.Name,
      nations.length,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const drawCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;

    const nations = room.AlivePlayers.reduce<CharacterNationality[]>((allNations, player) => {
      if (!allNations.includes(player.Nationality)) {
        allNations.push(player.Nationality);
      }
      return allNations;
    }, []);
    drawCardEvent.drawAmount += nations.length;

    room.setFlag<boolean>(fromId, this.Name, true);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: ZiShou.Name, description: ZiShou.Description })
export class ZiShouShadow extends TriggerSkill implements OnDefineReleaseTiming {
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
    return content.from === PlayerPhase.PhaseFinish && room.getFlag<boolean>(owner.Id, this.GeneralName) === true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>, 
  ): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: ZiShouShadow.Name, description: ZiShouShadow.Description })
export class ZiShouBlocker extends FilterSkill {
  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId, target?: PlayerId): boolean {
    return !(
      room.getFlag<boolean>(owner, this.GeneralName) === true &&
      owner !== target
    )
  }
}

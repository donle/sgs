import { CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage, StagePriority } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { QiXi } from '../standard/qixi';
import { YingZi } from '../standard/yingzi';
import { StdXuanFeng } from '../yijiang2011/std_xuanfeng';

@CompulsorySkill({ name: 'qizhou', description: 'qizhou_description' })
export class QiZhou extends TriggerSkill implements OnDefineReleaseTiming {
  public get RelatedSkills(): string[] {
    return [YingZi.Name, QiXi.Name, StdXuanFeng.Name];
  }

  public audioIndex(): number {
    return 0;
  }

  public getPriority(): StagePriority {
    return StagePriority.High;
  }

  public async whenLosingSkill(room: Room, player: Player) {
    if (!player.getFlag<string[]>(this.Name)) {
      return;
    }

    for (const skillName of this.RelatedSkills) {
      player.getFlag<string[]>(this.Name).includes(skillName) && (await room.loseSkill(player.Id, skillName));
    }
    player.removeFlag(this.Name);
  }

  public async whenNullifying(room: Room, player: Player) {
    if (!player.getFlag<string[]>(this.Name)) {
      return;
    }

    for (const skillName of this.RelatedSkills) {
      player.getFlag<string[]>(this.Name).includes(skillName) && (await room.loseSkill(player.Id, skillName));
    }
    player.removeFlag(this.Name);
  }

  private async handleQiZhouSkills(room: Room, player: Player): Promise<void> {
    const suitsNum = player.getCardIds(PlayerCardsArea.EquipArea).reduce<CardSuit[]>((suits, cardId) => {
      const suit = Sanguosha.getCardById(cardId).Suit;
      suits.includes(suit) || suits.push(suit);
      return suits;
    }, []).length;
    const flagValue = Math.min(3, suitsNum);
    const originalSkillNames = player.getFlag<string[]>(this.Name) || [];

    for (let i = 0; i < this.RelatedSkills.length; i++) {
      const skillName = this.RelatedSkills[i];
      if (i < flagValue && !player.hasSkill(skillName)) {
        await room.obtainSkill(player.Id, skillName, true);
        originalSkillNames.push(skillName);
      } else if (i >= flagValue && originalSkillNames.includes(skillName)) {
        await room.loseSkill(player.Id, skillName, true);
        const index = originalSkillNames.findIndex(name => name === skillName);
        originalSkillNames.splice(index, 1);
      }
    }

    if (originalSkillNames.length > 0) {
      player.setFlag<string[]>(this.Name, originalSkillNames);
    } else {
      player.removeFlag(this.Name);
    }
  }

  public async whenObtainingSkill(room: Room, player: Player) {
    await this.handleQiZhouSkills(room, player);
  }

  public async whenEffecting(room: Room, player: Player) {
    await this.handleQiZhouSkills(room, player);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    if (
      !content.infos.find(
        info =>
          (info.fromId === owner.Id &&
            info.movingCards.find(cardInfo => cardInfo.fromArea === CardMoveArea.EquipArea)) ||
          (info.toId === owner.Id && info.toArea === CardMoveArea.EquipArea),
      )
    ) {
      return false;
    }

    const suitsNum = owner.getCardIds(PlayerCardsArea.EquipArea).reduce<CardSuit[]>((suits, cardId) => {
      const suit = Sanguosha.getCardById(cardId).Suit;
      suits.includes(suit) || suits.push(suit);
      return suits;
    }, []).length;
    const currentSkillNames = suitsNum > 0 ? this.RelatedSkills.slice(0, Math.min(suitsNum, 3)) : [];
    return !!this.RelatedSkills.find(
      skillName =>
        (currentSkillNames.includes(skillName) && !owner.hasSkill(skillName)) ||
        (owner.hasSkill(skillName) &&
          owner.getFlag<string[]>(this.Name)?.includes(skillName) &&
          !currentSkillNames.includes(skillName)),
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await this.handleQiZhouSkills(room, room.getPlayerById(event.fromId));

    return true;
  }
}

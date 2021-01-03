import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { ActiveSkill, CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { FangZhu } from '../forest/fangzhu';
import { WanSha } from '../forest/wansha';
import { GuiCai } from '../standard/guicai';
import { JiZhi } from '../standard/jizhi';
import { ZhiHeng } from '../standard/zhiheng';

@CommonSkill({ name: 'jilve', description: 'jilve_description' })
export class JiLve extends ActiveSkill {
  public static readonly ZhihengUsed = 'zhihengUsed';
  public static readonly WanshaUsed = 'wanshaUsed';

  public canUse(room: Room, owner: Player): boolean {
    return (
      (!owner.getFlag<boolean>(JiLve.ZhihengUsed) || !owner.getFlag<boolean>(JiLve.WanshaUsed)) &&
      owner.getMark(MarkEnum.Ren) > 0
    );
  }

  public numberOfTargets(): number {
    return 0;
  }

  public cardFilter(): boolean {
    return true;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const options: string[] = [];
    const from = room.getPlayerById(skillUseEvent.fromId);

    if (!from.getFlag<boolean>(JiLve.ZhihengUsed)) {
      options.push(ZhiHeng.Name);
    }
    if (!from.getFlag<boolean>(JiLve.WanshaUsed)) {
      options.push(WanSha.Name);
    }
    if (options.length === 0) {
      return false;
    }

    const askForOptions: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      conversation: 'please choose a skill',
      toId: skillUseEvent.fromId,
    };
    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForOptions, skillUseEvent.fromId);
    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      skillUseEvent.fromId,
    );
    if (selectedOption === undefined) {
      return false;
    }

    if (selectedOption === ZhiHeng.Name) {
      const askForCard: ServerEventFinder<GameEventIdentifiers.AskForCardEvent> = {
        cardAmountRange: [1, from.getPlayerCards().length],
        toId: from.Id,
        reason: this.Name,
        conversation: 'please choose your zhiheng cards',
        fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
      };
      room.notify(
        GameEventIdentifiers.AskForCardEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardEvent>(askForCard),
        from.Id,
      );
      const { selectedCards } = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForCardEvent, from.Id);
      const handCards = from.getCardIds(PlayerCardsArea.HandArea);
      let additionalCardDraw = 0;
      if (
        selectedCards.filter(zhihengCard => handCards.includes(zhihengCard)).length === handCards.length &&
        handCards.length > 0
      ) {
        additionalCardDraw++;
      }
      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} used skill {1}',
          TranslationPack.patchPlayerInTranslation(from),
          'jilve-zhiheng',
        ).extract(),
      });

      await room.dropCards(
        CardMoveReason.SelfDrop,
        selectedCards,
        skillUseEvent.fromId,
        skillUseEvent.fromId,
        ZhiHeng.Name,
      );

      await room.drawCards(
        selectedCards.length + additionalCardDraw,
        skillUseEvent.fromId,
        undefined,
        skillUseEvent.fromId,
        this.Name,
      );
      room.setFlag(from.Id, JiLve.ZhihengUsed, true);
      room.addMark(skillUseEvent.fromId, MarkEnum.Ren, -1);
    } else {
      await room.obtainSkill(skillUseEvent.fromId, WanSha.Name, true);
      room.setFlag(skillUseEvent.fromId, JiLve.WanshaUsed, true);
      room.addMark(skillUseEvent.fromId, MarkEnum.Ren, -1);
    }
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: JiLve.Name, description: JiLve.Description })
export class JiLveShadow extends TriggerSkill {
  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: PhaseChangeStage) {
    return stage === PhaseChangeStage.PhaseChanged && event.from === PlayerPhase.PhaseFinish;
  }

  public isFlaggedSkill() {
    return true;
  }

  canUse() {
    return true;
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} used skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      this.Name,
    ).extract();
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const from = room.getPlayerById(event.fromId);
    if (from.getFlag<boolean>(JiLve.WanshaUsed)) {
      room.removeFlag(from.Id, JiLve.WanshaUsed);
      await room.loseSkill(from.Id, WanSha.Name);
    }
    if (from.getFlag<boolean>(JiLve.ZhihengUsed)) {
      room.removeFlag(from.Id, JiLve.ZhihengUsed);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: JiLveShadow.Name, description: JiLveShadow.Description })
export class JiLveGuiCai extends GuiCai {
  canUse(room: Room, owner: Player) {
    return owner.getMark(MarkEnum.Ren) > 0 && super.canUse(room, owner);
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} used skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      this.Name,
    ).extract();

    room.addMark(event.fromId, MarkEnum.Ren, -1);
    return super.onUse(room, event);
  }
}

@ShadowSkill
@CommonSkill({ name: JiLveGuiCai.Name, description: JiLveGuiCai.Description })
export class JiLveJiZhi extends JiZhi {
  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return owner.getMark(MarkEnum.Ren) > 0 && super.canUse(room, owner, content);
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} used skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      this.Name,
    ).extract();

    room.addMark(event.fromId, MarkEnum.Ren, -1);
    return super.onUse(room, event);
  }
}

@ShadowSkill
@CommonSkill({ name: JiLveJiZhi.Name, description: JiLveJiZhi.Description })
export class JiLveFangZhu extends FangZhu {
  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.getMark(MarkEnum.Ren) > 0 && super.canUse(room, owner, content);
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    room.addMark(event.fromId, MarkEnum.Ren, -1);
    return super.onUse(room, event);
  }
}

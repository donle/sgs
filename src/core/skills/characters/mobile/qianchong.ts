import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardColor, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import {
  AllStage,
  CardMoveStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
  StagePriority,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { WeiMu } from '../forest/weimu';
import { MingZhe } from '../sp/mingzhe';

@CompulsorySkill({ name: 'qianchong', description: 'qianchong_description' })
export class QianChong extends TriggerSkill implements OnDefineReleaseTiming {
  public get RelatedSkills(): string[] {
    return [MingZhe.Name, WeiMu.Name];
  }

  public audioIndex(): number {
    return 1;
  }

  public getPriority(): StagePriority {
    return StagePriority.High;
  }

  public async whenLosingSkill(room: Room, player: Player) {
    if (!player.getFlag<string>(this.Name)) {
      return;
    }

    for (const skillName of this.RelatedSkills) {
      player.getFlag<string>(this.Name) === skillName && (await room.loseSkill(player.Id, skillName));
    }
    player.removeFlag(this.Name);
  }

  public async whenNullifying(room: Room, player: Player) {
    if (!player.getFlag<string>(this.Name)) {
      return;
    }

    for (const skillName of this.RelatedSkills) {
      player.getFlag<string>(this.Name) === skillName && (await room.loseSkill(player.Id, skillName));
    }
    player.removeFlag(this.Name);
  }

  private async handleQianChongSkills(room: Room, player: Player): Promise<void> {
    let equipColor = CardColor.None;
    for (const cardId of player.getCardIds(PlayerCardsArea.EquipArea)) {
      const currentColor = Sanguosha.getCardById(cardId).Color;
      if (equipColor === CardColor.None) {
        equipColor = currentColor;
      } else if (equipColor !== currentColor) {
        equipColor = CardColor.None;
        break;
      }
    }

    let originalSkillName: string | undefined = player.getFlag<string>(this.Name);
    originalSkillName && (await room.loseSkill(player.Id, originalSkillName));
    originalSkillName = equipColor === CardColor.None ? undefined : this.RelatedSkills[equipColor];
    if (originalSkillName && !player.hasSkill(originalSkillName)) {
      await room.obtainSkill(player.Id, originalSkillName);
      player.setFlag<string>(this.Name, originalSkillName);
    } else {
      player.removeFlag(this.Name);
    }
  }

  public async whenObtainingSkill(room: Room, player: Player) {
    await this.handleQianChongSkills(room, player);
  }

  public async whenEffecting(room: Room, player: Player) {
    await this.handleQianChongSkills(room, player);
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

    let equipColor = CardColor.None;
    for (const cardId of owner.getCardIds(PlayerCardsArea.EquipArea)) {
      const currentColor = Sanguosha.getCardById(cardId).Color;
      if (equipColor === CardColor.None) {
        equipColor = currentColor;
      } else if (equipColor !== currentColor) {
        equipColor = CardColor.None;
        break;
      }
    }

    return (
      owner.getFlag<string>(this.Name) !== (equipColor === CardColor.None ? undefined : this.RelatedSkills[equipColor])
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await this.handleQianChongSkills(room, room.getPlayerById(event.fromId));

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: QianChong.Name, description: QianChong.Description })
export class QianChongShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    const equips = owner.getCardIds(PlayerCardsArea.EquipArea);
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PlayCardStageStart &&
      (equips.length === 0 ||
        !!equips.find(cardId => Sanguosha.getCardById(cardId).Color !== Sanguosha.getCardById(equips[0]).Color))
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const mapper = {};
    const options: string[] = [];
    for (const type of [CardType.Basic, CardType.Trick, CardType.Equip]) {
      mapper[Functional.getCardTypeRawText(type)] = type;
      options.push(Functional.getCardTypeRawText(type));
    }
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose qianchong options: {1}',
          this.GeneralName,
        ).extract(),
        toId: event.fromId,
        triggeredBySkills: [this.GeneralName],
      },
      event.fromId,
      true,
    );

    response.selectedOption = response.selectedOption || options[0];

    const originalTypes = room.getFlag<CardType[]>(event.fromId, this.Name) || [];
    if (!originalTypes.includes(mapper[response.selectedOption])) {
      originalTypes.push(mapper[response.selectedOption]);

      let originalText = '{0}：';
      for (let i = 1; i <= originalTypes.length; i++) {
        originalText = originalText + '[{' + i + '}]';
      }
      room.setFlag<CardType[]>(
        event.fromId,
        this.Name,
        originalTypes,
        TranslationPack.translationJsonPatcher(
          originalText,
          this.GeneralName,
          ...originalTypes.map(type => Functional.getCardBaseTypeAbbrRawText(type)),
        ).toString(),
      );
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: QianChongShadow.Name, description: QianChongShadow.Description })
export class QianChongBuff extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (!owner.getFlag<CardType[]>(QianChongShadow.Name)) {
      return 0;
    }

    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ type: owner.getFlag<CardType[]>(QianChongShadow.Name) }))
        ? INFINITE_DISTANCE
        : 0;
    } else {
      return owner.getFlag<CardType[]>(QianChongShadow.Name).includes(Sanguosha.getCardById(cardId).BaseType)
        ? INFINITE_DISTANCE
        : 0;
    }
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (!owner.getFlag<CardType[]>(QianChongShadow.Name)) {
      return 0;
    }

    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ type: owner.getFlag<CardType[]>(QianChongShadow.Name) }))
        ? INFINITE_TRIGGERING_TIMES
        : 0;
    } else {
      return owner.getFlag<CardType[]>(QianChongShadow.Name).includes(Sanguosha.getCardById(cardId).BaseType)
        ? INFINITE_TRIGGERING_TIMES
        : 0;
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: QianChongBuff.Name, description: QianChongBuff.Description })
export class QianChongRemover extends TriggerSkill implements OnDefineReleaseTiming {
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
    return (
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PhaseFinish &&
      owner.getFlag<CardType[]>(QianChongShadow.Name) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, QianChongShadow.Name);

    return true;
  }
}

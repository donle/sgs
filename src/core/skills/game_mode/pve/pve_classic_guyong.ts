import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardSuit, CardChoosingOptions } from 'core/cards/libs/card_props';
import { Slash } from 'core/cards/standard/slash';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  DamageEffectStage,
  JudgeEffectStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
  StagePriority,
  PlayerDiedStage,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { AwakeningSkill, CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { PveClassicQiSha } from './pve_classic_qisha';
import { PveClassicTianJi } from './pve_classic_tianji';
import { PveClassicTianLiang } from './pve_classic_tianliang';
import { PveClassicTianTong } from './pve_classic_tiantong';
import { PveClassicTianXiang } from './pve_classic_tianxiang';

@AwakeningSkill({ name: 'pve_classic_guyong', description: 'pve_classic_guyong_description' })
export class PveClassicGuYong extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return [
      PveClassicQiSha.GeneralName,
      PveClassicTianJi.GeneralName,
      PveClassicTianLiang.GeneralName,
      PveClassicTianTong.GeneralName,
      PveClassicTianXiang.GeneralName,
    ];
  }

  public get RelatedCharacters() {
    return ['pve_qisha', 'pve_tianji', 'pve_tianliang', 'pve_tiantong', 'pve_tianxiang'];
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.playerId === owner.Id && room.enableToAwaken(this.Name, owner);
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activated awakening skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const rewardCharactersId = this.RelatedCharacters.map(name => Sanguosha.getCharacterByCharaterName(name).Id);
    room.notify(
      GameEventIdentifiers.AskForChoosingCharacterEvent,
      {
        amount: 1,
        characterIds: rewardCharactersId,
        toId: event.fromId,
        byHuaShen: true,
        translationsMessage: TranslationPack.translationJsonPatcher(
          'Please choose a character for get a skill',
        ).extract(),
        ignoreNotifiedStatus: true,
      },
      event.fromId,
    );

    const resp = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCharacterEvent,
      event.fromId,
    );
    const skillName = Sanguosha.getCharacterById(resp.chosenCharacterIds[0]).Skills[0].Name;
    await room.obtainSkill(event.fromId, skillName, true);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: PveClassicGuYong.Name, description: PveClassicGuYong.Description })
export class PveClassicGuYongMark extends TriggerSkill {
  public getPriority() {
    return StagePriority.High;
  }

  isAutoTrigger() {
    return true;
  }

  isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.JudgeEvent | GameEventIdentifiers.PlayerDiedEvent>,
    stage?: AllStage,
  ) {
    return stage === JudgeEffectStage.AfterJudgeEffect || stage === PlayerDiedStage.PlayerDied;
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.JudgeEvent | GameEventIdentifiers.PlayerDiedEvent>,
  ) {
    const suitFlag = owner.getFlag<CardSuit[]>(this.Name);
    if (suitFlag !== undefined && suitFlag.length > 3) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(content);
    switch (identifier) {
      case GameEventIdentifiers.JudgeEvent:
        const cardSuit = Sanguosha.getCardById(
          (content as ServerEventFinder<GameEventIdentifiers.JudgeEvent>).judgeCardId,
        ).Suit;
        return cardSuit !== CardSuit.NoSuit && (suitFlag === undefined || !suitFlag.includes(cardSuit));
      case GameEventIdentifiers.PlayerDiedEvent:
        return true;
      default:
        return false;
    }
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const owner = room.getPlayerById(content.fromId);
    const identifier = EventPacker.getIdentifier(content.triggeredOnEvent!);
    let suitFlag = owner.getFlag<CardSuit[]>(this.Name);
    if (suitFlag === undefined) {
      suitFlag = [];
    }
    switch (identifier) {
      case GameEventIdentifiers.JudgeEvent:
        const judgeEvent = content.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;
        const cardSuit = Sanguosha.getCardById(judgeEvent.judgeCardId).Suit;
        suitFlag.push(cardSuit);
        break;
      case GameEventIdentifiers.PlayerDiedEvent:
        suitFlag.push(CardSuit.NoSuit);
        break;
      default:
        break;
    }

    switch (suitFlag.length) {
      case 1:
        owner.getMark(MarkEnum.YuQing) || room.addMark(owner.Id, MarkEnum.YuQing, 1);
        break;
      case 2:
        owner.getMark(MarkEnum.HouTu) || room.addMark(owner.Id, MarkEnum.HouTu, 1);
        break;
      case 3:
        owner.getMark(MarkEnum.GouChen) || room.addMark(owner.Id, MarkEnum.GouChen, 1);
        break;
      case 4:
        owner.getMark(MarkEnum.ZiWei) || room.addMark(owner.Id, MarkEnum.ZiWei, 1);
        break;
      default:
        break;
    }

    owner.setFlag<CardSuit[]>(this.Name, suitFlag);
    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: PveClassicGuYongMark.Name, description: PveClassicGuYongMark.Description })
export class PveClassicGuYongBuf extends TriggerSkill {
  public getPriority() {
    return StagePriority.High;
  }

  isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ) {
    return stage === PhaseStageChangeStage.StageChanged || stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.DamageEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    switch (identifier) {
      case GameEventIdentifiers.PhaseStageChangeEvent:
        const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
        const canTriggerYuQing =
          phaseStageChangeEvent.toStage === PlayerPhaseStages.PhaseFinishEnd &&
          room.getMark(owner.Id, MarkEnum.YuQing) > 0;
        const canTriggerGouChen =
          phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart &&
          room.getMark(owner.Id, MarkEnum.GouChen) > 0;
        return phaseStageChangeEvent.playerId === owner.Id && (canTriggerYuQing || canTriggerGouChen);

      case GameEventIdentifiers.DamageEvent:
        const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
        if (
          damageEvent.fromId === undefined ||
          damageEvent.fromId === owner.Id ||
          room.getPlayerById(damageEvent.fromId).getCardIds(PlayerCardsArea.HandArea).length === 0
        ) {
          return false;
        }
        return damageEvent.toId === owner.Id && room.getMark(owner.Id, MarkEnum.HouTu) > 0;
      default:
        return false;
    }
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (event.triggeredOnEvent === undefined) {
      return false;
    }

    const owner = room.getPlayerById(event.fromId);
    const identifier = EventPacker.getIdentifier(event.triggeredOnEvent);
    switch (identifier) {
      case GameEventIdentifiers.PhaseStageChangeEvent:
        const phaseStageChangeEvent =
          event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
        if (phaseStageChangeEvent.toStage === PlayerPhaseStages.PhaseFinishEnd) {
          await room.drawCards(1, event.fromId);
        }

        if (phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart) {
          const targets = room
            .getOtherPlayers(owner.Id)
            .filter(player =>
              room.getPlayerById(owner.Id).canUseCardTo(room, new CardMatcher({ generalName: ['slash'] }), player.Id),
            )
            .map(player => player.Id);

          if (targets.length > 0) {
            const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
              GameEventIdentifiers.AskForChoosingPlayerEvent,
              {
                players: targets,
                toId: owner.Id,
                requiredAmount: 1,
                conversation: 'you can choose one player to use a slash',
                triggeredBySkills: [this.Name],
              },
              owner.Id,
            );

            if (resp.selectedPlayers && resp.selectedPlayers.length > 0) {
              await room.useCard({
                fromId: owner.Id,
                targetGroup: [resp.selectedPlayers],
                cardId: VirtualCard.create<Slash>({ cardName: 'slash', bySkill: this.Name }).Id,
                extraUse: true,
                triggeredBySkills: [this.Name],
              });
            }
          }
        }

        return true;
      case GameEventIdentifiers.DamageEvent:
        const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
        if (damageEvent.fromId !== undefined) {
          const damageFrom = room.getPlayerById(damageEvent.fromId);
          const options: CardChoosingOptions = {
            [PlayerCardsArea.HandArea]: damageFrom.getCardIds(PlayerCardsArea.HandArea).length,
          };

          const chooseCardEvent = {
            fromId: event.fromId,
            toId: damageFrom.Id,
            options,
            triggeredBySkills: [this.Name],
          };

          const response = await room.askForChoosingPlayerCard(chooseCardEvent, chooseCardEvent.fromId, false, true);
          if (!response) {
            return false;
          }

          await room.moveCards({
            movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
            fromId: chooseCardEvent.toId,
            toId: chooseCardEvent.fromId,
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActivePrey,
            proposer: chooseCardEvent.fromId,
            movedByReason: this.Name,
          });
        }

        return true;
      default:
        return false;
    }
  }
}

@ShadowSkill
@CompulsorySkill({ name: PveClassicGuYongBuf.Name, description: PveClassicGuYongBuf.Description })
export class PveClassicGuYongBufZiWei extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.DamagedEffect;
  }

  public isRefreshAt(room: Room, owner: Player, phase: PlayerPhase): boolean {
    return phase === PlayerPhase.PhaseBegin;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return (
      owner.getMark(MarkEnum.ZiWei) > 0 &&
      !owner.hasUsedSkill(this.Name) &&
      content.fromId === owner.Id &&
      owner.getCardIds().length > 0
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    console.log(`skill ${this.Name} on effect`);
    const resp = await room.askForCardDrop(
      event.fromId!,
      1,
      [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
      true,
      undefined,
      this.Name,
    );

    if (resp.droppedCards.length > 0) {
      await room.dropCards(CardMoveReason.SelfDrop, resp.droppedCards, event.fromId);
      const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      damageEvent.damage++;
    }
    return true;
  }
}

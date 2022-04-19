import { VirtualCard } from 'core/cards/card';
import { CardColor, CardId, CardSuit } from 'core/cards/libs/card_props';
import { Slash } from 'core/cards/standard/slash';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import {
  AllStage,
  CardUseStage,
  JudgeEffectStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerDiedStage,
  PlayerPhase,
  PlayerPhaseStages,
  StagePriority,
  AimStage,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { MarkEnum } from 'core/shares/types/mark_list';
import { ExtralCardSkillProperty } from 'core/skills/cards/interface/extral_property';
import { TriggerSkill } from 'core/skills/skill';
import { AwakeningSkill, CommonSkill, CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { PveClassicLianZhen } from './pve_classic_lianzhen';
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
      PveClassicLianZhen.GeneralName,
    ];
  }

  public get RelatedCharacters() {
    return ['pve_qisha', 'pve_tianji', 'pve_tianliang', 'pve_tiantong', 'pve_tianxiang', 'pve_lianzhen'];
  }

  getSkillLog() {
    return TranslationPack.translationJsonPatcher('{0}: do you want to awaken?', this.Name).extract();
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    return (
      content.toPlayer === owner.Id && content.to === PlayerPhase.PhaseBegin && room.enableToAwaken(this.Name, owner)
    );
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
  getPriority() {
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

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0}: get the next stage mark',
      this.Name,
    ).extract();
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
        owner.getMark(MarkEnum.PveTanLang) || room.addMark(owner.Id, MarkEnum.PveTanLang, 1);
        break;
      case 2:
        owner.getMark(MarkEnum.PveWenQu) || room.addMark(owner.Id, MarkEnum.PveWenQu, 1);
        break;
      case 3:
        owner.getMark(MarkEnum.PveWuQu) || room.addMark(owner.Id, MarkEnum.PveWuQu, 1);
        break;
      case 4:
        owner.getMark(MarkEnum.PvePoJun) || room.addMark(owner.Id, MarkEnum.PvePoJun, 1);
        break;
      default:
        break;
    }

    owner.setFlag<CardSuit[]>(this.Name, suitFlag);
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: PveClassicGuYongMark.Name, description: PveClassicGuYongMark.Description })
export class PveClassicGuYongTanLang extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      content.toStage === PlayerPhaseStages.PrepareStageStart &&
      room.getMark(owner.Id, MarkEnum.PveTanLang) > 0 &&
      room.CurrentPlayer !== owner &&
      owner.getCardIds(PlayerCardsArea.HandArea).length <= owner.MaxHp
    );
  }

  getSkillLog() {
    return TranslationPack.translationJsonPatcher('{0}: do you want to draw a card?', this.Name).extract();
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}, draw a card',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
    ).extract();
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(1, event.fromId);
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: PveClassicGuYongTanLang.Name, description: PveClassicGuYongTanLang.Description })
export class PveClassicGuYongWenQu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage) {
    return stage === CardUseStage.AfterCardTargetDeclared;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const card = Sanguosha.getCardById(content.cardId);
    return (
      content.fromId === owner.Id &&
      room.getMark(owner.Id, MarkEnum.PveWenQu) > 0 &&
      ['guohechaiqiao', 'shunshouqianyang', 'duel', 'fire_attack'].includes(card.GeneralName) &&
      room.AlivePlayers.filter(
        player =>
          !TargetGroupUtil.getRealTargets(content.targetGroup).includes(player.Id) &&
          room.isAvailableTarget(card.Id, content.fromId, player.Id) &&
          (Sanguosha.getCardById(content.cardId).Skill as unknown as ExtralCardSkillProperty).isCardAvailableTarget(
            content.fromId,
            room,
            player.Id,
            [],
            [],
            content.cardId,
          ),
      ).length > 0
    );
  }

  getSkillLog(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return TranslationPack.translationJsonPatcher(
      '{0}: you can append a player to the targets of {1}',
      this.Name,
      TranslationPack.patchCardInTranslation(event.cardId),
    ).extract();
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}, add a target for {2}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
      TranslationPack.patchCardInTranslation(
        Sanguosha.getCardById(
          (skillUseEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId,
        ).Id,
      ),
    ).extract();
    return true;
  }

  public resortTargets(): boolean {
    return false;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const card = Sanguosha.getCardById(cardUseEvent.cardId);
    const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent>(
      GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent,
      {
        user: cardUseEvent.fromId,
        cardId: card.Id,
        exclude: TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup),
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please select a player append to target for {1}',
          this.Name,
          TranslationPack.patchCardInTranslation(card.Id),
        ).extract(),
        triggeredBySkills: [this.Name],
      },
      cardUseEvent.fromId,
    );

    if (resp.selectedPlayers === undefined) {
      return false;
    }

    const selectedPlayer = resp.selectedPlayers[0];

    room.broadcast(GameEventIdentifiers.CustomGameDialog, {
      translationsMessage: TranslationPack.translationJsonPatcher(
        "{1} is appended to target list of {2} by {0}'s skill {3}",
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(selectedPlayer)),
        TranslationPack.patchCardInTranslation(cardUseEvent.cardId),
        this.Name,
      ).extract(),
    });
    TargetGroupUtil.pushTargets(cardUseEvent.targetGroup!, selectedPlayer);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: PveClassicGuYongWenQu.Name, description: PveClassicGuYongWenQu.Description })
export class PveClassicGuYongWuQu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      content.toStage === PlayerPhaseStages.PrepareStageEnd &&
      room.getMark(owner.Id, MarkEnum.PveWuQu) > 0 &&
      room.CurrentPlayer === owner
    );
  }

  numberOfTargets() {
    return 1;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return room.canPindian(owner, target);
  }

  getSkillLog() {
    return TranslationPack.translationJsonPatcher('{0}: you can pindian to a player', this.Name).extract();
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
    ).extract();
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const { pindianRecord } = await room.pindian(fromId, toIds, this.GeneralName);
    if (!pindianRecord) {
      return false;
    }

    if (pindianRecord[0].winner === fromId) {
      const slash = VirtualCard.create<Slash>({ cardName: 'slash', bySkill: this.Name }).Id;
      const slashUseEvent = { fromId, cardId: slash, targetGroup: [toIds] };
      await room.useCard(slashUseEvent);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: PveClassicGuYongWuQu.Name, description: PveClassicGuYongWuQu.Description })
export class PveClassicGuYongBufPoJun extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAimmed && event.byCardId !== undefined;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return owner.getMark(MarkEnum.PvePoJun) > 0 && event.toId === owner.Id && event.fromId !== owner.Id;
  }

  getSkillLog() {
    return TranslationPack.translationJsonPatcher('you can drop a card to then draw a card').extract();
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 1;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return room.canDropCard(owner, cardId);
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const owner = room.getPlayerById(event.fromId);
    if (!event.cardIds) {
      return false;
    }
    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, owner.Id, owner.Id, this.Name);

    const blackCardNumber = event.cardIds.filter(
      cardId => Sanguosha.getCardById(cardId).Color === CardColor.Black,
    ).length;

    if (blackCardNumber === 0) {
      const fromId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId;
      const damageFrom = fromId && room.getPlayerById(fromId);
      if (damageFrom && !damageFrom.Dead) {
        await room.damage({
          fromId: owner.Id,
          damage: 1,
          damageType: DamageType.Normal,
          toId: damageFrom.Id,
          triggeredBySkills: [this.Name],
        });
      }
    } else {
      await room.drawCards(blackCardNumber * 2, owner.Id);
    }
    return true;
  }
}

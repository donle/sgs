import { CardType, VirtualCard } from 'core/cards/card';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { Slash } from 'core/cards/standard/slash';
import { DamageType, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import {
  AimStage,
  AllStage,
  CardEffectStage,
  CardUseStage,
  DamageEffectStage,
  DrawCardStage,
  LevelBeginStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, LimitSkill, SideEffectSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { System } from 'core/shares/libs/system';
import { Algorithm } from 'core/shares/libs/algorithm';

export const pveLongShenSkills = [
  { name: 'pve_longshen_ziyu', weights: 2 },
  { name: 'pve_longshen_chouxin', weights: 2 },
  { name: 'pve_longshen_suwei', weights: 2 },
  { name: 'pve_longshen_longlin', weights: 2 },
  { name: 'pve_longshen_longling', weights: 1 },
  { name: 'pve_longshen_longning', weights: 2 },
  { name: 'pve_longshen_ruiyan', weights: 1 },
  { name: 'pve_longshen_longshi', weights: 3 },
  { name: 'pve_longshen_longli', weights: 1 },
  { name: 'pve_longshen_longlie', weights: 1 },
  { name: 'pve_longshen_qinlv', weights: 2 },
  { name: 'pve_longshen_longhou', weights: 3 },
  { name: 'pve_longshen_longwei', weights: 3 },
  { name: 'pve_longshen_longen', weights: 3 },
  { name: 'pve_longshen_longxiao', weights: 1 },
  { name: 'pve_longshen_longgu', weights: 1 },
  { name: 'pve_longshen_chaiyue', weights: 1 },
  { name: 'pve_longshen_lige', weights: 1 },
  { name: 'pve_longshen_bibao', weights: 1 },
];

@CompulsorySkill({ name: 'pve_longshen_qifu', description: 'pve_longshen_qifu_description' })
export class PveLongShenQiFu extends TriggerSkill implements OnDefineReleaseTiming {
  isAutoTrigger() {
    return true;
  }

  isFlaggedSkill() {
    return true;
  }

  async whenLosingSkill(room: Room) {
    room.uninstallSideEffectSkill(System.SideEffectSkillApplierEnum.PveLongShenQiFu);
  }

  async whenObtainingSkill(room: Room, owner: Player) {
    room.installSideEffectSkill(
      System.SideEffectSkillApplierEnum.PveLongShenQiFu,
      PveLongShenQiFuReward.Name,
      owner.Id,
    );
  }

  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.LevelBeginEvent>, stage?: AllStage) {
    return stage === LevelBeginStage.LevelBegining;
  }

  canUse() {
    return true;
  }

  async onTrigger(_: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    event.translationsMessage = undefined;
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    room.installSideEffectSkill(
      System.SideEffectSkillApplierEnum.PveLongShenQiFu,
      PveLongShenQiFuReward.Name,
      event.fromId,
    );

    room.getOtherPlayers(event.fromId).forEach(player => {
      room.refreshPlayerOnceSkill(player.Id, PveLongShenQiFuReward.Name);
    });

    return true;
  }
}

@SideEffectSkill
@LimitSkill({ name: 'pve_longshen_qifu', description: 'pve_longshen_qifu_description' })
export class PveLongShenQiFuReward extends ActiveSkill {
  canUse() {
    return true;
  }

  numberOfTargets() {
    return 0;
  }

  cardFilter(_: Room, __: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  isAvailableTarget() {
    return false;
  }

  isAvailableCard(): boolean {
    return false;
  }

  async onUse() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const skills = room
      .getPlayerById(event.fromId)
      .getPlayerSkills()
      .filter(skill => !skill.isShadowSkill());

    if (skills.length >= 5) {
      const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options: skills.map(skill => skill.Name),
        toId: event.fromId,
        conversation: 'Please drop a skill',
        triggeredBySkills: [this.Name],
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(
          askForChoosingOptionsEvent,
        ),
        event.fromId,
      );

      const chooseResp = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        event.fromId,
      );
      room.loseSkill(event.fromId, chooseResp.selectedOption!);
    }

    const characters = room.getRandomCharactersFromLoadedPackage(5);
    room.notify(
      GameEventIdentifiers.AskForChoosingCharacterEvent,
      {
        amount: 1,
        characterIds: characters,
        toId: event.fromId,
        byHuaShen: true,
        triggeredBySkills: [this.Name],
        translationsMessage: TranslationPack.translationJsonPatcher(
          'Please choose a character for get a skill',
        ).extract(),
      },
      event.fromId,
    );

    const { chosenCharacterIds } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCharacterEvent,
      event.fromId,
    );

    const options = Sanguosha.getCharacterById(chosenCharacterIds[0])
      .Skills.filter(skill => !(skill.isShadowSkill() || skill.isLordSkill()))
      .map(skill => skill.GeneralName);

    const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options,
      toId: event.fromId,
      conversation: 'Please announce a skill',
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChoosingOptionsEvent),
      event.fromId,
    );

    const chooseResp = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      event.fromId,
    );
    room.obtainSkill(event.fromId, chooseResp.selectedOption!);

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_ziyu', description: 'pve_longshen_ziyu_description' })
export class PveLongShenZiYu extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(_: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId && PlayerPhaseStages.PrepareStageStart === content.toStage && owner.isInjured()
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const owner = room.getPlayerById(content.fromId);
    await room.recover({
      recoveredHp: Math.ceil((owner.MaxHp - owner.Hp) / 2),
      recoverBy: owner.Id,
      toId: owner.Id,
    });

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_chouxin', description: 'pve_longshen_chouxin_description' })
export class PveLongShenChouXin extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage) {
    return stage === DrawCardStage.AfterDrawCardEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>) {
    return (
      content.fromId === room.CurrentPhasePlayer.Id &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      content.fromId !== owner.Id
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const target = room.CurrentPhasePlayer;
    const card = target.getPlayerCards()[Math.floor(target.getPlayerCards().length * Math.random())];
    await room.moveCards({
      movingCards: [{ card }],
      fromId: target.Id,
      toId: content.fromId,
      moveReason: CardMoveReason.ActivePrey,
      toArea: CardMoveArea.HandArea,
      movedByReason: this.Name,
    });

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_suwei', description: 'pve_longshen_suwei_description' })
export class PveLongShenSuWei extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAimmed && event.byCardId !== undefined;
  }

  canUse(_: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return event.toId === owner.Id && event.fromId !== owner.Id;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, toId } = skillUseEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    const attacker = room.getPlayerById(fromId);

    await room.drawCards(1, toId, 'top', toId, this.Name);
    if (room.getPlayerById(fromId).getPlayerCards().length > 0) {
      const askForChooseCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent> = {
        options: {
          [PlayerCardsArea.EquipArea]: attacker.getCardIds(PlayerCardsArea.EquipArea),
          [PlayerCardsArea.HandArea]: attacker.getCardIds(PlayerCardsArea.HandArea).length,
        },
        fromId: toId,
        toId: fromId,
        triggeredBySkills: [this.Name],
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
          askForChooseCardEvent,
        ),
        toId,
      );

      const response = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        toId,
      );

      if (response.selectedCardIndex !== undefined) {
        const cardIds = attacker.getCardIds(PlayerCardsArea.HandArea);
        response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
      } else if (response.selectedCard === undefined) {
        const cardIds = attacker.getPlayerCards();
        response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
      }
      if (response.selectedCard !== undefined) {
        await room.dropCards(CardMoveReason.PassiveDrop, [response.selectedCard], fromId, toId, this.Name);
      }
    }
    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_longlin', description: 'pve_longshen_longlin_description' })
export class PveLongShenLongLin extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage) {
    return stage === CardUseStage.CardUsing;
  }

  canUse(_: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    if (event.fromId !== owner.Id) {
      return false;
    }

    const card = Sanguosha.getCardById(event.cardId);

    return card.BaseType === CardType.Equip;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (room.getPlayerById(event.fromId).isInjured()) {
      await room.recover({ recoverBy: event.fromId, recoveredHp: 1, toId: event.fromId });
      await room.drawCards(2, event.fromId, 'top', event.fromId, this.Name);
    } else {
      await room.changeMaxHp(event.fromId, 1);
      await room.drawCards(3, event.fromId, 'top', event.fromId, this.Name);
    }

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_longling', description: 'pve_longshen_longling_description' })
export class PveLongShenLongLing extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(_: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id === event.playerId && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const owner = room.getPlayerById(event.fromId);
    let extraDrawCardsNum: number = 0;
    for (const cardType of [CardType.Weapon, CardType.Shield, CardType.Precious]) {
      if (owner.getEquipment(cardType) === undefined) {
        extraDrawCardsNum++;
      }
    }
    await room.drawCards(extraDrawCardsNum, owner.Id);

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_longning', description: 'pve_longshen_longning_description' })
export class PveLongShenLongNing extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage) {
    return stage === DrawCardStage.CardDrawing;
  }

  canUse(_: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>) {
    return owner.Id === event.fromId;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const extraDrawNum = room
      .getPlayerById(event.fromId)
      .getCardIds(PlayerCardsArea.EquipArea)
      .reduce<CardSuit[]>((allSuits, cardId) => {
        const card = Sanguosha.getCardById(cardId);
        if (!allSuits.includes(card.Suit) && card.Suit !== CardSuit.NoSuit) {
          allSuits.push(card.Suit);
        }
        return allSuits;
      }, []).length;
    if (extraDrawNum !== 0) {
      const drawCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
      drawCardEvent.drawAmount += extraDrawNum;
    }

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_ruiyan', description: 'pve_longshen_ruiyan_description' })
export class PveLongShenRuiYan extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.BeforeStageChange;
  }

  canUse(_: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId &&
      (content.toStage === PlayerPhaseStages.FinishStageStart ||
        content.toStage === PlayerPhaseStages.PrepareStageStart)
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(
      room.getAlivePlayersFrom().length - 1,
      skillUseEvent.fromId,
      'top',
      skillUseEvent.fromId,
      this.Name,
    );

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_longshi', description: 'pve_longshen_longshi_description' })
export class PveLongShenLongShi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStage;
  }

  canUse(_: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id === event.playerId;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const fromId = skillUseEvent.fromId;
    const targetPlayers: Player[] = room.AlivePlayers.filter(player => player.Id !== fromId);

    for (const target of targetPlayers) {
      const allCards = target.getPlayerCards();
      Algorithm.shuffle(allCards);
      const dropCards = allCards.slice(0, 3);
      await room.dropCards(CardMoveReason.PassiveDrop, dropCards, target.Id, fromId, this.Name);
      if (dropCards.length < 3) {
        const slash = VirtualCard.create<Slash>({ cardName: 'fire_slash', bySkill: this.Name }).Id;
        const slashUseEvent = { fromId, cardId: slash, targetGroup: [[target.Id]] };
        await room.useCard(slashUseEvent);
      }
    }
    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_longli', description: 'pve_longshen_longli_description' })
export class PveLongShenLongLi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAim && event.byCardId !== undefined;
  }

  canUse(_: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return owner.Id === event.fromId;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(_: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    EventPacker.setDisresponsiveEvent(aimEvent);

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_longlie', description: 'pve_longshen_longlie_description' })
export class PveLongShenLonglie extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage: AllStage) {
    return stage === DamageEffectStage.DamageEffect && !event.isFromChainedDamage;
  }

  canUse(_: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.fromId === owner.Id;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    damageEvent.damage++;
    damageEvent.messages = damageEvent.messages || [];
    damageEvent.messages.push(
      TranslationPack.translationJsonPatcher(
        '{0} used skill {1}, damage increases to {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(damageEvent.fromId!)),
        this.Name,
        damageEvent.damage,
      ).toString(),
    );

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_qinlv', description: 'pve_longshen_qinlv_description' })
export class PveLongShenQinLv extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.BeforeStageChange;
  }

  canUse(_: Room, _a: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.toStage === PlayerPhaseStages.FinishStageStart;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const owner = room.getPlayerById(event.fromId);

    await room.recover({ recoveredHp: 1, recoverBy: owner.Id, toId: owner.Id });
    if (owner.isInjured()) {
      await room.drawCards(owner.MaxHp - owner.Hp, owner.Id, 'top', owner.Id, this.Name);
    }

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_longhou', description: 'pve_longshen_longhou_description' })
export class PveLongShenLongHou extends TriggerSkill {
  isRefreshAt(_: Room, __: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.PhaseBegin;
  }

  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAim;
  }

  canUse(_: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return (
      owner.Id === event.fromId &&
      owner.hasUsedSkillTimes(this.Name) < 3 &&
      event.byCardId !== undefined &&
      event.toId !== owner.Id
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    const target = room.getPlayerById(aimEvent.toId);
    if (target.isInjured()) {
      await room.damage({
        fromId,
        toId: target.Id,
        damage: target.LostHp,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      });
    }
    await room.changeMaxHp(target.Id, 1);
    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_longwei', description: 'pve_longshen_longwei_description' })
export class PveLongShenLongWei extends TriggerSkill {
  public isRefreshAt(_: Room, __: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.PhaseBegin;
  }

  public isTriggerable(_: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>, stage?: AllStage) {
    return stage === CardEffectStage.PreCardEffect;
  }

  canUse(room: Room, owner: Player, _: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    return room.CurrentPlayer !== owner && owner.hasUsedSkillTimes(this.Name) < 3;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(_: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const event = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
    event.nullifiedTargets?.push(skillUseEvent.fromId);
    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_longen', description: 'pve_longshen_longen_description' })
export class PveLongShenLongEn extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage) {
    return stage === DrawCardStage.CardDrawing;
  }

  canUse(_: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>) {
    return owner.Id !== event.fromId;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const drawCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
    const owner = room.AlivePlayers.find(player => player.hasSkill(this.GeneralName));
    if (owner === undefined) {
      return false;
    }
    if (owner.hasUsedSkillTimes(this.Name) < 3) {
      drawCardEvent.drawAmount += 1;
    } else {
      EventPacker.terminate(event);
    }

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_longxiao', description: 'pve_longshen_longxiao_description' })
export class PveLongShenLongXiao extends RulesBreakerSkill {
  breakCardUsableTimesTo(_: CardId | CardMatcher, room: Room, owner: Player, target: Player): number {
    if (room.withinAttackDistance(owner, target)) {
      return INFINITE_TRIGGERING_TIMES;
    } else {
      return 0;
    }
  }
}

@CompulsorySkill({ name: 'pve_longshen_longgu', description: 'pve_longshen_longgu_description' })
export class PveLongShenLongGu extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  canUse(_: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    return content.toPlayer === owner.Id && content.to === PlayerPhase.PhaseBegin;
  }

  async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const tricks = room.findCardsByMatcherFrom(new CardMatcher({ type: [CardType.Equip] }));

    if (tricks.length > 0) {
      const randomEquip = tricks[Math.floor(Math.random() * tricks.length)];
      await room.moveCards({
        movingCards: [{ card: randomEquip, fromArea: CardMoveArea.DrawStack }],
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      });

      const equipUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
        fromId: event.fromId,
        cardId: randomEquip,
      };

      await room.useCard(equipUseEvent);
    }

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_chaiyue', description: 'pve_longshen_chaiyue_description' })
export class PveLongShenChaiYue extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse(_: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.toId === owner.Id;
  }

  async onTrigger() {
    return true;
  }

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const owner = room.getPlayerById(event.fromId);
    await room.drawCards(2, owner.Id, 'top', owner.Id, this.Name);
    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_lige', description: 'pve_longshen_lige_description' })
export class PveLongShenLiGe extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(_: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id !== event.playerId && event.toStage === PlayerPhaseStages.FinishStageStart;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const duelUseEvent: ServerEventFinder<GameEventIdentifiers.CardUseEvent> = {
      fromId: event.fromId,
      cardId: VirtualCard.create({
        cardName: 'guohechaiqiao',
        bySkill: this.Name,
      }).Id,
      targetGroup: [[room.CurrentPhasePlayer.Id]],
    };

    await room.useCard(duelUseEvent);

    return true;
  }
}

@CompulsorySkill({ name: 'pve_longshen_bibao', description: 'pve_longshen_bibao_description' })
export class PveLongShenBiBao extends TriggerSkill {
  isTriggerable(_: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamageEffect || stage === DamageEffectStage.DamagedEffect;
  }

  canUse(
    _: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DamageEffectStage.DamageEffect && content.fromId === owner.Id;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.recover({ recoveredHp: 1, recoverBy: event.fromId, toId: event.fromId });
    return true;
  }
}

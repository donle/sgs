import { VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { CardEffectStage, CardMoveStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { ActiveSkill, OnDefineReleaseTiming, TransformSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { PveHuaShen } from './pve_huashen';

@CommonSkill({ name: 'pve_beifa', description: 'pve_beifa_description' })
export class PveBeiFa extends TriggerSkill {
  public async whenObtainingSkill(room: Room, owner: Player) {
    room.setFlag<number>(
      owner.Id,
      this.Name,
      1,
      TranslationPack.translationJsonPatcher('pve_beifa times: {0}', 1).toString(),
    );
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
    return stage === CardMoveStage.AfterCardMoved;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    const infos = content.infos.filter(
      info => owner.Id === info.fromId && info.movingCards.find(({ fromArea }) => fromArea === CardMoveArea.HandArea),
    );
    return infos.length > 0 && owner.getCardIds(PlayerCardsArea.HandArea).length === 0;
  }

  targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length > 0;
  }

  isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ) {
    return selectedTargets.length < 1;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = skillUseEvent;
    const skilllv = room.getPlayerById(fromId).getFlag<number>(this.Name) || 0;
    for (const toId of toIds!) {
      await room.loseHp(toId, skilllv);
    }
    return true;
  }
}

@CompulsorySkill({ name: 'pve_buxu', description: 'pve_buxu_description' })
export class PveBuXu extends TriggerSkill {
  public async whenObtainingSkill(room: Room, owner: Player) {
    room.setFlag<number>(
      owner.Id,
      this.Name,
      1,
      TranslationPack.translationJsonPatcher('pve_buxu times: {0}', 1).toString(),
    );
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>, stage?: AllStage) {
    return stage === CardEffectStage.PreCardEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const skilllv = owner.getFlag<number>(this.Name) || 0;
    const BOSS = room.getOtherPlayers(owner.Id).filter(player => player.hasSkill('pve_huashen'));
    for (const longshen of BOSS) {
      return room.CurrentPlayer === longshen && room.Analytics.getCardUseRecord(longshen.Id, 'round').length <= skilllv;
    }
    return false;
  }

  async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    content.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const event = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
    event.nullifiedTargets?.push(skillUseEvent.fromId);
    return true;
  }
}

@CommonSkill({ name: 'pve_dudu', description: 'pve_dudu_description' })
export class PveDuDu extends ActiveSkill {
  public async whenObtainingSkill(room: Room, owner: Player) {
    room.setFlag<number>(
      owner.Id,
      this.Name,
      1,
      TranslationPack.translationJsonPatcher(this.Name + ' times: {0}', 1).toString(),
    );
  }

  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const skilllv = room.getPlayerById(skillUseEvent.fromId).getFlag<number>(this.Name) || 0;
    await room.drawCards((skilllv - 1) * 2 + 1, skillUseEvent.fromId, 'top', skillUseEvent.fromId);
    return true;
  }
}

@CompulsorySkill({ name: 'pve_feihua', description: 'pve_feihua_description' })
export class PveFeiHua extends TransformSkill implements OnDefineReleaseTiming {
  async whenObtainingSkill(room: Room, owner: Player) {
    room.setFlag<number>(owner.Id, this.Name, 1);
  }

  async whenLosingSkill(room: Room, owner: Player) {
    room.setFlag<number>(owner.Id, this.Name, 0);
  }

  canTransform(owner: Player, cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    return card.CardNumber === -10;
  }

  public includesJudgeCard() {
    return true;
  }

  public forceToTransformCardTo(cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    return VirtualCard.create(
      {
        cardName: card.Name,
        cardNumber: card.CardNumber,
        bySkill: this.Name,
      },
      [cardId],
    );
  }
}

@CommonSkill({ name: 'pve_chengxiang', description: 'pve_chengxiang_description' })
export class PveChengXiang extends TriggerSkill {
  public async whenObtainingSkill(room: Room, owner: Player) {
    room.setFlag<number>(
      owner.Id,
      this.Name,
      1,
      TranslationPack.translationJsonPatcher('pve_chengxiang times: {0}', 1).toString(),
    );
  }
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return owner.Id === content.playerId && content.toStage === PlayerPhaseStages.PlayCardStageEnd;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const skilllv = room.getPlayerById(event.fromId).getFlag<number>(this.Name) || 0;
    await room.recover({
      recoverBy: undefined,
      recoveredHp: Math.floor(Math.random() * (2 + skilllv) + skilllv),
      toId: event.fromId,
    });
    return true;
  }
}

@CommonSkill({ name: 'pve_zhibing', description: 'pve_zhibing_description' })
export class PveZhiBing extends ActiveSkill {
  public async whenObtainingSkill(room: Room, owner: Player) {
    room.setFlag<number>(
      owner.Id,
      this.Name,
      1,
      TranslationPack.translationJsonPatcher('pve_zhibing times: {0}', 1).toString(),
    );
  }
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }
  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(
    owner: string,
    room: Room<WorkPlace>,
    target: string,
    selectedCards: CardId[],
    selectedTargets: string[],
    containerCard?: CardId,
  ): boolean {
    return selectedTargets.length < 1;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }
  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds } = event;
    const skilllv = room.getPlayerById(event.fromId).getFlag<number>(this.Name) || 0;
    const dam = Math.floor(Math.random() * (2 + skilllv) + 1);
    await room.damage({
      fromId: undefined,
      toId: toIds![0],
      damage: dam,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    });
    return true;
  }
}

@CommonSkill({ name: 'pve_pyjiaoyi', description: 'pve_pyjiaoyi_description' })
export class PvePyJiaoYi extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    const BOSS = room.getOtherPlayers(owner.Id).filter(player => player.hasSkill('pve_huashen'));
    for (const longshen of BOSS) {
      const longshenlv = PveHuaShen.CHARACTERS.length - room.getMark(longshen.Id, MarkEnum.PveHuaShen);
      return owner.hasUsedSkillTimes(this.Name) < longshenlv;
    }
    return false;
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const BOSS = room.getOtherPlayers(skillUseEvent.fromId).filter(player => player.hasSkill('pve_huashen'));
    for (const player of BOSS) {
      const py = Math.floor(Math.random() * 2 + 1);
      const pyskill = ['pve_beifa', 'pve_buxu', 'pve_dudu', 'pve_feihua', 'pve_chengxiang', 'pve_zhibing'];
      const options = [pyskill[Math.floor(Math.random() * pyskill.length)]];
      while (3 > options.length) {
        options.push(pyskill[Math.floor(Math.random() * pyskill.length)]);
      }
      const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        options,
        toId: skillUseEvent.fromId,
        conversation: 'pve_pyjiaoyi: A dirty deal' + py,
        triggeredBySkills: [this.Name],
      };
      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(
          askForChoosingOptionsEvent,
        ),
        skillUseEvent.fromId,
      );

      const { selectedOption } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        skillUseEvent.fromId,
      );
      if (selectedOption) {
        if (py === 1) {
          await room.changeMaxHp(skillUseEvent.fromId, -1);
          await room.changeMaxHp(player.Id, 1);
        } else if (py === 2) {
          await room.moveCards({
            movingCards: room
              .getPlayerById(skillUseEvent.fromId)
              .getCardIds(PlayerCardsArea.HandArea)
              .map(card => ({ card, fromArea: CardMoveArea.HandArea })),
            fromId: skillUseEvent.fromId,
            toId: player.Id,
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActiveMove,
            proposer: skillUseEvent.fromId,
            triggeredBySkills: [this.Name],
          });
        }
        if (room.getPlayerById(skillUseEvent.fromId).hasSkill(selectedOption)) {
          const skilllv = room.getPlayerById(skillUseEvent.fromId).getFlag<number>(selectedOption) || 0;
          selectedOption === 'pve_feihua'
            ? room.setFlag<number>(skillUseEvent.fromId, selectedOption, skilllv + 1)
            : room.setFlag<number>(
                skillUseEvent.fromId,
                selectedOption,
                skilllv + 1,
                TranslationPack.translationJsonPatcher(selectedOption + ' times: {0}', skilllv + 1).toString(),
              );
        } else {
          await room.obtainSkill(skillUseEvent.fromId, selectedOption);
        }
      }
    }
    return true;
  }
}

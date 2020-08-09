import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, GameStartStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { System } from 'core/shares/libs/system';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, LordSkill, SideEffectSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { TranslationPack } from 'core/translations/translation_json_tool';

@LordSkill
@CommonSkill({ name: 'huangtian', description: 'huangtian_description' })
export class HuangTian extends TriggerSkill implements OnDefineReleaseTiming {
  public isAutoTrigger() {
    return true;
  }

  public isFlaggedSkill() {
    return true;
  }

  async whenLosingSkill(room: Room) {
    room.uninstallSideEffectSkill(System.SideEffectSkillApplierEnum.HuangTian);
  }

  async whenObtainingSkill(room: Room) {
    room.installSideEffectSkill(System.SideEffectSkillApplierEnum.HuangTian, HuangTianGiveCard.Name);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.GameStartEvent>, stage?: AllStage): boolean {
    return stage === GameStartStage.BeforeGameStart;
  }
  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers>): boolean {
    return true;
  }
  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.translationsMessage = undefined;
    return true;
  }
  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    room.installSideEffectSkill(System.SideEffectSkillApplierEnum.HuangTian, HuangTianGiveCard.Name);
    return true;
  }
}

@SideEffectSkill
@CommonSkill({ name: HuangTian.Name, description: HuangTian.Description })
export class HuangTianGiveCard extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    const card = Sanguosha.getCardById(cardId);
    return card.GeneralName === 'jink' || card.GeneralName === 'lightning';
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean {
    return room.getPlayerById(target).hasSkill(this.GeneralName);
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }
  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds, cardIds } = event;
    await room.moveCards({
      movingCards: [{ card: cardIds![0], fromArea: CardMoveArea.HandArea }],
      fromId,
      toId: toIds![0],
      moveReason: CardMoveReason.ActiveMove,
      toArea: CardMoveArea.HandArea,
      proposer: fromId,
      movedByReason: this.GeneralName,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} obtains cards {1} from {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(toIds![0])),
        TranslationPack.patchCardInTranslation(...cardIds!),
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
      ).extract(),
    });

    return true;
  }
}

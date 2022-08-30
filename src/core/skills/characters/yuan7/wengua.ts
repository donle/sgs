import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, GameStartStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { System } from 'core/shares/libs/system';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill, SideEffectSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'wengua', description: 'wengua_description' })
export class WenGua extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.cardIds) {
      return false;
    }

    const options = ['wengua:top', 'wengua:bottom'];
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose wengua options: {1}',
          this.Name,
          TranslationPack.patchCardInTranslation(event.cardIds[0]),
        ).extract(),
        toId: event.fromId,
        triggeredBySkills: [this.Name],
      },
      event.fromId,
      true,
    );

    response.selectedOption = response.selectedOption || options[0];

    await room.moveCards({
      movingCards: [{ card: event.cardIds[0], fromArea: room.getPlayerById(event.fromId).cardFrom(event.cardIds[0]) }],
      fromId: event.fromId,
      toArea: CardMoveArea.DrawStack,
      placeAtTheBottomOfDrawStack: response.selectedOption !== options[0],
      moveReason: CardMoveReason.PlaceToDrawStack,
      proposer: event.fromId,
      triggeredBySkills: [this.Name],
    });

    await room.drawCards(
      1,
      event.fromId,
      response.selectedOption === options[0] ? 'bottom' : 'top',
      event.fromId,
      this.Name,
    );

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: WenGua.Name, description: WenGua.Description })
export class WenGuaShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public isAutoTrigger() {
    return true;
  }

  public isFlaggedSkill() {
    return true;
  }

  async whenLosingSkill(room: Room) {
    room.uninstallSideEffectSkill(System.SideEffectSkillApplierEnum.WenGua);
  }

  async whenObtainingSkill(room: Room, owner: Player) {
    room.installSideEffectSkill(System.SideEffectSkillApplierEnum.WenGua, WenGuaSide.Name, owner.Id);
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
    room.installSideEffectSkill(System.SideEffectSkillApplierEnum.WenGua, WenGuaSide.Name, event.fromId);
    return true;
  }
}

@SideEffectSkill
@PersistentSkill()
@CommonSkill({ name: 'side_wengua_s', description: 'side_wengua_s_description' })
export class WenGuaSide extends ActiveSkill {
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
    return true;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      !!room
        .getPlayerById(target)
        .getPlayerSkills('common')
        .find(skill => skill.Name === WenGua.Name) && target !== owner
    );
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.cardIds || !event.toIds) {
      return false;
    }
    const owner = event.toIds[0];

    await room.moveCards({
      movingCards: [{ card: event.cardIds[0], fromArea: room.getPlayerById(event.fromId).cardFrom(event.cardIds[0]) }],
      fromId: event.fromId,
      toId: owner,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: event.fromId,
      triggeredBySkills: [WenGua.Name],
    });

    const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options: ['yes', 'no'],
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: do you want to use this skill for {1}: {2}',
          WenGua.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
          TranslationPack.patchCardInTranslation(event.cardIds[0]),
        ).extract(),
        toId: owner,
        triggeredBySkills: [WenGua.Name],
      },
      owner,
      true,
    );

    if (resp.selectedOption !== 'yes') {
      return true;
    }

    const options = ['wengua:top', 'wengua:bottom'];
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose wengua options: {1} {2}',
          WenGua.Name,
          TranslationPack.patchCardInTranslation(event.cardIds[0]),
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
        ).extract(),
        toId: owner,
        triggeredBySkills: [WenGua.Name],
      },
      owner,
      true,
    );

    response.selectedOption = response.selectedOption || options[0];

    await room.moveCards({
      movingCards: [{ card: event.cardIds[0], fromArea: CardMoveArea.HandArea }],
      fromId: owner,
      toArea: CardMoveArea.DrawStack,
      placeAtTheBottomOfDrawStack: response.selectedOption !== options[0],
      moveReason: CardMoveReason.PlaceToDrawStack,
      proposer: owner,
      triggeredBySkills: [WenGua.Name],
    });

    for (const player of [event.fromId, owner]) {
      await room.drawCards(1, player, response.selectedOption === options[0] ? 'bottom' : 'top', player, WenGua.Name);
    }

    return true;
  }
}

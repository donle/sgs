import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import {
  CardMoveReason,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill, LimitSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@LimitSkill({ name: 'yongjin', description: 'yongjin_description' })
export class YongJin extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return true;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets(): number {
    return 2;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    const to = room.getPlayerById(target);
    const equiprCardIds = to.getCardIds(PlayerCardsArea.EquipArea);

    if (selectedTargets.length === 0) {
      return equiprCardIds.length > 0;
    } else if (selectedTargets.length === 1) {
      let canBeTarget: boolean = false;
      const from = room.getPlayerById(selectedTargets[0]);

      const fromEquipArea = from.getCardIds(PlayerCardsArea.EquipArea);
      canBeTarget = canBeTarget || fromEquipArea.find(id => room.canPlaceCardTo(id, target)) !== undefined;

      return canBeTarget;
    }

    return false;
  }

  public nominateForwardTarget(targets?: PlayerId[]) {
    return [targets![0]];
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, toIds } = event;

    return [
      { from: fromId, tos: [toIds![0]] },
      { from: toIds![0], tos: [toIds![1]] },
    ];
  }

  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.animation = this.getAnimationSteps(event);

    return true;
  }

  private async yongJinMove(room: Room, user: PlayerId, fromId: PlayerId, toId: PlayerId): Promise<CardId> {
    const moveFrom = room.getPlayerById(fromId);
    const moveTo = room.getPlayerById(toId);
    const canMovedEquipCardIds: CardId[] = [];

    const fromEquipArea = Precondition.exists(
      moveFrom.getCardIds(PlayerCardsArea.EquipArea),
      'Unable to get yongjin equips',
    );
    const banIds = room.getFlag<CardId[]>(user, this.Name);
    canMovedEquipCardIds.push(
      ...fromEquipArea.filter(id => room.canPlaceCardTo(id, moveTo.Id) && (banIds ? !banIds.includes(id) : true)),
    );

    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: canMovedEquipCardIds,
    };

    const chooseCardEvent = {
      fromId: user,
      toId: user,
      options,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
      user,
    );

    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      user,
    );

    response.selectedCard = response.selectedCard || canMovedEquipCardIds[0];

    await room.moveCards({
      movingCards: [{ card: response.selectedCard, fromArea: response.fromArea }],
      moveReason: CardMoveReason.PassiveMove,
      toId: moveTo.Id,
      fromId: moveFrom.Id,
      toArea: response.fromArea!,
      proposer: chooseCardEvent.fromId,
      movedByReason: this.Name,
    });

    return response.selectedCard;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;

    let banId = await this.yongJinMove(room, fromId, toIds![0], toIds![1]);
    room.setFlag<CardId[]>(fromId, this.Name, [banId]);

    for (let i = 0; i < 2; i++) {
      const skillUseEvent = {
        invokeSkillNames: [YongJinMove.Name],
        toId: fromId,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose two target to move their equipment',
          this.Name,
        ).extract(),
      };

      room.notify(GameEventIdentifiers.AskForSkillUseEvent, skillUseEvent, fromId);

      const { toIds } = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, fromId);

      if (!toIds) {
        break;
      }

      banId = await this.yongJinMove(room, fromId, toIds[0], toIds[1]);
      const banIds = room.getFlag<CardId[]>(fromId, this.Name) || [];

      banIds.push(banId);
      room.setFlag<CardId[]>(fromId, this.Name, banIds);
    }

    room.removeFlag(fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: 'yongjin_move', description: 'yongjin_move_description' })
export class YongJinMove extends TriggerSkill {
  public isTriggerable(): boolean {
    return false;
  }

  public canUse(): boolean {
    return false;
  }

  public numberOfTargets(): number {
    return 2;
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    const to = room.getPlayerById(target);
    const equipCardIds = to.getCardIds(PlayerCardsArea.EquipArea);

    if (selectedTargets.length === 0) {
      return equipCardIds.length > 0;
    } else if (selectedTargets.length === 1) {
      const from = room.getPlayerById(selectedTargets[0]);
      const banIds = room.getFlag<CardId[]>(owner, YongJin.Name);

      const fromEquipArea = from.getCardIds(PlayerCardsArea.EquipArea);

      return (
        fromEquipArea.find(id => {
          return room.canPlaceCardTo(id, target) && (banIds ? !banIds.includes(id) : true);
        }) !== undefined
      );
    }

    return false;
  }

  public nominateForwardTarget(targets?: PlayerId[]) {
    return [targets![0]];
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(): Promise<boolean> {
    return true;
  }
}

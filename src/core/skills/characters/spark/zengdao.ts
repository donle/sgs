import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, LimitSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@LimitSkill({ name: 'zengdao', description: 'zengdao_description' })
export class ZengDao extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return owner.getCardIds(PlayerCardsArea.EquipArea).length > 0;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.EquipArea];
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds, cardIds } = event;
    if (!toIds || !cardIds) {
      return false;
    }

    await room.moveCards({
      movingCards: cardIds.map(card => ({ card, fromArea: CardMoveArea.EquipArea })),
      fromId,
      toId: toIds[0],
      toArea: PlayerCardsArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      toOutsideArea: this.Name,
      isOutsideAreaInPublic: true,
      proposer: fromId,
      movedByReason: this.Name,
    });

    room.getPlayerById(toIds[0]).hasShadowSkill(ZengDaoBuff.Name) ||
      (await room.obtainSkill(toIds[0], ZengDaoBuff.Name));

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: 's_zengdao_buff', description: 's_zengdao_buff_description' })
export class ZengDaoBuff extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, player: Player) {
    await room.loseSkill(player.Id, this.Name);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamageEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return content.fromId === owner.Id && owner.getCardIds(PlayerCardsArea.OutsideArea, ZengDao.Name).length > 0;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;

    const dao = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.OutsideArea, ZengDao.Name);
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
      GameEventIdentifiers.AskForCardEvent,
      {
        cardAmount: 1,
        toId: fromId,
        reason: this.Name,
        conversation: TranslationPack.translationJsonPatcher('{0}: please remove a ‘Dao’', this.Name).extract(),
        fromArea: [PlayerCardsArea.OutsideArea],
        cardMatcher: new CardMatcher({
          cards: dao,
        }).toSocketPassenger(),
        triggeredBySkills: [this.Name],
      },
      fromId,
      true,
    );

    response.selectedCards = response.selectedCards || dao[0];

    await room.moveCards({
      movingCards: [{ card: response.selectedCards[0], fromArea: CardMoveArea.OutsideArea }],
      fromId,
      toArea: CardMoveArea.DropStack,
      moveReason: CardMoveReason.PlaceToDropStack,
      proposer: fromId,
      triggeredBySkills: [ZengDao.Name],
    });

    (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).damage++;

    if (room.getPlayerById(fromId).getCardIds(PlayerCardsArea.OutsideArea, ZengDao.Name).length === 0) {
      await room.loseSkill(fromId, this.Name);
    }

    return true;
  }
}

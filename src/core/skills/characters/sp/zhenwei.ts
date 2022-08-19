import { CardType, VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { ExtralCardSkillProperty } from 'core/skills/cards/interface/extral_property';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhenwei', description: 'zhenwei_description' })
export class ZhenWei extends TriggerSkill {
  private readonly ZhenWeiOptions = ['zhenwei:transfer', 'zhenwei:cancel'];

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.OnAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      content.fromId !== owner.Id &&
      room.getPlayerById(content.toId).Hp < owner.Hp &&
      (Sanguosha.getCardById(content.byCardId).GeneralName === 'slash' ||
        (Sanguosha.getCardById(content.byCardId).is(CardType.Trick) &&
          Sanguosha.getCardById(content.byCardId).isBlack())) &&
      AimGroupUtil.getAllTargets(content.allTargets).length === 1 &&
      owner.getPlayerCards().length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return room.canDropCard(owner, cardId);
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    if (!event.cardIds) {
      return false;
    }

    const options = this.ZhenWeiOptions.slice();
    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    if (
      !(
        !AimGroupUtil.getAllTargets(aimEvent.allTargets).includes(event.fromId) &&
        room.isAvailableTarget(aimEvent.byCardId, aimEvent.fromId, event.fromId) &&
        ((Sanguosha.getCardById(aimEvent.byCardId).Skill as unknown) as ExtralCardSkillProperty).isCardAvailableTarget(
          aimEvent.fromId,
          room,
          event.fromId,
          [],
          [],
          aimEvent.byCardId,
        )
      )
    ) {
      options.shift();
    }

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose zhenwei options: {1} {2}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(aimEvent.toId)),
          TranslationPack.patchCardInTranslation(aimEvent.byCardId),
        ).extract(),
        toId: event.fromId,
        triggeredBySkills: [this.Name],
      },
      event.fromId,
      true,
    );

    response.selectedOption = response.selectedOption || options[options.length - 1];

    EventPacker.addMiddleware({ tag: this.Name, data: response.selectedOption }, event);

    return true;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds!, event.fromId, event.fromId, this.Name);

    const chosen = EventPacker.getMiddleware<string>(this.Name, event);
    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    if (chosen === this.ZhenWeiOptions[0]) {
      await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);
      const originalTargets = TargetGroupUtil.getAllTargets(aimEvent.targetGroup)![0];

      AimGroupUtil.cancelTarget(aimEvent, aimEvent.toId);

      originalTargets[0] = event.fromId;
      AimGroupUtil.addTargets(room, aimEvent, originalTargets);
    } else {
      const allCards = VirtualCard.getActualCards([aimEvent.byCardId]);
      if (
        room.isCardOnProcessing(aimEvent.byCardId) &&
        allCards.length > 0 &&
        !room.getPlayerById(aimEvent.fromId).Dead
      ) {
        await room.moveCards({
          movingCards: allCards.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
          toId: aimEvent.fromId,
          toArea: CardMoveArea.OutsideArea,
          moveReason: CardMoveReason.PassiveMove,
          proposer: event.fromId,
          isOutsideAreaInPublic: true,
          toOutsideArea: this.Name,
          triggeredBySkills: [this.Name],
        });

        AimGroupUtil.cancelTarget(aimEvent, aimEvent.toId);

        room.getPlayerById(aimEvent.fromId).hasShadowSkill(ZhenWeiClear.Name) ||
          (await room.obtainSkill(aimEvent.fromId, ZhenWeiClear.Name));
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_zhenwei_clear', description: 's_zhenwei_clear_description' })
export class ZhenWeiClear extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, owner: Player) {
    await room.loseSkill(owner.Id, this.Name);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return event.from === PlayerPhase.PhaseFinish;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const zheng = room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.OutsideArea, ZhenWei.Name);
    zheng.length > 0 &&
      (await room.moveCards({
        movingCards: zheng.map(id => ({ card: id, fromArea: PlayerCardsArea.OutsideArea })),
        fromId: event.fromId,
        toId: event.fromId,
        toArea: PlayerCardsArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        movedByReason: ZhenWei.Name,
      }));

    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}

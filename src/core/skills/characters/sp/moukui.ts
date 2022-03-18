import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, CardEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'moukui', description: 'moukui_description' })
export class MouKui extends TriggerSkill {
  private readonly MouKuiOptions = ['moukui:draw', 'moukui:discard'];

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return content.fromId === owner.Id && Sanguosha.getCardById(content.byCardId).GeneralName === 'slash';
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const options = this.MouKuiOptions.slice();
    const to = room.getPlayerById((event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>).toId);
    if (
      to.Id === event.fromId
        ? !to.getPlayerCards().find(id => room.canDropCard(event.fromId, id))
        : to.getPlayerCards().length === 0
    ) {
      options.pop();
    }

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose moukui options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(to),
        ).extract(),
        toId: event.fromId,
        triggeredBySkills: [this.Name],
      },
      event.fromId,
    );

    if (response.selectedOption) {
      EventPacker.addMiddleware({ tag: this.Name, data: response.selectedOption }, event);
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const chosen = EventPacker.getMiddleware<string>(this.Name, event);

    if (chosen === this.MouKuiOptions[0]) {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    } else {
      const to = room.getPlayerById((event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>).toId);
      const options: CardChoosingOptions = {
        [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId,
        toId: to.Id,
        options,
        triggeredBySkills: [this.Name],
      };

      const resp = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, true, true);
      if (!resp) {
        return false;
      }

      await room.dropCards(
        fromId === to.Id ? CardMoveReason.SelfDrop : CardMoveReason.PassiveDrop,
        [resp.selectedCard!],
        to.Id,
        fromId,
        this.Name,
      );
    }

    EventPacker.addMiddleware(
      { tag: this.Name, data: event.fromId },
      event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>,
    );

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: MouKui.Name, description: MouKui.Description })
export class MouKuiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>, stage?: AllStage): boolean {
    return stage === CardEffectStage.CardEffectCancelledOut;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>): boolean {
    return (
      content.toIds !== undefined &&
      EventPacker.getMiddleware<PlayerId>(this.GeneralName, content) === owner.Id &&
      Sanguosha.getCardById(content.cardId).GeneralName === 'slash'
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const from = room.getPlayerById(event.fromId);
    const toId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>).toIds![0];
    if (
      toId === event.fromId
        ? from.getPlayerCards().find(id => room.canDropCard(event.fromId, id))
        : from.getPlayerCards().length > 0
    ) {
      const options: CardChoosingOptions = {
        [PlayerCardsArea.EquipArea]: from.getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.HandArea]: from.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId: toId,
        toId: event.fromId,
        options,
        triggeredBySkills: [this.Name],
      };

      const resp = await room.askForChoosingPlayerCard(chooseCardEvent, toId, true, true);
      if (!resp) {
        return false;
      }

      await room.dropCards(
        event.fromId === toId ? CardMoveReason.SelfDrop : CardMoveReason.PassiveDrop,
        [resp.selectedCard!],
        event.fromId,
        toId,
        this.Name,
      );
    }

    return true;
  }
}

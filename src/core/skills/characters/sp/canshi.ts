import { CharacterNationality } from 'core/characters/character';
import { CardDrawReason, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, DrawCardStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { GuiMing } from './guiming';

@CommonSkill({ name: 'canshi', description: 'canshi_description' })
export class CanShi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage): boolean {
    return stage === DrawCardStage.CardDrawing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>): boolean {
    if (
      !(
        owner.Id === content.fromId &&
        room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
        content.bySpecialReason === CardDrawReason.GameStage
      )
    ) {
      return false;
    }

    const hasGuiMing = owner.getPlayerSkills().find(skill => skill.Name === GuiMing.Name);
    return (
      room
        .getAlivePlayersFrom()
        .find(
          player =>
            player.LostHp > 0 || (owner !== player && hasGuiMing && player.Nationality === CharacterNationality.Wu),
        ) !== undefined
    );
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    const hasGuiMing = owner.getPlayerSkills().find(skill => skill.Name === GuiMing.Name);
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to draw {1} card(s) additionally?',
      this.Name,
      room
        .getAlivePlayersFrom()
        .filter(
          player =>
            player.LostHp > 0 || (owner !== player && hasGuiMing && player.Nationality === CharacterNationality.Wu),
        ).length,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const from = room.getPlayerById(event.fromId);
    const drawCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;

    const hasGuiMing = from.getPlayerSkills().find(skill => skill.Name === GuiMing.Name);
    drawCardEvent.drawAmount += room
      .getAlivePlayersFrom()
      .filter(
        player =>
          player.LostHp > 0 || (from !== player && hasGuiMing && player.Nationality === CharacterNationality.Wu),
      ).length;

    from.setFlag<boolean>(this.Name, true);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: CanShi.Name, description: CanShi.Description })
export class CanShiShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    if (!owner.getFlag<boolean>(this.GeneralName)) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        cardUseEvent.fromId === owner.Id &&
        (Sanguosha.getCardById(cardUseEvent.cardId).GeneralName === 'slash' ||
          Sanguosha.getCardById(cardUseEvent.cardId).isCommonTrick()) &&
        owner.getPlayerCards().find(id => room.canDropCard(owner.Id, id)) !== undefined
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.fromPlayer === owner.Id && phaseChangeEvent.from === PlayerPhase.PhaseFinish;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const identifier = EventPacker.getIdentifier(
      event.triggeredOnEvent as ServerEventFinder<
        GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
      >,
    );

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const response = await room.askForCardDrop(
        event.fromId,
        1,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        undefined,
        this.GeneralName,
      );

      response.droppedCards.length > 0 &&
        (await room.dropCards(
          CardMoveReason.SelfDrop,
          response.droppedCards,
          event.fromId,
          event.fromId,
          this.GeneralName,
        ));
    } else {
      room.removeFlag(event.fromId, this.GeneralName);
    }

    return true;
  }
}

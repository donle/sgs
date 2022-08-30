import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'mingshi', description: 'mingshi_description' })
export class MingShi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.toId === owner.Id &&
      content.fromId !== undefined &&
      owner.getMark(MarkEnum.Qian) > 0 &&
      !room.getPlayerById(content.fromId).Dead &&
      room.getPlayerById(content.fromId).getPlayerCards().length > 0
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = event;
    const source = (triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId!;

    const sourcePlayer = room.getPlayerById(source);
    const options = {
      [PlayerCardsArea.JudgeArea]: sourcePlayer.getCardIds(PlayerCardsArea.JudgeArea),
      [PlayerCardsArea.EquipArea]: sourcePlayer.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: sourcePlayer.getCardIds(PlayerCardsArea.HandArea),
    };

    const chooseCardEvent = {
      fromId: source,
      toId: source,
      options,
      triggeredBySkills: [this.Name],
    };

    const response = await room.askForChoosingPlayerCard(chooseCardEvent, source, true, true);
    if (!response) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, [response.selectedCard!], source, source, this.Name);
    if (Sanguosha.getCardById(response.selectedCard!).isBlack() && room.isCardInDropStack(response.selectedCard!)) {
      await room.moveCards({
        movingCards: [{ card: response.selectedCard!, fromArea: CardMoveArea.DropStack }],
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      });
    } else if (Sanguosha.getCardById(response.selectedCard!).isRed()) {
      await room.recover({
        toId: event.fromId,
        recoveredHp: 1,
        recoverBy: event.fromId,
      });
    }

    return true;
  }
}

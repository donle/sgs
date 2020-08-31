import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yinghun', description: 'yinghun_description' })
export class YingHun extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.playerId === owner.Id && owner.Hp < owner.MaxHp;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = event;
    const options: string[] = ['yinghun:option-one', 'yinghun:option-two'];

    let selected: string | undefined;
    const from = room.getPlayerById(fromId);
    const toId = toIds![0];
    const x = from.LostHp;

    if (x > 1) {
      const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options,
        conversation: TranslationPack.translationJsonPatcher(
          'please choose yinghun options:{0}:{1}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(toId)),
          x,
        ).extract(),
        toId: fromId,
      });

      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseEvent, fromId);

      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, fromId);
      selected = response.selectedOption || 'yinghun:option-one';
    }

    if (!selected || selected === 'yinghun:option-one') {
      await room.drawCards(1, toId, 'top', fromId, this.Name);

      const response = await room.askForCardDrop(
        toId,
        Math.min(x, room.getPlayerById(toId).getPlayerCards().length),
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        undefined,
        this.Name,
      );
      await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toId);
    } else {
      await room.drawCards(x, toId, 'top', fromId, this.Name);

      const response = await room.askForCardDrop(
        toId,
        1,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        undefined,
        this.Name,
      );
      await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toId);
    }

    return true;
  }
}

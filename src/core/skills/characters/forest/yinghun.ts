import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
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
    return (
      content.playerId === owner.Id &&
      owner.Hp < owner.MaxHp
    );
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
    const options: string[] = ['yinghun:discard', 'yinghun:draw'];

    const from = room.getPlayerById(fromId);
    const x = from.MaxHp - from.Hp;
    const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
      options,
      conversation: TranslationPack.translationJsonPatcher(
        'please choose tianxiang options:{0}',
        x,
      ).extract(),
      toId: fromId,
    });

    room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseEvent, fromId);

    const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, fromId);

    response.selectedOption = response.selectedOption || 'yinghun:discard';
    if (response.selectedOption === 'yinghun:discard') {
      await room.drawCards(1, toIds![0], 'top', fromId, this.Name);
      await room.askForCardDrop(
        toIds![0],
        x,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        undefined,
        this.Name
      );
    } else {
      await room.askForCardDrop(
        toIds![0],
        1,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        undefined,
        this.Name
      );

      await room.drawCards(x, toIds![0], 'top', fromId, this.Name);
    }

    return true;
  }
}

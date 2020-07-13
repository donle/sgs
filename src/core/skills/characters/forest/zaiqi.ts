import { CardMoveArea, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zaiqi', description: 'zaiqi_description' })
export class ZaiQi extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    if (owner.getFlag<number>(this.Name) !== undefined) {
      room.removeFlag(owner.Id, this.Name);
    }

    let isUseable = owner.Id === content.playerId && content.toStage === PlayerPhaseStages.DropCardStageEnd;
    if (isUseable) {
      let droppedCardNum = 0;
      room.Analytics.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
        event =>
          EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
          event.toArea === CardMoveArea.DropStack,
        content.playerId,
        true,
      ).forEach(event => {
        droppedCardNum += event.movingCards.filter(mcard => Sanguosha.getCardById(mcard.card).isRed()).length;
      });

      isUseable = droppedCardNum > 0;
      if (isUseable) {
        room.setFlag(owner.Id, this.Name, droppedCardNum);
      }
    }
    return isUseable;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length > 0 && targets.length <= owner.getFlag<number>(this.Name);
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, toIds } = skillUseEvent;
    if (!toIds || toIds.length < 1) {
      return false;
    }

    const from = room.getPlayerById(fromId);
    for (const target of toIds) {
      const options: string[] = ['zaiqi:draw'];
      if (from.Hp < from.MaxHp) {
        options.push('zaiqi:recover');
      }

      const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options,
        conversation: TranslationPack.translationJsonPatcher('{0}: please choose', this.Name).extract(),
        toId: target,
      });

      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseEvent, target);

      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, target);
      response.selectedOption = response.selectedOption || 'zaiqi:draw';

      if (response.selectedOption === 'zaiqi:recover') {
        await room.recover({
          toId: fromId,
          recoveredHp: 1,
          recoverBy: target,
        });
      } else {
        await room.drawCards(1, target, 'top', fromId, this.Name);
      }
    }

    return true;
  }
}

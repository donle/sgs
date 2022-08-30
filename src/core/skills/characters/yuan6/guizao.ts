import { CardSuit } from 'core/cards/libs/card_props';
import { CardMovedBySpecifiedReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'guizao', description: 'guizao_description' })
export class GuiZao extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    if (event.playerId === owner.Id && event.toStage === PlayerPhaseStages.DropCardStageEnd) {
      const records = room.Analytics.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
        event =>
          EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
          !!event.infos.find(
            info => info.fromId === owner.Id && info.movedByReason === CardMovedBySpecifiedReason.GameRuleDrop,
          ),
        owner.Id,
        'phase',
      );

      const suitsRecorded: CardSuit[] = [];
      for (const record of records) {
        for (const info of record.infos) {
          for (const cardInfo of info.movingCards) {
            if (Sanguosha.getCardById(cardInfo.card).isVirtualCard()) {
              continue;
            }

            const suitDiscarded = Sanguosha.getCardById(cardInfo.card).Suit;
            if (suitsRecorded.includes(suitDiscarded)) {
              return false;
            }

            suitsRecorded.push(suitDiscarded);
          }
        }
      }

      return suitsRecorded.length > 1;
    }

    return false;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const options = ['guizao:draw', 'cancel'];
    if (room.getPlayerById(event.fromId).LostHp > 0) {
      options.push('guizao:recover');
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose guizao options',
            this.Name,
          ).extract(),
          toId: event.fromId,
          triggeredBySkills: [this.Name],
        },
        event.fromId,
      );

      if (response.selectedOption && response.selectedOption !== 'cancel') {
        EventPacker.addMiddleware({ tag: this.Name, data: response.selectedOption }, event);
        return true;
      }
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (EventPacker.getMiddleware<string>(this.Name, event) === 'guizao:recover') {
      await room.recover({
        toId: event.fromId,
        recoveredHp: 1,
        recoverBy: event.fromId,
      });
    } else {
      await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);
    }

    return true;
  }
}

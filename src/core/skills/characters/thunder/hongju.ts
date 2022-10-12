import { ZhengRong } from './zhengrong';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AwakeningSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@AwakeningSkill({ name: 'hongju', description: 'hongju_description' })
export class HongJu extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['qingce'];
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && room.enableToAwaken(this.Name, owner);
  }

  public async onTrigger(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activated awakening skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);
    const rongs = from.getCardIds(PlayerCardsArea.OutsideArea, ZhengRong.Name);

    if (from.getCardIds(PlayerCardsArea.HandArea).length > 0 && rongs.length > 0) {
      const { selectedCards } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardEvent>(
        GameEventIdentifiers.AskForChoosingCardEvent,
        {
          amount: rongs.length,
          customCardFields: {
            [ZhengRong.Name]: rongs,
            [PlayerCardsArea.HandArea]: from.getCardIds(PlayerCardsArea.HandArea),
          },
          toId: fromId,
          customTitle: TranslationPack.translationJsonPatcher(
            'hongju: please choose {1} cards to be new Rong',
            rongs.length,
          ).toString(),
        },
        fromId,
      );

      if (selectedCards) {
        const toGain = rongs.filter(card => !selectedCards.includes(card));

        if (toGain.length > 0) {
          const toRong = selectedCards.filter(card => !rongs.includes(card));

          await room.moveCards({
            movingCards: toRong.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
            fromId,
            toId: fromId,
            toArea: PlayerCardsArea.OutsideArea,
            moveReason: CardMoveReason.ActiveMove,
            toOutsideArea: ZhengRong.Name,
            isOutsideAreaInPublic: false,
            proposer: fromId,
            movedByReason: this.Name,
          });

          await room.moveCards({
            movingCards: toGain.map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
            fromId,
            toId: fromId,
            toArea: PlayerCardsArea.HandArea,
            moveReason: CardMoveReason.ActiveMove,
            proposer: fromId,
            movedByReason: this.Name,
          });
        }
      }
    }

    await room.changeMaxHp(fromId, -1);
    await room.obtainSkill(fromId, 'qingce', true);

    return true;
  }
}

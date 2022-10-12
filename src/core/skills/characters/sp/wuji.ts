import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { QingLongYanYueDao } from 'core/cards/standard/qinglongdao';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { AwakeningSkill } from 'core/skills/skill_wrappers';
import { HuXiao } from './huxiao';

@AwakeningSkill({ name: 'wuji', description: 'wuji_description' })
export class WuJi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      room.enableToAwaken(this.Name, owner)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.changeMaxHp(event.fromId, 1);
    await room.recover({
      toId: event.fromId,
      recoveredHp: 1,
      recoverBy: event.fromId,
    });

    await room.loseSkill(event.fromId, HuXiao.Name, true);

    if (
      room
        .getPlayerById(event.fromId)
        .getCardIds(PlayerCardsArea.HandArea)
        .find(cardId => Sanguosha.getCardById(cardId).Name === QingLongYanYueDao.name)
    ) {
      return true;
    }

    let qinglongdao: CardId[] = [];
    let fromArea: CardMoveArea | undefined;
    let fromId: PlayerId | undefined;

    for (const player of room.AlivePlayers) {
      let currentQinglong: CardId | undefined;
      currentQinglong = player
        .getCardIds(PlayerCardsArea.EquipArea)
        .find(cardId => Sanguosha.getCardById(cardId).Name === QingLongYanYueDao.name);
      if (currentQinglong) {
        fromArea = CardMoveArea.EquipArea;
      } else {
        if (player.getCardIds(PlayerCardsArea.JudgeArea).length === 0) {
          continue;
        }

        const actualCards = player
          .getCardIds(PlayerCardsArea.JudgeArea)
          .reduce<CardId[]>((cardIds, cardId) => cardIds.concat(...VirtualCard.getActualCards([cardId])), []);
        currentQinglong = actualCards.find(cardId => Sanguosha.getCardById(cardId).Name === QingLongYanYueDao.name);
        if (currentQinglong) {
          fromArea = CardMoveArea.JudgeArea;
        }
      }

      if (currentQinglong) {
        qinglongdao = [currentQinglong];
        fromId = player.Id;
        break;
      }
    }

    if (qinglongdao.length === 0) {
      qinglongdao = room.findCardsByMatcherFrom(new CardMatcher({ name: [QingLongYanYueDao.name] }));
      if (qinglongdao.length === 0) {
        qinglongdao = room.findCardsByMatcherFrom(new CardMatcher({ name: [QingLongYanYueDao.name] }), false);
        qinglongdao.length > 0 && (fromArea = CardMoveArea.DropStack);
      } else {
        fromArea = CardMoveArea.DrawStack;
      }
    }

    qinglongdao.length > 0 &&
      fromArea !== undefined &&
      (await room.moveCards({
        movingCards: [{ card: qinglongdao[0], fromArea }],
        fromId,
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      }));

    return true;
  }
}

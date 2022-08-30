import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType, INFINITE_DISTANCE, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import {
  AllStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'yuyun', description: 'yuyun_description' })
export class YuYun extends TriggerSkill {
  public static readonly YuYunTargets = 'yuyun_targets';

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
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PlayCardStageStart &&
      (owner.Hp > 1 || owner.MaxHp > 1)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const options = ['yuyun:loseMaxHp'];
    room.getPlayerById(fromId).Hp > 1 && options.unshift('yuyun:loseHp');

    let selectedOption = options[0];
    if (options.length === 2) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options,
          conversation: TranslationPack.translationJsonPatcher('{0}: please choose yuyun options', this.Name).extract(),
          toId: fromId,
          triggeredBySkills: [this.Name],
        },
        fromId,
      );

      selectedOption = response.selectedOption || selectedOption;
    }

    selectedOption === 'yuyun:loseMaxHp' ? await room.changeMaxHp(fromId, -1) : await room.loseHp(fromId, 1);

    const chosenOptions: string[] = [];
    for (let i = 0; i < room.getPlayerById(fromId).LostHp + 1; i++) {
      let secOptions = ['yuyun:draw2', 'yuyun:damage', 'yuyun:unlimited'];
      room.getOtherPlayers(fromId).find(player => player.getCardIds().length > 0) && secOptions.push('yuyun:prey');
      room
        .getOtherPlayers(fromId)
        .find(player => player.getCardIds(PlayerCardsArea.HandArea).length < Math.min(player.MaxHp, 5)) &&
        secOptions.push('yuyun:letDraw');

      secOptions = secOptions.filter(option => !chosenOptions.includes(option));

      if (secOptions.length === 0) {
        break;
      }

      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options: secOptions,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose yuyun_sec options: {1}',
            this.Name,
            room.getPlayerById(fromId).LostHp + 1 - i,
          ).extract(),
          toId: fromId,
          triggeredBySkills: [this.Name],
        },
        fromId,
        i === 0,
      );

      i === 0 && (resp.selectedOption = resp.selectedOption || secOptions[0]);
      if (!resp.selectedOption) {
        break;
      }
      chosenOptions.push(resp.selectedOption);

      if (resp.selectedOption === 'yuyun:draw2') {
        await room.drawCards(2, fromId, 'top', fromId, this.Name);
      } else if (resp.selectedOption === 'yuyun:unlimited') {
        room.setFlag<boolean>(fromId, this.Name, true);
      } else {
        let targets = room.getOtherPlayers(fromId);
        if (resp.selectedOption === 'yuyun:discard') {
          targets = targets.filter(player => player.getCardIds().length > 0);
        } else if (resp.selectedOption === 'yuyun:letDraw') {
          targets = room.AlivePlayers.filter(
            player => player.getCardIds(PlayerCardsArea.HandArea).length < player.MaxHp,
          );
        }

        const resp2 = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          {
            players: targets.map(player => player.Id),
            toId: fromId,
            requiredAmount: 1,
            conversation: 'yuyun: please choose a target',
            triggeredBySkills: [this.Name],
          },
          fromId,
          true,
        );

        resp2.selectedPlayers = resp2.selectedPlayers || [targets[0].Id];
        if (resp.selectedOption === 'yuyun:damage') {
          await room.damage({
            fromId,
            toId: resp2.selectedPlayers[0],
            damage: 1,
            damageType: DamageType.Normal,
            triggeredBySkills: [this.Name],
          });

          const originalTargets = room.getFlag<PlayerId[]>(fromId, YuYun.YuYunTargets) || [];
          originalTargets.push(resp2.selectedPlayers[0]);
          room.setFlag<PlayerId[]>(fromId, YuYun.YuYunTargets, originalTargets);
        } else if (resp.selectedOption === 'yuyun:prey') {
          const to = room.getPlayerById(resp2.selectedPlayers[0]);
          const options: CardChoosingOptions = {
            [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
            [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
            [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
          };

          const chooseCardEvent = {
            fromId,
            toId: resp2.selectedPlayers[0],
            options,
            triggeredBySkills: [this.Name],
          };

          const response = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, false, true);
          if (!response) {
            return false;
          }

          await room.moveCards({
            movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
            fromId: resp2.selectedPlayers[0],
            toId: fromId,
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActivePrey,
            proposer: fromId,
            triggeredBySkills: [this.Name],
          });
        } else {
          const to = room.getPlayerById(resp2.selectedPlayers[0]);
          await room.drawCards(
            Math.min(to.MaxHp, 5) - to.getCardIds(PlayerCardsArea.HandArea).length,
            resp2.selectedPlayers[0],
            'top',
            resp2.selectedPlayers[0],
            this.Name,
          );
        }
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: YuYun.Name, description: YuYun.Description })
export class YuYunBuff extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakBaseCardHoldNumber(room: Room, owner: Player): number {
    return owner.getFlag<boolean>(this.GeneralName) ? 1000 : -1;
  }

  public breakCardUsableDistanceTo(
    cardId: CardId | CardMatcher | undefined,
    room: Room,
    owner: Player,
    target: Player,
  ): number {
    if (!owner.getFlag<PlayerId>(YuYun.YuYunTargets)?.includes(target.Id)) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      match = cardId !== undefined && Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }

  public breakCardUsableTimesTo(cardId: CardId | CardMatcher, room: Room, owner: Player, target: Player): number {
    if (!owner.getFlag<PlayerId>(YuYun.YuYunTargets)?.includes(target.Id)) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return INFINITE_TRIGGERING_TIMES;
    } else {
      return 0;
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: YuYunBuff.Name, description: YuYunBuff.Description })
export class YuYunShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PhaseFinish &&
      (owner.getFlag<boolean>(this.GeneralName) !== undefined ||
        owner.getFlag<PlayerId>(YuYun.YuYunTargets) !== undefined)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);
    room.removeFlag(event.fromId, YuYun.YuYunTargets);

    return true;
  }
}

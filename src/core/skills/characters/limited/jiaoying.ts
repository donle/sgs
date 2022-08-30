import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardColor, CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  CardMoveStage,
  CardUseStage,
  PhaseChangeStage,
  PlayerPhase,
  StagePriority,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { FilterSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

type JiaoYingMapper = { [playerId: string]: number };

@CommonSkill({ name: 'jiaoying', description: 'jiaoying_description' })
export class JiaoYing extends TriggerSkill {
  public static readonly UsedTimesMappers = 'jiaoying_used_times_mappers';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return (
      content.infos.find(
        info =>
          info.fromId === owner.Id &&
          info.movingCards.find(card => card.fromArea === CardMoveArea.HandArea) !== undefined &&
          info.toId !== owner.Id &&
          info.toArea === CardMoveArea.HandArea,
      ) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    for (const info of (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos) {
      if (
        info.fromId === event.fromId &&
        info.movingCards.find(card => card.fromArea === CardMoveArea.HandArea) !== undefined &&
        info.toId !== event.fromId &&
        info.toArea === CardMoveArea.HandArea
      ) {
        continue;
      }

      const toId = info.toId!;
      const originalColors = room.getFlag<CardColor[]>(toId, this.Name) || [];
      if (originalColors.length < 2) {
        let hasPushed = false;
        for (const cardInfo of info.movingCards) {
          if (cardInfo.asideMove) {
            continue;
          }

          if (originalColors.length > 1) {
            break;
          }

          const cardColor = Sanguosha.getCardById(cardInfo.card).Color;
          if (!originalColors.includes(cardColor)) {
            originalColors.push(cardColor);
            hasPushed = true;
          }
        }

        hasPushed && room.setFlag<CardColor[]>(toId, this.Name, originalColors);
      }

      const originalMappers = room.getFlag<JiaoYingMapper[]>(toId, JiaoYing.UsedTimesMappers) || [];
      originalMappers[toId] = originalMappers[toId] || 0;
      originalMappers[toId]++;
      room.getPlayerById(toId).setFlag<JiaoYingMapper[]>(JiaoYing.UsedTimesMappers, originalMappers);

      for (const skillName of [JiaoYingBlocker.Name, JiaoYingRemover.Name]) {
        room.getPlayerById(toId).hasShadowSkill(skillName) || (await room.obtainSkill(toId, skillName));
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: JiaoYing.Name, description: JiaoYing.Description })
export class JiaoYingShaodow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public getPriority(): StagePriority {
    return StagePriority.High;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      content.from === PlayerPhase.PhaseFinish &&
      !!room.getOtherPlayers(owner.Id).find(player => {
        const jiaoYingMappers = player.getFlag<JiaoYingMapper[]>(JiaoYing.UsedTimesMappers);
        return jiaoYingMappers && jiaoYingMappers[owner.Id];
      })
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const availableNum = room.getOtherPlayers(event.fromId).reduce<number>((sum, player) => {
      const originalMappers = player.getFlag<JiaoYingMapper[]>(JiaoYing.UsedTimesMappers);
      if (originalMappers && originalMappers[event.fromId] && originalMappers[event.fromId] > 0) {
        sum += originalMappers[event.fromId];
      }

      return sum;
    }, 0);

    const targets = room.AlivePlayers.filter(player => player.getCardIds(PlayerCardsArea.HandArea).length < 5).map(
      player => player.Id,
    );
    if (targets.length < 1) {
      return false;
    }

    const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players: targets,
        toId: event.fromId,
        requiredAmount: [1, availableNum],
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: do you want to choose at most {1} targets to draw cards?',
          this.GeneralName,
          availableNum,
        ).toString(),
        triggeredBySkills: [this.GeneralName],
      },
      event.fromId,
    );

    if (resp.selectedPlayers && resp.selectedPlayers.length > 0) {
      event.toIds = resp.selectedPlayers;
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    for (const toId of event.toIds) {
      const drawNum = 5 - room.getPlayerById(toId).getCardIds(PlayerCardsArea.HandArea).length;
      drawNum > 0 && (await room.drawCards(drawNum, toId, 'top', event.fromId, this.GeneralName));
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_jiaoying_blocker', description: 's_jiaoying_blocker_description' })
export class JiaoYingBlocker extends FilterSkill {
  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    const colors = room.getFlag<CardColor[]>(owner, JiaoYing.Name);
    if (colors === undefined) {
      return true;
    }

    if (cardId instanceof CardMatcher) {
      const suits: CardSuit[] = [];
      for (const color of colors) {
        if (suits.length === 4) {
          break;
        }

        if (color === CardColor.Black) {
          suits.push(...[CardSuit.Club, CardSuit.Spade]);
        } else if (color === CardColor.Red) {
          suits.push(...[CardSuit.Diamond, CardSuit.Heart]);
        }
      }

      return !cardId.match(new CardMatcher({ suit: suits }));
    } else {
      return !colors.includes(Sanguosha.getCardById(cardId).Color);
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_jiaoying_remover', description: 's_jiaoying_remover_description' })
export class JiaoYingRemover extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenLosingSkill(room: Room, player: Player) {
    player.getFlag<CardColor[]>(JiaoYing.Name) && room.removeFlag(player.Id, JiaoYing.Name);
    player.removeFlag(JiaoYing.UsedTimesMappers);
    player.hasShadowSkill(JiaoYingBlocker.Name) && (await room.loseSkill(player.Id, JiaoYingBlocker.Name));
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged || stage === CardUseStage.BeforeCardUseEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.CardUseEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      return (content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).from === PlayerPhase.PhaseFinish;
    } else if (identifier === GameEventIdentifiers.CardUseEvent) {
      return (
        (content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).fromId === owner.Id &&
        !!owner.getFlag<JiaoYingMapper[]>(JiaoYing.UsedTimesMappers)
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (
      EventPacker.getIdentifier(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>) ===
      GameEventIdentifiers.PhaseChangeEvent
    ) {
      await room.loseSkill(event.fromId, this.Name);
    } else {
      room.getPlayerById(event.fromId).removeFlag(JiaoYing.UsedTimesMappers);
    }

    return true;
  }
}

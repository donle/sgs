import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { BaGuaZhen } from 'core/cards/standard/baguazhen';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, JudgeEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, SkillType, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { BaZhen } from '../fire/bazhen';

type JieZhenMapper = { [playerId: string]: string[] };

@CommonSkill({ name: 'jiezhen', description: 'jiezhen_description' })
export class JieZhen extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.toIds) {
      return false;
    }

    const toId = event.toIds[0];
    const skillsToLose: string[] = [];
    for (const skill of room.getPlayerById(toId).getPlayerSkills(undefined, true)) {
      if (
        !(
          [SkillType.Compulsory, SkillType.Limit, SkillType.Awaken, SkillType.Quest].includes(skill.SkillType) ||
          skill.isLordSkill() ||
          skill.isShadowSkill() ||
          skill.isStubbornSkill()
        )
      ) {
        skillsToLose.push(skill.Name);
      }
    }

    for (const skillName of skillsToLose) {
      await room.loseSkill(toId, skillName);
    }
    await room.obtainSkill(toId, BaZhen.Name);

    const originalMappers = room.getFlag<JieZhenMapper[]>(toId, this.Name) || [];
    originalMappers[event.fromId] = originalMappers[event.fromId] || [];
    originalMappers[event.fromId].push(...skillsToLose);
    room.getPlayerById(toId).setFlag<JieZhenMapper[]>(this.Name, originalMappers);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: JieZhen.Name, description: JieZhen.Description })
export class JieZhenResume extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenLosingSkill(room: Room, player: Player) {
    player.removeFlag(JieZhen.Name);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.AfterPhaseChanged || stage === JudgeEffectStage.AfterJudgeEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.JudgeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.to === PlayerPhase.PhaseBegin &&
        !!owner.getFlag<JieZhenMapper[]>(JieZhen.Name).find(mapper => mapper[phaseChangeEvent.toPlayer])
      );
    } else if (identifier === GameEventIdentifiers.JudgeEvent) {
      const judgeEvent = event as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;
      return judgeEvent.toId === owner.Id && judgeEvent.bySkill === BaGuaZhen.name;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.JudgeEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.PhaseChangeEvent) {
      const toPlayer = (unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).toPlayer;

      const jiezhenMappers = room.getFlag<JieZhenMapper[]>(event.fromId, JieZhen.Name);
      for (const skill of jiezhenMappers[toPlayer]) {
        await room.obtainSkill(event.fromId, skill);
      }

      const from = room.getPlayerById(event.fromId);
      if (from.getCardIds().length > 0) {
        const options: CardChoosingOptions = {
          [PlayerCardsArea.JudgeArea]: from.getCardIds(PlayerCardsArea.JudgeArea),
          [PlayerCardsArea.EquipArea]: from.getCardIds(PlayerCardsArea.EquipArea),
          [PlayerCardsArea.HandArea]: from.getCardIds(PlayerCardsArea.HandArea).length,
        };

        const chooseCardEvent = {
          fromId: toPlayer,
          toId: event.fromId,
          options,
          triggeredBySkills: [JieZhen.Name],
        };

        const response = await room.askForChoosingPlayerCard(chooseCardEvent, chooseCardEvent.fromId, false, true);
        if (!response) {
          return false;
        }

        await room.moveCards({
          movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
          fromId: chooseCardEvent.toId,
          toId: chooseCardEvent.fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: chooseCardEvent.fromId,
          triggeredBySkills: [JieZhen.Name],
        });
      }

      delete jiezhenMappers[toPlayer];
      jiezhenMappers.length === 0 && (await room.loseSkill(event.fromId, this.Name));
    } else {
      const jiezhenMappers = room.getFlag<JieZhenMapper[]>(event.fromId, JieZhen.Name);
      if (jiezhenMappers) {
        const allUsers = Object.keys(jiezhenMappers);
        room.deadPlayerFilters(allUsers);
        room.sortPlayersByPosition(allUsers);

        for (const user of allUsers) {
          for (const skill of jiezhenMappers[user]) {
            await room.obtainSkill(event.fromId, skill);
          }

          if (room.getPlayerById(user).Dead) {
            continue;
          }

          const from = room.getPlayerById(event.fromId);
          if (from.getCardIds().length > 0) {
            const options: CardChoosingOptions = {
              [PlayerCardsArea.JudgeArea]: from.getCardIds(PlayerCardsArea.JudgeArea),
              [PlayerCardsArea.EquipArea]: from.getCardIds(PlayerCardsArea.EquipArea),
              [PlayerCardsArea.HandArea]: from.getCardIds(PlayerCardsArea.HandArea).length,
            };

            const chooseCardEvent = {
              fromId: user,
              toId: event.fromId,
              options,
              triggeredBySkills: [JieZhen.Name],
            };

            const response = await room.askForChoosingPlayerCard(chooseCardEvent, chooseCardEvent.fromId, false, true);
            if (!response) {
              return false;
            }

            await room.moveCards({
              movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
              fromId: chooseCardEvent.toId,
              toId: chooseCardEvent.fromId,
              toArea: CardMoveArea.HandArea,
              moveReason: CardMoveReason.ActivePrey,
              proposer: chooseCardEvent.fromId,
              triggeredBySkills: [JieZhen.Name],
            });
          }
        }
      }

      await room.loseSkill(event.fromId, this.Name);
    }

    return true;
  }
}

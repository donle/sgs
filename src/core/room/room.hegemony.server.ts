import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage } from 'core/game/stage_processor';
import { HegemonyPlayer } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { FlagEnum } from 'core/shares/types/flag_list';
import { Skill, SkillProhibitedSkill, SkillType, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming, SkillLifeCycle } from 'core/skills/skill_hooks';
import { UniqueSkillRule } from 'core/skills/skill_rule';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ServerRoom } from './room.server';

export class HegemonyServerRoom extends ServerRoom {
  protected readonly players: HegemonyPlayer[];

  public getPlayerById(playerId: PlayerId) {
    return Precondition.exists(
      this.players.find(player => player.Id === playerId),
      `Unable to find player by player ID: ${playerId}`,
    );
  }

  public getAllPlayersFrom(playerId?: string | undefined, startsFromNext?: boolean): HegemonyPlayer[] {
    return super.getAllPlayersFrom(playerId, startsFromNext) as HegemonyPlayer[];
  }

  public changePlayerProperties(event: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent>): void {
    const { changedProperties } = event;

    let newCurrentPlayerPosition: number | undefined;
    for (const property of changedProperties) {
      const player = this.getPlayerById(property.toId);
      property.characterId !== undefined &&
        property.secondaryCharacterId !== undefined &&
        (player.HegemonyCharacterIds = [property.characterId, property.secondaryCharacterId]);
      property.armor !== undefined && (player.Armor = property.armor);
      property.maxHp !== undefined && (player.MaxHp = property.maxHp);
      property.hp !== undefined && (player.Hp = property.hp);
      property.nationality !== undefined && (player.Nationality = property.nationality);
      property.gender !== undefined && (player.Gender = property.gender);
      if (property.activate !== undefined) {
        property.activate && player.Dead && player.revive();
        property.activate || player.Dead || player.bury();
      }

      if (property.playerPosition !== undefined) {
        player.Position = property.playerPosition;
        player === this.CurrentPlayer && (newCurrentPlayerPosition = property.playerPosition);
      }
    }

    if (changedProperties.find(property => property.playerPosition)) {
      this.sortPlayers();
      newCurrentPlayerPosition !== undefined && this.gameProcessor.fixCurrentPosition(newCurrentPlayerPosition);
    }

    this.broadcast(GameEventIdentifiers.PlayerPropertiesChangeEvent, event);
  }

  public async trigger<T = never>(
    content: T extends never ? ServerEventFinder<GameEventIdentifiers> : T,
    stage?: AllStage,
  ) {
    if (!this.CurrentPlayer || !this.isPlaying()) {
      this.logger.debug('Do Not Need to Trigger Skill Because GameEnd Or Not CurrentPlayer');
      return;
    }

    const effectedSkillList: Skill[] = [];
    const nullifySkillList: Skill[] = [];
    for (const player of this.getAlivePlayersFrom()) {
      for (const pSkill of player.getSkillProhibitedSkills()) {
        if ((pSkill as SkillProhibitedSkill).toDeactivateSkills(this, player, content, stage)) {
          for (const playerSkill of player.getSkillProhibitedSkills(true)) {
            (pSkill as SkillProhibitedSkill).skillFilter(playerSkill, player) && nullifySkillList.push(playerSkill);
          }
        } else if ((pSkill as SkillProhibitedSkill).toActivateSkills(this, player, content, stage)) {
          for (const playerSkill of player.getSkillProhibitedSkills(true)) {
            if (effectedSkillList.includes(playerSkill)) {
              continue;
            }

            if ((pSkill as SkillProhibitedSkill).skillFilter(playerSkill, player, undefined, true)) {
              await SkillLifeCycle.executeHookedOnEffecting(playerSkill, this, player);
              effectedSkillList.push(playerSkill);
            }
          }
        }
      }

      for (const nullifySkill of nullifySkillList) {
        await SkillLifeCycle.executeHookedOnNullifying(nullifySkill, this, player);
      }
    }

    const { triggeredBySkills } = content as ServerEventFinder<GameEventIdentifiers>;
    const bySkills = triggeredBySkills
      ? triggeredBySkills.map(skillName => Sanguosha.getSkillBySkillName(skillName))
      : undefined;

    const skillSource: Readonly<['character', 'equip']> = ['character', 'equip'];
    try {
      for (const player of this.getAllPlayersFrom()) {
        if (EventPacker.isTerminated(content)) {
          return;
        }

        for (const skillFrom of skillSource) {
          if (EventPacker.isTerminated(content)) {
            return;
          }

          let canTriggerSkills = this.playerTriggerableSkills(player, skillFrom, content, stage);
          const triggeredSkills: TriggerSkill[] = [];
          do {
            if (EventPacker.isTerminated(content)) {
              return;
            }

            const skillsInPriorities: TriggerSkill[][] = [];
            const skillTriggerableTimes: {
              [K: string]: number;
            } = {};
            for (const skill of canTriggerSkills) {
              const priority = skill.getPriority(this, player, content);
              skillsInPriorities[priority]
                ? skillsInPriorities[priority].push(skill)
                : (skillsInPriorities[priority] = [skill]);
              skillTriggerableTimes[skill.Name] = skill.triggerableTimes(content, player);
            }

            for (const skills of skillsInPriorities) {
              if (EventPacker.isTerminated(content)) {
                return;
              }
              if (!skills) {
                continue;
              }

              let autoTrigger = true;

              if (skills.length === 1) {
                const skill = skills[0];

                if (player.isSkillInactivated(skill.Name)) {
                  autoTrigger = false;

                  const characterName = player.isSkillFromPrimaryCharacter(skill.Name) ? 'primary' : 'secondary';
                  const result = await this.doAskForCommonly(
                    GameEventIdentifiers.AskForChoosingOptionsEvent,
                    EventPacker.createUncancellableEvent({
                      conversation: TranslationPack.translationJsonPatcher(
                        'do you want to show your {0} character',
                        characterName,
                      ).toString(),
                      toId: player.Id,
                      options: ['yes', 'no'],
                    }),
                    player.Id,
                  );

                  if (result.selectedOption === 'yes') {
                    autoTrigger = true;

                    const showedCharacter = player.HegemonyCharacters[characterName === 'primary' ? 0 : 1];
                    this.broadcast(GameEventIdentifiers.HegemonyCharacterShownEvent, {
                      fromId: player.Id,
                      isPrimaryCharacter: characterName === 'primary',
                      characterId: showedCharacter.Id,
                      translationsMessage: TranslationPack.translationJsonPatcher(
                        '{0} showed its {1} character {2}',
                        TranslationPack.patchPlayerInTranslation(player),
                        characterName,
                        showedCharacter.Id,
                      ).extract(),
                    });
                  } else {
                    continue;
                  }
                }

                for (let i = 0; i < skill.triggerableTimes(content, player); i++) {
                  const triggerSkillEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
                    fromId: player.Id,
                    skillName: skill.Name,
                    triggeredOnEvent: content,
                    mute: skill.Muted,
                  };
                  if (
                    (skill.isAutoTrigger(this, player, content) ||
                      skill.SkillType === SkillType.Compulsory ||
                      skill.SkillType === SkillType.Awaken) &&
                    autoTrigger
                  ) {
                    await this.useSkill(triggerSkillEvent);
                  } else {
                    const event = {
                      invokeSkillNames: [skill.Name],
                      triggeredOnEvent: content,
                      toId: player.Id,
                      conversation: skill.getSkillLog(this, player, content),
                    };
                    if (skill.isUncancellable(this, content)) {
                      EventPacker.createUncancellableEvent(event);
                    }
                    this.notify(GameEventIdentifiers.AskForSkillUseEvent, event, player.Id);
                    const { invoke, cardIds, toIds } = await this.onReceivingAsyncResponseFrom(
                      GameEventIdentifiers.AskForSkillUseEvent,
                      player.Id,
                    );
                    const skillsUsing = player.getFlag<string[]>(FlagEnum.SkillsUsing);
                    if (!invoke && skillsUsing && skillsUsing.includes(skill.Name)) {
                      await this.loseSkill(player.Id, skill.Name, true);
                    }
                    triggerSkillEvent.toIds = toIds;
                    triggerSkillEvent.cardIds = cardIds;
                    if (invoke) {
                      await this.useSkill(triggerSkillEvent);
                    }
                  }
                }
              } else {
                let awaitedSkills: TriggerSkill[] = [];
                for (const skill of skills) {
                  if (skill.isFlaggedSkill(this, content, stage)) {
                    const triggerSkillEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
                      fromId: player.Id,
                      skillName: skill.Name,
                      triggeredOnEvent: content,
                      mute: skill.Muted,
                    };
                    await this.useSkill(triggerSkillEvent);
                  } else {
                    awaitedSkills.push(skill);
                  }
                }

                while (awaitedSkills.length > 0) {
                  const uncancellableSkills = awaitedSkills.filter(
                    skill =>
                      skill.isAutoTrigger(this, player, content) ||
                      skill.SkillType === SkillType.Compulsory ||
                      skill.SkillType === SkillType.Awaken,
                  );

                  const event = {
                    invokeSkillNames: awaitedSkills.map(skill => skill.Name),
                    toId: player.Id,
                  };
                  if (awaitedSkills.length === 1 && uncancellableSkills.length === 1) {
                    const triggerSkillEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
                      fromId: player.Id,
                      skillName: awaitedSkills[0].Name,
                      triggeredOnEvent: content,
                      mute: awaitedSkills[0].Muted,
                    };
                    for (let i = 0; i < skillTriggerableTimes[awaitedSkills[0].Name]; i++) {
                      await this.useSkill(triggerSkillEvent);
                    }
                    break;
                  }

                  if (uncancellableSkills.length > 1) {
                    EventPacker.createUncancellableEvent(event);
                  }
                  this.notify(GameEventIdentifiers.AskForSkillUseEvent, event, player.Id);
                  const { invoke, cardIds, toIds } = await this.onReceivingAsyncResponseFrom(
                    GameEventIdentifiers.AskForSkillUseEvent,
                    player.Id,
                  );
                  if (invoke === undefined) {
                    for (const skill of uncancellableSkills) {
                      const triggerSkillEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
                        fromId: player.Id,
                        skillName: skill.Name,
                        triggeredOnEvent: content,
                        mute: skill.Muted,
                      };
                      await this.useSkill(triggerSkillEvent);
                    }
                    break;
                  }

                  const awaitedSkill = awaitedSkills.find(skill => skill.Name === invoke);
                  const triggerSkillEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent> = {
                    fromId: player.Id,
                    skillName: invoke,
                    triggeredOnEvent: content,
                    mute: awaitedSkill?.Muted,
                  };
                  triggerSkillEvent.toIds = toIds;
                  triggerSkillEvent.cardIds = cardIds;
                  await this.useSkill(triggerSkillEvent);

                  const index = awaitedSkills.findIndex(skill => skill.Name === invoke);
                  if (index >= 0) {
                    skillTriggerableTimes[awaitedSkills[index].Name]--;
                    if (skillTriggerableTimes[awaitedSkills[index].Name] <= 0) {
                      awaitedSkills.splice(index, 1);
                    }
                  }

                  awaitedSkills = awaitedSkills.filter(skill => {
                    const canTrigger = bySkills
                      ? bySkills.find(bySkill => UniqueSkillRule.isProhibitedBySkillRule(bySkill, skill)) === undefined
                      : true;

                    return (
                      canTrigger && skill.isTriggerable(content, stage) && skill.canUse(this, player, content, stage)
                    );
                  });
                }
              }
            }

            triggeredSkills.push(...canTriggerSkills);
            canTriggerSkills = this.playerTriggerableSkills(player, skillFrom, content, stage, triggeredSkills);
          } while (canTriggerSkills.length > 0);
        }
      }
    } catch (e) {
      this.logger.error(e);
      const message = TranslationPack.patchPureTextParameter(
        'Room running with exceptions, please re-create your room',
      );
      this.broadcast(GameEventIdentifiers.UserMessageEvent, {
        message,
        originalMessage: message,
        playerId: this.players[0].Id,
      });
      this.gameOvered = true;
      this.close();
      return;
    }

    for (const p of this.getAlivePlayersFrom()) {
      if (p.HookedSkills.length === 0) {
        continue;
      }

      const toUnhook = p.HookedSkills.filter(skill => {
        const hookedSkill = (skill as unknown) as OnDefineReleaseTiming;
        if (hookedSkill.afterLosingSkill && hookedSkill.afterLosingSkill(this, p.Id, content, stage)) {
          return true;
        }
        if (hookedSkill.afterDead && hookedSkill.afterDead(this, p.Id, content, stage)) {
          return true;
        }
        return false;
      });

      if (toUnhook.length > 0) {
        p.removeHookedSkills(toUnhook);
        this.broadcast(GameEventIdentifiers.UnhookSkillsEvent, {
          toId: p.Id,
          skillNames: toUnhook.map(skill => skill.Name),
        });
      }
    }
  }
}

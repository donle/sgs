import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { DamageType } from 'core/game/game_props';
import {
  AllStage,
  DamageEffectStage,
  GameBeginStage,
  PhaseChangeStage,
  PlayerDyingStage,
  PlayerPhase,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { GlobalRulesBreakerSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, QuestSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@QuestSkill({ name: 'powei', description: 'powei_description' })
export class PoWei extends TriggerSkill {
  public static readonly Debuff = 'powei_debuff';

  public get RelatedSkills(): string[] {
    return ['shenzhuo'];
  }

  public audioIndex(): number {
    return 3;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<
      | GameEventIdentifiers.GameBeginEvent
      | GameEventIdentifiers.DamageEvent
      | GameEventIdentifiers.PhaseChangeEvent
      | GameEventIdentifiers.PlayerDyingEvent
    >,
    stage?: AllStage,
  ): boolean {
    return (
      stage === GameBeginStage.AfterGameBegan ||
      stage === DamageEffectStage.DamageEffect ||
      stage === PhaseChangeStage.AfterPhaseChanged ||
      stage === PlayerDyingStage.PlayerDying
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<
      | GameEventIdentifiers.GameBeginEvent
      | GameEventIdentifiers.DamageEvent
      | GameEventIdentifiers.PhaseChangeEvent
      | GameEventIdentifiers.PlayerDyingEvent
    >,
  ): boolean {
    if (owner.getFlag<boolean>(this.Name) !== undefined) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return room.getPlayerById(damageEvent.toId).getMark(MarkEnum.Wei) > 0;
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      const current = room.getPlayerById(phaseChangeEvent.toPlayer);
      return (
        phaseChangeEvent.to === PlayerPhase.PhaseBegin &&
        ((current.getMark(MarkEnum.Wei) > 0 &&
          (owner.getCardIds(PlayerCardsArea.HandArea).find(id => room.canDropCard(owner.Id, id)) !== undefined ||
            (current !== owner &&
              current.Hp <= owner.Hp &&
              current.getCardIds(PlayerCardsArea.HandArea).length > 0))) ||
          phaseChangeEvent.toPlayer === owner.Id)
      );
    } else if (identifier === GameEventIdentifiers.PlayerDyingEvent) {
      const playerDyingEvent = content as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>;
      return playerDyingEvent.dying === owner.Id && owner.Hp < 1;
    }

    return identifier === GameEventIdentifiers.GameBeginEvent;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      | GameEventIdentifiers.GameBeginEvent
      | GameEventIdentifiers.DamageEvent
      | GameEventIdentifiers.PhaseChangeEvent
      | GameEventIdentifiers.PlayerDyingEvent
    >;

    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      if (room.getMark(phaseChangeEvent.toPlayer, MarkEnum.Wei) > 0) {
        const { fromId } = event;

        const options: string[] = [];
        room
          .getPlayerById(fromId)
          .getCardIds(PlayerCardsArea.HandArea)
          .find(id => room.canDropCard(fromId, id)) && options.push('powei:dropCard');

        const current = room.getPlayerById(phaseChangeEvent.toPlayer);
        if (current.Hp <= room.getPlayerById(fromId).Hp && current.getCardIds(PlayerCardsArea.HandArea).length > 0) {
          options.push('powei:prey');
        }

        if (options.length > 0) {
          options.push('cancel');
          const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
            GameEventIdentifiers.AskForChoosingOptionsEvent,
            {
              options,
              conversation: TranslationPack.translationJsonPatcher(
                '{0}: please choose powei options: {1}',
                this.Name,
                TranslationPack.patchPlayerInTranslation(current),
              ).extract(),
              toId: fromId,
              triggeredBySkills: [this.Name],
            },
            fromId,
            true,
          );

          response.selectedOption = response.selectedOption || options[0];
          if (response.selectedOption && response.selectedOption !== 'cancel') {
            EventPacker.addMiddleware({ tag: this.Name, data: response.selectedOption }, event);
            return true;
          } else {
            return false;
          }
        }
      }
    }

    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      | GameEventIdentifiers.GameBeginEvent
      | GameEventIdentifiers.DamageEvent
      | GameEventIdentifiers.PhaseChangeEvent
      | GameEventIdentifiers.PlayerDyingEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.GameBeginEvent) {
      for (const player of room.getOtherPlayers(fromId)) {
        if (player.getMark(MarkEnum.Wei) === 0) {
          room.addMark(player.Id, MarkEnum.Wei, 1);
        }
      }
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      room.addMark(damageEvent.toId, MarkEnum.Wei, -1);
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      const selectedOption = EventPacker.getMiddleware<string | undefined>(this.Name, event);
      if (selectedOption === 'powei:dropCard') {
        const response = await room.askForCardDrop(fromId, 1, [PlayerCardsArea.HandArea], true, undefined, this.Name);
        await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, fromId, fromId, this.Name);

        await room.damage({
          fromId,
          toId: phaseChangeEvent.toPlayer,
          damage: 1,
          damageType: DamageType.Normal,
          triggeredBySkills: [this.Name],
        });
      } else if (selectedOption === 'powei:prey') {
        const options: CardChoosingOptions = {
          [PlayerCardsArea.HandArea]: room
            .getPlayerById(phaseChangeEvent.toPlayer)
            .getCardIds(PlayerCardsArea.HandArea),
        };
        const chooseCardEvent = {
          fromId,
          toId: phaseChangeEvent.toPlayer,
          options,
          triggeredBySkills: [this.Name],
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
          movedByReason: this.Name,
        });
      }

      if (selectedOption) {
        room.setFlag<PlayerId>(fromId, PoWei.Debuff, phaseChangeEvent.toPlayer);
      }

      if (phaseChangeEvent.toPlayer === fromId) {
        let hasWei = false;
        for (const player of room.getAlivePlayersFrom()) {
          if (player.getMark(MarkEnum.Wei) > 0) {
            hasWei = true;

            let nextPlayer = room.getNextAlivePlayer(player.Id);
            if (nextPlayer.Id === fromId) {
              if (room.getNextAlivePlayer(fromId).Id !== player.Id) {
                nextPlayer = room.getNextAlivePlayer(fromId);
              } else {
                continue;
              }
            }

            room.addMark(player.Id, MarkEnum.Wei, -1);
            room.addMark(nextPlayer.Id, MarkEnum.Wei, 1);
          }
        }

        if (!hasWei) {
          room.setFlag<boolean>(fromId, this.Name, true, 'powei:succeeded');
          await room.obtainSkill(fromId, 'shenzhuo');
        }
      }
    } else {
      room.setFlag<boolean>(fromId, this.Name, false, 'powei:failed');
      await room.recover({
        toId: fromId,
        recoveredHp: 1 - room.getPlayerById(fromId).Hp,
        recoverBy: fromId,
      });

      for (const player of room.getAlivePlayersFrom()) {
        player.getMark(MarkEnum.Wei) > 0 && room.removeMark(player.Id, MarkEnum.Wei);
      }

      const equips = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.EquipArea);
      equips.length > 0 && (await room.dropCards(CardMoveReason.SelfDrop, equips, fromId, fromId, this.Name));
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: PoWei.Name, description: PoWei.Description })
export class PoWeiShadow extends GlobalRulesBreakerSkill {
  public breakWithinAttackDistance(room: Room, owner: Player, from: Player, to: Player): boolean {
    return to === owner && to.getFlag<PlayerId>(PoWei.Debuff) === from.Id;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: PoWeiShadow.Name, description: PoWeiShadow.Description })
export class PoWeiRemove extends TriggerSkill implements OnDefineReleaseTiming {
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
    return event.from === PlayerPhase.PhaseFinish && owner.getFlag<PlayerId>(PoWei.Debuff) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, PoWei.Debuff);

    return true;
  }
}

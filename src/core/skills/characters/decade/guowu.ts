import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE } from 'core/game/game_props';
import {
  AllStage,
  CardUseStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { ExtralCardSkillProperty } from 'core/skills/cards/interface/extral_property';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'guowu', description: 'guowu_description' })
export class GuoWu extends TriggerSkill {
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
      content.toStage === PlayerPhaseStages.PlayCardStageStart &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const handCards = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.HandArea);

    const displayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      fromId,
      displayCards: handCards,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} displayed cards {1}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        TranslationPack.patchCardInTranslation(...handCards),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, displayEvent);

    const typeNum = handCards.reduce<CardSuit[]>((suits, cardId) => {
      const suit = Sanguosha.getCardById(cardId).Suit;
      return suits.includes(suit) ? suits : suits.concat(suit);
    }, []).length;

    if (typeNum > 0) {
      const slashs = room.findCardsByMatcherFrom(new CardMatcher({ generalName: ['slash'] }), false);
      slashs.length > 0 &&
        (await room.moveCards({
          movingCards: [{ card: slashs[Math.floor(Math.random() * slashs.length)], fromArea: CardMoveArea.DropStack }],
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: fromId,
          triggeredBySkills: [this.Name],
        }));

      if (typeNum > 1) {
        room.getPlayerById(fromId).hasShadowSkill(GuoWuUnlimited.Name) ||
          (await room.obtainSkill(fromId, GuoWuUnlimited.Name));

        typeNum > 2 && room.getPlayerById(fromId).setFlag<boolean>(this.Name, true);
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: GuoWu.Name, description: GuoWu.Description })
export class GuoWuShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public async whenDead(room: Room, player: Player) {
    await room.loseSkill(player.Id, GuoWuUnlimited.Name);
    player.removeFlag(this.GeneralName);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.AfterCardTargetDeclared || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        owner.getFlag<boolean>(this.GeneralName) &&
        cardUseEvent.fromId === owner.Id &&
        (Sanguosha.getCardById(cardUseEvent.cardId).GeneralName === 'slash' ||
          Sanguosha.getCardById(cardUseEvent.cardId).isCommonTrick()) &&
        !!((Sanguosha.getCardById(cardUseEvent.cardId).Skill as unknown) as ExtralCardSkillProperty)
          .isCardAvailableTarget
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.fromPlayer === owner.Id &&
        phaseChangeEvent.from === PlayerPhase.PlayCardStage &&
        (owner.hasShadowSkill(GuoWuUnlimited.Name) || owner.getFlag<boolean>(this.GeneralName))
      );
    }

    return false;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const identifier = EventPacker.getIdentifier(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const players = room
        .getAlivePlayersFrom()
        .map(player => player.Id)
        .filter(playerId => {
          return (
            !TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup).includes(playerId) &&
            room.isAvailableTarget(cardUseEvent.cardId, event.fromId, playerId) &&
            ((Sanguosha.getCardById(cardUseEvent.cardId)
              .Skill as unknown) as ExtralCardSkillProperty).isCardAvailableTarget(
              event.fromId,
              room,
              playerId,
              [],
              [],
              cardUseEvent.cardId,
            )
          );
        });

      const allTargets = TargetGroupUtil.getAllTargets(cardUseEvent.targetGroup);
      if (players.length > 0 && allTargets !== undefined) {
        if (allTargets[0].length === 1) {
          const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
            GameEventIdentifiers.AskForChoosingPlayerEvent,
            {
              players,
              toId: event.fromId,
              requiredAmount: [1, 2],
              conversation: TranslationPack.translationJsonPatcher(
                '{0}: do you want to choose at most 2 targets to append to {1} targets?',
                this.Name,
                TranslationPack.patchCardInTranslation(cardUseEvent.cardId),
              ).extract(),
              triggeredBySkills: [this.Name],
            },
            event.fromId,
          );

          if (resp.selectedPlayers && resp.selectedPlayers.length > 0) {
            event.toIds = resp.selectedPlayers;
            return true;
          }
        } else if (allTargets[0].length > 1) {
          const targets = TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup);

          const chosen: PlayerId[][] = [];
          let count = 0;
          while (players.length > 0 || count < 2) {
            const { selectedPlayers } = await room.doAskForCommonly<
              GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent
            >(
              GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent,
              {
                user: event.fromId,
                cardId: cardUseEvent.cardId,
                exclude: targets,
                conversation: TranslationPack.translationJsonPatcher(
                  '{0}: do you want to choose a target to append to {1} targets?',
                  this.Name,
                  TranslationPack.patchCardInTranslation(cardUseEvent.cardId),
                ).extract(),
                triggeredBySkills: [this.Name],
              },
              event.fromId,
            );

            if (!selectedPlayers || selectedPlayers.length < 2) {
              break;
            } else {
              chosen.push(selectedPlayers);
              targets.push(selectedPlayers[0]);
              const index = players.findIndex(player => player === selectedPlayers[0]);
              index !== -1 && players.splice(index, 1);
              count++;
            }
          }

          if (chosen.length > 0) {
            for (const selected of chosen) {
              TargetGroupUtil.pushTargets(cardUseEvent.targetGroup!, selected);
            }

            event.toIds = [];
            return true;
          }
        }
      }
    }

    return identifier === GameEventIdentifiers.PhaseChangeEvent;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      if (!event.toIds) {
        return false;
      }

      if (event.toIds.length > 0) {
        for (const toId of event.toIds) {
          TargetGroupUtil.pushTargets(
            (unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).targetGroup!,
            toId,
          );
        }
      }
    } else {
      await room.loseSkill(event.fromId, GuoWuUnlimited.Name);
      room.getPlayerById(event.fromId).removeFlag(this.GeneralName);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_guowu_unlimited', description: 's_guowu_unlimited_description' })
export class GuoWuUnlimited extends RulesBreakerSkill {
  public breakCardUsableDistance(): number {
    return INFINITE_DISTANCE;
  }
}

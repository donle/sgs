import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, LimitSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@LimitSkill({ name: 'zhafu', description: 'zhafu_description' })
export class ZhaFu extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return true;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const originalPlayers = room.getFlag<PlayerId[]>(toIds[0], this.Name) || [];
    originalPlayers.includes(fromId) || originalPlayers.push(fromId);
    room.setFlag<PlayerId[]>(toIds[0], this.Name, originalPlayers, this.Name);

    room.getPlayerById(toIds[0]).hasShadowSkill(ZhaFuDebuff.Name) ||
      (await room.obtainSkill(toIds[0], ZhaFuDebuff.Name));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_zhafu_debuff', description: 's_zhafu_debuff_description' })
export class ZhaFuDebuff extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      content.playerId === owner &&
      content.toStage === PlayerPhaseStages.DropCardStageStart &&
      stage === PhaseStageChangeStage.StageChanged
    );
  }

  public async whenDead(room: Room, player: Player) {
    await room.loseSkill(player.Id, this.Name);
    room.removeFlag(player.Id, ZhaFu.Name);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return event.playerId === owner.Id && event.toStage === PlayerPhaseStages.DropCardStageStart;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const players = room.getFlag<PlayerId[]>(event.fromId, ZhaFu.Name).slice();
    if (players) {
      room.removeFlag(event.fromId, ZhaFu.Name);

      if (players.length > 0) {
        room.sortPlayersByPosition(players);
        for (const player of players) {
          const handCards = room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea);
          if (handCards.length < 2) {
            break;
          }

          if (room.getPlayerById(player).Dead) {
            continue;
          }

          const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
            GameEventIdentifiers.AskForCardEvent,
            EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardEvent>({
              cardAmount: 1,
              toId: event.fromId,
              reason: this.Name,
              conversation: TranslationPack.translationJsonPatcher(
                '{0}: please choose a hand card, give the other cards to {1}',
                this.Name,
                TranslationPack.patchPlayerInTranslation(room.getPlayerById(player)),
              ).extract(),
              fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
              triggeredBySkills: [this.Name],
            }),
            event.fromId,
            true,
          );

          response.selectedCards =
            response.selectedCards.length > 0
              ? response.selectedCards
              : [handCards[Math.floor(Math.random() * handCards.length)]];

          await room.moveCards({
            movingCards: handCards
              .filter(id => id !== response.selectedCards[0])
              .map(card => ({ card, fromArea: CardMoveArea.HandArea })),
            fromId: event.fromId,
            toId: player,
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActiveMove,
            proposer: event.fromId,
            triggeredBySkills: [this.Name],
          });
        }
      }
    }

    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}

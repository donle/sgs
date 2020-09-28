import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qiuyuan', description: 'qiuyuan_description' })
export class QiuYuan extends TriggerSkill {
  public isTriggerable(_: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.OnAimmed;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    if (!!event.byCardId && Sanguosha.getCardById(event.byCardId).GeneralName === 'slash' && event.toId === owner.Id) {
      room.setFlag<PlayerId[]>(owner.Id, this.Name, [event.fromId, ...event.allTargets]);
      return true;
    }
    return false;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    const invalidTargets = room.getPlayerById(owner).getFlag<PlayerId[]>(this.Name);
    return !invalidTargets.includes(target);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const to = room.getPlayerById(skillEffectEvent.toIds![0]);

    const askForCard: ServerEventFinder<GameEventIdentifiers.AskForCardEvent> = {
      cardAmount: 1,
      toId: to.Id,
      fromArea: [PlayerCardsArea.HandArea],
      cardMatcher: new CardMatcher({
        name: ['jink'],
      }).toSocketPassenger(),
      conversation: TranslationPack.translationJsonPatcher(
        '{0}: you need to give a jink to {1}',
        this.Name,
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillEffectEvent.fromId)),
      ).extract(),
      reason: this.Name,
    };

    room.notify(GameEventIdentifiers.AskForCardEvent, askForCard, to.Id);

    const { selectedCards } = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForCardEvent, to.Id);

    if (selectedCards) {
      room.moveCards({
        movingCards: [{ card: selectedCards[0], fromArea: PlayerCardsArea.HandArea }],
        fromId: to.Id,
        toId: skillEffectEvent.fromId,
        toArea: PlayerCardsArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: to.Id,
        movedByReason: this.Name,
        engagedPlayerIds: room.getAllPlayersFrom().map(player => player.Id),
      });
    } else {
      if (room.canUseCardTo(new CardMatcher({ generalName: ['slash'] }), to.Id)) {
        const aimEvent = skillEffectEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
        aimEvent.allTargets.push(to.Id);
      }
    }

    room.removeFlag(skillEffectEvent.fromId, this.Name);

    return true;
  }
}

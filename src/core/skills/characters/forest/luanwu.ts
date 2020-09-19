import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { INFINITE_DISTANCE } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@LimitSkill({ name: 'luanwu', description: 'luanwu_description' })
export class LuanWu extends ActiveSkill {
  public canUse() {
    return true;
  }

  public numberOfTargets() {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;

    for (const target of room.getOtherPlayers(fromId)) {
      let minDistance: number = INFINITE_DISTANCE;
      room.getOtherPlayers(target.Id).forEach(player => {
        const distance = room.distanceBetween(target, player);
        if (distance < minDistance) {
          minDistance = distance;
        }
      });
      const targets = room.getOtherPlayers(target.Id).reduce<Player[]>((targets, player) => {
        if (room.distanceBetween(target, player) === minDistance) {
          targets.push(player);
        }
        return targets;
      }, []);
      const toIds = targets.reduce<PlayerId[]>((toIds, player) => {
        toIds.push(player.Id);
        return toIds;
      }, []);

      if (targets.length > 0) {
        const response = await room.askForCardUse(
          {
            toId: target.Id,
            cardUserId: target.Id,
            scopedTargets: toIds,
            cardMatcher: new CardMatcher({ generalName: ['slash'] }).toSocketPassenger(),
            extraUse: true,
            commonUse: true,
            conversation: TranslationPack.translationJsonPatcher(
              'please use a {0} to player {1} to response {2}',
              'slash',
              TranslationPack.patchPlayerInTranslation(...targets),
              this.Name,
            ).extract(),
            triggeredBySkills: [this.Name],
          },
          target.Id,
        );

        if (response.cardId !== undefined) {
          const cardUseEvent = {
            fromId: response.fromId,
            cardId: response.cardId,
            toIds: response.toIds,
            triggeredBySkills: [this.Name],
          };

          await room.useCard(cardUseEvent, true);
        } else {
          await room.loseHp(target.Id, 1);
        }
      } else {
        await room.loseHp(target.Id, 1);
      }
    }

    return true;
  }
}

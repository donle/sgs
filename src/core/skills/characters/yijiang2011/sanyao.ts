import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'sanyao', description: 'sanyao_description' })
export class SanYao extends ActiveSkill {
  public static readonly MostHp = 'SanYao_MostHp';
  public static readonly MostHandNum = 'SanYao_MostHandNum';

  public isRefreshAt(room: Room, owner: Player, phase: PlayerPhase): boolean {
    return phase === PlayerPhase.PlayCardStage;
  }

  public async whenRefresh(room: Room, owner: Player) {
    room.removeFlag(owner.Id, SanYao.MostHp);
    room.removeFlag(owner.Id, SanYao.MostHandNum);
  }

  public canUse(room: Room, owner: Player): boolean {
    return owner.hasUsedSkillTimes(this.Name) < 2 && owner.getPlayerCards().length > 0;
  }

  public numberOfTargets(): number[] {
    return [];
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[], selectedCards: CardId[]): boolean {
    return targets.length === selectedCards.length;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    const ownerPlayer = room.getPlayerById(owner);
    const targetPlayer = room.getPlayerById(target);

    return (
      (ownerPlayer.getFlag<boolean>(SanYao.MostHp) !== true &&
        room.getAlivePlayersFrom().find(player => player.Hp > targetPlayer.Hp) === undefined) ||
      (ownerPlayer.getFlag<boolean>(SanYao.MostHandNum) !== true &&
        room.getAlivePlayersFrom().find(player => {
          return (
            player.getCardIds(PlayerCardsArea.HandArea).length >
            targetPlayer.getCardIds(PlayerCardsArea.HandArea).length
          );
        }) === undefined)
    );
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds, cardIds } = event;
    const target = room.getPlayerById(toIds![0]);
    const from = room.getPlayerById(fromId);

    const hasMostHp = room.getOtherPlayers(toIds![0]).find(player => player.Hp > target.Hp) === undefined;
    const hasMostHandNum =
      room.getOtherPlayers(toIds![0]).find(player => {
        return player.getCardIds(PlayerCardsArea.HandArea).length > target.getCardIds(PlayerCardsArea.HandArea).length;
      }) === undefined;

    if (
      hasMostHp &&
      hasMostHandNum &&
      from.getFlag<boolean>(SanYao.MostHp) !== true &&
      from.getFlag<boolean>(SanYao.MostHandNum) !== true
    ) {
      const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options: ['sanyao:hp', 'sanyao:handNum'],
        conversation: 'please choose sanyao options',
        toId: fromId,
      });

      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChooseEvent),
        fromId,
      );

      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, fromId);
      response.selectedOption = response.selectedOption || askForChooseEvent.options[0];

      if (response.selectedOption === askForChooseEvent.options[1]) {
        room.setFlag<boolean>(fromId, SanYao.MostHandNum, true);
      } else {
        room.setFlag<boolean>(fromId, SanYao.MostHp, true);
      }
    } else if (hasMostHp) {
      room.setFlag<boolean>(fromId, SanYao.MostHp, true);
    } else {
      room.setFlag<boolean>(fromId, SanYao.MostHandNum, true);
    }

    await room.dropCards(CardMoveReason.SelfDrop, cardIds!, fromId, fromId, this.Name);

    for (const toId of toIds!) {
      const to = room.getPlayerById(toId);
      if (to.Dead) {
        continue;
      }

      await room.damage({
        fromId,
        toId,
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}

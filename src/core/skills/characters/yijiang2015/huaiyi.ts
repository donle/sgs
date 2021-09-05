import { CardChoosingOptions, CardColor, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'huaiyi', description: 'huaiyi_description' })
export class HuaiYi extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return (
      (owner.getFlag<boolean>(this.Name) ? owner.hasUsedSkillTimes(this.Name) < 2 : !owner.hasUsedSkill(this.Name)) &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public numberOfTargets(): number {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;

    const handcards = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.HandArea);
    const displayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      fromId,
      displayCards: handcards,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} displayed cards {1}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        TranslationPack.patchCardInTranslation(...handcards),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, displayEvent);

    if (!handcards.find(id => Sanguosha.getCardById(handcards[0]).Color !== Sanguosha.getCardById(id).Color)) {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
      room.setFlag<boolean>(fromId, this.Name, true);
    } else {
      const options = ['huaiyi:black', 'huaiyi:red'];
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose a color and discard all hand cards with that color',
            this.Name,
          ).extract(),
          toId: fromId,
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      response.selectedOption = response.selectedOption || options[0];
      const color = response.selectedOption === options[1] ? CardColor.Red : CardColor.Black;

      const todrop = handcards.filter(id => Sanguosha.getCardById(id).Color === color && room.canDropCard(fromId, id));
      if (todrop.length > 0) {
        await room.dropCards(CardMoveReason.SelfDrop, todrop, fromId, fromId, this.Name);

        const players = room
          .getOtherPlayers(fromId)
          .filter(player => player.getPlayerCards().length > 0)
          .map(player => player.Id);

        if (players.length > 0) {
          const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
            GameEventIdentifiers.AskForChoosingPlayerEvent,
            {
              players,
              toId: fromId,
              requiredAmount: [1, players.length],
              conversation: TranslationPack.translationJsonPatcher(
                '{0}: do you want to choose {1} targets to prey a card from each of them?',
                this.Name,
                todrop.length,
              ).extract(),
              triggeredBySkills: [this.Name],
            },
            fromId,
            true,
          );

          resp.selectedPlayers = resp.selectedPlayers || [players[Math.floor(Math.random() * players.length)]];

          for (const target of resp.selectedPlayers) {
            const to = room.getPlayerById(target);
            const options: CardChoosingOptions = {
              [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
              [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
            };

            const chooseCardEvent = {
              fromId,
              toId: target,
              options,
              triggeredBySkills: [this.Name],
            };

            const newResp = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, false, true);

            newResp &&
              (await room.moveCards({
                movingCards: [{ card: newResp.selectedCard!, fromArea: newResp.fromArea }],
                fromId: target,
                toId: fromId,
                toArea: CardMoveArea.HandArea,
                moveReason: CardMoveReason.ActivePrey,
                proposer: fromId,
                triggeredBySkills: [this.Name],
              }));
          }

          resp.selectedPlayers.length >= 2 && (await room.loseHp(fromId, 1));
        }
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: HuaiYi.Name, description: HuaiYi.Description })
export class HuaiYiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
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
      event.from === PlayerPhase.PlayCardStage &&
      owner.getFlag<number>(this.GeneralName) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}

import { CardId } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, GameStartStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, LordSkill, SideEffectSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { HunZi } from './hunzi';

@LordSkill
@CommonSkill({ name: 'zhiba', description: 'zhiba_description' })
export class ZhiBa extends TriggerSkill {
  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.GameStartEvent>, stage?: AllStage): boolean {
    return stage === GameStartStage.BeforeGameStart;
  }
  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers>): boolean {
    return true;
  }
  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.translationsMessage = undefined;
    return true;
  }
  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    for (const player of room.getOtherPlayers(event.fromId)) {
      if (player.Nationality === CharacterNationality.Wu) {
        room.obtainSkill(player.Id, ZhiBaPindianCard.Name);
      }
    }

    return true;
  }
}

@SideEffectSkill
@CommonSkill({ name: ZhiBa.Name, description: ZhiBa.Description })
export class ZhiBaPindianCard extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return (
      owner.hasUsedSkillTimes(this.Name) <
        room.getAlivePlayersFrom().filter(player => player.hasSkill(this.GeneralName)).length &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      room.getPlayerById(target).hasSkill(this.GeneralName) &&
      room.canPindian(owner, target) &&
      room.Analytics.getRecordEvents<GameEventIdentifiers.SkillEffectEvent>(
        event =>
          event.skillName === this.Name &&
          event.fromId === owner &&
          event.toIds !== undefined &&
          event.toIds?.includes(target),
        owner,
        true,
        [PlayerPhase.PlayCardStage],
      ).length === 0
    );
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    const toId = toIds![0];

    let selectedOption: string = 'yes';
    if (room.getPlayerById(toId).hasUsedSkill(HunZi.Name)) {
      const options: string[] = ['yes', 'no'];

      const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: do you agree to pindian with {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        ).extract(),
        toId,
      });

      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseEvent, toId);

      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, toId);
      selectedOption = response.selectedOption || 'no';
    }

    if (selectedOption === 'yes') {
      const pindianResult = await room.pindian(fromId, toIds!);
      if (!pindianResult) {
        return false;
      }

      if (!pindianResult.winners.includes(fromId)) {
        const options: string[] = ['confirm', 'cancel'];
        const pindianCardIds = pindianResult.pindianCards.reduce<CardId[]>((allCards, card) => {
          return [...allCards, card.cardId];
        }, []);

        const askForChooseEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(
          {
            options,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: do you want to obtain pindian cards: {1}',
              this.Name,
              TranslationPack.patchCardInTranslation(...pindianCardIds),
            ).extract(),
            toId,
          },
        );

        room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseEvent, toId);

        const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, toId);
        response.selectedOption = response.selectedOption || 'confirm';

        if (response.selectedOption === 'confirm') {
          await room.moveCards({
            movingCards: pindianCardIds.map(card => ({ card, fromArea: CardMoveArea.DropStack })),
            toId,
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActivePrey,
            proposer: toId,
            movedByReason: this.Name,
          });
        }
      }
    }

    return true;
  }
}

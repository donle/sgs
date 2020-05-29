import { Card } from 'core/cards/card';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { RoomPresenter, RoomStore } from '../room.presenter';
import { BaseAction } from './base_action';

export class SkillUseAction extends BaseAction {
  private askForEvent: ServerEventFinder<GameEventIdentifiers.AskForSkillUseEvent>;

  constructor(
    playerId: PlayerId,
    store: RoomStore,
    presenter: RoomPresenter,
    askForEvent: ServerEventFinder<GameEventIdentifiers.AskForSkillUseEvent>,
    translator: ClientTranslationModule,
  ) {
    super(playerId, store, presenter, translator);
    this.askForEvent = askForEvent;
  }

  onSelect(translator: ClientTranslationModule) {
    return new Promise<void>(resolve => {
      const { invokeSkillNames, toId } = this.askForEvent;
      if (toId !== this.presenter.ClientPlayer!.Id) {
        return;
      }

      if (invokeSkillNames.length === 1) {
        const skillName = invokeSkillNames[0];
        const translatedConversation = TranslationPack.translationJsonPatcher(
          'do you want to trigger skill {0} ?',
          skillName,
        ).extract();

        this.presenter.createIncomingConversation({
          conversation: translatedConversation,
          translator,
        });

        const event: ClientEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
          invoke: undefined,
          fromId: toId,
        };
        const skill = Sanguosha.getSkillBySkillName<TriggerSkill>(skillName);
        this.selectSkill(skill);
        this.onPlay();
        this.enableToCallAction() && this.presenter.enableActionButton('confirm');

        this.presenter.defineConfirmButtonActions(() => {
          event.invoke = skillName;
          event.cardIds = this.selectedCards;
          event.toIds = this.selectedTargets;
          this.store.room.broadcast(GameEventIdentifiers.AskForSkillUseEvent, event);
          this.presenter.closeIncomingConversation();
          this.resetActionHandlers();
          this.resetAction();
          this.presenter.resetSelectedSkill();
          resolve();
        });
        this.presenter.defineCancelButtonActions(() => {
          this.store.room.broadcast(GameEventIdentifiers.AskForSkillUseEvent, event);
          this.presenter.closeIncomingConversation();
          this.resetActionHandlers();
          this.resetAction();
          this.presenter.resetSelectedSkill();
          resolve();
        });
      } else {
        //TODO: need to refactor, when multiple skills triggered at the same time
      }
    });
  }

  isCardEnabledOnSkillTriggered(card: Card, fromArea: PlayerCardsArea) {
    if (this.selectedSkillToPlay instanceof TriggerSkill) {
      return (
        (this.selectedSkillToPlay.isAvailableCard(
          this.playerId,
          this.store.room,
          card.Id,
          this.selectedCards,
          this.selectedTargets,
          this.equipSkillCardId,
        ) &&
          (!this.selectedSkillToPlay.cardFilter(this.store.room, this.selectedCards) ||
            this.selectedSkillToPlay.cardFilter(this.store.room, [...this.selectedCards, card.Id])) &&
          card.Id !== this.equipSkillCardId) ||
        this.selectedCards.includes(card.Id)
      );
    }

    return false;
  }

  async onPlay() {
    this.presenter.setupPlayersSelectionMatcher((player: Player) => this.isPlayerEnabled(player));
    this.presenter.setupClientPlayerCardActionsMatcher((card: Card) =>
      this.isCardEnabledOnSkillTriggered(card, PlayerCardsArea.HandArea),
    );
    this.presenter.setupCardSkillSelectionMatcher((card: Card) =>
      this.isCardEnabledOnSkillTriggered(card, PlayerCardsArea.EquipArea),
    );
  }
}

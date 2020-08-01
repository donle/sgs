import { Card } from 'core/cards/card';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Skill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { RoomPresenter, RoomStore } from '../room.presenter';
import { BaseAction } from './base_action';

export class SkillUseAction extends BaseAction {
  public static isSkillDisabled = (event: ServerEventFinder<GameEventIdentifiers.AskForSkillUseEvent>) => (
    skill: Skill,
  ) => {
    if (skill instanceof TriggerSkill && event.invokeSkillNames.includes(skill.Name)) {
      return false;
    }

    return true;
  };

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

  private invokeSpecifiedSkill(skillName: string, translator: ClientTranslationModule, callback: () => void) {
    if (!EventPacker.isUncancellabelEvent(this.askForEvent)) {
      this.presenter.enableActionButton('cancel');
    } else {
      this.presenter.disableActionButton('cancel');
    }

    const event: ClientEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
      invoke: undefined,
      fromId: this.presenter.ClientPlayer!.Id,
    };
    const skill = Sanguosha.getSkillBySkillName<TriggerSkill>(skillName);
    this.presenter.createIncomingConversation({
      conversation:
        this.askForEvent.conversation ||
        TranslationPack.translationJsonPatcher('do you want to trigger skill {0} ?', skill.Name).extract(),
      translator,
    });
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
      callback();
    });
    !EventPacker.isUncancellabelEvent(this.askForEvent) &&
      this.presenter.defineCancelButtonActions(() => {
        this.store.room.broadcast(GameEventIdentifiers.AskForSkillUseEvent, event);
        this.presenter.closeIncomingConversation();
        this.resetActionHandlers();
        this.resetAction();
        this.presenter.resetSelectedSkill();
        callback();
      });
  }

  onSelect(translator: ClientTranslationModule) {
    return new Promise<void>(resolve => {
      const { invokeSkillNames, toId } = this.askForEvent;
      if (toId !== this.presenter.ClientPlayer!.Id) {
        return resolve();
      }

      if (invokeSkillNames.length === 1) {
        this.invokeSpecifiedSkill(invokeSkillNames[0], translator, resolve);
      } else {
        const actionHandlers = {};
        for (const skillName of invokeSkillNames) {
          actionHandlers[skillName] = () => {
            this.invokeSpecifiedSkill(skillName, translator, resolve);
          };
        }
        this.presenter.createIncomingConversation({
          optionsActionHanlder: actionHandlers,
          translator: this.translator,
          conversation: 'please choose a skill',
        });
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
          this.selectedSkillToPlay.availableCardAreas().includes(fromArea) &&
          (!this.selectedSkillToPlay.cardFilter(
            this.store.room,
            this.player,
            this.selectedCards,
            this.selectedTargets,
            this.selectedCardToPlay,
          ) ||
            this.selectedSkillToPlay.cardFilter(
              this.store.room,
              this.player,
              [...this.selectedCards, card.Id],
              this.selectedTargets,
              this.selectedCardToPlay,
            )) &&
          card.Id !== this.equipSkillCardId) ||
        this.selectedCards.includes(card.Id)
      );
    }

    return false;
  }

  async onPlay() {
    this.delightItems();
    this.presenter.highlightCards();

    if (EventPacker.isUncancellabelEvent(this.askForEvent)) {
      this.presenter.disableActionButton('cancel');
      this.presenter.broadcastUIUpdate();
    }
    this.presenter.setupPlayersSelectionMatcher((player: Player) => this.isPlayerEnabled(player));
    this.presenter.setupClientPlayerCardActionsMatcher((card: Card) =>
      this.isCardEnabledOnSkillTriggered(card, PlayerCardsArea.HandArea),
    );
    this.presenter.setupClientPlayerOutsideCardActionsMatcher((card: Card) =>
      this.isCardEnabledOnSkillTriggered(card, PlayerCardsArea.OutsideArea),
    );
    this.presenter.setupCardSkillSelectionMatcher((card: Card) =>
      this.isCardEnabledOnSkillTriggered(card, PlayerCardsArea.EquipArea),
    );
  }
}

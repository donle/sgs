import { Card, CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { ActiveSkill, ResponsiveSkill, Skill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { RoomPresenter, RoomStore } from '../room.presenter';

export abstract class BaseAction {
  public static disableSkills = (skill: Skill) => {
    if (skill instanceof TriggerSkill) {
      return false;
    }

    return true;
  };

  protected selectedCards: CardId[] = [];
  protected selectedCardToPlay?: CardId;
  protected selectedSkillToPlay?: Skill;
  protected selectedTargets: PlayerId[] = [];
  protected equipSkillCardId?: CardId;
  protected pendingCards: CardId[] = [];

  constructor(
    protected playerId: PlayerId,
    protected store: RoomStore,
    protected presenter: RoomPresenter,
    protected scopedTargets?: PlayerId[],
  ) {
    this.presenter.onClickPlayer((player: Player, selected: boolean) => {
      selected ? this.selectPlayer(player) : this.unselectePlayer(player);
      this.onClickPlayer(player, selected);
      this.enableToCallAction()
        ? this.presenter.enableActionButton('confirm')
        : this.presenter.disableActionButton('confirm');
      this.presenter.broadcastUIUpdate();
    });
    this.presenter.onClickPlayerCard((card: Card, selected: boolean) => {
      selected ? this.selectCard(card.Id) : this.unselectCard(card.Id);
      this.onClickCard(card, selected);
      this.enableToCallAction()
        ? this.presenter.enableActionButton('confirm')
        : this.presenter.disableActionButton('confirm');
      this.presenter.broadcastUIUpdate();
    });
    this.presenter.onClickEquipment((card: Card, selected: boolean) => {
      if (this.selectedCardToPlay === undefined && this.selectedSkillToPlay === undefined) {
        if (card.Skill instanceof ActiveSkill || card.Skill instanceof ViewAsSkill) {
          if (selected) {
            this.selectSkill(card.Skill);
          } else {
            this.unselectSkill(card.Skill);
          }
          this.onClickSkill(card.Skill, selected);
        }
      }

      //TODO:
      selected ? this.selectCard(card.Id) : this.unselectCard(card.Id);
      this.onClickCard(card, selected);

      this.enableToCallAction()
        ? this.presenter.enableActionButton('confirm')
        : this.presenter.disableActionButton('confirm');
      this.presenter.broadcastUIUpdate();
    });
    this.presenter.onClickSkill((skill: Skill, selected: boolean) => {
      selected ? this.selectSkill(skill) : this.unselectSkill(skill);
      this.onClickSkill(skill, selected);
      this.enableToCallAction()
        ? this.presenter.enableActionButton('confirm')
        : this.presenter.disableActionButton('confirm');
      this.presenter.broadcastUIUpdate();
    });
  }

  public readonly resetAction = () => {
    this.selectedCardToPlay = undefined;
    this.selectedSkillToPlay = undefined;
    this.equipSkillCardId = undefined;
    this.selectedCards = [];
    this.selectedTargets = [];
    this.pendingCards = [];

    this.presenter.disableActionButton('confirm');
    this.onResetAction();
    this.presenter.broadcastUIUpdate();
  };

  public readonly resetActionHandlers = () => {
    this.presenter.setupPlayersSelectionMatcher(() => false);
    this.presenter.setupClientPlayerCardActionsMatcher(() => false);
    this.presenter.setupCardSkillSelectionMatcher(() => false);
  };

  isPlayerEnabled(player: Player): boolean {
    if (this.scopedTargets && !this.scopedTargets.includes(player.Id)) {
      return false;
    }
    if (this.selectedTargets.includes(player.Id)) {
      return true;
    }

    let skill: Skill | undefined;

    if (this.selectedCardToPlay !== undefined) {
      skill = Sanguosha.getCardById(this.selectedCardToPlay).Skill;
    } else if (this.selectedSkillToPlay !== undefined) {
      skill = this.selectedSkillToPlay;
    }

    if (skill === undefined) {
      return false;
    }
    if (skill instanceof ActiveSkill || skill instanceof TriggerSkill) {
      const isAvailableInRoom =
        this.selectedCardToPlay === undefined
          ? true
          : this.store.room.isAvailableTarget(this.selectedCardToPlay, this.playerId, player.Id);

      return (
        skill.isAvailableTarget(
          this.playerId,
          this.store.room,
          player.Id,
          this.selectedCards,
          this.selectedTargets,
          this.selectedCardToPlay,
        ) &&
        isAvailableInRoom &&
        !skill.targetFilter(this.store.room, this.selectedTargets)
      );
    } else {
      return false;
    }
  }

  isCardEnabled(
    card: Card,
    player: Player,
    fromArea: PlayerCardsArea = PlayerCardsArea.HandArea,
    ignoreCanUseCondition: boolean = false,
  ): boolean {
    if (
      card.Id === this.selectedCardToPlay ||
      card.Id === this.equipSkillCardId ||
      this.pendingCards.includes(card.Id) ||
      this.selectedCards.includes(card.Id)
    ) {
      return true;
    }

    if (this.selectedSkillToPlay) {
      const skill = this.selectedSkillToPlay;
      if (skill instanceof ActiveSkill) {
        return (
          skill.isAvailableCard(
            player.Id,
            this.store.room,
            card.Id,
            this.selectedCards,
            this.selectedTargets,
            this.equipSkillCardId,
          ) && skill.cardFilter(this.store.room, [...this.selectedCards, card.Id])
        );
      } else if (skill instanceof ViewAsSkill) {
        return (
          skill.isAvailableCard(this.store.room, player, card.Id, this.pendingCards, this.equipSkillCardId) &&
          !skill.cardFilter(this.store.room, player, this.pendingCards)
        );
      } else if (skill instanceof ResponsiveSkill) {
        return this.selectedCardToPlay === undefined;
      } else {
        return false;
      }
    }

    if (this.selectedCardToPlay === undefined) {
      if (fromArea === PlayerCardsArea.HandArea) {
        if (!ignoreCanUseCondition && !player.canUseCard(this.store.room, card.Id)) {
          return false;
        }
      } else if (fromArea === PlayerCardsArea.EquipArea) {
        if (card.Skill instanceof ViewAsSkill) {
          return player.canUseCard(this.store.room, new CardMatcher({ name: card.Skill.canViewAs() }));
        } else if (card.Skill instanceof ActiveSkill) {
          let canSelfUse = false;
          if (card.Skill.isSelfTargetSkill()) {
            canSelfUse = player.canUseCardTo(this.store.room, card.Id, player.Id);
          }
          return card.Skill.canUse(this.store.room, player) && canSelfUse;
        }

        return false;
      }
    } else {
      const skill = card.Skill;
      if (skill instanceof ActiveSkill) {
        return (
          skill.isAvailableCard(
            player.Id,
            this.store.room,
            card.Id,
            this.selectedCards,
            this.selectedTargets,
            card.Id,
          ) && !skill.cardFilter(this.store.room, this.selectedCards)
        );
      } else if (skill instanceof ViewAsSkill) {
        return (
          skill.isAvailableCard(
            this.store.room,
            this.presenter.ClientPlayer!,
            card.Id,
            this.pendingCards,
            this.equipSkillCardId,
          ) && !skill.cardFilter(this.store.room, this.presenter.ClientPlayer!, this.pendingCards)
        );
      } else {
        return false;
      }
    }

    return player.canUseCard(this.store.room, card.Id);
  }

  protected unselectePlayer(player: Player) {
    if (this.selectedTargets.includes(player.Id)) {
      const index = this.selectedTargets.findIndex(target => target === player.Id);
      if (index >= 0) {
        this.selectedTargets.splice(index, 1);
      }
    }
  }

  protected selectPlayer(player: Player) {
    if (!this.selectedTargets.includes(player.Id)) {
      this.selectedTargets.push(player.Id);
    }
  }

  protected selectCard(cardId: CardId) {
    if (this.equipSkillCardId === cardId) {
      return;
    }

    if (this.selectedSkillToPlay !== undefined) {
      if (this.selectedSkillToPlay instanceof ViewAsSkill) {
        this.pendingCards.push(cardId);
      } else {
        this.selectedCards.push(cardId);
      }
    } else if (this.selectedCardToPlay === undefined) {
      this.selectedCardToPlay = cardId;
    } else {
      this.selectedCards.push(cardId);
    }
  }

  protected unselectCard(cardId: CardId) {
    if (this.equipSkillCardId === cardId) {
      this.resetAction();
      return;
    }

    if (this.selectedSkillToPlay?.Name === Sanguosha.getCardById(cardId).Name) {
      this.selectedSkillToPlay = undefined;
    }
    if (this.selectedCardToPlay === cardId) {
      this.selectedCardToPlay = undefined;
    } else {
      let index = this.selectedCards.findIndex(selectedCard => selectedCard === cardId);
      if (index >= 0) {
        this.selectedCards.splice(index, 1);
      }
      index = this.pendingCards.findIndex(pendingCard => pendingCard === cardId);
      if (index >= 0) {
        this.pendingCards.splice(index, 1);
      }
    }
  }

  protected selectSkill(skill: Skill) {
    if (this.selectedCardToPlay !== undefined) {
      return;
    }

    if (this.selectedSkillToPlay === undefined) {
      this.selectedSkillToPlay = skill;
      this.store.selectedSkill = skill;
      this.equipSkillCardId = this.store.room
        .getPlayerById(this.playerId)
        .getCardIds(PlayerCardsArea.EquipArea)
        .find(cardId => Sanguosha.getCardById(cardId).Skill === skill);
    }
  }
  protected unselectSkill(skill: Skill) {
    if (this.selectedSkillToPlay === skill) {
      this.selectedSkillToPlay = undefined;
      this.store.selectedSkill = undefined;
    }
  }

  protected enableToCallAction() {
    if (this.selectedCardToPlay !== undefined) {
      const card = Sanguosha.getCardById(this.selectedCardToPlay);
      if (card.is(CardType.Equip)) {
        return true;
      }

      if (card.Skill instanceof ActiveSkill || card.Skill instanceof TriggerSkill) {
        return (
          card.Skill.cardFilter(this.store.room, this.selectedCards) &&
          card.Skill.targetFilter(this.store.room, this.selectedTargets)
        );
      } else if (card.Skill instanceof ResponsiveSkill) {
        return true;
      } else {
        return false;
      }
    } else if (this.selectedSkillToPlay !== undefined) {
      const skill = this.selectedSkillToPlay;

      if (skill instanceof ActiveSkill || skill instanceof TriggerSkill) {
        return (
          skill.cardFilter(this.store.room, this.selectedCards) &&
          skill.targetFilter(this.store.room, this.selectedTargets)
        );
      } else if (skill instanceof ResponsiveSkill) {
        return true;
      } else {
        return false;
      }
    }

    return false;
  }

  public abstract onPlay(...args: any): void;

  protected onClickCard(card: Card, selected: boolean): void {
    if (this.selectedSkillToPlay !== undefined) {
      if (
        this.selectedSkillToPlay instanceof ViewAsSkill &&
        this.selectedSkillToPlay.cardFilter(
          this.store.room,
          this.store.room.getPlayerById(this.playerId),
          this.pendingCards,
        )
      ) {
        this.selectedCardToPlay = this.selectedSkillToPlay.viewAs(this.pendingCards).Id;
      } else {
        this.selectedCardToPlay = undefined;
      }
    }
  }
  // tslint:disable-next-line:no-empty
  protected onClickPlayer(player: Player, selected: boolean): void {}
  // tslint:disable-next-line:no-empty
  protected onClickSkill(skill: Skill, selected: boolean): void {}
  // tslint:disable-next-line:no-empty
  protected onResetAction() {}
}

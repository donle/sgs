import { Card, CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { ActiveSkill, GlobalFilterSkill, ResponsiveSkill, Skill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import { RoomPresenter, RoomStore } from '../room.presenter';
import { CardCategoryDialog } from '../ui/dialog/card_category_dialog/card_category_dialog';

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

  private inProcessDialog = false;
  protected player: Player;

  constructor(
    protected playerId: PlayerId,
    protected store: RoomStore,
    protected presenter: RoomPresenter,
    protected translator: ClientTranslationModule,
    protected scopedTargets?: PlayerId[],
  ) {
    this.player = this.store.room.getPlayerById(this.playerId);
    this.presenter.onClickPlayer((player: Player, selected: boolean) => {
      if (this.inProcessDialog) {
        this.presenter.closeDialog();
      }

      selected ? this.selectPlayer(player) : this.unselectePlayer(player);
      this.onClickPlayer(player, selected);
    });
    this.presenter.onClickPlayerCard((card: Card, selected: boolean) => {
      if (this.inProcessDialog) {
        this.presenter.closeDialog();
      }

      selected ? this.selectCard(card.Id) : this.unselectCard(card.Id);
      this.onClickCard(card, selected);
    });
    this.presenter.onClickEquipment((card: Card, selected: boolean) => {
      if (this.inProcessDialog) {
        this.presenter.closeDialog();
      }

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
    });
    this.presenter.onClickSkill((skill: Skill, selected: boolean) => {
      if (this.inProcessDialog) {
        this.presenter.closeDialog();
      }

      selected ? this.selectSkill(skill) : this.unselectSkill(skill);
      this.onClickSkill(skill, selected);
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
    this.presenter.disableActionButton('reforge');
    this.presenter.disableCardReforgeStatus();
    this.onResetAction();
    this.presenter.broadcastUIUpdate();
  };

  public readonly resetActionHandlers = () => {
    this.presenter.setupPlayersSelectionMatcher(() => false);
    this.presenter.setupClientPlayerCardActionsMatcher(() => false);
    this.presenter.setupCardSkillSelectionMatcher(() => false);
  };

  isPlayerEnabled(player: Player): boolean {
    if (
      (this.scopedTargets && !this.scopedTargets.includes(player.Id)) ||
      player.Dead ||
      !this.store.room.isPlaying() ||
      this.store.room.isGameOver()
    ) {
      return false;
    }
    if (this.selectedTargets.includes(player.Id)) {
      return true;
    }
    if (this.selectedCardToPlay !== undefined) {
      for (const skillOwner of this.store.room.getAlivePlayersFrom()) {
        for (const skill of skillOwner.getSkills<GlobalFilterSkill>('globalFilter')) {
          if (!skill.canUseCardTo(this.selectedCardToPlay, this.store.room, skillOwner, this.player, player)) {
            return false;
          }
        }
      }
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
        (!skill.targetFilter(this.store.room, this.player, this.selectedTargets, this.selectedCardToPlay) ||
          skill.targetFilter(
            this.store.room,
            this.player,
            [...this.selectedTargets, player.Id],
            this.selectedCardToPlay,
          ))
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
    if (!this.store.room.isPlaying() || this.store.room.isGameOver()) {
      return false;
    }
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
          ) &&
          (!skill.cardFilter(this.store.room, player, this.selectedCards) ||
            skill.cardFilter(this.store.room, player, [...this.selectedCards, card.Id]))
        );
      } else if (skill instanceof ViewAsSkill) {
        return (
          skill.isAvailableCard(this.store.room, player, card.Id, this.pendingCards, this.equipSkillCardId) &&
          (!skill.cardFilter(this.store.room, player, this.pendingCards) ||
            skill.cardFilter(this.store.room, player, [...this.pendingCards, card.Id]))
        );
      } else if (skill instanceof ResponsiveSkill) {
        return this.selectedCardToPlay === undefined;
      } else {
        return false;
      }
    }

    if (this.selectedCardToPlay === undefined) {
      if (fromArea === PlayerCardsArea.HandArea) {
        if (
          card.Skill instanceof ResponsiveSkill ||
          (!ignoreCanUseCondition && !player.canUseCard(this.store.room, card.Id))
        ) {
          return false;
        }
      } else if (fromArea === PlayerCardsArea.EquipArea) {
        if (card.Skill instanceof ViewAsSkill) {
          return (
            player.canUseCard(
              this.store.room,
              new CardMatcher({ name: card.Skill.canViewAs(this.store.room, player, this.pendingCards) }),
            ) && card.Skill.canUse(this.store.room, player)
          );
        } else if (card.Skill instanceof ActiveSkill) {
          let canSelfUse = true;
          if (card.Skill.isSelfTargetSkill()) {
            canSelfUse = player.canUseCardTo(this.store.room, card.Id, player.Id);
          }
          return canSelfUse && card.Skill.canUse(this.store.room, player);
        }

        return false;
      }
    } else {
      const playingCard = Sanguosha.getCardById(this.selectedCardToPlay);
      if (playingCard.is(CardType.Equip)) {
        return false;
      }
      const skill = playingCard.Skill;

      if (skill instanceof ActiveSkill) {
        return (
          skill.isAvailableCard(
            player.Id,
            this.store.room,
            card.Id,
            this.selectedCards,
            this.selectedTargets,
            card.Id,
          ) &&
          (!skill.cardFilter(this.store.room, this.presenter.ClientPlayer!, this.selectedCards) ||
            skill.cardFilter(this.store.room, this.presenter.ClientPlayer!, [...this.selectedCards, card.Id]))
        );
      } else if (skill instanceof ViewAsSkill) {
        return (
          skill.isAvailableCard(
            this.store.room,
            this.presenter.ClientPlayer!,
            card.Id,
            this.pendingCards,
            this.equipSkillCardId,
          ) &&
          (!skill.cardFilter(this.store.room, this.presenter.ClientPlayer!, this.pendingCards) ||
            skill.cardFilter(this.store.room, this.presenter.ClientPlayer!, [...this.pendingCards, card.Id]))
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
      this.equipSkillCardId = this.player
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

  private callToActionCheck() {
    this.enableToCallAction()
      ? this.presenter.enableActionButton('confirm')
      : this.presenter.disableActionButton('confirm');
    this.presenter.broadcastUIUpdate();
  }

  protected enableToCallAction() {
    if (this.selectedCardToPlay !== undefined) {
      const card = Sanguosha.getCardById(this.selectedCardToPlay);
      if (card.is(CardType.Equip)) {
        return true;
      }

      if (card.Skill instanceof ActiveSkill || card.Skill instanceof TriggerSkill) {
        return (
          card.Skill.cardFilter(this.store.room, this.player, this.selectedCards) &&
          card.Skill.targetFilter(this.store.room, this.player, this.selectedTargets, this.selectedCardToPlay)
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
          skill.cardFilter(this.store.room, this.player, this.selectedCards) &&
          skill.targetFilter(this.store.room, this.player, this.selectedTargets, this.selectedCardToPlay)
        );
      } else if (skill instanceof ResponsiveSkill) {
        return true;
      } else {
        return false;
      }
    }

    return false;
  }

  public abstract async onPlay(...args: any): Promise<void>;

  protected onClickCard(card: Card, selected: boolean, matcher?: CardMatcher): void {
    if (this.selectedSkillToPlay !== undefined) {
      if (
        this.selectedSkillToPlay instanceof ViewAsSkill &&
        this.selectedSkillToPlay.cardFilter(this.store.room, this.player, this.pendingCards)
      ) {
        const canViewAs = this.selectedSkillToPlay
          .canViewAs(this.store.room, this.player, this.pendingCards)
          .filter(cardName => {
            if (!matcher) {
              return (
                !(Sanguosha.getCardByName(cardName).Skill instanceof ResponsiveSkill) &&
                this.player.canUseCard(
                  this.store.room,
                  VirtualCard.create({ cardName, bySkill: this.selectedSkillToPlay!.Name }).Id,
                )
              );
            } else {
              return matcher.Matcher.name ? matcher.Matcher.name.includes(cardName) : false;
            }
          });

        if (canViewAs.length > 1) {
          const skill = this.selectedSkillToPlay as ViewAsSkill;
          this.inProcessDialog = true;
          const onClickDemoCard = (selectedCardName: string) => {
            this.inProcessDialog = false;
            this.presenter.closeDialog();
            this.selectedCardToPlay = skill.viewAs(this.pendingCards, selectedCardName).Id;
            this.callToActionCheck();
          };

          this.presenter.createDialog(
            <CardCategoryDialog translator={this.translator} cardNames={canViewAs} onClick={onClickDemoCard} />,
          );
        } else {
          this.selectedCardToPlay = this.selectedSkillToPlay.viewAs(this.pendingCards, canViewAs[0]).Id;
        }
      } else {
        this.selectedCardToPlay = undefined;
      }
    }
    this.callToActionCheck();
  }

  protected onClickSkill(skill: Skill, selected: boolean, matcher?: CardMatcher): void {
    if (
      this.selectedSkillToPlay &&
      this.selectedSkillToPlay instanceof ViewAsSkill &&
      this.selectedSkillToPlay.cardFilter(this.store.room, this.player, this.pendingCards)
    ) {
      const canViewAs = this.selectedSkillToPlay
        .canViewAs(this.store.room, this.player, this.pendingCards)
        .filter(cardName => {
          if (!matcher) {
            return (
              !(Sanguosha.getCardByName(cardName).Skill instanceof ResponsiveSkill) &&
              this.player.canUseCard(
                this.store.room,
                VirtualCard.create({ cardName, bySkill: this.selectedSkillToPlay!.Name }).Id,
              )
            );
          } else {
            return matcher.Matcher.name ? matcher.Matcher.name.includes(cardName) : false;
          }
        });

      if (canViewAs.length > 1) {
        const skill = this.selectedSkillToPlay as ViewAsSkill;
        this.inProcessDialog = true;
        const onClickDemoCard = (selectedCardName: string) => {
          this.inProcessDialog = false;
          this.presenter.closeDialog();
          this.selectedCardToPlay = skill.viewAs(this.pendingCards, selectedCardName).Id;
          this.callToActionCheck();
        };

        this.presenter.createDialog(
          <CardCategoryDialog translator={this.translator} cardNames={canViewAs} onClick={onClickDemoCard} />,
        );
      } else {
        this.selectedCardToPlay = this.selectedSkillToPlay.viewAs(this.pendingCards, canViewAs[0]).Id;
      }
    }
    this.callToActionCheck();
  }

  protected onClickPlayer(player: Player, selected: boolean): void {
    this.callToActionCheck();
  }
  // tslint:disable-next-line:no-empty
  protected onResetAction() {}
}

import { Card, CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { ClientPlayer } from 'core/player/player.client';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { ActiveSkill, GlobalFilterSkill, ResponsiveSkill, Skill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
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
    this.presenter.disableActionButton('cancel');
    this.presenter.disableActionButton('finish');
    this.presenter.disableCardReforgeStatus();
    this.presenter.delightPlayers(false);
    this.presenter.highlightCards(true);
    this.onResetAction();
    this.presenter.broadcastUIUpdate();
  };

  public readonly resetActionHandlers = () => {
    this.presenter.setupPlayersSelectionMatcher(() => false);
    this.presenter.setupClientPlayerCardActionsMatcher(() => false);
    this.presenter.setupClientPlayerOutsideCardActionsMatcher(() => false);
    this.presenter.setupCardSkillSelectionMatcher(() => false);
    this.presenter.clearSelectedCards();
    this.presenter.clearSelectedPlayers();
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
      let isAvailableInRoom =
        this.selectedCardToPlay === undefined
          ? true
          : this.store.room.isAvailableTarget(this.selectedCardToPlay, this.playerId, player.Id);
      if (this.selectedCardToPlay !== undefined) {
        isAvailableInRoom =
          isAvailableInRoom && this.player.canUseCardTo(this.store.room, this.selectedCardToPlay, player.Id);
      }

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
        (!skill.targetFilter(
          this.store.room,
          this.player,
          this.selectedTargets,
          this.selectedCards,
          this.selectedCardToPlay,
        ) ||
          skill.targetFilter(
            this.store.room,
            this.player,
            [...this.selectedTargets, player.Id],
            this.selectedCards,
            this.selectedCardToPlay,
          ))
      );
    } else {
      return false;
    }
  }

  protected isCardFromParticularArea(card: Card) {
    return (
      this.store.room.GameParticularAreas.find(cardName =>
        this.player.getCardIds(PlayerCardsArea.OutsideArea, cardName).includes(card.Id),
      ) !== undefined
    );
  }

  protected isCardEnabledInArea(skill: ViewAsSkill | ActiveSkill, card: Card, fromArea: PlayerCardsArea) {
    if (
      this.store.room.GameParticularAreas.includes(skill.GeneralName) &&
      !this.store.room.GameParticularAreas.includes(card.GeneralName) &&
      fromArea === PlayerCardsArea.OutsideArea
    ) {
      return false;
    }

    return this.isCardFromParticularArea(card) || skill.availableCardAreas().includes(fromArea);
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
        const selectedCardsRange = skill.numberOfCards();
        const usableCardNumbers = selectedCardsRange.findIndex(
          cardNumbers => cardNumbers === this.selectedCards.length,
        );

        if (usableCardNumbers >= 0 && usableCardNumbers !== selectedCardsRange.length - 1) {
          return true;
        }

        return (
          skill.isAvailableCard(
            player.Id,
            this.store.room,
            card.Id,
            this.selectedCards,
            this.selectedTargets,
            this.equipSkillCardId,
          ) &&
          skill.availableCardAreas().includes(fromArea) &&
          (!skill.cardFilter(
            this.store.room,
            player,
            this.selectedCards,
            this.selectedTargets,
            this.selectedCardToPlay,
          ) ||
            skill.cardFilter(
              this.store.room,
              player,
              [...this.selectedCards, card.Id],
              this.selectedTargets,
              this.selectedCardToPlay,
            ))
        );
      } else if (skill instanceof ViewAsSkill) {
        return (
          skill.isAvailableCard(this.store.room, player, card.Id, this.pendingCards, this.equipSkillCardId) &&
          this.isCardEnabledInArea(skill, card, fromArea) &&
          (!skill.cardFilter(
            this.store.room,
            player,
            this.pendingCards,
            this.selectedTargets,
            this.selectedCardToPlay,
          ) ||
            skill.cardFilter(
              this.store.room,
              player,
              [...this.pendingCards, card.Id],
              this.selectedTargets,
              this.selectedCardToPlay,
            ))
        );
      } else if (skill instanceof ResponsiveSkill) {
        return this.selectedCardToPlay === undefined;
      } else {
        return false;
      }
    }

    const canUseOnPlayers =
      this.store.room.AlivePlayers.find(target => player.canUseCardTo(this.store.room, card.Id, target.Id)) !==
      undefined;
    if (this.selectedCardToPlay === undefined) {
      if (fromArea === PlayerCardsArea.HandArea) {
        if (card.is(CardType.Equip)) {
          return player.canUseCardTo(this.store.room, card.Id, player.Id);
        }

        if (
          card.Skill instanceof ResponsiveSkill ||
          (!ignoreCanUseCondition && !player.canUseCard(this.store.room, card.Id) && !canUseOnPlayers)
        ) {
          return false;
        }
        if (ignoreCanUseCondition) {
          return true;
        }

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

          return canSelfUse && player.canUseCard(this.store.room, card.Id);
        }
      } else if (fromArea === PlayerCardsArea.EquipArea) {
        if (this.store.room.GameParticularAreas.includes(card.Skill.Name)) {
          const hasParticularOutsideCards =
            this.store.room.GameParticularAreas.find(
              cardName =>
                this.selectedCards.find(cardId =>
                  player.getCardIds(PlayerCardsArea.OutsideArea, cardName).includes(cardId),
                ) !== undefined,
            ) !== undefined;
          if (hasParticularOutsideCards) {
            return false;
          }
        }

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
          return canSelfUse && card.Skill.canUse(this.store.room, player, card.Id);
        }

        return false;
      } else if (fromArea === PlayerCardsArea.OutsideArea) {
        if (this.isCardFromParticularArea(card)) {
          const hasParticularOutsideCards = this.selectedCards.find(cardId =>
            this.store.room.GameParticularAreas.includes(Sanguosha.getCardById(cardId).Name),
          );
          if (hasParticularOutsideCards) {
            return false;
          }

          if (
            card.Skill instanceof ResponsiveSkill ||
            (!ignoreCanUseCondition && !player.canUseCard(this.store.room, card.Id) && !canUseOnPlayers)
          ) {
            return false;
          }
        } else {
          return false;
        }
      }
    } else {
      const playingCard = Sanguosha.getCardById(this.selectedCardToPlay);
      if (playingCard.is(CardType.Equip)) {
        return false;
      }
      const skill = playingCard.Skill;

      if (skill instanceof ActiveSkill) {
        const selectedCardsRange = skill.numberOfCards();
        const usableCardNumbers = selectedCardsRange.findIndex(
          cardNumbers => cardNumbers === this.selectedCards.length,
        );

        if (usableCardNumbers >= 0 && usableCardNumbers !== selectedCardsRange.length - 1) {
          return true;
        }

        return (
          skill.isAvailableCard(
            player.Id,
            this.store.room,
            card.Id,
            this.selectedCards,
            this.selectedTargets,
            card.Id,
          ) &&
          skill.availableCardAreas().includes(fromArea) &&
          (!skill.cardFilter(
            this.store.room,
            this.presenter.ClientPlayer!,
            this.selectedCards,
            this.selectedTargets,
            this.selectedCardToPlay,
          ) ||
            skill.cardFilter(
              this.store.room,
              this.presenter.ClientPlayer!,
              [...this.selectedCards, card.Id],
              this.selectedTargets,
              this.selectedCardToPlay,
            ))
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
          this.isCardEnabledInArea(skill, card, fromArea) &&
          (!skill.cardFilter(
            this.store.room,
            this.presenter.ClientPlayer!,
            this.pendingCards,
            this.selectedTargets,
            this.selectedCardToPlay,
          ) ||
            skill.cardFilter(
              this.store.room,
              this.presenter.ClientPlayer!,
              [...this.pendingCards, card.Id],
              this.selectedTargets,
              this.selectedCardToPlay,
            ))
        );
      } else {
        return false;
      }
    }

    return player.canUseCard(this.store.room, card.Id) || canUseOnPlayers;
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

  protected delightItems() {
    if (this.selectedCardToPlay || this.selectedSkillToPlay) {
      this.presenter.delightPlayers(true);
    } else {
      this.presenter.delightPlayers(false);
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
        const canUse =
          card.Skill.numberOfCards().length === 0 || card.Skill.numberOfCards().includes(this.selectedCards.length);
        return (
          canUse &&
          card.Skill.cardFilter(
            this.store.room,
            this.player,
            this.selectedCards,
            this.selectedTargets,
            this.selectedCardToPlay,
          ) &&
          card.Skill.targetFilter(
            this.store.room,
            this.player,
            this.selectedTargets,
            this.selectedCards,
            this.selectedCardToPlay,
          )
        );
      } else if (card.Skill instanceof ResponsiveSkill) {
        return true;
      } else {
        return false;
      }
    } else if (this.selectedSkillToPlay !== undefined) {
      const skill = this.selectedSkillToPlay;

      if (skill instanceof ActiveSkill || skill instanceof TriggerSkill) {
        const canUse = skill.numberOfCards().length === 0 || skill.numberOfCards().includes(this.selectedCards.length);
        return (
          canUse &&
          skill.cardFilter(
            this.store.room,
            this.player,
            this.selectedCards,
            this.selectedTargets,
            this.selectedCardToPlay,
          ) &&
          skill.targetFilter(
            this.store.room,
            this.player,
            this.selectedTargets,
            this.selectedCards,
            this.selectedCardToPlay,
          )
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
    if (selected) {
      this.presenter.selectCard(card);
      const target = this.store.room.getAlivePlayersFrom().filter(player => this.isPlayerEnabled(player));
      if (target.length === 1) {
        this.presenter.selectPlayer(this.store.room.getPlayerById(target[0].Id));
        this.selectedTargets.push(target[0].Id);
        this.callToActionCheck();
      }
    } else {
      this.presenter.unselectCard(card);
      for (const target of this.selectedTargets) {
        this.presenter.unselectPlayer(this.store.room.getPlayerById(target));
      }
      this.scopedTargets?.length !== 1 && (this.selectedTargets = []);
    }

    if (this.selectedSkillToPlay !== undefined) {
      if (
        this.selectedSkillToPlay instanceof ViewAsSkill &&
        this.selectedSkillToPlay.cardFilter(
          this.store.room,
          this.player,
          this.pendingCards,
          this.selectedTargets,
          this.selectedCardToPlay,
        )
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
              return matcher.match(new CardMatcher({ name: [cardName] }));
            }
          });

        if (canViewAs.length > 1) {
          const skill = this.selectedSkillToPlay as ViewAsSkill;
          this.inProcessDialog = true;
          const onClickDemoCard = (selectedCardName: string) => {
            this.inProcessDialog = false;
            this.presenter.closeDialog();
            this.selectedCardToPlay = skill.viewAs(this.pendingCards, this.player, selectedCardName).Id;
            this.callToActionCheck();
          };

          this.presenter.createCardCategoryDialog({
            translator: this.translator,
            cardNames: canViewAs,
            onClick: onClickDemoCard,
          });
        } else {
          this.selectedCardToPlay = this.selectedSkillToPlay.viewAs(this.pendingCards, this.player, canViewAs[0]).Id;
        }
      } else {
        this.selectedCardToPlay = undefined;
      }
    }
    this.delightItems();
    this.callToActionCheck();
  }

  protected onClickSkill(skill: Skill, selected: boolean, matcher?: CardMatcher): void {
    if (
      this.selectedSkillToPlay &&
      this.selectedSkillToPlay instanceof ViewAsSkill &&
      this.selectedSkillToPlay.cardFilter(
        this.store.room,
        this.player,
        this.pendingCards,
        this.selectedTargets,
        this.selectedCardToPlay,
      )
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
          this.selectedCardToPlay = skill.viewAs(this.pendingCards, this.player, selectedCardName).Id;
          this.callToActionCheck();
        };

        this.presenter.createCardCategoryDialog({
          translator: this.translator,
          cardNames: canViewAs,
          onClick: onClickDemoCard,
        });
      } else {
        this.selectedCardToPlay = this.selectedSkillToPlay.viewAs(this.pendingCards, this.player, canViewAs[0]).Id;
      }
    }
    if (!selected) {
      for (const card of this.selectedCards) {
        this.presenter.unselectCard(Sanguosha.getCardById(card));
      }
      for (const target of this.selectedTargets) {
        this.presenter.unselectPlayer(this.store.room.getPlayerById(target));
      }
      this.selectedCards = [];
      this.selectedTargets = [];
    }
    this.delightItems();
    this.callToActionCheck();
  }

  protected onClickPlayer(player: Player, selected: boolean): void {
    selected
      ? this.presenter.selectPlayer(player as ClientPlayer)
      : this.presenter.unselectPlayer(player as ClientPlayer);
    this.callToActionCheck();
  }
  // tslint:disable-next-line:no-empty
  protected onResetAction() {}
}

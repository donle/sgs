import * as basicCards from 'core/cards/basic_card';
import * as cardHooks from 'core/cards/card';
import * as equipCards from 'core/cards/equip_card';
import { CardSuit } from 'core/cards/libs/card_props';
import * as trickCards from 'core/cards/trick_card';
import * as characters from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { GameCharacterExtensions } from 'core/game/game_props';
import { CardLoader } from 'core/game/package_loader/loader.cards';
import { CharacterLoader } from 'core/game/package_loader/loader.characters';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import * as skills from 'core/skills/skill';

function registerSkills(...addonSkills: skills.SkillPrototype<skills.Skill>[]) {
  (SkillLoader.getInstance() as any).addSkills(...addonSkills);
}

function registerCharacters(...addonCharacters: (new (index: number) => characters.Character)[]) {
  const charactersCreator = (index: number) => {
    return addonCharacters.map(character => new character(index++));
  };
  CharacterLoader.getInstance().addCharacterPackage({ [GameCharacterExtensions.Custom]: charactersCreator });
}

function registerCards(
  ...addonCards: {
    card: new (index: number, cardNumber: number, suit: CardSuit) => cardHooks.Card;
    number: number;
    suit: CardSuit;
  }[]
) {
  const cardsCreator = (index: number) => {
    return addonCards.map(card => new card.card(index++, card.number, card.suit));
  };
  CardLoader.getInstance().addCardPackages({ [GameCharacterExtensions.Custom]: cardsCreator });
}

export const OpenAPI = {
  registerSkills,
  registerCharacters,
  registerCards,
  ...skills,
  ...cardHooks,
  ...basicCards,
  ...equipCards,
  ...trickCards,
  ...characters,
  Sanguosha,
};

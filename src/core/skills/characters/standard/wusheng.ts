import { CommonSkill, ViewAsSkill, ShadowSkill, CompulsorySkill, TriggerSkill } from "core/skills/skill";
import { Room } from 'core/room/room';
import { Player } from 'core/player/player';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardSuit, CardId } from 'core/cards/libs/card_props';
import { Card, VirtualCard } from 'core/cards/card';
import { Sanguosha } from 'core/game/engine';
import { Slash } from 'core/cards/standard/slash';
import { ServerEventFinder, GameEventIdentifiers } from 'core/event/event';


@CommonSkill
export class WuSheng extends ViewAsSkill{
    constructor(){
        super("wusheng", "wusheng_description");
    }
    public canViewAs(): string[]{
        return ["slash"];
    }
    public canUse(room: Room, owner: Player): boolean{
        return owner.canUseCard(room, new CardMatcher({ name: ['slash'], suit: [CardSuit.Heart, CardSuit.Diamond]}));
    }
    public cardFilter(room: Room, owner:Player, cards: CardId[]): boolean {
        return cards.length == 1 && Sanguosha.getCardById(cards[0]).isRed();
    }
    public isAvailableCard(
        room: Room,
        owner: Player,
        pendingCardId: CardId,
        selectedCards: CardId[],
        containerCard?: CardId,
        cardMatcher?: CardMatcher,
    ): boolean {
        if(cardMatcher){
            if(cardMatcher.Matcher.name && cardMatcher.Matcher.name.includes("slash")){
                // Slash, and selected is red.
                return this.cardFilter(room, owner, selectedCards);
            }
        } else {
            // normal situation. Same as actively use.
            return this.canUse(room, owner) && this.cardFilter(room, owner, selectedCards);
        }
        return false;
    }
    public viewAs(selectedCards: CardId[]): VirtualCard{
        return VirtualCard.create<Slash>(
            {
                cardName: "slash",
                bySkill: this.name
            },
            selectedCards,
            this
        );
    }

}

//! Shadow skill will be created as long as distance skill are perfectly supported.
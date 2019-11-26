import { Player } from 'sgs/player';
import { Card } from 'cards/card';

export type CardUseEvent = {
    from: Player;
    card: Card;
    to?: Player;
}

export type SkillUseEvent = {
    from: Player;
    cards?: Card[];
    tos?: Player[];
}

export type DamageEvent = {
    from?: Player;
    cards?: Card[];
    to: Player;
}

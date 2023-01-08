import {Hand} from './Hand';
import {Deck} from './Deck';
export class Player{
    hand: Hand;
    deck: Deck;
    balance: number;
    currentBet: number;
    valueLimit: number;
    /**
     * 
     * @param deck - deck player draws from for first hand
     * @param startingBalance - balance they start the game with
     * @param valueLimit - limit before going bust, for the hand
     * @param currentBet - amount the player will bet if they decide per hand
     */
    constructor(deck: Deck, startingBalance: number, valueLimit: number, currentBet:number)
    {
        this.deck = deck;
        this.hand = new Hand(deck, valueLimit);
        this.balance = startingBalance;
        this.currentBet = currentBet;
        this.valueLimit= valueLimit;
    }
}
import { Suit } from './CardPip';
import {Deck, CardData} from './Deck';

/**
 * The status of the hand in terms of what action was last taken / is currently being taken
 */
type Status = "notBetted" | "inPlay" | "surrendered" | "stuck" | "bust" | "finished" | "blackjack";

/**
 * The game states for determining which function type should be used and how it would be managed by the handDisplay
 */
export type GameStates = "finished" | "winnings" | "playing" | "betting";
/**
 * The states for populating the next states for the player to play and the corresponding function
 * @param name - Name of option in text box
 * @param value - the type of function used
 * @param functionFinished - function to deal the player a new hand
 * @param functionWinnings - function for getting winnings to increase player balance
 * @param functionBetting - function for allowing player to place bet
 */
export type AvailableStates = {
    name: string;
    functionFinished?: () => Hand;
    functionWinnings?: (dealerValue: number, isDealerBlackjack: boolean) => number;
    functionPlaying?: () => void;
    functionBetting?: (bet: number) => number;
    value: GameStates;
}

export class Hand{
    cards: CardData[] = [];
    bet: number = 0;
    status: Status = "notBetted";
    handMinValue: number = 0;
    valueLimit: number;
    optionalTens: number = 0;
    /**
     * Creates a hand to store cards data and keep track of player actions and hand value
     * @param deck - deck for hand to draw from
     * @param valueLimit - the point at which the hand busts if exceeded
     * @param suit1 - optional choosing first drawn card suit
     * @param denomination1 - optional choosing first drawn card denomination
     * @param suit2 - optional choosing second drawn card suit
     * @param denomination2 - optional choosing second drawn card denomination
     */
    constructor(deck: Deck, valueLimit:number, suit1? : Suit, denomination1?: number, suit2? : Suit, denomination2? : number)
    {
        this.valueLimit = valueLimit;
        this.drawCard(deck, suit1, denomination1)
        this.drawCard(deck, suit2, denomination2)
    }
    /**
     * Draw a card from the deck and add it to the hand
     * @param deck - deck drawn from
     * @param suit - optional specification of suit want
     * @param denomination - optional specification of denomination you want (must be declared if declare suit to draw specified card)
     */
    drawCard(deck: Deck, suit?: Suit, denomination?: number){
        const card : CardData = (suit && denomination) ? deck.drawSpecificCard(suit, denomination) : deck.drawCard();
        this.cards.push(card); 
        this.handMinValue += card.value;
        if (card.optionalTen)
        {
            this.optionalTens++;    
        }
        
        if (this.getHandMinValue() > this.valueLimit)
        {
            this.status = "bust";
        }
    }

    /**
     * 
     * @returns the value of the hand if all cards are minimized, useful for telling if it's bust
     */
    getHandMinValue(){
        return this.handMinValue;
    }

    /**
     * 
     * @returns the value of the hand if all cards are minimized without going bust (if possible), useful for telling who has higher hand value
     */
    getBestHandValue(){
        const numberOf10sWithoutBust: number = Math.max(Math.floor((this.valueLimit - this.handMinValue) / 10), 0);
        const extraValueFromOptional10s : number =  Math.min(this.optionalTens, numberOf10sWithoutBust) * 10
        return this.handMinValue + extraValueFromOptional10s;
    }

    /**
     * 
     * @param bet - the amount the player wants to bet, this should be removed from the players balance
     * @returns the value of that bet if successful, otherwise errors if already placed a bet
     */
    placeBet(bet: number){
        if (this.status === "notBetted")
        {
            this.bet = bet;
            this.status = "inPlay";
            if (this.getBestHandValue() === this.valueLimit)
            {
                this.status = "blackjack"
            }
            return bet;
        }
        throw new Error("Already Betted");
    }

    /**
     * 
     * @remarks
     * this assumes that bets are payed before the beginning of the round
     * @param dealerValue - value of dealers cards
     * @param isDealerBlackjack  - if dealer achieved blackjack since blackjack 21 beats non-blackjack 21
     * @returns winnings / returned money (in case of draw / surrender) for the player (if any)
     */
    
    getWinnings(dealerValue: number, isDealerBlackjack: boolean){
        switch(this.status)
        {
            case "notBetted":
                this.status = "finished";
                return 0;
            case "inPlay":
                throw new Error("Please finish the go before claiming winnings");
            case "finished":
                throw new Error("Winnings already Collected");
            case "bust":
                this.status = "finished";
                return 0;
            case "surrendered":
                this.status = "finished";
                return this.bet / 2;
            case "stuck":
                this.status = "finished";
                if (dealerValue > this.valueLimit)
                {
                    return this.bet * 2;
                }
                else if(isDealerBlackjack)
                {
                    return 0;
                }
                else
                {
                    const valueOverDealer = this.getBestHandValue() - dealerValue;
                    if (valueOverDealer > 0)
                    {
                        return this.bet * 2;
                    }
                    else if(valueOverDealer < 0)
                    {
                        return 0;
                    }
                    else
                    {
                        return this.bet;
                    }
                }
            case "blackjack":
                this.status = "finished";
                if (isDealerBlackjack)
                {
                    return this.bet;
                }
                else
                {
                    return this.bet * 5 / 2;
                }
        }
    }
    /**
     * Draws a card from deck if in play and may go bust from it
     * @param deck - deck to draw card from
     */
    hit(deck: Deck)
    {
        if (this.status === "inPlay")
        {
            this.drawCard(deck);
        }
        else
        {
            throw new Error("Not in Play")
        }
    }

    /**
     * Sticks so that winnings can be calculated and no more cards can be drawn
     */
    stick()
    {
        if (this.status === "inPlay")
        {
            this.status = "stuck";
        }
        else if (this.status !== "blackjack")
        {
            throw new Error("Not in Play")
        }
    }

    /**
     * draw a card and then stick with up to double the original bet
     * @param deck - deck to draw card from
     * @param bet - optional bet if want to less than double bet
     * @returns the extra amount betted if allowed to bet it otherwise throws error
     */
    double(deck: Deck, bet?: number){
        if (this.status === "inPlay")
        {
            const extraBet : number = Math.min(bet||this.bet, this.bet);
            this.bet += extraBet;
            this.hit(deck);
            try
            {
                this.stick();
            }
            catch(e: unknown)
            {
                if ((!(e instanceof Error))||(e.message !== "Not in Play"))
                {
                    throw e;
                }
            }
            return extraBet;
        }
        else
        {
            throw new Error("Not in Play")
        }
    }

    /**
     * forfeits hand to get half the original bet back
     */
    surrender()
    {
        if (this.status === "inPlay")
        {
            this.status = "surrendered";
        }
        else
        {
            throw new Error("Not in Play")
        }
    }

    /**
     * 
     * @param deck - deck to draw from if the action needs it
     * @returns list of available states to the player and the functions they need to call to execute them
     */
    availableStates(deck : Deck)
    {
        let availableStates : AvailableStates[]; 
        switch(this.status)
        {
            case "notBetted":
                availableStates = [
                    {
                        name: "Place Bet",
                        functionBetting: (bet: number) => {return this.placeBet(bet);},
                        value: "betting"
                    },
                    {
                        name: "Abstain From Betting",
                        functionWinnings: () => {return this.getWinnings(21, true);},
                        value: "winnings"
                    }
                ]
                break;
            case "inPlay":
                availableStates = [
                    {
                        name: "Hit",
                        functionPlaying: () => {return this.hit(deck);},
                        value: "playing"
                    },
                    {
                        name: "Stick",
                        functionPlaying: () => {return this.stick();},
                        value: "playing"
                    },
                    {
                        name: "Surrender",
                        functionPlaying: () => {return this.surrender();},
                        value: "playing"
                    },
                    {
                        name: "Double",
                        functionBetting: (bet: number) => {return this.double(deck, bet);},
                        value: "betting"
                    }
                ]
                break;
            case "finished":
                availableStates = [
                    {
                        name: "Create New Hand",
                        functionFinished: () => {return new Hand(deck, this.valueLimit);},
                        value: "finished"
                    }
                ]
                break;
            default:
                //i.e. "blackjack" || "bust" || "stuck" || "surrendered":
                availableStates = [
                    {
                        name: "Collect Winnings / Reset Hand",
                        functionWinnings: (dealerValue: number, isDealerBlackjack: boolean) => {return this.getWinnings(dealerValue, isDealerBlackjack)},
                        value: "winnings"
                    }
                ]
                break;
        }
        return availableStates;
    }
}
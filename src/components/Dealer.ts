import {Hand} from './Hand';
import {Deck} from './Deck';
export class Dealer{
    hand: Hand;
    valueStop: number;
    valueLimit: number;
    /**
     * Dealer is a wrapper from the dealer hand and it's simple behavior
     * @param deck - the deck the dealer draws from for the hand
     * @param valueLimit - the value at which we go bust
     * @param valueStop - the value in which the dealer will stick rather than hit, if the dealer reaches the value with a soft (i.e. has a minimum less than the value) they will continue hitting
     */
    constructor(deck: Deck, valueLimit: number, valueStop:number)
    {
        this.hand = new Hand(deck, valueLimit);
        this.valueStop = valueStop;
        this.valueLimit = valueLimit;
    }

    /**
     * Gives Dealer a new Hand
     * @param deck - deck to draw new hand from
     * 
     */
    resetHand(deck: Deck)
    {
        this.hand = new Hand(deck, this.valueLimit);
        this.hand.placeBet(0);
    }

    /**
     * After player plays the dealer draw their cards until bust or over their valueStop
     * @param deck - deck dealer draws new cards from
     */
    resolveHand(deck : Deck)
    {
        while(this.hand.status === "inPlay")
        {
            if (this.hand.getBestHandValue() < this.valueStop)
            {
                this.hand.hit(deck);
            }
            else if ((this.hand.getBestHandValue() === this.valueStop)&&(this.hand.getHandMinValue() < this.valueStop))
            {
                this.hand.hit(deck);
            }
            else
            {
                this.hand.stick();
            }
        }
    }
}
import {Suit} from './CardPip';

/** 
 * counts the amount of datatype T that makes up the main data structure for the deck.
 * 
 * @param count - the amount of this type of suit/denomination in the deck
 * @param data - the actual data being referred to by the count
 * @param value - the base value of the cards being referred to (for number cards this is the same as denomination)
 * @param optionalTen - for Aces the player has the option to choose 1 or 11 and so thew optionalTen says to check both when evaluating value
 * 
 * @remarks
 * This is essentially a look up table so we can iterate through all of the cards using their denomination (and later suit)
 * rather than going through every instance of a card for every deck 
 */
type countData<T> = {
    count: number;
    data: T;
    value: number;
    optionalTen: boolean;
};

/**
 * Stores all the logical data for the card
 * 
 * @param suit - The suit of the card
 * @param denomination - the id of the denomination of the card which maps to name of face cards in denomination map
 * @param value - lowest (usually only) value a card can have (for number cards this equals denomination)
 * @param optionalTen - for Aces the player has the option to choose 1 or 11 and so thew optionalTen says to check both when evaluating value
 */
export type CardData = {
    suit: Suit;
    denomination: number;
    value: number;
    optionalTen: boolean;
  }

export class Deck {
    // Deck is stored in groups of denominations storing all of the different suits and their number of occurrences in the deck
    deck : Map<number, countData<Map<Suit, number>>>;
    resetWhenRemaining : number;
    suits: Suit[];
    denominations: number[];
    numberOfPacks : number;
    cardsRemaining: number;
    /**
     * Creates Deck, most notably the lookup table with all the counts of cards to make large multi-pack searching more efficient
     * 
     * @param suits - The list of the suits that are in the deck, defaults to the standard hearts, clubs, diamonds and spades
     * @param denominations - The list of the denomination ids that are in the deck, defaults to 1 to 13, the standard deck of cards
     * @param numberOfPacks - the number of packets 'shuffled' together, defaults to 1
     * @param resetWhenRemaining  - when this many cards are remaining the deck is reset , essentially reshuffling it
     */
    constructor(suits?: Suit[], denominations?: number[], numberOfPacks? : number, resetWhenRemaining?: number)
    {
        this.suits = suits||["hearts", "diamonds", "clubs", "spades"];
        this.denominations = denominations||[1,2,3,4,5,6,7,8,9,10,11,12,13];
        this.numberOfPacks = numberOfPacks||1;
        this.resetWhenRemaining = resetWhenRemaining||0;

        this.deck = this.getNewDeck(this.suits, this.denominations, this.numberOfPacks);
        this.cardsRemaining = this.suits.length * this.denominations.length * this.numberOfPacks;
    }

    /**
     * Translates denomination to the minimum value that will be stored as value in the deck
     * @param denomination - The denomination id wanting value of
     * @returns value of that denomination in standard blackjack
     */
    getDenominationValue(denomination: number)
    {
        return Math.min(denomination, 10);
    }

     /**
     * Translates denomination to whether there is an optional 10, 
     * @param denomination - The denomination id wanting to know if it has the optional10 property (i.e. is an Ace)
     * @returns if the card is an Ace
     */
    getDenominationOptionalTen(denomination: number)
    {
        return (denomination===1)
    }

    /**
     * Creates a new Deck based on the parameters which is a the look up table when drawing cards or evaluating what values the deck has
     * @param suits - list of suits in the new deck
     * @param denominations - list of denominations for new deck
     * @param numberOfPacks - amount of packs used in the new deck
     * 
     * @returns Mapping from denominations to their count and mapping of suits to their count within the specific denomination
     */
    getNewDeck(suits: Suit[], denominations: number[], numberOfPacks : number)
    {
        let deck : Map<number, countData<Map<Suit, number>>> = new Map
        (
            denominations.map
            (
                (denomination : number) => 
                {
                    return(
                        [denomination,
                            {
                                count: suits.length * numberOfPacks,
                                value: this.getDenominationValue(denomination),
                                data: new Map (suits.map((suit: Suit) => {return([suit, numberOfPacks])})),
                                optionalTen: this.getDenominationOptionalTen(denomination)
                            }
                        ]
                    )
                }
            )
        )
        return (deck);
    }

    /**
     * Sets internal deck and new remaining count to current deck reset or optionally a new deck can be
     * @param suits - suits in new deck, defaults to suits in old deck
     * @param denominations - denominations in new deck, defaults to denominations in old deck
     * @param numberOfPacks - number of packs in new deck, defaults to number of cards in old deck
     */
    resetDeck(suits?: Suit[], denominations?: number[], numberOfPacks?: number)
    {
        this.suits = suits||this.suits;
        this.denominations = denominations||this.denominations;
        this.numberOfPacks = numberOfPacks||this.numberOfPacks;
        this.deck = this.getNewDeck(this.suits, this.denominations, this.numberOfPacks);
        this.cardsRemaining = this.suits.length * this.denominations.length * this.numberOfPacks;
    }

    /**
     * 
     * @returns number ofd cards remaining in deck
     */
    getCardsRemaining()
    {
        return this.cardsRemaining;
    }

    /** Draws specified card from the deck
     * 
     * @param suit - Suit of card to remove one instance of from deck
     * @param denomination - Denomination of card to remove one instance of from deck
     * @returns that specified card from deck if exists, otherwise it sends an error
     */
    drawSpecificCard(suit : Suit, denomination : number)
    {
        let denominationEntry : (countData<Map<Suit, number>>|undefined) = this.deck.get(denomination);
        if (!denominationEntry)
        {
            throw new Error("Denomination " + denomination + " not in deck")
        }
        let suitEntry : number|undefined = denominationEntry.data.get(suit);
        if (suitEntry === undefined)
        {
            throw new Error("Suit " + suit + " is not in Deck");
        }
        else if(suitEntry === 0)
        {
            throw new Error("Card " + denomination + " of " + suit + " is not in Deck");
        }
        else
        {
            const card : CardData = {
                suit: suit,
                denomination: denomination,
                value: denominationEntry.value,
                optionalTen: denominationEntry.optionalTen
            }
            denominationEntry.count = denominationEntry.count - 1;
            denominationEntry.data.set(suit, suitEntry - 1);
            this.cardsRemaining = this.cardsRemaining - 1;
            this.deck.set(denomination, denominationEntry);
            return card
        }
    }

    /**
     * 
     * @returns A random card from the deck, also removing one of it's entries
     */
    drawCard()
    {
        if (this.resetWhenRemaining >= this.getCardsRemaining()) {this.resetDeck()}
        let randomPos : number = Math.floor(Math.random() * this.getCardsRemaining());
        for (let denominationEntry of Array.from(this.deck.entries())) {
            if (denominationEntry[1].count > randomPos)
            {
                for (let suitEntry of Array.from(denominationEntry[1].data.entries()))
                {
                    if (suitEntry[1] > randomPos)
                    {
                        const card : CardData = {
                            suit: suitEntry[0],
                            denomination: denominationEntry[0],
                            value: denominationEntry[1].value,
                            optionalTen: denominationEntry[1].optionalTen
                        }
                        denominationEntry[1].count = denominationEntry[1].count - 1;
                        denominationEntry[1].data.set(suitEntry[0], suitEntry[1] - 1);
                        this.cardsRemaining = this.cardsRemaining - 1;
                        this.deck.set(denominationEntry[0], denominationEntry[1]);
                        return card
                    }
                    else
                    {
                        randomPos -= suitEntry[1];
                    }
                }
                throw new Error("Empty Section in Denomination: position left " + randomPos + " in denomination " + denominationEntry[0])
            }
            else
            {
                randomPos -= denominationEntry[1].count;
            }
        }
        throw new Error("Empty Deck: position left " + randomPos)
    }

    /**
     * 
     * @param valueToWeightMap - Map between the value of the card and the weighting you want to give it in the sum, defaults to the cards value if none is given and 0 if not in that map but map is given
     * @param isHighest - Determines whether Ace has been mapped from 1 or 11 (in general whether to take into account isOptional10)
     * @returns weighted sum of all cards in the deck according to weighting map
     */
    getWeightedSum(valueToWeightMap? : Map<number, number>, isHighest?: boolean)
    {
        let weightedSum: number = 0;
        this.deck.forEach(
            (denominationEntry: countData<Map<Suit, number>>) =>
            {
                let value: number = (valueToWeightMap) ? valueToWeightMap.get(denominationEntry.value)||0 : denominationEntry.value
                if (isHighest && valueToWeightMap && denominationEntry.optionalTen)
                {
                    value = valueToWeightMap.get(denominationEntry.value + 10)||0;
                }
                weightedSum += value * denominationEntry.count; 
            }
        )
        return weightedSum;
    }

    /**
     * 
     * @returns expected value of the next card drawn from the deck
     */
    getExpectation()
    {
        return this.getWeightedSum() / this.getCardsRemaining();
    }

    /**
     * @remarks
     * traditionally high low is based on the cards seen so the weightings are reversed because it is 0 total sum on a fresh and empty deck and taking away a card from the deck is like adding the negative to the count
     * 
     * @returns the count value from the hi low counting scheme
     */
    getHiLowCount()
    {
        return this.getWeightedSum(
            new Map<number, number>(
                Array.from(this.deck.keys()).map(
                    (i: number) => {
                        return (
                            [i, (i <= 1) ? 1 :
                                (
                                    (i<= 6) ? -1 :
                                    (
                                        (i<=9) ? 0 : 1
                                    )
                                )
                            ]
                        )
                    }
                )
            )
        )
    }

    /**
     * 
     * @param value - the value the probability event seeks to get less than or equal to
     * @returns the probability that the next card is less than or equal to the given value
     */
    getProbabilityOfGettingLessThanOrEqualTo(value: number){
        return (
            this.getWeightedSum(
                new Map<number, number>(
                    Array.from(this.deck.keys()).map(
                        (i: number) => {
                            return (
                                [i, (i <= value) ? 1 : 0]
                            )
                        }
                    )
                )
            ) / this.getCardsRemaining()
        );
    }
}
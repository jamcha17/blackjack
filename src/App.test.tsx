import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import {Deck, CardData} from './components/Deck';
import {Suit} from './components/CardPip';
import { Hand } from './components/Hand';

/*test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});*/

describe('Deck', () => {
  describe('When drawing a random card', () => {
    it("Reduces the card count by 1, reshuffling at 0", () => {
      let deck : Deck = new Deck();
      expect(deck.getCardsRemaining()).toEqual(52);
      deck.drawCard();
      expect(deck.getCardsRemaining()).toEqual(51);
      for (let i: number=50; i>=0; i--)
      {
        deck.drawCard();
        expect(deck.getCardsRemaining()).toEqual(i);
      }
      deck.drawCard();
      expect(deck.getCardsRemaining()).toEqual(51);
    })
    it("Doesn't allow itself to be removed from the deck twice", ()=>{
      let deck : Deck = new Deck();
      const card : CardData = deck.drawCard();
      expect(deck.deck.get(card.denomination)?.count).toEqual(3);
      expect(deck.deck.get(card.denomination)?.data.get(card.suit)).toEqual(0);
      expect(() => deck.drawSpecificCard(card.suit, card.denomination)).toThrow(new Error("Card " + card.denomination + " of " + card.suit + " is not in Deck"));
    })
  })
  describe('When asked to draw a specific card', () => {
    it.each(
      [
        [5, "clubs", 5, false],
        [6, "hearts", 6, false],
        [1, "clubs", 1, true],
        [1, "diamonds", 1, true],
        [12, "diamonds", 10, false],
        [13, "spades", 10, false],
        [8, "clubs", 8, false],
        [9, "clubs", 9, false],
        [10, "clubs", 10, false],
        [11, "clubs", 10, false],
        [12, "clubs", 10, false]
      ])(
      'should return card for %i of %s exactly once', (denomination: number, suit: string,  value : number, optionalTen: boolean) => {
      let deck : Deck = new Deck();
      expect(deck.getCardsRemaining()).toEqual(52);
      let card: CardData = deck.drawSpecificCard(suit as Suit, denomination);
      expect(deck.getCardsRemaining()).toEqual(51);
      expect(card.suit).toEqual(suit);
      expect(card.denomination).toEqual(denomination);
      expect(card.value).toEqual(value);
      expect(card.optionalTen).toEqual(optionalTen);
      expect(() => deck.drawSpecificCard(suit as Suit, denomination)).toThrow(new Error("Card " + denomination + " of " + suit + " is not in Deck"));
    })
  })
  describe("Calculating Weighted Sums", () => {
    it("Starting Expectation", () => {
      let deck : Deck = new Deck();
      expect(deck.getExpectation()).toEqual((1+2+3+4+5+6+7+8+9+(10*4))/13);
    })
    it("Starting Hi Low Count should be 0", () => {
      let deck : Deck = new Deck();
      expect(deck.getHiLowCount()).toEqual(0);
    })
    it("Hi Low should count cards based on values", () => {
      let deck : Deck = new Deck();
      deck.drawSpecificCard("hearts", 2);
      expect(deck.getHiLowCount()).toEqual(1);
      deck.drawSpecificCard("clubs", 3);
      expect(deck.getHiLowCount()).toEqual(2);
      deck.drawSpecificCard("clubs", 1);
      expect(deck.getHiLowCount()).toEqual(1);
      deck.drawSpecificCard("hearts", 9);
      expect(deck.getHiLowCount()).toEqual(1);
      deck.drawSpecificCard("clubs", 10);
      expect(deck.getHiLowCount()).toEqual(0);
      deck.drawSpecificCard("clubs", 11);
      expect(deck.getHiLowCount()).toEqual(-1);
      deck.drawSpecificCard("diamonds", 8);
      expect(deck.getHiLowCount()).toEqual(-1);
      deck.drawSpecificCard("diamonds", 13);
      expect(deck.getHiLowCount()).toEqual(-2);
      deck.drawSpecificCard("spades", 13);
      expect(deck.getHiLowCount()).toEqual(-3);
    })
    it.each([
      [1, 1/13],
      [2, 2/13],
      [5, 5/13],
      [9, 9/13],
      [10, 1]
    ])("Starting Probability card is <= %p", (value : number, probability : number) => {
      let deck : Deck = new Deck();
      expect(deck.getProbabilityOfGettingLessThanOrEqualTo(value)).toEqual(probability);
      deck.drawSpecificCard("clubs", 1);
      expect(deck.getProbabilityOfGettingLessThanOrEqualTo(value)).toEqual((probability*52 - 1)/51);
      deck.drawSpecificCard("hearts", 1);
      expect(deck.getProbabilityOfGettingLessThanOrEqualTo(value)).toEqual((probability*52 - 2)/50);
    })
    it("Weighted sum with all 1s should equal cards remaining", () => {
      let deck : Deck = new Deck();
      const oneMap: Map<number, number> = new Map(
        [[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1]]
      );
      expect(deck.getWeightedSum(oneMap)).toEqual(deck.getCardsRemaining());
      for(let i : number = 0; i<13; i++)
      {
        deck.drawCard();
        expect(deck.getWeightedSum(oneMap)).toEqual(deck.getCardsRemaining());
      }
    })
  })
})

describe("Hand", () =>{
  describe("When my score is evaluated", () => {
    it("Given I have a king and an ace Then my score is 21", () => {
      let deck : Deck = new Deck();
      let hand : Hand = new Hand(deck, 21, "hearts", 13, "spades", 1);
      hand.placeBet(1);
      expect(hand.getBestHandValue()).toEqual(21);
      expect(hand.status).toEqual("blackjack");
    })
    it("Given I have a king, a queen, and an ace, Then my score is 21", () => {
      let deck : Deck = new Deck();
      let hand : Hand = new Hand(deck, 21, "hearts", 13, "clubs", 12);
      hand.placeBet(1);
      hand.drawCard(deck, "spades", 1);
      expect(hand.getBestHandValue()).toEqual(21);
      expect(hand.status).toEqual("inPlay");
    })
    it("Given that I have a nine, an ace, and another ace, Then my score is 21", () => {
      let deck : Deck = new Deck();
      let hand : Hand = new Hand(deck, 21, "diamonds", 9, "clubs", 1);
      hand.placeBet(1);
      hand.drawCard(deck, "spades", 1);
      expect(hand.getBestHandValue()).toEqual(21);
      expect(hand.status).toEqual("inPlay");
    })
    it("Given that I have a 4 aces, Then my score is 14", () => {
      let deck : Deck = new Deck();
      let hand : Hand = new Hand(deck, 21, "diamonds", 1, "clubs", 1);
      hand.drawCard(deck, "spades", 1);
      hand.drawCard(deck, "hearts", 1);
      expect(hand.getBestHandValue()).toEqual(14);
    })
  })
  describe("Given my score is updated", () => {
    it.each(
      [
        [9,8,7],
        [7,5,12],
        [12, 13, 2],
        [9, 11, 3]
    ]
    )
    ("When it is 22 or more i.e. for (%p, %p, %p), Then I am ‘bust’ and do not have a valid hand", (denomination1: number, denomination2: number, denomination3: number) => {
      let deck : Deck = new Deck();
      let hand : Hand = new Hand(deck, 21, "diamonds", denomination1, "clubs", denomination2);
      expect(hand.status).toEqual("notBetted");
      hand.placeBet(1);
      expect(hand.status).toEqual("inPlay");
      expect(hand.getBestHandValue()).toBeLessThanOrEqual(21);
      expect(hand.optionalTens).toEqual(0);
      hand.drawCard(deck, "spades", denomination3);
      expect(hand.status).toEqual("bust");
      expect(hand.optionalTens).toEqual(0);
      expect(hand.getBestHandValue()).toBeGreaterThan(21);
      expect(() => hand.hit(deck)).toThrow(new Error("Not in Play"))
    })
    it.each(
      [
        [9, 8, 1],
        [7, 4, 12],
        [7, 13, 2],
        [9, 4, 3]
    ]
    )
    ("When it is 21 or less i.e. for (%p, %p, %p), Then I have a valid hand", (denomination1: number, denomination2: number, denomination3: number) => {
      let deck : Deck = new Deck();
      let hand : Hand = new Hand(deck, 21, "diamonds", denomination1, "clubs", denomination2);
      expect(hand.status).toEqual("notBetted");
      hand.placeBet(1);
      expect(hand.status).toEqual("inPlay");
      expect(hand.getBestHandValue()).toBeLessThanOrEqual(21);
    })
  })
  describe("Given I play a game of blackjack, When I am dealt my opening hand", ()=> {
    it("Then I have two cards", ()=> {
      let deck : Deck = new Deck;
      let hand : Hand = new Hand(deck, 21);
      expect(hand.cards.length).toEqual(2);
      
    })
    it("If I have a value of 21, then I have blackjack and get winnings 3:2", () => {
      let deck : Deck = new Deck;
      let hand : Hand = new Hand(deck, 21, "clubs", 1, "spades", 10);
      expect(hand.cards.length).toEqual(2);
      expect(hand.getBestHandValue()).toEqual(21);
      expect(hand.status).toEqual("notBetted");
      hand.placeBet(10);
      expect(hand.status).toEqual("blackjack");
      expect(hand.getWinnings(21, false)).toEqual(25);
      expect(hand.status).toEqual("finished");
      expect(() => {hand.getWinnings(21, false);}).toThrow(new Error("Winnings already Collected"));
      expect(() => {hand.hit(deck);}).toThrow(new Error("Not in Play"));
    })
    it("If I have a value of 21 in more than 2 cards, then I do not have blackjack and get winnings 1:1", () => {
      let deck : Deck = new Deck;
      let hand : Hand = new Hand(deck, 21, "clubs", 5, "spades", 10);
      hand.placeBet(10);
      hand.drawCard(deck, "diamonds", 6);
      expect(hand.getBestHandValue()).toEqual(21);
      expect(hand.status).toEqual("inPlay");
      expect(() => {hand.getWinnings(20, false)}).toThrow(new Error("Please finish the go before claiming winnings"))
      hand.stick();
      expect(hand.getWinnings(20, false)).toEqual(20);
      expect(hand.status).toEqual("finished");
      expect(() => {hand.getWinnings(20, false);}).toThrow(new Error("Winnings already Collected"));
      expect(() => {hand.hit(deck);}).toThrow(new Error("Not in Play"));
    })
  })
  describe("Given I have a valid hand of cards", () => {
    describe("When I choose to ‘hit’", () => {
      it("Then I receive another card and my score is updated", () => {
        let deck : Deck = new Deck;
        let hand : Hand = new Hand(deck, 21);
        expect(hand.cards.length).toEqual(2);
        const curHandMinValue = hand.getHandMinValue()
        hand.placeBet(1);
        if(hand.getBestHandValue() == 21) 
        {
          expect(hand.status).toEqual("blackjack");
          expect(() => hand.hit(deck)).toThrow(new Error("Not in Play"));
          expect(hand.cards.length).toEqual(2);
        }
        else
        {
          hand.hit(deck);
          expect(hand.cards.length).toEqual(3);
          expect(hand.getHandMinValue()).toBeGreaterThan(curHandMinValue);
        }
      })
    })
    describe("When I choose to ‘stand’", () => {
      it("Then I receive no further cards And my score is evaluated", () => {
        let deck : Deck = new Deck;
        let hand : Hand = new Hand(deck, 21);
        expect(hand.cards.length).toEqual(2);
        const curBestHandValue = hand.getBestHandValue()
        hand.placeBet(1);
        expect(hand.getBestHandValue()).toBeLessThanOrEqual(21)
        hand.stick();
        expect(hand.cards.length).toEqual(2);
        expect(hand.getBestHandValue()).toEqual(curBestHandValue);
        if(hand.getBestHandValue() == 21) 
        {
          expect(hand.status).toEqual("blackjack");
        }
        else
        {
          expect(hand.status).toEqual("stuck");
        }
        
        expect(() => hand.hit(deck)).toThrow(new Error("Not in Play"));
        expect(hand.cards.length).toEqual(2);
      })
    })
    describe("When I choose to ‘surrender’", () => {
      it("Then I receive no further cards", () => {
        let deck : Deck = new Deck;
        let hand : Hand = new Hand(deck, 21);
        expect(hand.cards.length).toEqual(2);
        const curBestHandValue = hand.getBestHandValue()
        hand.placeBet(1);
        hand.surrender();
        expect(hand.cards.length).toEqual(2);
        expect(hand.getBestHandValue()).toEqual(curBestHandValue);
        expect(hand.status).toEqual("surrendered");
        expect(() => hand.hit(deck)).toThrow(new Error("Not in Play"));
        expect(hand.cards.length).toEqual(2);
      })
    })
    describe("When I choose to ‘double’", () => {
      it("Then I receive exactly 1 further card", () => {
        let deck : Deck = new Deck;
        let hand : Hand = new Hand(deck, 21);
        expect(hand.cards.length).toEqual(2);
        const curHandMinValue = hand.getHandMinValue()
        hand.placeBet(1);
        hand.double(deck);
        expect(hand.cards.length).toEqual(3);
        expect(hand.getHandMinValue()).toBeGreaterThan(curHandMinValue);
        if (hand.getBestHandValue() <= 21)
        {
          expect(hand.status).toEqual("stuck");
        }
        else
        {
          expect(hand.status).toEqual("bust");
        }
        expect(() => hand.hit(deck)).toThrow(new Error("Not in Play"));
        expect(hand.cards.length).toEqual(3);
      })
    })
  })
})
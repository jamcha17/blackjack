import {AvailableStates} from './Hand';
import React, {useState} from 'react';
import Card from './Card';
import {Deck} from './Deck';
import {Player} from './Player';
import {Dealer} from './Dealer';

/**
 * Handles the click on one of the hand states
 * @param availableStates - list of available states from hand
 * @param deck - deck to draw from for dealer
 * @param player - Player to force state onto, e.g. update balance or hand
 * @param dealer - the dealer to evaluate against or to play / reset their hand
 * @param setLastWinnings - a state to update the last winnings value on the screen
 */
function handleStateClick(availableStates : AvailableStates, deck: Deck, player : Player, dealer : Dealer, setLastWinnings: React.Dispatch<React.SetStateAction<number>>)
{
    /*
    functionFinished?: () => Hand;
    functionWinnings?: (dealerValue: number, isDealerBlackjack: boolean) => number;
    functionPlaying?: () => void;
    functionBetting?: (bet: number) => void;
    */

    switch(availableStates.value)
    {
        case "finished":
            player.hand = availableStates.functionFinished!();
            dealer.resetHand(deck);
            setLastWinnings(0);
            break;
        case "winnings":
            dealer.resolveHand(deck);
            const winnings = Math.max(availableStates.functionWinnings!(dealer.hand.getBestHandValue(), (dealer.hand.status === "blackjack")), 0);
            player.balance += winnings;
            setLastWinnings(winnings);
            break;
        case "playing":
            availableStates.functionPlaying!();
            setLastWinnings(0)
            break;
        case "betting":
            player.balance -= availableStates.functionBetting!(player.currentBet);
            setLastWinnings(- player.currentBet);
            break;
    }
}

type Props = {
    deck: Deck;
    player : Player;
    dealer: Dealer;
}

/** 
 * Creates HTML to display hand
 * @param Props.deck - deck to get cards from
 * @param Props.player - player to store hand and balance in
 * @param Props.dealer - dealer to store dealer's hand / behavior in
 */
function HandDisplay({deck, player, dealer} : Props) {
    const [playerHand, setPlayerHand] = useState(player.hand);
    const [dealerHand, setDealerHand] = useState(dealer.hand);
    const [handActions, setHandActions] = useState(player.hand.availableStates(deck))
    const [lastWinnings, setLastWinnings] = useState(0);
    return (
      <div className="HandGrid"> 
        <div className="Hand">
            <b>Dealer Hand: </b>
            {dealerHand.getBestHandValue()}
            <div className="DealerHand">
                <div className="CardGrid">
                    {
                    dealerHand.cards.map
                    (
                        (element, index) => 
                        {
                        return(
                            <span className="CardWrapper" draggable={true} key={index}>
                            <Card suit={element.suit} denomination={element.denomination} />
                            </span>
                        )
                        }
                    )
                    }
                </div>
            </div>
            
            <div className="HandActions">
                {
                    handActions.map
                    (
                        (element : AvailableStates, index: number) =>
                        {
                            return(
                                <button 
                                    name={element.name}
                                    onClick={
                                        () => {
                                            handleStateClick(element, deck, player, dealer, setLastWinnings);
                                            setPlayerHand(player.hand);
                                            setDealerHand(dealer.hand); 
                                            setHandActions(player.hand.availableStates(deck));
                                        }
                                    } 
                                    key={index}>
                                        {element.name}
                                </button>
                            )
                        }
                    )
                }
            </div>
            <div className="PlayerHand">
                <p>
                    Player Balance : {player.balance} <b className="Winnings" data-positiveness={(lastWinnings > 0) ? true : false}>{(lastWinnings === 0) ? "" : (lastWinnings > 0) ? "(+" + lastWinnings + ")" : "(" + lastWinnings + ")"}</b>
                </p>
                <p>
                    <b>Player Hand: </b>
                    {playerHand.getBestHandValue()}
                </p>
                 <div className="CardGrid">
                    {
                    playerHand.cards.map
                    (
                        (element, index) => 
                        {
                        return(
                            <span className="CardWrapper" draggable={true} key={index}>
                            <Card suit={element.suit} denomination={element.denomination} />
                            </span>
                        )
                        }
                    )
                    }
                </div>
                <p className="DeckInfo">
                    Deck has <i>{deck.getCardsRemaining()}</i> cards remaining with card count <i>{deck.getHiLowCount()}</i>
                </p>
                <p>
                    Expected value of drawing a card: <i>{Math.round(deck.getExpectation() * 10000) / 10000}</i>
                </p>
                <p>
                    Probability of bust on drawing card: <i>{
                        1 - Math.round(
                            deck.getProbabilityOfGettingLessThanOrEqualTo(playerHand.valueLimit - playerHand.getHandMinValue()) 
                            * 10000) / 10000
                    }</i>
                </p>
            </div>
        </div>
      </div>
    );
  }
  export default HandDisplay;
  
import React from 'react';
import { Dealer } from './components/Dealer';
import {Deck} from './components/Deck';
import HandDisplay from './components/HandDisplay';
import { Player } from './components/Player';

let standardDeck: Deck = new Deck(["spades", "clubs", "diamonds", "hearts"], [1,2,3,4,5,6,7,8,9,10,11,12,13], 10, 1);
let player : Player = new Player(standardDeck, 1000, 21, 5);
let dealer : Dealer = new Dealer(standardDeck, 21, 17);

/**
 * Create Application by handing over display to HandDisplay
 */
function App() {
  return (
    <div className="App">
      <HandDisplay deck={standardDeck} player={player} dealer={dealer}/>
    </div>
  );
}

export default App;

import React from 'react';
import './styles.css';

/**
 * Suit is a type union of the possible suits of a standard deck of cards
 */
export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

/**
 * suitCharCode maps the suit to the corresponding unicode character number
 */
const suitCharCode: Map<Suit, number> = new Map([["hearts", 9829], ["diamonds", 9830], ["clubs", 9827], ["spades", 9824]])

/**
 * These suits will be assigned color of red, the remaining suits will be assigned black
 */
const redSuits: Suit[] = ["hearts", "diamonds"]

/**
 * A type union of possible pip types
 * Outer: The top and bottom number suits on the card
 * Inner: The middle part of a number card, corresponding to just the suit
 * Face: The middle part of a face card, corresponding to the unicode for the denomination
 */
type PipPosition = "Outer" | "Inner" | "Face";
type Props = {
    suit: Suit;
    text?: string;
    reversed?: boolean;
    centerUnicodeChar?: number;
    invisible?: boolean;
}

/**
 * Format a pip on a card with the given properties
 * 
 * @param Props.suit - The suit of the pip, giving it's color (and unicode character used if not a face card)
 * @param Props.text - Gives the text for the Outer pips above the suit, typically the number or first letter of face card
 * @param Props.reversed - Gives whether the pip (and text) is upside down, typically in the lower half of the card
 * @param Props.centerUnicodeChar - Gives the unicode character corresponding to the denomination of a face card
 * @param Props.invisible - Determine whether to display the pip to the screen, used for spacing of the middle of number cards
 * 
 * @returns The HTML corresponding to displaying that pip
 */
const CardPip = ({suit, text, reversed, centerUnicodeChar, invisible} : Props) => {
    const charCode: number = (centerUnicodeChar && (centerUnicodeChar>0)) ? centerUnicodeChar : suitCharCode.get(suit)!;
    const pipPosition: PipPosition = (text) ? "Outer" : ((centerUnicodeChar) ? "Face" : "Inner"); 
    return (
        <h2 className="Pip"
            data-position={pipPosition}
            data-color={redSuits.includes(suit) ? "red" : "black"}
            data-upside-down={reversed}
            data-hidden={invisible} >
                {text}{text?<br className="TextBreak"/>:null}{String.fromCharCode(charCode)}
        </h2>
        )
};

export default CardPip;
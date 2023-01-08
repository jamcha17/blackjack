import React from 'react';
import './styles.css';
import CardPip, {Suit} from './CardPip';

/**
 * @param name - The full name of the Face card, of which the first letter will be displayed
 * @param centerUnicodeChar - The unicode character at the center of the face card
 * 
 */
type FaceCard = {
    name: string;
    centerUnicodeChar: number;
}

/**
 * Map between denomination id and the data needed to display Face card
 * @remarks
 * centerUnicodeChar -1 displays the suit unicode character instead of the specified one
 */
export const denominationMap: Map<number, FaceCard> = new Map([
    [1, {name: "Ace", centerUnicodeChar: -1}],
    [11, {name: "Jack", centerUnicodeChar: 9822}],
    [12, {name: "Queen", centerUnicodeChar: 9819}],
    [13, {name: "King", centerUnicodeChar: 9818}]
]);

/**
 * Stores list of Where the pips go on the card,
 * @remarks
 * one of the arrays has to be 5 long and the other <= 5 to maintain consistent card height and pip height
 * 
 * @param edge - stores the whether pip should be invisible on both edges of the inner bit of a number card
 * @param center - stores whether a pip should be invisible on the center of the inner bit of a number card
 **/
type PipPlacements = {
    edge: boolean[];
    center: boolean[];
};

/**
 * Mapping between denominations of number cards and where their pips go on the card
 */
const allPipPlacementMap: Map<number, PipPlacements> = new Map([
    [2, {center: [true, false, false, false, true], edge: []}],
    [3, {center: [true, false, true, false, true], edge: []}],
    [4, {center: [], edge: [true, false, false, false, true]}],
    [5, {center: [false, false, true, false, false], edge: [true, false, false, false, true]}],
    [6, {center: [], edge: [true, false, true, false, true]}],
    [7, {center: [false, true, false, false, false], edge: [true, false, true, false, true]}],
    [8, {center: [false, false, false, false, false], edge: [true, true, true, true]}],
    [9, {center: [false, true, false, false, false], edge: [true, true, true, true]}],
    [10, {center: [false, true, false, true, false], edge: [true, true, true, true]}]
]);

/**
 * Handles drawing a column of the card by calling the CardPip
 * 
 * @param listOfPositions - Whether the position should be invisible or not (not amount determines how centered it is usually 4 for even and 5 for odd)
 * @param suit - The suit of all the pips in this column
 * 
 * @returns The HTML for a column of a number card
 */
const getPipsElement = (listOfPositions : boolean[], suit : Suit) => {
    
    return (
        <span className="PipColumn">
        {
            listOfPositions.map
            (
                (element, index) =>
                {
                    return (
                        <CardPip suit={suit} reversed={index >= listOfPositions.length/2} invisible={!element} key={index}/>
                    )
                }
            )
        }
        </span>
    )
}

type Props = {
    denomination: number;
    suit: Suit;
}
/**
 * Takes a denomination and suit and creates the HTML for the card object
 * 
 * @remarks
 * Card is made up of the top name, the middle which is either 3 columns for number card or a big unicode character for a face card followed by the bottom number text
 * 
 * @param Props.denomination - denomination of card, using denomination map and pip placements can determine whether it is a number or face card and how we display in HTML
 * @param Props.suit - suit of card, determines color and object used in CarPip
 * 
 * @returns Card HTML object that has the suit denomination and layout as specified by maps for face cards and number cards and parameters
 */
const Card = ({denomination, suit} : Props) => {
    const cardText : string = denominationMap.has(denomination) ? denominationMap.get(denomination)!.name[0] : denomination.toString()
    const pipPlacements : PipPlacements = allPipPlacementMap.get(denomination) || {center: [false, false, true, false, false], edge: []};

    var middle : JSX.Element;
    if (denominationMap.has(denomination)){
        // this is here so that face cards get the same height as number cards
        const edge: JSX.Element = getPipsElement([false, false, false, false, false], suit)
        middle = 
            <span className="CardMiddle">
                <span className="LeftBorder" />
                <span className="LeftEdge">
                    {edge}
                </span>
                <span className="center">
                    <CardPip suit={suit} centerUnicodeChar={denominationMap.get(denomination)!.centerUnicodeChar} reversed={false} />
                </span>
                <span className="rightEdge">
                    {edge}
                </span>
                <span className="RightBorder" />
            </span>
    }
    else{
        const edge: JSX.Element = getPipsElement(pipPlacements.edge, suit)
        const center: JSX.Element = getPipsElement(pipPlacements.center, suit)
    
        middle = 
        <span className="CardMiddle">
            <span className="LeftBorder" />
            <span className="LeftEdge">
                {edge}
            </span>
            <span className="Center">
                {center}
            </span>
            <span className="RightEdge">
                {edge}
            </span>
            <span className="RightBorder" />
        </span>
    }
                
    return (
        <span className="Card">
                <CardPip suit={suit} text={cardText} reversed={false} />
                {middle}
                <CardPip suit={suit} text={cardText} reversed={true} />
        </span>

    )
};

export default Card;
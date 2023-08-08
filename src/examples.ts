import * as Deck from './deck'
import * as Card from './card'

export const decks = [
    {
        deck: {
            name: 'Science Quiz',
            termLang: 'English',
            defLang: 'French',
        },
        cards: [
            { term: 'Physics', def: 'Physique' },
            { term: 'Chemistry', def: 'Chimie' },
            { term: 'Biology', def: 'Biologie' },
        ],
    },
    {
        deck: {
            name: 'Animal Names',
            termLang: 'English',
            defLang: 'German',
        },
        cards: [
            { term: 'Dog', def: 'Hund' },
            { term: 'Cat', def: 'Katze' },
            { term: 'Bird', def: 'Vogel' },
            { term: 'Elephant', def: 'Elefant' },
        ],
    },
    {
        deck: {
            name: 'Mathematics Basics',
            termLang: 'English',
            defLang: 'Spanish',
        },
        cards: [
            { term: 'Addition', def: 'Suma' },
            { term: 'Subtraction', def: 'Resta' },
            { term: 'Multiplication', def: 'Multiplicación' },
            { term: 'Division', def: 'División' },
            { term: 'Geometry', def: 'Geometría' },
        ],
    },
    {
        deck: {
            name: 'Fruits and Colors',
            termLang: 'English',
            defLang: 'Italian',
        },
        cards: [
            { term: 'Apple', def: 'Mela' },
            { term: 'Banana', def: 'Banana' },
            { term: 'Orange', def: 'Arancia' },
            { term: 'Grapes', def: 'Uva' },
            { term: 'Red', def: 'Rosso' },
            { term: 'Yellow', def: 'Giallo' },
            { term: 'Orange (Color)', def: 'Arancione' },
        ],
    },
] as { deck: Deck.Data, cards: Card.Data[] }[]

export function randomDeck() {

    return decks[Math.floor(Math.random() * decks.length)]
}
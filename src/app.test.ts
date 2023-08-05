import { createElement } from 'react'
import App from './app'

import '@testing-library/jest-dom'

import { render, screen, fireEvent, waitFor }
    from '@testing-library/react'

import * as fakeIDB from 'fake-indexeddb'
Object.assign(global, fakeIDB)

import { open as openDB, NAME as DB_NAME } from "./database"

import * as Deck from "./deck"
import * as Card from "./card"

const testDecks = [
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
]



describe('Indexed DB', function () {

    test('database works more or less', async () => {

        const db = await openDB()

        const { deck, cards } = testDecks[0]

        const deckId = await Deck.add(deck, cards, db)

        expect(deckId).not.toBeNull()

        const retrieved = await Deck.get(deckId, db)

        expect(retrieved).toEqual({
            deck: { id: deckId, ...deck },
            cards: cards.map((card, i) => ({ id: i + 2, ...card, deckId: 2 }))
        })

        await Deck.remove(deckId, db)

        const removed = await Deck.get(deckId, db)

        expect(removed).toEqual({ deck: undefined, cards: [] })
    })
})


describe('Scanner', function () {

    test('clicking scanner button toggles the scanner', async () => {

        render(createElement(App))

        await waitFor(() => screen.getByTestId('scanner-button'))

        const scannerButton = screen.getByTestId('scanner-button')

        let scanner = screen.queryByTestId('scanner')
        expect(scanner).toBeNull()


        fireEvent.click(scannerButton)

        scanner = screen.queryByTestId('scanner')
        expect(scanner).not.toBeNull()
        expect(scanner).toBeVisible()


        fireEvent.click(scannerButton)

        scanner = screen.queryByTestId('scanner')
        expect(scanner).toBeNull()
    })

    test.todo('progress of scanning is visible')

    test.todo('scanning is successful')
})


describe('Pocket', function () {

    test('empty deck can be added manually', async () => {

        render(createElement(App))

        const db = await openDB()

        const length = (await Deck.getAllData(db)).length

        await waitFor(() => screen.getByTestId('added-decks'))

        const
            addBtn = screen.getByTestId('add-btn'),
            container = screen.getByTestId('added-decks')

        expect(container).toBeEmptyDOMElement()

        fireEvent.click(addBtn)

        await waitFor(() => expect(container).not.toBeEmptyDOMElement())
        expect(await Deck.getAllData(db)).toHaveLength(length + 1)
    })

    test('if there is any deck it is visible and clicking changes view', async () => {

        const db = await openDB()

        const { deck } = testDecks[1]

        await Deck.add(deck, [], db)


        render(createElement(App))

        const container = await waitFor(() => screen.getByTestId('decks'))
        const link = await waitFor(() => screen.findByText(deck.name))

        expect(container).toContainElement(link)

        fireEvent.click(link)

        const deckEditor = await waitFor(() => screen.findByTestId('deck-editor'))
        
        expect(deckEditor).toBeVisible()
    })
})


describe('Deck', function () {

    test.todo("deck's properties can be modified")
    test.todo("deck can be removed")

    test.todo('cards can be added manually')
    test.todo('if there are cards in selected deck they are all visible')
    test.todo('cards\' properties can be modified')
})
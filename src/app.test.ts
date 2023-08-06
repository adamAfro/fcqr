import { createElement } from 'react'
import App from './app'

import '@testing-library/jest-dom'

import { render, screen, fireEvent, waitFor }
    from '@testing-library/react'

import * as fakeIDB from 'fake-indexeddb'
Object.assign(global, fakeIDB)

import { open as openDB, Type as Database } from "./database"

import * as Deck from "./deck"
import * as Card from "./card"
import { act } from 'react-dom/test-utils'

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
] as { deck: Deck.Data, cards: Card.Data[] }[]

function randomTestDeck() {

    return testDecks[Math.floor(Math.random() * testDecks.length)]
}


describe('Indexed DB', function () {

    test('database works more or less', async () => {

        const db = await openDB()

        const lastCardID = (await Card.getLast(db))?.id || 0

        const { deck, cards } = randomTestDeck()
        const deckId = (await Deck.add(deck, cards, db)).deckId

        const retrieved = await Deck.get(deckId, db)

        expect(retrieved).toEqual({
            deck: { id: deckId, ...deck },
            cards: cards.map((card, i) => ({
                id: lastCardID + 1 + i, ...card,
                deckId
            }))
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


        await act(() => fireEvent.click(scannerButton))

        scanner = screen.queryByTestId('scanner')
        expect(scanner).not.toBeNull()
        expect(scanner).toBeVisible()


        await act(() => fireEvent.click(scannerButton))

        scanner = screen.queryByTestId('scanner')
        expect(scanner).toBeNull()
    })

    test.todo('progress of scanning is visible')

    test.todo('scanning is successful')
})


async function goToListedDeck(deck: Deck.Data, db: Database) {

    expect(screen.queryByTestId(`deck-${deck.id}`)).not.toBeInTheDocument()

    const nav = await waitFor(() => screen.getByTestId('decks'))
    const link = await waitFor(() => screen.findByText(deck.name))
    const linkHref = link.getAttribute('href') as string    
    const linkID = Number(linkHref.split('$').pop())

    expect(nav).toContainElement(link)

    await act(() => fireEvent.click(link))

    const container = await waitFor(() => screen.findByTestId(`deck-${deck.id}`))

    expect(container).toBeVisible()
}


describe('Pocket', function () {

    beforeEach(() => void (indexedDB = new IDBFactory()))

    test('empty deck can be added manually', async () => {

        const db = await openDB()
        const initLength = (await Deck.getAllData(db)).length

        render(createElement(App))

        await waitFor(() => screen.getByTestId('added-decks'))

        const
            addBtn = screen.getByTestId('add-btn'),
            container = screen.getByTestId('added-decks')

        expect(container).toBeEmptyDOMElement()

        await act(() => fireEvent.click(addBtn))

        await waitFor(() => expect(container).not.toBeEmptyDOMElement())
        expect(await Deck.getAllData(db)).toHaveLength(initLength + 1)
    })

    test('if there is any deck it is visible and clicking changes view', async () => {

        const db = await openDB()
        const { deck } = randomTestDeck()
        deck.id = (await Deck.add(deck, [], db)).deckId

        render(createElement(App))
        await goToListedDeck(deck, db)

        await act(() => history.back())
    })
})


describe('Deck', function () {

    beforeEach(() => void (indexedDB = new IDBFactory()))
    afterEach(() => void (history.back()))

    test("all deck's properties can be modified", async () => {
        
        const db = await openDB()
        const { deck } = randomTestDeck()
        deck.id = (await Deck.add(deck, [], db)).deckId

        render(createElement(App))
        await goToListedDeck(deck, db)

        const changes = {
            name: 'New Name',
            termLang: deck.termLang == 'Spanish' ? 'Polish' : 'Spanish',
            defLang: deck.defLang == 'Polish' ? 'Italian' : 'Polish',
        }

        const nameInput = screen.getByDisplayValue(deck.name)
        const langsSel = screen.getAllByDisplayValue(deck.termLang)
        const termLangSel = langsSel[0]
        const defLangSel = langsSel[1] || screen.getByDisplayValue(deck.defLang)

        let savedDeck: Deck.Data | null
        
        await act(() => fireEvent.input(nameInput, { target: { value: changes.name } }))
        savedDeck = await Deck.getData(deck.id, db)
        expect(savedDeck).toEqual({ ...deck, name: changes.name })
        
        
        await act(() => fireEvent.change(termLangSel, { target: { value: changes.termLang } }))
        savedDeck = await Deck.getData(deck.id, db)
        expect(savedDeck).toEqual({ ...deck, termLang: changes.termLang })


        await act(() => fireEvent.change(defLangSel, { target: { value: changes.defLang } }))
        savedDeck = await Deck.getData(deck.id, db)
        expect(savedDeck).toEqual({ ...deck, defLang: changes.defLang })
    })


    test("deck can be removed", async () => {

        const db = await openDB()
        const { deck } = randomTestDeck()
        deck.id = (await Deck.add(deck, [], db)).deckId

        render(createElement(App))
        await goToListedDeck(deck, db)

        const removalBtn = screen.getByTestId("deck-remove-btn")

        let retrived: Deck.Data | undefined

        retrived = await Deck.getData(deck.id, db)
        expect(retrived).not.toBeUndefined()
        
        await act(() => fireEvent.click(removalBtn))

        retrived = await Deck.getData(deck.id, db)
        expect(retrived).toBeUndefined()
    })

    test('cards can be added manually', async () => {

        const db = await openDB()
        const { deck } = randomTestDeck()
        deck.id = (await Deck.add(deck, [], db)).deckId

        render(createElement(App))
        await goToListedDeck(deck, db)

        const addBtn = screen.getByTestId('add-card-btn')
        const container = screen.getByTestId('added-cards')

        expect(container).toBeEmptyDOMElement()
        await act(() => fireEvent.click(addBtn))
        await waitFor(() => expect(container).not.toBeEmptyDOMElement())
    })
    
    test('if there are cards in selected deck they are all visible', async () => {

        const db = await openDB()
        let { deck, cards } = randomTestDeck()
        const ids = await Deck.add(deck, cards, db)
        deck.id = ids.deckId
        cards = cards.map((card, i) => ({ ...card, id: ids.cardsIds[i]}))

        render(createElement(App))
        await goToListedDeck(deck, db)

        const
            container = screen.getByTestId('cards'),
            addContainer = screen.getByTestId('added-cards')

        expect(addContainer).toBeEmptyDOMElement()
        expect(container).not.toBeEmptyDOMElement()
        for (const { id } of cards)
            expect (container).toContainElement(screen.getByTestId(`card-${id}`))
    })
    
    test.todo('cards\' properties can be modified')
})
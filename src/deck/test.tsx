import '@testing-library/jest-dom'
import { MemoryRouter as Router } from 'react-router-dom'
import { act } from 'react-dom/test-utils'
import { render, screen, fireEvent, waitFor }
    from '@testing-library/react'

import * as Card from "../card/database"
import Entry from "../deck"
import * as Deck from "../deck/database"
import { decks } from './examples'
import { langConfigs } from '../options/examples'
 
import { openDatabase, Provider as MemoryProvider, LANGUAGES_KEY } 
    from "../memory"
import * as fakeIDB from 'fake-indexeddb'
    Object.assign(global, fakeIDB)

const App = ({id}: {id:number}) => <MemoryProvider> 
    <Router basename={'/'}><Entry id={id}/></Router>
</MemoryProvider>

async function waitForFullLoad() {

    await waitFor(() => expect(screen.queryByTestId('database-unloaded')).toBeNull())
    await waitFor(() => expect(screen.queryByTestId('loading-deck')).toBeNull())
    await waitFor(() => expect(screen.queryByTestId('cards')).not.toBeNull())
}

beforeEach(() => localStorage.setItem(LANGUAGES_KEY, JSON.stringify(langConfigs)))

beforeEach(async function insertExampleDecks() {

    indexedDB = new IDBFactory()

    const db = await openDatabase()
    for (let i = 0; i < decks.length; i++) {

        const { data, cards } = decks[i]
        const { deckId, cardsIds} = await Deck.add(data, cards, db)

        decks[i].data.id = deckId
        decks[i].cards = cards.map((card, j) => ({...card, id: cardsIds[j]}))
    }

    await db.close()
})

describe("modifying deck's data", () => {

    test.each(decks)("deck's name", async ({data}) => {

        await act(() => render(<App id={data.id!}/>))
        await waitForFullLoad()
        
        const changes = { name: 'Deck with modified deck' }

        const nameInput = screen.getByTestId(`deck-${data.id}`)
            .querySelector('input')!
        
        expect(nameInput.value).not.toEqual(changes.name)
        await act(() => fireEvent.input(nameInput, { target: { value: changes.name } }))
        expect(nameInput.value).toEqual(changes.name)
        
        const db = await openDatabase()
        const savedDeck = await Deck.getData(data.id!, db)
        db.close()

        expect(savedDeck.name).toEqual(changes.name)
    })

    test.each(decks)("deck's term language", async ({data}) => {

        await act(() => render(<App id={data.id!}/>))
        await waitForFullLoad()

        const langsSel = [...screen
            .getByTestId(`deck-${data.id}`)
            .querySelectorAll('select')!
        ]

        await waitFor(() => {

            expect(langsSel[0].children.length)
                .toBeGreaterThanOrEqual(4)
        })

        const termLangSel = langsSel[0]
        const possibleLanguages = [...langsSel[0].querySelectorAll('option')]
            .map(x => x.value).filter(x => x)
        expect(possibleLanguages.length).toBeGreaterThan(0)

        const changes = {
            termLang: possibleLanguages
                .filter(x => x != termLangSel.value)[0]
        }

        expect(termLangSel.value).not.toEqual(changes.termLang)
        await act(() => fireEvent.change(termLangSel, { target: { value: changes.termLang } }))
        expect(termLangSel.value).toEqual(changes.termLang)
        
        const db = await openDatabase()
        const savedDeck = await Deck.getData(data.id!, db)
        db.close()

        expect(savedDeck.termLang).toEqual(changes.termLang)
    })

    test.each(decks)("deck's definition language", async ({data}) => {

        await act(() => render(<App id={data.id!}/>))
        await waitForFullLoad()

        const langsSel = [...screen
            .getByTestId(`deck-${data.id}`)
            .querySelectorAll('select')!
        ]

        await waitFor(() => {

            expect(langsSel[0].children.length)
                .toBeGreaterThanOrEqual(4)
        })

        const defLangSel = langsSel[1]
        const possibleLanguages = [...langsSel[1].querySelectorAll('option')]
            .map(x => x.value)
        expect(possibleLanguages.length).toBeGreaterThan(0)
        
        const changes = {
            defLang: possibleLanguages
                .filter(x => x != defLangSel.value)[0]
        }
        
        expect(defLangSel.value).not.toEqual(changes.defLang)
        await act(() => fireEvent.change(defLangSel, { target: { value: changes.defLang } }))
        expect(defLangSel.value).toEqual(changes.defLang)
        
        const db = await openDatabase()
        const savedDeck = await Deck.getData(data.id!, db)
        db.close()

        expect(savedDeck.defLang).toEqual(changes.defLang)
    })

    test.each(decks)("all at once", async ({data}) => {

        await act(() => render(<App id={data.id!}/>))
        await waitForFullLoad()

        const langsSel = [...screen
            .getByTestId(`deck-${data.id}`)
            .querySelectorAll('select')!
        ]

        await waitFor(() => {

            expect(langsSel[0].children.length)
                .toBeGreaterThanOrEqual(4)
        })

        const nameInput = screen.getByTestId(`deck-${data.id}`)
            .querySelector('input')!
        const termLangSel = langsSel[0]
        const defLangSel = langsSel[1] || screen.getByDisplayValue(data.defLang)
        const possibleTermLanguages = [...langsSel[0].querySelectorAll('option')]
            .map(x => x.value)
        const possibleDefLanguages = [...langsSel[1].querySelectorAll('option')]
            .map(x => x.value)
        
        const changes = {
            name: 'Modified deck',
            termLang: possibleTermLanguages.filter(x => x != termLangSel.value)[0],
            defLang: possibleDefLanguages.filter(x => x != defLangSel.value)[0],
        }

        expect(nameInput.value).not.toEqual(changes.name)
        expect(termLangSel.value).not.toEqual(changes.termLang)
        expect(defLangSel.value).not.toEqual(changes.defLang)
        
        await act(() => fireEvent.input(nameInput, { target: { value: changes.name } }))
        await act(() => fireEvent.change(termLangSel, { target: { value: changes.termLang } }))
        await act(() => fireEvent.change(defLangSel, { target: { value: changes.defLang } }))

        expect(nameInput.value).toEqual(changes.name)
        expect(termLangSel.value).toEqual(changes.termLang)
        expect(defLangSel.value).toEqual(changes.defLang)
        
        const db = await openDatabase()
        const savedDeck = await Deck.getData(data.id!, db)
        db.close()

        expect(savedDeck.name).toEqual(changes.name)
        expect(savedDeck.termLang).toEqual(changes.termLang)
        expect(savedDeck.defLang).toEqual(changes.defLang)
    })
})

test.each(decks)("cards are visible", async({data, cards}) => {

    await act(() => render(<App id={data.id!}/>))
    await waitForFullLoad()


    for (const card of cards) {
        
        const element = screen.getByTestId(`card-${card.id}`)
        
        const termInput = element
            .querySelector('input') as HTMLInputElement
        expect(termInput.value).toEqual(card.term)

        const defInput = element
            .querySelector('textarea') as HTMLTextAreaElement
        expect(defInput.value).toEqual(card.def)
    }
})

describe("modifying card's data", () => {

    test.each(decks)("card's term", async({data, cards}) => {

        await act(() => render(<App id={data.id!}/>))
        await waitForFullLoad()

        const db = await openDatabase()
        const changes = { term: 'Test term' }
        for (const card of cards) {
            
            const element = screen.getByTestId(`card-${card.id}`)
            
            const termInput = element
                .querySelector('input') as HTMLInputElement

            expect(termInput.value).not.toEqual(changes.term)
            await act(() => fireEvent.input(termInput, { target: { value: changes.term } }))
            expect(termInput.value).toEqual(changes.term)

            const savedCard = await Card.getData(card.id!, db)
            expect(savedCard.term).toEqual(changes.term)
        }

        db.close()
    })

    test.each(decks)("card's def", async({data, cards}) => {

        await act(() => render(<App id={data.id!}/>))
        await waitForFullLoad()

        const db = await openDatabase()
        const changes = { def: 'Test def' }
        for (const card of cards) {
            
            const element = screen.getByTestId(`card-${card.id}`)
            
            const defInput = element
                .querySelector('textarea') as HTMLTextAreaElement

            expect(defInput.value).not.toEqual(changes.def)
            await act(() => fireEvent.input(defInput, { target: { value: changes.def } }))
            expect(defInput.value).toEqual(changes.def)

            const savedCard = await Card.getData(card.id!, db)
            expect(savedCard.def).toEqual(changes.def)
        }

        db.close()
    })
    test.todo('can be modified at once')
})

test.todo('scanner can be toogled')

describe("modyfing list of cards", () => {

    test.each(decks)('are all visible in deck', async ({data, cards}) => {

        await act(() => render(<App id={data.id!}/>))
        await waitForFullLoad()

        const container = screen.getByTestId('cards')
        if(cards.length)
            expect(container).not.toBeEmptyDOMElement()
        for (const { id } of cards)
            expect (container).toContainElement(screen.getByTestId(`card-${id}`))
    })

    test.each(decks)('can be added', async ({data, cards}) => {

        await act(() => render(<App id={data.id!}/>))
        await waitForFullLoad()

        const addBtn = screen.getByTestId('add-card-btn')
        const initLength = cards.length
        
        await act(() => fireEvent.click(addBtn))

        const db = await openDatabase()
        const savedCards = (await Deck.get(data.id!, db)).cards
        expect(savedCards.length == initLength + 1).toBeTruthy()
        
        await waitFor(() => expect(screen.getByTestId(`card-${savedCards[0].id}`)).toBeVisible())
    })

    test.todo('can be added by scanner')
    
    test.todo('can be shuffled')
    test.todo('can be spreaded')

    test.each(decks)('can be deleted', async ({data, cards}) => {

        await act(() => render(<App id={data.id!}/>))
        await waitForFullLoad()

        for (const {id} of cards) {

            const card = screen.getByTestId(`card-${id}`)
            const remBtn = card.parentElement
                ?.querySelector(`button[data-role="removal"]`)

            await waitFor(() => expect(card).toBeVisible())
            await act(() => fireEvent.click(remBtn!))
            await waitFor(() => expect(card).not.toBeVisible())
        }
    })
})

test.each(decks)("deck can be removed", async ({data, cards}) => {

    await act(() => render(<App id={data.id!}/>))
    await waitForFullLoad()

    const showRmvBtn = screen.getByTestId('show-removal-btn')
    await act(() => fireEvent.click(showRmvBtn))

    const removalBtn = screen.getByTestId("deck-remove-btn")

    let retrived: Deck.Data | undefined

    const db = await openDatabase()

    retrived = await Deck.getData(data.id!, db)
    expect(retrived).not.toBeUndefined()
    
    await act(() => fireEvent.click(removalBtn))

    retrived = await Deck.getData(data.id!, db)
    expect(retrived).toBeUndefined()
})
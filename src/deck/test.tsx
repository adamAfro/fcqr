import '@testing-library/jest-dom'
import { MemoryRouter as Router } from 'react-router-dom'
import { act } from 'react-dom/test-utils'
import { render, screen, fireEvent, waitFor }
    from '@testing-library/react'

import * as Card from "../card"
import * as Deck from "../deck"
import { decks, voices } from './examples'

import { Provider as SettingsProvider } from '../settings' 
import { open as openDB, Provider as DatabaseProvider } 
    from "../database"
import * as fakeIDB from 'fake-indexeddb'
    Object.assign(global, fakeIDB)

// @ts-ignore
global.speechSynthesis = {
    getVoices: () => voices
}


const App = ({id}: {id:number}) => <DatabaseProvider><SettingsProvider>
    
    <Router basename={'/'}><Deck.Entry id={id}/></Router>

</SettingsProvider></DatabaseProvider>

async function expectFullLoad() {

    await waitFor(() => expect(screen.queryByTestId('database-unloaded')).toBeNull())
    await waitFor(() => expect(screen.queryByTestId('loading-deck')).toBeNull())
}

beforeAll(async function insertExampleDecks() {

    indexedDB = new IDBFactory()

    const db = await openDB()
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

        render(<App id={data.id!}/>)
        await expectFullLoad()
        
        const changes = { name: 'Deck with modified deck' }

        const nameInput = screen.getByTestId(`deck-${data.id}`)
            .querySelector('input')!
        
        expect(nameInput.value).not.toEqual(changes.name)
        await act(() => fireEvent.input(nameInput, { target: { value: changes.name } }))
        expect(nameInput.value).toEqual(changes.name)
        
        const db = await openDB()
        const savedDeck = await Deck.getData(data.id!, db)
        db.close()

        expect(savedDeck.name).toEqual(changes.name)
    })

    test.each(decks)("deck's term language", async ({data}) => {

        render(<App id={data.id!}/>)
        await expectFullLoad()

        const langsSel = [...screen.getByTestId(`deck-${data.id}`)
            .querySelectorAll('select')!]
        const termLangSel = langsSel[0]
        const possibleLanguages = [...langsSel[0].querySelectorAll('option')]
            .map(x => x.value).filter(x => x)

        const changes = {
            termLang: possibleLanguages
                .filter(x => x != termLangSel.value)[0]
        }


        expect(changes.termLang).not.toBeFalsy()

        expect(termLangSel.value).not.toEqual(changes.termLang)
        await act(() => fireEvent.change(termLangSel, { target: { value: changes.termLang } }))
        expect(termLangSel.value).toEqual(changes.termLang)
        
        const db = await openDB()
        const savedDeck = await Deck.getData(data.id!, db)
        db.close()

        expect(savedDeck.termLang).toEqual(changes.termLang)
    })

    test.each(decks)("deck's definition language", async ({data}) => {

        render(<App id={data.id!}/>)
        await expectFullLoad()

        const langsSel = [...screen.getByTestId(`deck-${data.id}`)
            .querySelectorAll('select')!]
        const defLangSel = langsSel[1]
        const possibleLanguages = [...langsSel[0].querySelectorAll('option')]
            .map(x => x.value)
        
        const changes = {
            defLang: possibleLanguages
                .filter(x => x != defLangSel.value)[0]
        }
        
        expect(defLangSel.value).not.toEqual(changes.defLang)
        await act(() => fireEvent.change(defLangSel, { target: { value: changes.defLang } }))
        expect(defLangSel.value).toEqual(changes.defLang)
        
        const db = await openDB()
        const savedDeck = await Deck.getData(data.id!, db)
        db.close()

        expect(savedDeck.defLang).toEqual(changes.defLang)
    })

    test.each(decks)("all at once", async ({data}) => {

        render(<App id={data.id!}/>)
        await expectFullLoad()

        const nameInput = screen.getByTestId(`deck-${data.id}`)
            .querySelector('input')!
        const langsSel = [...screen.getByTestId(`deck-${data.id}`)
            .querySelectorAll('select')!]
        const termLangSel = langsSel[0]
        const defLangSel = langsSel[1] || screen.getByDisplayValue(data.defLang)
        const possibleLanguages = [...langsSel[0].querySelectorAll('option')]
            .map(x => x.value)
        
        const changes = {
            name: 'Modified deck',
            termLang: possibleLanguages.filter(x => x != termLangSel.value)[0],
            defLang: possibleLanguages.filter(x => x != defLangSel.value)[0],
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
        
        const db = await openDB()
        const savedDeck = await Deck.getData(data.id!, db)
        db.close()

        expect(savedDeck.name).toEqual(changes.name)
        expect(savedDeck.termLang).toEqual(changes.termLang)
        expect(savedDeck.defLang).toEqual(changes.defLang)
    })
})

test.each(decks)("cards are visible", async({data, cards}) => {

    render(<App id={data.id!}/>)
    await expectFullLoad()

    for (const card of cards) {
        
        const element = screen.getByTestId(`card-${card.id}`)
        
        const termInput = element
            .querySelector('input[name=term]') as HTMLInputElement
        expect(termInput.value).toEqual(card.term)

        const defInput = element
            .querySelector('textarea[name=def]') as HTMLTextAreaElement
        expect(defInput.value).toEqual(card.def)
    }
})

describe("modifying card's data", () => {

    test.each(decks)("card's term", async({data, cards}) => {

        render(<App id={data.id!}/>)
        await expectFullLoad()

        const db = await openDB()
        const changes = { term: 'Test term' }
        for (const card of cards) {
            
            const element = screen.getByTestId(`card-${card.id}`)
            
            const termInput = element
                .querySelector('input[name=term]') as HTMLInputElement

            expect(termInput.value).not.toEqual(changes.term)
            await act(() => fireEvent.input(termInput, { target: { value: changes.term } }))
            expect(termInput.value).toEqual(changes.term)

            const savedCard = await Card.getData(card.id!, db)
            expect(savedCard.term).toEqual(changes.term)
        }

        db.close()
    })

    test.each(decks)("card's def", async({data, cards}) => {

        render(<App id={data.id!}/>)
        await expectFullLoad()

        const db = await openDB()
        const changes = { def: 'Test def' }
        for (const card of cards) {
            
            const element = screen.getByTestId(`card-${card.id}`)
            
            const defInput = element
                .querySelector('textarea[name=def]') as HTMLTextAreaElement

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

        render(<App id={data.id!}/>)
        await expectFullLoad()

        const container = screen.getByTestId('cards')
        if(cards.length)
            expect(container).not.toBeEmptyDOMElement()
        for (const { id } of cards)
            expect (container).toContainElement(screen.getByTestId(`card-${id}`))
    })

    test.each(decks)('can be added', async ({data, cards}) => {

        render(<App id={data.id!}/>)
        await expectFullLoad()

        const addBtn = screen.getByTestId('add-card-btn')
        const container = screen.getByTestId('cards')
        const initChildrenLength = container.children.length
        const initLength = cards.length

        expect(initChildrenLength == initLength).toBeTruthy()
        
        await act(() => fireEvent.click(addBtn))

        await waitFor(() => expect(container.children.length == initChildrenLength + 1).toBeTruthy())

        const db = await openDB()
        const savedCards = (await Deck.get(data.id!, db)).cards
        expect(savedCards.length == initLength + 1).toBeTruthy()
    })

    test.todo('can be added by scanner')
    
    test.todo('can be shuffled')
    test.todo('can be spreaded')

    test.each(decks)('can be deleted', async ({data, cards}) => {

        render(<App id={data.id!}/>)
        await expectFullLoad()

        for (const {id} of cards) {

            const card = screen.getByTestId(`card-${id}`)
            const remBtn = card.parentElement
                ?.querySelector(`button[data-id="${id}"]`)

            await waitFor(() => expect(card).toBeVisible())
            await act(() => fireEvent.click(remBtn!))
            await waitFor(() => expect(card).not.toBeVisible())
        }
    })
})

test.each(decks)("deck can be removed", async ({data, cards}) => {

    render(<App id={data.id!}/>)
    await expectFullLoad()

    const removalBtn = screen.getByTestId("deck-remove-btn")

    let retrived: Deck.Data | undefined

    const db = await openDB()

    retrived = await Deck.getData(data.id!, db)
    expect(retrived).not.toBeUndefined()
    
    await act(() => fireEvent.click(removalBtn))

    retrived = await Deck.getData(data.id!, db)
    expect(retrived).toBeUndefined()
})
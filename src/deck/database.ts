import { Database, Stores } from "../memory"

import * as Card from '../card/database'
import * as Language from '../languages/database'

export interface Data {
    id?: number
    name: string
    languageId?: number
}

function read(db: Database) {

    const t = db.transaction(Stores.DECKS, 'readonly')
    return { done: t.done, store: t.objectStore(Stores.DECKS) }
}

function readwrite(db: Database) {

    const t = db.transaction(Stores.DECKS, 'readwrite')
    return { done: t.done, store: t.objectStore(Stores.DECKS) }
}

function readWithCards(db: Database) {

    const t = db.transaction([Stores.DECKS, Stores.CARDS], 'readonly')
    return { done: t.done, 
        store: t.objectStore(Stores.DECKS),
        cardStore: t.objectStore(Stores.CARDS) 
    }
}

function readwriteWithCards(db: Database) {

    const t = db.transaction([Stores.DECKS, Stores.CARDS], 'readwrite')
    return { done: t.done, 
        store: t.objectStore(Stores.DECKS),
        cardStore: t.objectStore(Stores.CARDS) 
    }
}

function readAll(db: Database) {

    const t = db.transaction([Stores.DECKS, Stores.CARDS, Stores.LANGUAGES], 'readonly')
    return { done: t.done, 
        store: t.objectStore(Stores.DECKS),
        cardStore: t.objectStore(Stores.CARDS),
        languageStore: t.objectStore(Stores.LANGUAGES) 
    }
}

export async function add(deck: Data, cards: Card.Data[], db: Database) {

    const { done, store, cardStore } = readwriteWithCards(db)

    const deckId = Number(await store.add(deck))
    const additions = cards
        .map(card => cardStore.add({ ...card, deckId }))
    const cardsIds = await Promise.all(additions)
    
    await done
    return { deckId, cardsIds: cardsIds as number[] }
}

export async function addData(deck: Data, db: Database) {

    const { done, store } = readwrite(db)

    const deckId = Number(await store.add(deck))

    await done
    return deckId
}

export async function addCards(deckId: number, cards: Card.Data[], db: Database) {

    const { done, cardStore } = readwriteWithCards(db)
    
    const additions = cards
        .map(card => cardStore.add({ ...card, deckId }))
    const ids = await Promise.all(additions)
    
    await done
    return ids
}

export async function get(deckId: number, db: Database) {

    const { done, store, cardStore, languageStore } = readAll(db)

    const data = await store.get(deckId) as Data
    const index = cardStore.index('deckId')
    const cards = await index.getAll(IDBKeyRange.only(deckId)) as Card.Data[]

    const language = data.languageId ? 
        await languageStore.get(data.languageId) as Language.Data :
        null
 
    await done
    return { data, cards, language }
}

export async function getData(deckId: number, db: Database) {

    const { done, store } = read(db)

    const deck = await store.get(deckId) as Data
    
    await done
    return deck
}

export async function remove(deckId: number, db: Database) {

    const { done, store, cardStore } = readwriteWithCards(db)

    await store.delete(deckId)

    const index = cardStore.index('deckId')
    const cards = await index.getAll(IDBKeyRange.only(deckId)) as Card.Data[]
    const removals = cards.map(card => cardStore.delete(card.id!))

    await Promise.all(removals)
    
    return await done
}

export async function modify(modified: Data, cards: Card.Data[], db: Database) {
    
    const { done, store, cardStore } = readwriteWithCards(db)

    await store.put(modified)

    const modifications = cards.map(card => cardStore.put(card))
    await Promise.all(modifications)

    return await done
}

export async function modifyCards(deckId: number, cards: Card.Data[], db: Database) {

    const { done, cardStore } = readwriteWithCards(db)

    const modifications = cards.map(card => cardStore.put(card))
    await Promise.all(modifications)

    return await done
}

export async function modifyData(modified: Data, db: Database) {

    const { done, store } = readwrite(db)

    await store.put(modified)
    
    return await done
}

export async function rename(deckId: number, name: string, db: Database) {

    const { done, store } = readwrite(db)

    const deck = await store.get(deckId) as Data
    deck.name = name

    await store.put(deck)
    
    return await done
}

export async function changeLanguage(deckId: number, languageId: number, db: Database) {

    const { done, store } = readwrite(db)

    const deck = await store.get(deckId) as Data

    await store.put({ ...deck, languageId })

    return await done
}

export async function getAllData(db: Database) {

    const { done, store } = read(db)

    const decks = await store.getAll() as Data[]
    
    await done
    return decks
}

export async function getLast(db: Database) {
    
    const { done, store } = readwrite(db)

    const cursor = await store.openCursor(null, "prev")
    
    await done
    return cursor ? cursor.value : null
}

export async function createPackage(ids: number[], db: Database) {

    const { done, store, cardStore } = readWithCards(db)

    const cardIndex = cardStore.index('deckId')
    const packed = Promise.all(ids.map(async (id) => ({
        data: await store.get(id) as Data,
        cards: await cardIndex.getAll(IDBKeyRange.only(id)) as Card.Data[]
    })))
    
    await done
    return packed
}

type Packed = Awaited <ReturnType <typeof createPackage>>

export async function fromPackage(packed: Packed, db: Database, { replace = false } = {}) {

    const { done, store, cardStore } = readwriteWithCards(db)

    const additions = packed.map(async ({ data, cards }) => {

        if (!replace) {
            if (data.id)
                delete data.id
            for (const card of cards) if (card.id)
                delete card.id
        }
        
        const deckId = Number(await store.add(data))

        cards = cards.map(card => ({ ...card, deckId }))
        
        const additions = cards.map(card => cardStore.add(card))

        const cardsIds = await Promise.all(additions)

        return { deckId, cardsIds: cardsIds as number[] }
    })

    const ids = await Promise.all(additions)
    
    await done
    return ids
}
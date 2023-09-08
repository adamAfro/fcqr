import { Database, Stores } from "../memory"

import * as Card from '../card'

export interface Data {
    id?: number
    name: string
    termLang: string
    defLang: string
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

export async function add(deck: Data, cards: Card.Data[], db: Database) {

    const transaction = db.transaction([Stores.DECKS, Stores.CARDS], 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)
    const cardStore = transaction.objectStore(Stores.CARDS)

    const deckId = Number(await deckStore.add(deck))

    cards = cards.map(card => ({ ...card, deckId }))
    
    const additions = cards.map(card => cardStore.add(card))

    const cardsIds = await Promise.all(additions)
    await transaction.done

    return { deckId, cardsIds: cardsIds as number[] }
}

export async function addData(deck: Data, db: Database) {

    const transaction = db.transaction([Stores.DECKS, Stores.CARDS], 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)

    const deckId = Number(await deckStore.add(deck))
    await transaction.done

    return deckId
}

export async function addCards(deckId: number, cards: Card.Data[], db: Database) {

    const transaction = db.transaction([Stores.CARDS], 'readwrite')
    const cardStore = transaction.objectStore(Stores.CARDS)

    cards = cards.map(card => ({ ...card, deckId }))
    
    const additions = cards.map(card => cardStore.add(card))

    const ids = await Promise.all(additions)
    await transaction.done

    return ids
}

export async function get(deckId: number, db: Database) {

    const transaction = db.transaction([Stores.DECKS, Stores.CARDS], 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)
    const cardStore = transaction.objectStore(Stores.CARDS)

    const data = await deckStore.get(deckId) as Data

    const index = cardStore.index('deckId')
    const cards = await index.getAll(IDBKeyRange.only(deckId)) as Card.Data[]
    
    await transaction.done

    return { data, cards }
}

export async function getData(deckId: number, db: Database) {

    const transaction = db.transaction([Stores.DECKS], 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)

    const deck = await deckStore.get(deckId) as Data
    await transaction.done

    return deck
}

export async function remove(deckId: number, db: Database) {

    const transaction = db.transaction([Stores.DECKS, Stores.CARDS], 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)
    const cardStore = transaction.objectStore(Stores.CARDS)

    await deckStore.delete(deckId)

    const index = cardStore.index('deckId')
    const cards = await index.getAll(IDBKeyRange.only(deckId)) as Card.Data[]

    const removals = cards.map(card => cardStore.delete(card.id!))

    await Promise.all(removals)
    await transaction.done

    return
}

export async function modify(modified: Data, cards: Card.Data[], db: Database) {
    
    const transaction = db.transaction([Stores.DECKS, Stores.CARDS], 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)
    const cardStore = transaction.objectStore(Stores.CARDS)

    await deckStore.put(modified)

    const modifications = cards.map(card => cardStore.put(card))
    await Promise.all(modifications)

    await transaction.done

    return
}

export async function modifyCards(deckId: number, cards: Card.Data[], db: Database) {
    
    const transaction = db.transaction([Stores.CARDS], 'readwrite')
    const cardStore = transaction.objectStore(Stores.CARDS)

    const modifications = cards.map(card => cardStore.put(card))
    await Promise.all(modifications)

    await transaction.done

    return
}

export async function modifyData(modified: Data, db: Database) {
    
    const transaction = db.transaction(Stores.DECKS, 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)

    await deckStore.put(modified)
    await transaction.done

    return
}

export async function rename(deckId: number, name: string, db: Database) {

    const transaction = db.transaction(Stores.DECKS, 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)

    const deck = await deckStore.get(deckId) as Data
    deck.name = name

    await deckStore.put(deck)
    await transaction.done
    
    return
}

export async function changeLanguage(deckId: number, key: 'termLang' | 'defLang', value: string, db: Database) {

    const transaction = db.transaction(Stores.DECKS, 'readwrite')
    const deckStore = transaction.objectStore(Stores.DECKS)

    const deck = await deckStore.get(deckId) as Data
    deck[key] = value

    await deckStore.put(deck)
    await transaction.done

    return
}

export async function getAllData(db: Database) {

    const transaction = db.transaction(Stores.DECKS, 'readonly')
    const deckStore = transaction.objectStore(Stores.DECKS)

    const decks = await deckStore.getAll() as Data[]
    await transaction.done

    return decks
}

export async function getLast(db: Database) {
    
    const transaction = db.transaction(Stores.DECKS, 'readonly')
    const store = transaction.objectStore(Stores.DECKS)

    const cursor = await store.openCursor(null, "prev")
    await transaction.done
    
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
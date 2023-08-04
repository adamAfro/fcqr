import React, { createContext, useState, useEffect, useContext } from 'react'

import { openDB, IDBPDatabase } from 'idb'



const DB_NAME = 'main'

const DECK_STORE_NAME = 'decks'
interface Deck {
    id?: number
    name: string
    termLang: string
    defLang: string
}

const CARD_STORE_NAME = 'cards'
interface Card {
    id?: number
    deckId?: number
    term: string
    def: string
}



export const open = () => openDB(DB_NAME, 2, {

    upgrade(db, oldVersion, newVersion, transaction, event) {
        
        if (!db.objectStoreNames.contains(DECK_STORE_NAME))
            db.createObjectStore(DECK_STORE_NAME, { keyPath: 'id', autoIncrement: true })
    
        if (!db.objectStoreNames.contains(CARD_STORE_NAME)) {

            const cardStore = db.createObjectStore(CARD_STORE_NAME, { keyPath: 'id', autoIncrement: true })
            cardStore.createIndex('deckId', 'deckId')
        }
    }
})


export async function add(deck: Deck, cards: Card[], db: IDBPDatabase) {

    const transaction = db.transaction([DECK_STORE_NAME, CARD_STORE_NAME], 'readwrite')
    const deckStore = transaction.objectStore(DECK_STORE_NAME)
    const cardStore = transaction.objectStore(CARD_STORE_NAME)

    const deckId = Number(await deckStore.add(deck))

    cards = cards.map(card => ({ ...card, deckId }))
    
    const additions = cards.map(card => cardStore.add(card))

    await Promise.all(additions)
    await transaction.done

    return deckId
}

export async function remove(deckId: number, db: IDBPDatabase) {

    const transaction = db.transaction([DECK_STORE_NAME, CARD_STORE_NAME], 'readwrite')
    const deckStore = transaction.objectStore(DECK_STORE_NAME)
    const cardStore = transaction.objectStore(CARD_STORE_NAME)

    await deckStore.delete(deckId)

    const index = cardStore.index('deckId')
    const cards = await index.getAll(IDBKeyRange.only(deckId))

    const removals = cards.map(card => cardStore.delete(card.id))

    await Promise.all(removals)
    await transaction.done

    return
}

export async function modify(modified: Deck, db: IDBPDatabase) {
    
    const transaction = db.transaction(DECK_STORE_NAME, 'readwrite')
    const deckStore = transaction.objectStore(DECK_STORE_NAME)

    await deckStore.put(modified)
    await transaction.done

    return
}

export async function get(deckId: number, db: IDBPDatabase) {

    const transaction = db.transaction(DECK_STORE_NAME, 'readonly')
    const deckStore = transaction.objectStore(DECK_STORE_NAME)

    const deck = await deckStore.get(deckId)
    await transaction.done

    return deck
}


export async function addInto(deckId: number, cards: Card[], db: IDBPDatabase) {
    
    const transaction = db.transaction([DECK_STORE_NAME, CARD_STORE_NAME], 'readwrite')
    const deckStore = transaction.objectStore(DECK_STORE_NAME)
    const cardStore = transaction.objectStore(CARD_STORE_NAME)

    const deck = await deckStore.get(deckId)
    if (!deck) 
        throw new Error(`Deck with id ${deckId} not found.`)

    const additions = cards.map(card => cardStore.add(card))

    const ids = await Promise.all(additions)
    await transaction.done
    
    return ids.map(id => Number(id))
}

export async function modifyInside(deckId: number, modified: Card[], db: IDBPDatabase) {
    
    const transaction = db.transaction(CARD_STORE_NAME, 'readwrite')
    const cardStore = transaction.objectStore(CARD_STORE_NAME)

    const modifications = modified.map(card => cardStore.put(card))

    await Promise.all(modifications)
    await transaction.done

    return
}

export async function removeFrom(deckId: number, cardsIds: number[], db: IDBPDatabase) {

    const transaction = db.transaction(CARD_STORE_NAME, 'readwrite')
    const cardStore = transaction.objectStore(CARD_STORE_NAME)

    const removals = cardsIds.map(id => cardStore.delete(id))

    await Promise.all(removals)
    await transaction.done

    return
}

export async function getAllFrom(deckId: number, db: IDBPDatabase) {

    const transaction = db.transaction(CARD_STORE_NAME, 'readonly')
    const cardStore = transaction.objectStore(CARD_STORE_NAME)
    
    const index = cardStore.index('deckId')

    const cards = await index.getAll(IDBKeyRange.only(deckId)) as Card[]
    await transaction

    return cards
}

export async function getFrom(deckId: number, ids: number[], db: IDBPDatabase) {

    const transaction = db.transaction(CARD_STORE_NAME, 'readonly')
    const cardStore = transaction.objectStore(CARD_STORE_NAME)
    const index = cardStore.index('deckId')
    
    const cards: Card[] = []
    for (const id of ids) {
        const range = IDBKeyRange.only(deckId)
        const cursor = await index.openCursor(range)

        while (cursor) {
            const card = cursor.value as Card
            if (card.deckId === deckId && card.id === id) {
                cards.push(card)
                break
            }
            cursor.continue()
        }
    }

    await transaction.done

    return cards
}



const IDBContext = createContext <{ db: IDBPDatabase | null }> ({ db: null })

export function useIDB() {

    return useContext(IDBContext)
}

export function IDBProvider({ children }: { children: React.ReactNode }) {
    
    const [db, setDB] = useState(null as IDBPDatabase | null)

    useEffect(() => void open().then(db => db && setDB(db)), [])

    return <IDBContext.Provider value={{ db }}>{children}</IDBContext.Provider>
}
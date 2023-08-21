import { Database, Stores } from '../memory'

export interface Data {
    id?: number
    deckId?: number
    term: string
    def: string
    order?: number
}

export async function addData(data: Data, db: Database) {

    const transaction = db.transaction([Stores.CARDS], 'readwrite')
    const store = transaction.objectStore(Stores.CARDS)

    const id = Number(await store.add(data))
    await transaction.done

    return id
}

export async function getAllData(db: Database) {

    const transaction = db.transaction(Stores.CARDS, 'readonly')
    const deckStore = transaction.objectStore(Stores.CARDS)

    const decks = await deckStore.getAll() as Data[]
    await transaction.done

    return decks
}

export async function getData(id: number, db: Database) {

    const transaction = db.transaction(Stores.CARDS, 'readonly')
    const store = transaction.objectStore(Stores.CARDS)

    const data = await store.get(id) as Data
    await transaction.done

    return data
}

export async function modifyData(data: Data, db: Database) {

    const transaction = db.transaction(Stores.CARDS, 'readwrite')
    const store = transaction.objectStore(Stores.CARDS)

    await store.put(data)
    await transaction.done

    return true
}

export async function getLast(db: Database) {
    
    const transaction = db.transaction(Stores.CARDS, 'readonly')
    const store = transaction.objectStore(Stores.CARDS)

    const cursor = await store.openCursor(null, "prev")
    await transaction.done
    
    return cursor ? cursor.value : null
}

export async function removeData(id: number, db: Database) {

    const transaction = db.transaction([Stores.CARDS], 'readwrite')
    const store = transaction.objectStore(Stores.CARDS)

    await store.delete(id)
    await transaction.done

    return
}
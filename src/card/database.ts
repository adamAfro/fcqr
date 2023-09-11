import { Database, Stores } from '../memory'

function read(db: Database) {

    const t = db.transaction(Stores.CARDS, 'readonly')
    return { done: t.done, store: t.objectStore(Stores.CARDS) }
}

function readwrite(db: Database) {

    const t = db.transaction(Stores.CARDS, 'readwrite')
    return { done: t.done, store: t.objectStore(Stores.CARDS) }
}

export interface Data {
    id?: number
    deckId?: number
    term: string
    def: string
    order?: number
}

export async function addData(data: Data, db: Database) {

    const { done, store } = readwrite(db)

    const id = Number(await store.add(data))
    
    await done
    return id
}

export async function getAllData(db: Database) {

    const { done, store } = read(db)

    const decks = await store.getAll() as Data[]
    
    await done
    return decks
}

export async function getData(id: number, db: Database) {

    const { done, store } = read(db)

    const data = await store.get(id) as Data
    
    await done
    return data
}

export async function modifyData(data: Data, db: Database) {

    const { done, store } = readwrite(db)

    await store.put(data)

    return await done
}

export async function getLast(db: Database) {
   
    const { done, store } = read(db)

    const cursor = await store.openCursor(null, "prev")
    
    await done
    return cursor ? cursor.value : null
}

export async function removeData(id: number, db: Database) {

    const { done, store } = readwrite(db)

    await store.delete(id)

    return await done
}
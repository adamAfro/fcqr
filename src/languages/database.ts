import { Database, Stores } from '../memory'

export interface Data {
    id?: number,
    name: string,
    voice?: string,
	code?: string
}

function read(db: Database) {

    const t = db.transaction(Stores.LANGUAGES, 'readonly')
    return { done: t.done, store: t.objectStore(Stores.LANGUAGES) }
}

function readwrite(db: Database) {

    const t = db.transaction(Stores.LANGUAGES, 'readwrite')
    return { done: t.done, store: t.objectStore(Stores.LANGUAGES) }
}

export async function addData(data: Data, db: Database) {

    const { done, store } = readwrite(db)

    const id = Number(await store.add(data))
    
    await done
    return id
}

export async function getData(id: number, db: Database) {

    const { done, store } = read(db)

    const data = await store.get(id) as Data
    
    await done
    return data
}

export async function rename(id: number, name: string, db: Database) {

    const { done, store } = readwrite(db)

    const deck = await store.get(id) as Data
    deck.name = name

    await store.put(deck)
    
    return await done
}

export async function changeVoice(id: number, voice: string, code: string, db: Database) {

    const { done, store } = readwrite(db)

    const deck = await store.get(id) as Data

    await store.put({ ...deck, voice, code })

    return await done
}

export async function modifyData(data: Data, db: Database) {

    const { done, store } = readwrite(db)

    await store.put(data)

    return await done
}

export async function getAllData(db: Database) {

    const { done, store } = read(db)

    const decks = await store.getAll() as Data[]
    
    await done
    return decks
}

export async function removeData(id: number, db: Database) {

    const { done, store } = readwrite(db)

    await store.delete(id)

    return await done
}
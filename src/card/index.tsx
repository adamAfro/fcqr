import { useState } from 'react'

import { ChangeEvent } from 'react'

import { useDatabase, Type as Database, Stores } from '../database'


import style from "./style.module.css"


export interface Data {
    id?: number
    deckId?: number
    term: string
    def: string
    order?: number
}

export function Card(props: Data) {

    return <p className={style.card} data-testid={`card-${props.id}`}>
        <span className={style.term}>
            <Letters text={props.term}/>
        </span>
        <span className={style.def}>    
            <Letters text={props.def}/>
        </span>
    </p>
}

export function Editor(props: Data) {

    const database = useDatabase()

    const [data, setData] = useState(props)
    const change = (event: ChangeEvent) => {

        if (!database)
            throw new Error('no database')

        const target = event.target as HTMLInputElement | HTMLSelectElement
        const key = target.name, value = target.value

        modifyData({ ...data, [key]: value } as Data, database)
        setData(prev => ({ ...prev, [key]: value }))
    }

    return <p className={style.card} data-testid={`card-${props.id}`}>
        <input className={style.term} name='term' value={data.term} onChange={change}/>
        <textarea className={style.def} name='def' value={data.def} onChange={change}/>
    </p>
}

function Letters(props: { text: string }) {
    
        return <span className={style.letters}>
            {Array.from(props.text).map(tagCharRandomly)}
        </span>
}

function tagCharRandomly(letter: string, index = 0) {

    return tagChar(letter, index, Math.random(), randInt(1, 5))
}

function tagChar(letter: string, index = 0, seed = 0, variant = 0) {

    return <span key={index} className={style.letter} style={{
        transform: `translate(${.25*seed}em, ${1.25*seed}em)`
    }} data-variant={variant}>
        {letter}
    </span>
}

function randInt(min = 0, max = 1) {

    return Math.floor(Math.random() * (max - min + 1)) + min
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
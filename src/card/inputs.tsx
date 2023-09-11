import { useContext } from 'react'

import { Data } from './'
import { useMemory, Database, Stores } from '../memory'

import { useTranslation } from 'react-i18next'

import { Context } from './'


import ui from "../style.module.css"
import style from "./style.module.css"

export function Term() {

    const { database } = useMemory()!

    const { id, term, setTerm } = useContext(Context)

    const { t } = useTranslation()

    return <input className={style.term} onChange={async (e) => {

        setTerm(e.target.value)
        if (!id) return

        const { done, store } = readwrite(database)
        const card = await store.get(id) as Data

        await store.put({ ...card, term: e.target.value })        
        return await done

    }} placeholder={t`term`} value={term} data-is-long={term.length > 15}/>
}

export function Definition() {

    const { database } = useMemory()!

    const { id, def, setDef } = useContext(Context)

    const { t } = useTranslation()

    return <textarea className={style.def} onChange={async (e) => {

        setDef(e.target.value)
        if (!id) return

        const { done, store } = readwrite(database)
        const card = await store.get(id) as Data

        await store.put({ ...card, def: e.target.value })        
        return await done

    }} placeholder={t`definition`} value={def}/>
}

export function Options() {

    const { database } = useMemory()!

    const { id, setRemoved } = useContext(Context)

    return <span className={style.options}>
        
        <button data-role="removal" className={ui.removal} onClick={async () => {

            setRemoved(true)
            if (!id) return

            const { done, store } = readwrite(database)
            
            await store.delete(id)
        
            return await done

        }}>🗑</button>
    
    </span>
}

export function read(db: Database) {

    const t = db.transaction(Stores.CARDS, 'readonly')
    return { done: t.done, store: t.objectStore(Stores.CARDS) }
}

export function readwrite(db: Database) {

    const t = db.transaction(Stores.CARDS, 'readwrite')
    return { done: t.done, store: t.objectStore(Stores.CARDS) }
}
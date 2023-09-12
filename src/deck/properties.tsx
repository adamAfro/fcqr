import { useContext, useEffect, useState } from 'react'

import { Database, Stores } from "../memory"

import { useTranslation } from '../localisation'
import { Data as Language, read as readLanguages } from '../languages'
import { useMemory } from "../memory"
import { Data } from './'

import { Context } from './'


import ui from "../style.module.css"
import style from "./style.module.css"


export default function Properties() {

    const { id } = useContext(Context)

    return <header className={style.properites} data-testid={`deck-${id}`}>
        
        <Name/>

        <div style={{display:'flex', gap:'1em'}}>

            <LanguageSelect/>

            <MuteButton/>

            <SilenceButton/>

        </div>

    </header>
}

function Name() {

    const context = useContext(Context)
    const { id } = context

    const { t } = useTranslation()
    const { database } = useMemory()!

    const [name, setName] = useState(context.name)

    return <input className={ui.title} onChange={async (e) => {

        const target = e.target as HTMLInputElement
        
        setName(target.value)
        
        if (!id) return

        const { done, store } = readwrite(database)

        const deck = await store.get(id) as Data

        await store.put({ ...deck, name })        
        return await done
        
    }} placeholder={t`unnamed deck`} type="text" value={name}/>
}

function LanguageSelect() {

    const { database } = useMemory()!

    const { id, language, setLanguage } = useContext(Context)

    const [languages, setLanguages] = useState([] as Language[])
    useEffect(() => void (async function() {

        const { done, store } = readLanguages(database)

        const languages = await store.getAll() as Data[]
        
        await done
        return languages

    })().then(ls => setLanguages(ls)), [])

    const { t } = useTranslation()

    return <select onChange={async (e) => {

        const languageId = Number(e.target.value)
        const language = languages
            .find(({ id }) => id == languageId)

        setLanguage(prev => language)
        
        const { done, store } = readwrite(database)
        const deck = await store.get(id) as Data
        
        await store.put({ ...deck, languageId })
        return await done
        
    }} value={language?.id}>
        <option key={-1}>{t`no language`}</option>
        {languages.map(({ id, name }) => 
            <option key={id} value={id}>{name}</option>)
        }
    </select>
}

function MuteButton() {

    const { database } = useMemory()!

    const { id, muted, setMuted, language } = useContext(Context)

    return <label role='button' className={ui.widget}>
        
        🔇
        <input type="checkbox" checked={muted} 
            disabled={!language || !language.voice}
            onChange={async () => {

                const { done, store } = readwrite(database)
                const deck = await store.get(id) as Data
                
                await store.put({ ...deck, muted: !muted })
                await done
                
                setMuted(p => !p)
            
            }}/>

    </label>
}

function SilenceButton() {

    const { database } = useMemory()!

    const { id, silent, setSilent, language } = useContext(Context)

    return <label role='button' className={ui.widget}>
        
        🤫
        <input type="checkbox" checked={silent} 
            disabled={!language || !language.code}
            onChange={async () => {

                const { done, store } = readwrite(database)
                const deck = await store.get(id) as Data
                
                await store.put({ ...deck, silent: !silent })
                await done
                
                setSilent(p => !p)
            
            }}/>

    </label>
}

export function readwrite(db: Database) {

    const t = db.transaction(Stores.DECKS, 'readwrite')
    return { done: t.done, store: t.objectStore(Stores.DECKS) }
}
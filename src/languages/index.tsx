import { useEffect, useState, useContext } from 'react';
import { createContext } from 'react'

import { Database, Stores } from '../memory'
import { useTranslation } from '../localisation'
import { getVoices } from './speech'
import { useMemory } from '../memory'
import { readwrite, default as Inputs } from './entry'
import { Context as PocketContext } from '../pocket'

import style from './style.module.css'

export interface Data {
    id?: number,
    name: string,
    voice?: string,
	code?: string
}

export enum Status { LOADING, FAILED, LOADED }
export const Context = createContext({
    status: Status.LOADING,
    voices: [] as SpeechSynthesisVoice[],
    languages: [] as Data[],
        setLanguages: (x: (prev: Data[]) => any[]) => {}
})

export default function Languages() {

    const { database } = useMemory()!
    
    const [status, setStatus] = useState(Status.LOADING)
    const [languages, setLanguages] = useState <Data[]> ([])

    useEffect(() => void (async function() {
        
        const { done, store } = read(database)

        const decks = await store.getAll() as Data[]

        await done
        return decks

    })().then(setLanguages), [])

    const [voices, setVoices] = useState([] as SpeechSynthesisVoice[])
    useEffect(() => {

        const voicesLoad = getVoices()
            .then(v => void setVoices(v))
            .then(_ => void setStatus(Status.LOADED))

        voicesLoad.catch(e => void setStatus(Status.FAILED))

    }, [])

    return <Context.Provider value={{ status, voices, 
        languages, setLanguages
    }}>

        <ul className={style.entries}>
            <li>
                <ShowAllButton/>
            </li>
            <li>
                <AddButton/>
            </li>{[...languages].reverse().map((language) =>
            <li data-testid={`language-${language.id}`} key={language.id}>
                <Inputs {...language}/>
            </li>
        )}</ul>

    </Context.Provider>
}

function ShowAllButton() {

    const { activeLanguageId, setActiveLanguageId } = useContext(PocketContext)

    const { t } = useTranslation()

    return <button data-active={activeLanguageId == -1} onClick={() => setActiveLanguageId(-1)}>
        {t`show all`}
    </button>
}

function AddButton() {

    const { database } = useMemory()!

    const { setLanguages } = useContext(Context)

    const { t } = useTranslation()

    return <button className='icon' onClick={async () => {

        const added = {
            name: t`new language`,
            voice: undefined as string | undefined,
            code: undefined
        }

        const { done, store } = readwrite(database)

        const id = await store.add(added)

        setLanguages(prev => [...prev, {...added, id}])
        
        await done
        
    }} data-testid="add-voice-btn">➕</button>
}

export function read(db: Database) {

    const t = db.transaction(Stores.LANGUAGES, 'readonly')
    return { done: t.done, store: t.objectStore(Stores.LANGUAGES) }
}
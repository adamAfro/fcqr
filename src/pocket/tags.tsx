import { useEffect, useState, useContext } from 'react';
import { createContext } from 'react'

import { Database, Stores } from '../memory'
import { useTranslation } from '../localisation'
import { getVoices } from '../speech'
import { useMemory } from '../memory'
import { Context as PocketContext } from '.'

import { Input, Button, Widget } from '../interactions'

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
    tags: [] as Data[],
        setTags: (x: (prev: Data[]) => any[]) => {}
})

export default function Languages() {

    const { database } = useMemory()!
    
    const [status, setStatus] = useState(Status.LOADING)
    const [tags, setTags] = useState <Data[]> ([])

    useEffect(() => void (async function() {
        
        const { done, store } = read(database)

        const decks = await store.getAll() as Data[]

        await done
        return decks

    })().then(setTags), [])

    const [voices, setVoices] = useState([] as SpeechSynthesisVoice[])
    useEffect(() => {

        const voicesLoad = getVoices()
            .then(v => void setVoices(v))
            .then(_ => void setStatus(Status.LOADED))

        voicesLoad.catch(e => void setStatus(Status.FAILED))

    }, [])

    const { t } = useTranslation()

    return <Context.Provider value={{ status, voices, 
        tags, setTags
    }}>

        <ul className='row'>
            <li>
                <h2 className={style.heading}>{t`tags`}</h2>
            </li>
            <li>
                <ShowAllButton/>
            </li>{tags.map((language) =>
            <li data-testid={`language-${language.id}`} key={language.id}>
                <Entry {...language}/>
            </li>)}
            <li>
                <AddButton/>
            </li>
        </ul>

    </Context.Provider>
}

function ShowAllButton() {

    const { activeTagId, setActiveTagId } = useContext(PocketContext)

    const { t } = useTranslation()

    return <Button contents={t`show all`} 
        active={activeTagId == -1} attention='weak'
        onClick={() => setActiveTagId(-1)}/>
}

function AddButton() {

    const { database } = useMemory()!

    const { setTags } = useContext(Context)

    const { t } = useTranslation()

    return <Widget symbol='Plus' onClick={async () => {

        const added = {
            name: t`new language`,
            voice: undefined as string | undefined,
            code: undefined
        }

        const { done, store } = readwrite(database)

        const id = await store.add(added)

        setTags(prev => [...prev, {...added, id}])
        
        await done
        
    }}/>
}

export function read(db: Database) {

    const t = db.transaction(Stores.TAGS, 'readonly')
    return { done: t.done, store: t.objectStore(Stores.TAGS) }
}

const EntryContext = createContext({
    
    id: undefined as number | undefined,
    removed: false, setRemoved: (prev: boolean) => {},
    name: '', setName(_:string) {}
})

export function Entry({ id, ...props }: Data) {

    const { activeTagId, setActiveTagId } = useContext(PocketContext)

    const [name, setName] = useState(props.name)
    const [removed, setRemoved] = useState(false)

    if (removed)
        return null

    return <EntryContext.Provider  value={{
        id, removed, setRemoved, name, setName
    }}>
        
        {activeTagId == id ? <div className={style.tag} onClick={() => setActiveTagId(id)}>

            <NameInput/>

            <RemoveButton/>
    
            <VoiceSelect initValue={props.voice}/>

        </div> : <Button className={style.tag} contents={name} attention='weak' 
            onClick={() => setActiveTagId(id!)}/>}

    </EntryContext.Provider>
}

function NameInput() {

    const { database } = useMemory()!

    const { id, name, setName } = useContext(EntryContext)

    const { t } = useTranslation()

    return <Input active={true} onChange={async (e) => {

        setName(e.target.value)
        if (!id) return

        const { done, store } = readwrite(database)
        const tag = await store.get(id) as Data

        await store.put({ ...tag, name: e.target.value })        
        return await done

    }} placeholder={t`not named`} value={name}/>
}

function VoiceSelect({ initValue }: { initValue: undefined | string }) {

    const { database } = useMemory()!
   
    const { voices, status } = useContext(Context)

    const { id } = useContext(EntryContext)

    const [value, setValue] = useState(initValue)

    const { t } = useTranslation()

    return <select value={value}
        disabled={status == Status.LOADED ? false : true}
        className={status == Status.FAILED ? 'wrong' : ''}
        onChange={async (e) => {

        if (!id) return

        const voice = e.target.value
        setValue(voice)
        
        const { done, store } = readwrite(database)
        const tag = await store.get(id) as Data

        const code = voices.find(v => v.name == voice)?.lang
        
        await store.put({ ...tag, voice, code })

        return await done

    }}><option key={crypto.randomUUID()} value={undefined}>{t`no voice`}</option>{voices.map((voice) =>
        <option key={crypto.randomUUID()} value={voice.name}>{voice.name}</option>
    )}</select>
}

function RemoveButton() {

    const { database } = useMemory()!

    const { id, setRemoved } = useContext(EntryContext)

    return <Widget symbol='Bin' attention='removal' onClick={async () => {

        setRemoved(true)
        if (!id) return
        
        const { done, store } = readwrite(database)

        await store.delete(id)

        return await done

    }}/>
}

export function readwrite(db: Database) {

    const t = db.transaction(Stores.TAGS, 'readwrite')
    return { done: t.done, store: t.objectStore(Stores.TAGS) }
}
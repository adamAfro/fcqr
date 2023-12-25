import { useEffect, useState, useContext, ChangeEvent } from 'react';
import { createContext } from 'react'

import { Database, Stores } from '../memory'
import { useTranslation } from '../localisation'
import { getVoices } from '../speech'
import { useMemory } from '../memory'
import { Context as PocketContext } from '.'

import Button from '../button'

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

export default function() {

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

    return <Context.Provider value={{ status, voices, 
        tags, setTags
    }}>

        <div style={{fontSize:"80%",marginBottom:'5em'}}>
            <ShowAllButton/>
            {tags.map((language) => <Entry {...language}/>)}
            <AddButton/>
        </div>

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

    return <Button symbol='Plus' onClick={async () => {

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
        
        {activeTagId == id ? <span style={{
            margin:'var(--button-radius)',position:'relative'
        }} onClick={() => setActiveTagId(id)}>

            <NameInput/>

            <RemoveButton/>

            <VoiceSelect initValue={props.voice}/>

        </span> : <Button style={{width:`${name.length*.8}em`}} contents={name} attention='none'
            onClick={() => setActiveTagId(id!)}/>}

    </EntryContext.Provider>
}

function NameInput() {

    const { database } = useMemory()!

    const { id, name, setName } = useContext(EntryContext)

    const { t } = useTranslation()

    return <input style={{width:`${name.length*.8}em`}} onChange={async (e: ChangeEvent<HTMLInputElement>) => {

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

    }} style={{
        position:'absolute', top: '100%',left:0,zIndex:100,
        backgroundColor: 'var(--background)',width:'100%'
    }}><option key={crypto.randomUUID()} value={undefined}>{t`no voice`}</option>{voices.map((voice) =>
        <option key={crypto.randomUUID()} value={voice.name}>{voice.name}</option>
    )}</select>
}

function RemoveButton() {

    const { database } = useMemory()!

    const { id, setRemoved } = useContext(EntryContext)

    return <Button symbol='Bin' attention='removal' onClick={async () => {

        setRemoved(true)
        if (!id) return
        
        const { done, store } = readwrite(database)

        await store.delete(id)

        return await done

    }} style={{
        position:'absolute',bottom:'100%',right:'-1em',zIndex:100
    }}/>
}

export function read(db: Database) {

    const t = db.transaction(Stores.TAGS, 'readonly')
    return { done: t.done, store: t.objectStore(Stores.TAGS) }
}

export function readwrite(db: Database) {

    const t = db.transaction(Stores.TAGS, 'readwrite')
    return { done: t.done, store: t.objectStore(Stores.TAGS) }
}
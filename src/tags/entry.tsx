import { useState, useContext } from 'react';
import { createContext } from 'react'

import { Database, Stores, useMemory } from '../memory';
import { useTranslation } from '../localisation'
import { Data, Status, Context } from '.'
import { Context as PocketContext } from '../pocket'

import { Button, Widget, Input } from '../interactions'

import style from './style.module.css'

const EntryContext = createContext({
    
    id: undefined as number | undefined,
    removed: false, setRemoved: (prev: boolean) => {},
    name: '', setName(_:string) {}
})

export default function Entry({ id, ...props }: Data) {

    const { activeTagId, setActiveTagId } = useContext(PocketContext)

    const [name, setName] = useState(props.name)
    const [removed, setRemoved] = useState(false)

    if (removed)
        return null

    return <EntryContext.Provider  value={{
        id, removed, setRemoved, name, setName
    }}>
        
        {activeTagId == id ? <div className={style.entry} onClick={() => setActiveTagId(id)}>

            <NameInput/>

            <RemoveButton/>
    
            <VoiceSelect initValue={props.voice}/>

        </div> : <Button className={style.entry} contents={name} attention='weak' 
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
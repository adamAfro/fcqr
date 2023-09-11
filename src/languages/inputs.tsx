import { useState, useContext } from 'react';
import { createContext } from 'react'

import { Database, Stores } from '../memory';
import { useTranslation } from '../localisation'
import { useMemory } from '../memory'
import { Data, Status, Context } from './'


import style from './style.module.css'
import ui from '../style.module.css'


const InputsContext = createContext({
    
    id: undefined as number | undefined,
    removed: false, setRemoved: (prev: boolean) => {}
})

export default function Inputs({ id, ...props }: Data) {

    const [removed, setRemoved] = useState(false)

    return <InputsContext.Provider  value={{
        id, removed, setRemoved
    }}>
        
        {!removed ? <div className={style.language}>
        
            <div className={style.inputs}>
                <NameInput initValue={props.name}/>
                <LanguageSelect initValue={props.voice}/>
            </div>
            
            <RemoveButton/>

        </div> : null}

    </InputsContext.Provider>
}

function NameInput({ initValue }: {initValue:string}) {

    const { database } = useMemory()!

    const { id } = useContext(InputsContext)

    const [name, setName] = useState(initValue)

    const { t } = useTranslation()

    return <input placeholder={t`not named`} type='text' value={name} onChange={async (e) => {

        setName(e.target.value)
        if (!id) return

        const { done, store } = readwrite(database)
        const language = await store.get(id) as Data

        await store.put({ ...language, name: e.target.value })        
        return await done

    }} />
}

function LanguageSelect({ initValue }: { initValue: undefined | string }) {

    const { database } = useMemory()!
   
    const { voices, status } = useContext(Context)

    const { id } = useContext(InputsContext)

    const [voice, setVoice] = useState(initValue)

    const { t } = useTranslation()

    return <select value={voice} 
        disabled={status == Status.LOADED ? false : true} 
        className={status == Status.FAILED ? ui.wrong : ''}
        onChange={async (e) => {

        setVoice(e.target.value)
        const [voice, code] = e.target.value
        if (!id)
            return
        
        const { done, store } = readwrite(database)

        const deck = await store.get(id) as Data

        await store.put({ ...deck, voice, code })

        return await done

    }}><option key={-1} value={undefined}>{t`no voice`}</option>{voices.map((voice) =>
        <option key={Date.now()} value={[voice.name, voice.lang]}>{voice.name}</option>
    )}</select>
}

function RemoveButton() {

    const { database } = useMemory()!

    const { id, setRemoved } = useContext(InputsContext)

    return <button className={ui.removal} onClick={async () => {

        setRemoved(true)
        if (!id) return
        
        const { done, store } = readwrite(database)

        await store.delete(id)

        return await done

    }}>❌</button>
}

export function readwrite(db: Database) {

    const t = db.transaction(Stores.LANGUAGES, 'readwrite')
    return { done: t.done, store: t.objectStore(Stores.LANGUAGES) }
}
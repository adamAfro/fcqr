import { useEffect, useState, useContext } from 'react';
import { createContext } from 'react'

import { useTranslation } from '../localisation'
import { Data as Language, changeVoice, getAllData, modifyData, rename, removeData, addData } from './database'
import { getVoices } from './speech'
import { useMemory } from '../memory'

import style from './style.module.css'
import ui from '../style.module.css'


enum Status { LOADING, FAILED, LOADED }
export const Context = createContext({
    status: Status.LOADING,
    voices: [] as SpeechSynthesisVoice[],
    configs: [] as Language[],
        setConfigs: (x: (prev: Language[]) => any[]) => {}
})

export default function Languages() {

    const { database } = useMemory()!
    
    const [status, setStatus] = useState(Status.LOADING)
    const [configs, setConfigs] = useState <Language[]> ([])
    useEffect(() => void getAllData(database).then(setConfigs), [])

    const [voices, setVoices] = useState([] as SpeechSynthesisVoice[])
    useEffect(() => {

        const voicesLoad = getVoices()
            .then(v => void setVoices(v))
            .then(_ => void setStatus(Status.LOADED))

        voicesLoad.catch(e => void setStatus(Status.FAILED))

    }, [])

    const { t } = useTranslation()

    return <Context.Provider value={{ status, voices, configs, setConfigs }}>

        <p className={style.prompt}>
            {t`add any language name and select voice for it`}
            {' - '}
            {t`you will be able to use them in decks`}
            <AddButton/>
        </p>

        <ul className={style.languages}>{[...configs].reverse().map((config) =>
            <li key={config.id}>
                <Editor {...config}/>
            </li>
        )}</ul>

    </Context.Provider>
}

function AddButton() {

    const { database } = useMemory()!

    const { setConfigs } = useContext(Context)

    const { t } = useTranslation()

    return <button onClick={() => {

        const added = {
            name: t`new language`,
            voice: undefined as string | undefined,
            code: undefined
        }

        setConfigs(prev => [...prev, added])

        addData(added, database)
        
    }} data-testid="add-voice-btn">{t`add`}</button>
}

const EditorContext = createContext({
    
    id: undefined as number | undefined,
    removed: false, setRemoved: (prev: boolean) => {}
})

function Editor({ id, ...props }: Language) {

    const [removed, setRemoved] = useState(false)

    const { t } = useTranslation()

    return <EditorContext.Provider  value={{
        id, removed, setRemoved
    }}>
        
        {!removed ? <div className={style.language} 
            data-testid={`language-config-${id}`}>
        
            <div className={style.inputs}>
                <NameInput initValue={props.name}/>
                <LanguageSelect initValue={props.voice}/>
            </div>
            
            <RemoveButton/>

        </div> : null}

    </EditorContext.Provider>
}

function NameInput({ initValue }: {initValue:string}) {

    const { database } = useMemory()!

    const { id } = useContext(EditorContext)

    const [name, setName] = useState(initValue)

    const { t } = useTranslation()

    return <input placeholder={t`not named`} type='text' value={name} onChange={e => {

        setName(e.target.value)
        if (id)
            rename(id, e.target.value, database)
    }} />
}

function LanguageSelect({ initValue }: { initValue: undefined | string }) {

    const { database } = useMemory()!
   
    const { voices, status } = useContext(Context)

    const { id } = useContext(EditorContext)

    const [voice, setVoice] = useState(initValue)

    const { t } = useTranslation()

    return <select value={voice} 
        disabled={status == Status.LOADED ? false : true} 
        className={status == Status.FAILED ? ui.wrong : ''}
        onChange={e => {

        setVoice(e.target.value)
        const [name, code] = e.target.value
        if (!id)
            return
        
            changeVoice(id, name, code, database)

    }}><option key={-1} value={undefined}>{t`no voice`}</option>{voices.map((voice) =>
        <option key={Date.now()} value={[voice.name, voice.lang]}>{voice.name}</option>
    )}</select>
}

function RemoveButton() {

    const { database } = useMemory()!

    const { id, setRemoved } = useContext(EditorContext)

    return <button className={ui.removal} onClick={() => {

        setRemoved(true)
        if (id)
            removeData(id, database)

    }}>❌</button>
}
import { useEffect, useState, useContext } from 'react';
import { createContext } from 'react'

import { useTranslation } from '../localisation'
import { LanguageConfig, getVoices } from '../languages'
import { useMemory } from '../memory'

import style from './style.module.css'
import ui from '../style.module.css'


enum Status { LOADING, FAILED, LOADED }
export const Context = createContext({
    status: Status.LOADING,
    voices: [] as SpeechSynthesisVoice[],
    configs: [] as LanguageConfig[],
        setConfigs: (x: (prev: LanguageConfig[]) => any[]) => {}
})

export default function Languages() {
    
    const { languages } = useMemory()!
    
    const [status, setStatus] = useState(Status.LOADING)
    const [configs, setConfigs] = useState(languages)
    const [voices, setVoices] = useState([] as SpeechSynthesisVoice[])

    useEffect(() => {

        const voicesLoad = getVoices()
            .then(v => void setVoices(v))
            .then(_ => void setStatus(Status.LOADED))

        voicesLoad.catch(e => void setStatus(Status.FAILED))

    }, [])

    const { t } = useTranslation()

    return <Context.Provider value={{ status, voices, configs, setConfigs }}>

        <h2>{t`voices and languages`}</h2>

        <p>
            {t`add any language name and select voice for it`}
            {' - '}
            {t`you will be able to use them in decks`}
        </p>

        <AddButton/>

        <ul className={style.languages}>{[...configs].reverse().map((config) =>
            <li key={config.id}>
                <Editor {...config}/>
            </li>
        )}</ul>

    </Context.Provider>
}

function AddButton() {

    const { languages, setLanguages } = useMemory()!
    const getLastId = () =>
        languages.reduce((acc, lang) => Math.max(acc, lang.id ?? 0), 0) || 0

    const { setConfigs } = useContext(Context)

    const { t } = useTranslation()

    return <button onClick={() => {

        const added = {
            id: getLastId() + 1,
            name: t`new language`,
            voice: undefined as string | undefined
        }

        setConfigs(prev => [...prev, added])
        setLanguages([...languages, added ])
        
    }} data-testid="add-voice-btn">{t`add`}</button>
}

const EditorContext = createContext({
    
    id: undefined as number | undefined,
    removed: false, setRemoved: (prev: boolean) => {}
})

function Editor({ id, ...props }: LanguageConfig) {

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

    const { setLanguages } = useMemory()!

    const { id } = useContext(EditorContext)

    const [name, setName] = useState(initValue)

    const { t } = useTranslation()

    return <input placeholder={t`not named`} type='text' value={name} onChange={e => {

        setName(e.target.value)
        setLanguages(prev => {

            const index = prev.findIndex(lang => lang.id === id)
            return [
                ...prev.slice(0, index),
                { ...prev[index], name: e.target.value }, 
                ...prev.slice(index + 1)
            ]
        })
    }} />
}

function LanguageSelect({ initValue }: { initValue: undefined | string }) {

    const { setLanguages } = useMemory()!
   
    const { voices, status } = useContext(Context)

    const { id } = useContext(EditorContext)

    const [voice, setVoice] = useState(initValue)

    const { t } = useTranslation()

    return <select value={voice} 
        disabled={status == Status.LOADED ? false : true} 
        className={status == Status.FAILED ? ui.wrong : ''}
        onChange={e => {

        setVoice(e.target.value)
        setLanguages(prev => {

            const index = prev.findIndex(lang => lang.id === id)
            return [
                ...prev.slice(0, index),
                { ...prev[index],
                    voice: e.target.value, 
                    code: voices
                        .find(voice => voice.name === e.target.value)?.lang
                },
                ...prev.slice(index + 1)
            ]
        })

    }}><option key={-1} value={undefined}>{t`no voice`}</option>{voices.map((voice) =>
        <option key={Date.now()} value={voice.name}>{voice.name}</option>
    )}</select>
}

function RemoveButton() {

    const { setLanguages } = useMemory()!

    const { id, setRemoved } = useContext(EditorContext)

    return <button className={ui.removal} onClick={() => {

        setRemoved(true)
        setLanguages(prev => {

            const index = prev.findIndex(lang => lang.id === id)
            return [
                ...prev.slice(0, index),
                ...prev.slice(index + 1)
            ]
        })

    }}>❌</button>
}
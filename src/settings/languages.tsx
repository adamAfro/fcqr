import { useEffect, useState } from 'react';
import { ChangeEvent, HTMLAttributes } from 'react'

import { useTranslation } from '../localisation'
import { LanguageConfig, getVoices } from '../languages'
import { useMemory } from '../memory'

import style from './style.module.css'

export default function Languages(props: HTMLAttributes<HTMLDivElement>) {
    
    const { languages, setLanguages } = useMemory()!
    const getLastId = () =>
        languages.reduce((acc, lang) => Math.max(acc, lang.id ?? 0), 0) || 0
    
    const [configs] = useState(languages)
    const [addedConfigs, setAddedConfigs] = useState([] as LanguageConfig[])

    const [voices, setVoices] = useState([] as SpeechSynthesisVoice[])
    useEffect(() => void getVoices().then(setVoices), [])

    const { t } = useTranslation()
    return <section {...props}>

        <h2>{t`voices and languages`}</h2>

        <p>
            {t`add any language name and select voice for it`}
            {' - '}
            {t`you will be able to use them in decks`}

            <button style={{
                display:'inline-block',width:'min-content',margin:'0 1em'
            }} data-testid="add-voice-btn" onClick={() => {

                const added = {
                    id: getLastId() + 1,
                    name: t`new language`
                }

                setLanguages([added, ...addedConfigs, ...configs])
                setAddedConfigs([added, ...addedConfigs])

            }}>{t`add`}</button>

        </p>

        {voices.length ? <>

            <ul>{addedConfigs.map((config, i) =>
                <li key={i}>
                    <Editor config={config} voices={voices} />
                </li>
            )}</ul>

            <ul>{configs.map((config, i) =>
                <li key={i}>
                    <Editor config={config} voices={voices} />
                </li>
            )}</ul>
        </> : null}

    </section>
}

/** @TODO loading prompt: sometimes voices need time to load */ 
function Editor({ config, voices }: { config: LanguageConfig, voices: SpeechSynthesisVoice[] }) {

    const { t } = useTranslation()

    const { languages, setLanguages } = useMemory()!
    
    const [removed, setRemoved] = useState(false)
    const [voice, setVoice] = useState(config.voice)
    const [name, setName] = useState(config.name)

    return <>{!removed ? <div className={style.buttons} data-testid={`language-config-${config.id}`}>
        
        <input name='name' type='text' value={name} onChange={(e: ChangeEvent) => {

            const name = (e.target as HTMLSelectElement).value
            setName(name)

            const index = languages.findIndex(lang => lang.id === config.id)
            if (index === -1)
                return

            setLanguages(prev => [
                ...prev.slice(0, index),
                { ...prev[index], name }, 
                ...prev.slice(index + 1)
            ])

        }} />
        
        <select name='voice' defaultValue={voice} onChange={(e: ChangeEvent) => {

            const voice = (e.target as HTMLSelectElement).value
            setVoice(voice)

            const index = languages.findIndex(lang => lang.id === config.id)
            if (index === -1)
                return

            setLanguages([
                ...languages.slice(0, index),
                { ...languages[index], voice }, 
                ...languages.slice(index + 1)
            ])

        }}><option key={-1} value={undefined}>{t`no voice`}</option>
            {voices.map((voice, i) =>
                <option key={i} value={voice.name}>{voice.name}</option>
            )}
        </select>

        <button onClick={() => {

            const index = languages.findIndex(lang => lang.id === config.id)
            if (index === -1)
                return

            setRemoved(true)
            setLanguages([
                ...languages.slice(0, index),
                ...languages.slice(index + 1)
            ])

        }}>{t`remove`}</button>

    </div> : t`removed language`}</>
}

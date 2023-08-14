import { useState } from 'react';

import { MouseEvent, ChangeEvent, HTMLAttributes } from 'react'

import { useTranslation } from '../localisation'

import { LanguageConfig, useSettings } from './context'


import style from './style.module.css'


export default function Voices(props: HTMLAttributes<HTMLDivElement>) {

    const { t } = useTranslation()

    const { languages, setLanguages } = useSettings()

    const getLastId = () => 
        languages.reduce((acc, lang) => Math.max(acc, lang.id ?? 0), 0) || 0
    const add = () => {

        const updatedLangs = [...languages, {
            language: t`new language`, id: getLastId() + 1
        }]

        setLanguages(updatedLangs)
    }

    const remove = (event: MouseEvent) => {

        const target = event.target as HTMLButtonElement
        const id = Number(target.dataset.id)

        const index = languages.findIndex(lang => lang.id === id)
        if (index === -1)
            return

        setLanguages([
            ...languages.slice(0, index),
            ...languages.slice(index + 1)
        ])
    }

    return <section {...props}>

        <h2>{t`voices and languages`}</h2>

        <p>
            {t`add any language name and select voice for it`}
            {' - '}
            {t`you will be able to use them in decks`}
        </p>

        <p className={style.bug}>
            🐛{t`removing may remove wrong language so you may need to refresh this panel after`} 
        </p>

        <button onClick={add}>{t`add`}</button>

        <ul>{languages.map((config, i) =>
            <li key={i}>
                <Editor {...config} />
                <button data-id={config.id} onClick={remove}>{t`remove`}</button>
            </li>
        )}</ul>

    </section>
}

/** @TODO loading prompt: sometimes voices need time to load */ 
function Editor(props: LanguageConfig) {

    const { t } = useTranslation()

    const { languages, setLanguages } = useSettings()

    const voices = speechSynthesis.getVoices()

    const [data, setData] = useState(props)
    const change = (event: ChangeEvent) => {

        const target = event.target as HTMLInputElement | HTMLSelectElement
        const key = target.name, value = target.value

        const updatedLang = { ...data, [key]: value }
        setData(updatedLang)

        const index = languages.findIndex(lang => lang.id === updatedLang.id)
        if (index === -1)
            return
        
        setLanguages([
            ...languages.slice(0, index),
            updatedLang, 
            ...languages.slice(index + 1)
        ])
    }

    return <div className={style.buttons}>
        <input name='language' type='text' value={data.language} onChange={change} />
        <select name='voice' defaultValue={data.voice} onChange={change}>

            <option key={-1} value={undefined}>{t`no voice`}</option>
            {voices.map((voice, i) =>
                <option key={i} value={voice.name}>{voice.name}</option>
            )}
        </select>
    </div>
}
import { useState } from 'react';

import { MouseEvent, ChangeEvent, HTMLAttributes } from 'react'

import { links, Link } from '../app'

import { useTranslation } from '../localisation'

import { LanguageConfig, useSettings } from '../settings'


import style from './style.module.css'


export function Voices(props: HTMLAttributes<HTMLDivElement>) {

    const { t } = useTranslation()

    const { languages, setLanguages } = useSettings()

    /** @TODO make it workkk */
    let lastId = languages.reduce((acc, lang) => Math.max(acc, lang.id ?? 0), 0) || 0
    const add = () => {

        const updatedLangs = [...languages, {
            language: t`new language`, id: lastId++
        }]

        setLanguages(updatedLangs)
    }

    /** @TODO repair it */
    const remove = (event: MouseEvent) => {

        const target = event.target as HTMLButtonElement
        const id = Number(target.dataset.id)

        const index = languages.findIndex(lang => lang.id === id)
        if (index === -1)
            return

        setLanguages([...languages.splice(index, 1)])
    }

    return <section className={style.panel} {...props}>

        <Link role='button' to={links.pocket}>{t`go back`}</Link>

        <h1>{t`voices and languages`}</h1>

        <p>
            {t`add any language name and select voice for it`}
            {' - '}
            {t`you will be able to use them in decks`}
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
        
        /** @TODO update settings */
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
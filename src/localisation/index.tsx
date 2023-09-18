import { default as Localisation } from "i18next"

import { initReactI18next as ReactLocalisation } 
    from "react-i18next"
import LanguageDetector 
    from 'i18next-browser-languagedetector'
import { useTranslation } from 'react-i18next'

import pl from './pl.json'
import en from './en.json'

import { useMemory } from '../memory'

export default function localise() {

    const local = Localisation
        .use(ReactLocalisation)
        .use(LanguageDetector)
        
    return local.init({

        fallbackLng: "en",
        resources: {
            'en': { translation: en },
            'pl': { translation: pl }
        }
    })
}

export const supported = [
    ['pl', "polski"],
    ['en', "English"]
]

export { t, changeLanguage } from 'i18next'
export { useTranslation }

export function Select() {

    const { t } = useTranslation()

    const { language, setLanguage } = useMemory()!

    return <select value={language} data-attention='none' onChange={e => { setLanguage(e.target.value) }}>
        <option key={-1} value='' disabled>{t`of the device`}</option>
        {supported.map(([code, name], i) => 
            <option key={i} value={code}>{name}</option>
        )}
    </select>
}
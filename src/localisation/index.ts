import { default as Localisation } from "i18next"

import { initReactI18next as ReactLocalisation } 
    from "react-i18next"
import LanguageDetector 
    from 'i18next-browser-languagedetector'

import pl from './pl.json'
import en from './en.json'

export default function localise() {

    const local = Localisation
        .use(ReactLocalisation)
        .use(LanguageDetector)
        
    return local.init({

        fallbackLng: "en",
        resources: {
            en: { translation: en },
            pl: { translation: pl }
        }
    })
}

export const supported = {
    pl: "polski",
    en: "English"
}

export { useTranslation } from 'react-i18next'
export { t } from 'i18next'
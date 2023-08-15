import { createContext, useContext, useState, useEffect } 
    from 'react'

import { getVoices } from '../speech'


export interface LanguageConfig {
    id: number
    language: string
    voice?: string
}

const LANG_KEY = 'languages'

const Context = createContext <{
    voices: SpeechSynthesisVoice[],
    setVoices: (voices: SpeechSynthesisVoice[]) => void,
    languages: LanguageConfig[],
    setLanguages: (languages: LanguageConfig[]) => void
}> ({} as any)

export function Provider({ children }: { children: React.ReactNode }) {

    const [languages, setLanguages] = useState([] as LanguageConfig[])
    const [voices, setVoices] = useState([] as SpeechSynthesisVoice[])

    useEffect(() => storeLanugages(languages), [languages])
    useEffect(() => {

        setLanguages(restoreLanguages())
        getVoices().then((loaded) => {

            setVoices(loaded)
            if (languages.length == 0) setLanguages(
                    loaded.map(({ lang, name }, id) => ({ 
                    id, language: lang, voice: name
                }))
            )

        }).catch(er => setVoices([]))

    }, [])

    return <Context.Provider value={{ 
        languages, setLanguages,
        voices, setVoices,
    }}>{children}</Context.Provider>
}

export function useSettings() {
    
    return useContext(Context)
}

function storeLanugages(languages: LanguageConfig[]) {

    localStorage.setItem(LANG_KEY, JSON.stringify(languages))
}

function restoreLanguages() {

    const saved = localStorage.getItem(LANG_KEY)
    if (!saved) 
        return []

    return JSON.parse(saved) as LanguageConfig[]
}
import { createContext, useContext, useState, useEffect } from 'react'


export interface LanguageConfig {
    id: number
    language: string
    voice?: string
}

const LANG_KEY = 'languages'

const Context = createContext <{
    languages: LanguageConfig[],
    setLanguages: (languages: LanguageConfig[]) => void
}> ({} as any)

export function Provider({ children }: { children: React.ReactNode }) {

    const [languages, setLanguages] = useState(restoreLanguages() as LanguageConfig[])

    useEffect(() => storeLanugages(languages), [languages])

    return <Context.Provider value={{ languages, setLanguages }}> 
        {children}
    </Context.Provider>
}

export function useSettings() {
    
    return useContext(Context)
}

function storeLanugages(languages: LanguageConfig[]) {

    localStorage.setItem(LANG_KEY, JSON.stringify(languages))
}

function restoreLanguages() {

    const saved = localStorage.getItem(LANG_KEY)
    if (!saved) return {
        languages: []
    }

    return JSON.parse(saved) as LanguageConfig[]
}
import { createContext, useContext as useReactContext, ReactNode } 
    from 'react'

import { useState, useEffect } 
    from 'react'

import { open as openDB, Type as Database } from './database'

const Context = createContext <{ 

    database: Database | null

}> ({ database: null })


export function useContext() { return useReactContext(Context) }

export function Provider({ children }: { children: ReactNode }) {
    
    const [database, setDatabase] = useState(null as Database | null)

    useEffect(() => void openDB().then(setDatabase), [])

    return <>{database ? 
        
        <Context.Provider value={{ database }}>{children}</Context.Provider> : 
        'no db'
        
    }</>
}

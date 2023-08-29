import { createContext, Dispatch, SetStateAction } 
    from 'react'

import * as Card from '../card'

export enum State {
    NOT_FOUND,
    REMOVED,
    LOADING,
    PARTIAL_LOADED,
    LOADED,
    EXERCISES
}

export interface Props {

    id?: number,

    name?: string,
    setName: Dispatch<SetStateAction<string | undefined>>,

    termLang?: string, 
    setTermLang: Dispatch<SetStateAction<string | undefined>>,

    defLang?: string,
    setDefLang: Dispatch<SetStateAction<string | undefined>>,

    state: State,
    setState: Dispatch<SetStateAction<State>>

    initialCards: Card.Data[], 
    setInitialCards: Dispatch<SetStateAction<Card.Data[]>>
    
    addedCards: Card.Data[],
    setAddedCards: Dispatch<SetStateAction<Card.Data[]>>,
    
    spread: boolean,
    setSpread: Dispatch<SetStateAction<boolean>>
}

export default createContext<Props>({ 

    id: undefined,
    state: State.LOADING, 
    setState: () => {},

    name: undefined,
    setName: () => {},

    termLang: undefined, 
    setTermLang: () => {},
    
    defLang: undefined,
    setDefLang: () => {},

    addedCards: [],
    setAddedCards: () => {}, 

    initialCards: [], 
    setInitialCards: () => {},

    spread: false, 
    setSpread: () => {}
})
import { createContext } from 'react'

import * as Card from '../card'
import { Data as Language } from '../languages/database'

export enum State {
    NOT_FOUND,
    REMOVED,
    LOADING,
    LOADED,
    EXERCISES
}

export const layouts = {
    
    compact: 'compact',
    extended: 'extended',
    quarter: 'quarter',
    grid: 'grid'

} as const

export type Layout = keyof typeof layouts;

export default createContext({ 

    id: -1,

    state: State.LOADING, 
    setState(c:State | ((p:State) => State)) {},

    name: <string | undefined> undefined,
    setName(c:string|((p:string | undefined) => string)) {},

    language: <Language | undefined | null> undefined,
    setLanguage(c:Language|((p:Language | undefined) => Language)) {},

    cards: <Card.Data[]> [], 
    setCards(c:Card.Data[]|((p:Card.Data[]) => Card.Data[])) {},
    
    layout: layouts.compact as Layout,
    setLayout(c:Layout|((p:Layout) => Layout)) {},
})
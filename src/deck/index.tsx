import { useContext, useEffect, useState, ChangeEvent } from 'react'

import { useTranslation } from '../localisation'
import { Data as Language, getAllData as getLanguages } from '../languages/database'
import { useMemory } from "../memory"
import { get, modifyCards, remove, addCards, rename, changeLanguage }
    from './database'

import { Data as CardData } from '../card'
import Card from '../card'

import { Link, links } from '../app'

import { default as Context, Layout, State, layouts } from './context'

import ui from "../style.module.css"
import style from "./style.module.css"

export * from './database'

export default function Deck({ id }: { id: number }): JSX.Element {

    const { database } = useMemory()!

    const [state, setState] = useState(State.LOADING)
    const [name, setName] = useState <string | undefined> (undefined)
    const [language, setLanguage] = useState <Language | undefined | null> (undefined)

    const [cards, setCards] = useState <CardData[]> ([])
    useEffect(() => void get(id, database!).then(({ data, cards, language }) => {

        console.log(language)
        setName(data.name)
        setLanguage(language)
        setCards(cards as CardData[])
        setState(State.LOADED)

    }), [])

    const [layout, setLayout] = useState <Layout> (layouts.compact)

    return <Context.Provider value={{ 
        id, 
        state, setState,
        name, setName,
        language, setLanguage,
        cards, setCards,
        layout, setLayout,
    }}>

        <Quickaccess/>

        {state > State.LOADING ? <Properties/> : null}

        {state >= State.LOADED ? <Cards/> : null}

    </Context.Provider>
}



function Quickaccess() {

    const { state } = useContext(Context)

    const [showRemoval, setShowRemoval] = useState(false)

    const { t } = useTranslation()

    return <nav className={ui.quickaccess}>

        <p className={ui.wideaccess}>
            <Link role="button" to={links.pocket}>{t`go back`}</Link>

            {state == State.LOADED ? <span className={style.dangerzone}>
                <button className={showRemoval ? ui.primary : ''}
                    onClick={() => setShowRemoval(x => !x)} data-testid='show-removal-btn'>🗑</button>

                {showRemoval ? <RemoveButton/> : null}
            </span> : null}
        </p>

        <div className={ui.thumbaccess}>

            <div className={ui.buttonstack}>

                {state == State.LOADED ? <AddButton/> : null}
                {state == State.EXERCISES ? <ShuffleButton/> : null}

                <LayoutButton/>
            </div>

            <ExerciseButton/>
        </div>

    </nav>
}

function ExerciseButton() {

    const { state, setState, id, setCards } = useContext(Context)

    const { database } = useMemory()!

    return <button className={
        state == State.EXERCISES ? '' : ui.primary
    } onClick={() => {

        state != State.EXERCISES ? setState(State.EXERCISES) : setState(State.LOADED)

        setCards([])
        if (id) get(id, database)
            .then(({ cards }) => setCards(cards as CardData[]))
    
    }} data-testid="play-btn">
        {state != State.EXERCISES ? '💪' : '📝'}
    </button>
}

function ShuffleButton() {

    const { id, cards, setCards } = useContext(Context)

    const { database } = useMemory()!

    return <button className={ui.primary} onClick={() => {

        const shuffled = cards?.map(card => ({ ...card, order: Math.random() }))
            .sort((a, b) => a.order! - b.order!).reverse()

        if (id) 
            modifyCards(id, shuffled!, database)
        
        setCards(shuffled)

    }} data-testid="shuffle-cards-btn">🔀</button>
}

function LayoutButton() {

    const { layout, setLayout } = useContext(Context)

    return <button data-testid="layout-cards-btn" onClick={() => {

        const values = Object.values(layouts)
        const index = values.findIndex(v => v == layout)
        setLayout(values[index + 1 < values.length ? index + 1 : 0])
        
    }}>🔍</button>
}



function Properties() {

    const { id } = useContext(Context)

    return <header className={style.properites} data-testid={`deck-${id}`}>
        
        <Name/>

        <LanguageSelect/>

    </header>
}

function Name() {

    const context = useContext(Context)
    const { id } = context

    const { t } = useTranslation()
    const { database } = useMemory()!

    const [name, setName] = useState(context.name)

    return <input className={ui.title} onChange={(e:ChangeEvent) => {

        const target = e.target as HTMLInputElement

        if (id)
            rename(id, target.value, database!)
        
        setName(target.value)
        
    }} placeholder={t`unnamed deck`} type="text" value={name}/>
}

function LanguageSelect() {

    const { database } = useMemory()!

    const { id, language, setLanguage } = useContext(Context)

    const [languages, setLanguages] = useState([] as Language[])
    useEffect(() => void getLanguages(database).then(l => setLanguages(l)), [])

    const { t } = useTranslation()

    return <select onChange={async (e) => {

        const languageId = Number(e.target.value)
        const language = languages
            .find(({ id }) => id == languageId)

        await changeLanguage(id, languageId, database)
        setLanguage(prev => language)
        
    }} value={language?.id}>
        <option key={-1}>{t`no language`}</option>
        {languages.map(({ id, name }) => 
            <option key={id} value={id}>{name}</option>)
        }
    </select>
}


function AddButton() {

    const { id, setCards } = useContext(Context)

    const { database } = useMemory()!

    return <button data-testid="add-card-btn" onClick={() => {

        const card = { term: '', def: '', deckId: id } as CardData
        
        const addition = id ?
            addCards(id, [card], database) : 
            Promise.resolve([0])
        
        addition
            .then(([cardId]) => setCards(prev => [{ ...card, id: Number(cardId) }, ...prev]))

    }}>➕</button>
}

function RemoveButton() {

    const { id, setState } = useContext(Context)

    const { database } = useMemory()!

    const { t } = useTranslation()

    return <Link role='button' className={ui.removal} onClick={() => {

        if (id) remove(id, database)
        setState(State.REMOVED)

    }} to={links.pocket} data-testid="deck-remove-btn">{t`remove deck`}</Link>
}

function Cards() {

    const { cards, state, layout } = useContext(Context)

    return <ul className={style.cardlist}
        data-testid='cards'
        data-layout={layout}>

        {[...cards].sort((a, b) => {

            if (state == State.EXERCISES && a.order !== undefined && b.order !== undefined)
                return a.order - b.order
            
            return b.id! - a.id!

        }).map((card,i) => <li key={card.id}>
            {<Card {...card}/>}
        </li>)}

    </ul>
}

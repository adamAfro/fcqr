import { useContext, useEffect, useState, ChangeEvent } from 'react'

import { useTranslation } from '../localisation'
import { useMemory } from "../memory"
import { get, modifyCards, remove, addCards, getData, rename, changeLanguage }
    from './database'

import { Scanner, Text as TextInput } from './input'
import * as Card from '../card'

import { Link, links } from '../app'

import { default as Context, State } from './context'

import ui from "../style.module.css"
import style from "./style.module.css"

export * from './database'

interface Props {
    name: string,
    termLang: string,
    defLang: string,
    cards: Card.Data[]
}

export default function Deck({ id }: { id: number }): JSX.Element;
export default function Deck(props: Props): JSX.Element;

export default function Deck(props: { id?: number } | Props): JSX.Element {

    const id = ('id' in props) ? props.id : undefined

    const { database } = useMemory()!

    const [state, setState] = useState(('id' in props) ? State.LOADING : State.LOADED)

    const [name, setName] = useState(('name' in props) ? props.name : undefined)
    const [termLang, setTermLang] = useState(('termLang' in props) ? props.termLang : undefined)
    const [defLang, setDefLang] = useState(('defLang' in props) ? props.defLang : undefined)
    useEffect(() => void (!id || getData(id, database!).then(data => {

        if (!data)
            return void setState(State.NOT_FOUND)

        setState(State.PARTIAL_LOADED)
        setName(data.name)
        setTermLang(data.termLang)
        setDefLang(data.defLang)

    })), [])

    const [cards, setCards] = useState(('cards' in props) ? props.cards : [])
    useEffect(() => void (!id || get(id, database!).then(({ cards }) => {

        if (state != State.PARTIAL_LOADED)
            return

        setCards(cards as Card.Data[])
        setState(State.LOADED)

    })), [state])

    const [layout, setLayout] = useState(layouts.compact)

    return <Context.Provider value={{ 
        id, state, setState,
        name, setName,
        termLang, defLang,
        setTermLang, setDefLang, 
        cards, setCards, 
        layout, setLayout,
    }}>

        <Quickaccess/>

        {state > State.LOADING ? <Properties/> : null}

        {state == State.LOADED ? <Options/> : null}

        {state >= State.LOADED ? <Cards/> : null}

    </Context.Provider>
}



function Quickaccess() {

    const { t } = useTranslation()

    return <nav className={ui.quickaccess}>

        <p className={ui.faraccess}>
            <Link role="button" to={links.pocket}>{t`go back`}</Link>
        </p>

        <div className={ui.thumbaccess}>

            <ExerciseButton/>

            <div className={style.buttonstack}>

                <ShuffleButton/>

                <LayoutButton/>
            </div>
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
            .then(({ cards }) => setCards(cards as Card.Data[]))
    
    }} data-testid="play-btn">
        {state != State.EXERCISES ? '💪' : '📝'}
    </button>
}

function ShuffleButton() {

    const { state, id, cards, setCards } = useContext(Context)

    const { database } = useMemory()!

    return <button className={
        state == State.EXERCISES ? ui.primary : ''
    }  onClick={() => {

        const shuffled = cards?.map(card => ({ ...card, order: Math.random() }))
            .sort((a, b) => a.order! - b.order!).reverse()

        if (id) 
            modifyCards(id, shuffled!, database)
        
        setCards(shuffled)

    }} data-testid="shuffle-cards-btn">🔀</button>
}

const layouts = {
    compact: 'compact',
    extended: 'extended',
    quarter: 'quarter',
    grid: 'grid'
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

        <div className={style.languages}>

            <Language subject='term'/>
            <Language subject='def'/>
        
        </div>

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

function Language({ subject }: {subject: 'term' | 'def'}) {

    const { id, termLang, setTermLang, defLang, setDefLang } = useContext(Context)

    const { t } = useTranslation()
    const { database, languages } = useMemory()!

    return <select onChange={(e) => {

        if (id)
            changeLanguage(id, subject == 'term' ? "termLang" : "defLang", e.target.value, database!)

        if (subject == 'term')
            setTermLang(e.target.value)
        else
            setDefLang(e.target.value)
        
    }} defaultValue={subject == 'term' ? termLang : defLang}>
        <option key={-1}>{t`no language`}</option>
        {languages.map(({ id, name }, i) => <option key={id} value={name}>{name}</option>)}
    </select>
}



function Options() {

    const [scanning, setScanning] = useState(false)
    const [showOptions, setShowOptions] = useState(false)

    const { setCards } = useContext(Context)

    const { t } = useTranslation()

    return <section className={style.options}>

        <AddButton/>

        <button
            data-testid={'more-opt-btn'}
            onClick={e => setShowOptions(x => !x)}>
            
            {!showOptions ? t`more options` : t`less options`}
        </button>

        {showOptions ? <>

            <button data-testid="scan-btn" onClick={() => setScanning(prev => !prev)}>
                {scanning ? t`close scanner` : t`scan QR`}
            </button>

            {scanning ? <Scanner onSuccess={cards => {

                setScanning(false)
                setCards(prev => [
                    ...cards, ...prev
                ])

            }} /> : <>
            
                <CopyButton/>

                <TextInput onSuccess={cards => setCards(prev => [
                    ...cards, ...prev
                ])} />

                <RemoveButton/>
            </>}

        </> : null}

    </section>
}

function AddButton() {

    const { id, setCards } = useContext(Context)

    const { database } = useMemory()!

    const { t } = useTranslation()

    return <button data-testid="add-card-btn" onClick={() => {

        const card = { term: '', def: '', deckId: id } as Card.Data
        
        const addition = id ?
            addCards(id, [card], database) : 
            Promise.resolve([0])
        
        addition
            .then(([cardId]) => setCards(prev => [{ ...card, id: Number(cardId) }, ...prev]))

    }} className={ui.primary}>{t`add card`}</button>
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

function CopyButton() {

    const { cards } = useContext(Context)

    const { t } = useTranslation()

    return <button data-testid="deck-copy-btn" onClick={() => {

        const text = cards
            .map(({ term, def }) => `${term} - ${def}`).join('\n')
        navigator.clipboard.writeText(text)

    }}>
        {t`copy as text`}
    </button>
}



function Cards() {

    const { cards, state, layout } = useContext(Context)

    return <ul className={style.cardlist}
        data-testid='cards'
        data-layout={layout}>

        {[...cards].sort((a, b) => {

            if (a.order !== undefined && b.order !== undefined)
                return a.order - b.order
            
            return b.id! - a.id!

        }).map((card,i) => <li key={card.id}>
            {state == State.EXERCISES ?
                <Card.Exercise {...card}/> :
                <Card.Editor {...card}/>
            }
        </li>)}

    </ul>
}

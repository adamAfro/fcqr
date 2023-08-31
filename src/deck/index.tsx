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

    const [addedCards, setAddedCards] = useState([] as Card.Data[])
    const [initialCards, setInitialCards] = useState(('cards' in props) ? props.cards : [])
    useEffect(() => void (!id || get(id, database!).then(({ cards }) => {

        if (state != State.PARTIAL_LOADED)
            return

        setInitialCards(orderLoadedCards(cards) as Card.Data[])
        setState(State.LOADED)

    })), [state])

    const [spread, setSpread] = useState(false)

    return <Context.Provider value={{ 
        id, state, setState,
        name, setName,
        termLang, defLang,
        setTermLang, setDefLang,

        addedCards, setAddedCards, 
        initialCards, setInitialCards, 
        spread, setSpread,
    }}>

        <Quickaccess/>

        {state > State.LOADING ? <Properties/> : null}

        <Options/>

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

                {/* <SpreadButton/> */}
            </div>
        </div>

    </nav>
}

function ExerciseButton() {

    const { state, setState, id, setAddedCards, setInitialCards } = useContext(Context)

    const { database } = useMemory()!

    return <button className={state == State.EXERCISES ? ui.secondary : ''} onClick={() => {

        state != State.EXERCISES ? setState(State.EXERCISES) : setState(State.LOADED)

        setAddedCards([])
        if (id) get(id, database)
            .then(({ cards }) => setInitialCards(orderLoadedCards(cards) as Card.Data[]))
        }} data-testid="play-btn">
        {state != State.EXERCISES ? '💪' : '📝'}
    
    </button>
}

function ShuffleButton() {

    const { state, id, initialCards, setInitialCards } = useContext(Context)

    const { database } = useMemory()!

    return <button className={state != State.EXERCISES ? ui.secondary : ''} data-testid="shuffle-cards-btn" onClick={() => {

        const shuffled = initialCards?.map(card => ({ ...card, order: Math.random() }))
            .sort((a, b) => a.order! - b.order!).reverse()

        if (id) modifyCards(id, shuffled!, database)
        setInitialCards(shuffled)

    }}>🔀</button>
}

function SpreadButton() {

    const { state, spread, setSpread } = useContext(Context)

    return <button className={state != State.EXERCISES ? ui.secondary : ''} data-testid="spread-cards-btn" onClick={() => setSpread(x => !x)}>{
        spread ? '🔼' : '🔽'
    }</button>
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
        {languages.map(({ name }, i) => <option key={i} value={name}>{name}</option>)}
    </select>
}



function Options() {

    const [scanning, setScanning] = useState(false)
    const [showOptions, setShowOptions] = useState(false)

    const { setAddedCards } = useContext(Context)

    const { t } = useTranslation()

    return <section className={style.options}>

        <AddButton/>

        <button className={ui.secondary} 
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
                setAddedCards(prev => [
                    ...cards, ...prev
                ])

            }} /> : <>
            
                <CopyButton/>

                <TextInput onSuccess={cards => setAddedCards(prev => [
                    ...cards, ...prev
                ])} />

                <RemoveButton/>
            </>}

        </> : null}

    </section>
}

function AddButton() {

    const { id, addedCards, setAddedCards } = useContext(Context)

    const { database } = useMemory()!

    const { t } = useTranslation()

    return <button data-testid="add-card-btn" onClick={() => {

        if (id) addCards(id, [{ term: '', def: '' }], database!)
            .then(ids => setAddedCards([{
                id: Number(ids[0]), term: '', def: '', deckId: id
            }, ...addedCards!]))
        else setAddedCards([{
            term: '', def: '', deckId: id
        }, ...addedCards!])

    }}>{t`add card`}</button>
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

    const { addedCards, initialCards } = useContext(Context)

    const { t } = useTranslation()

    return <button data-testid="deck-copy-btn" onClick={() => {

        const text = [...addedCards, ...initialCards!]
            .map(({ term, def }) => `${term} - ${def}`).join('\n')
        navigator.clipboard.writeText(text)

    }}>
        {t`copy as text`}
    </button>
}



function Cards() {

    const {
        termLang, defLang,
        id, addedCards, initialCards,
        state, spread,
        setAddedCards,
    } = useContext(Context)

    const { database } = useMemory()!
    const { t } = useTranslation()

    return <>

        <ul className={style.cardlist}
            data-testid="added-cards"
            data-spread={spread}>

            {addedCards.map((card, i) => <li key={i}>
                {state == State.EXERCISES ?
                    <Card.Exercise {...card}/> :
                    <Card.Editor {...card}/>
                }
            </li>)}

        </ul>

        <ul className={style.cardlist}
            data-testid='cards'
            data-spread={spread}>

            {initialCards?.map((card,i) => <li key={i}>
                {state == State.EXERCISES ?
                    <Card.Exercise {...card}/> :
                    <Card.Editor {...card}/>
                }
            </li>)}

        </ul>
    </>
}

function orderLoadedCards(array: any[]) {

    return array.sort((a, b) => a.order! - b.order!).reverse()
}
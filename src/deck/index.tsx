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

    const [spread, setSpread] = useState(true)

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

    const {
        state, setState,
        id, initialCards,
        setAddedCards, setInitialCards,
        spread, setSpread
    } = useContext(Context)

    const { database } = useMemory()!

    return <nav className={ui.quickaccess}>

        <p className={ui.faraccess}>
            <Link role="button" to={links.pocket}>🃏</Link>
        </p>

        <div className={ui.thumbaccess}>

            <button className={state == State.EXERCISES ? ui.secondary : ''} onClick={() => {

                state != State.EXERCISES ? setState(State.EXERCISES) : setState(State.LOADED)

                setAddedCards([])
                if (id) get(id, database)
                    .then(({ cards }) => setInitialCards(orderLoadedCards(cards) as Card.Data[]))
                }} data-testid="play-btn">
                {state != State.EXERCISES ? '💪' : '📝'}
            </button>

            <div className={style.buttonstack}>
                <button className={state != State.EXERCISES ? ui.secondary : ''} data-testid="shuffle-cards-btn" onClick={() => {

                    const shuffled = initialCards?.map(card => ({ ...card, order: Math.random() }))
                        .sort((a, b) => a.order! - b.order!).reverse()

                    if (id) modifyCards(id, shuffled!, database!)
                    setInitialCards(shuffled)

                }}>🔀</button>

                <button className={state != State.EXERCISES ? ui.secondary : ''} data-testid="spread-cards-btn" onClick={() => setSpread(x => !x)}>{
                    spread ? '🔼' : '🔽'
                }</button>
            </div>
        </div>

    </nav>
}

function Properties() {

    const context = useContext(Context)
    const { 
        id, termLang, defLang,
        setTermLang, setDefLang
    } = context

    const { t } = useTranslation()
    const { database, languages } = useMemory()!

    const [name, setName] = useState(context.name)

    return <header className={style.properites} data-testid={`deck-${id}`}>
        
        <input className={ui.title} onChange={(e:ChangeEvent) => {

            const target = e.target as HTMLInputElement

            if (id)
                rename(id, target.value, database!)
            
            setName(target.value)
            
        }} placeholder={t`unnamed deck`} type="text" value={name}/>

        <div className={style.languages}>

            <select onChange={(e:ChangeEvent) => {
                    
                const target = e.target as HTMLSelectElement

                if (id)
                    changeLanguage(id, "termLang", target.value, database!)
    
                setTermLang(target.value)
                
            }} defaultValue={termLang}>
                <option key={-1}>{t`no term language`}</option>
                {languages.map(({ name }, i) => <option key={i} value={name}>{name}</option>)}
            </select>

            <select onChange={(e:ChangeEvent) => {
                    
                const target = e.target as HTMLSelectElement

                if (id)
                    changeLanguage(id, "defLang", target.value, database!)
    
                setDefLang(target.value)
                
            }} defaultValue={defLang}>
                <option key={-1}>{t`no definition language`}</option>
                {languages.map(({ name }, i) => <option key={i} value={name}>{name}</option>)}
            </select>
        
        </div>

    </header>
}

function Options() {

    const [scanning, setScanning] = useState(false)
    const [showOptions, setShowOptions] = useState(false)

    const {
        setState,
        id, addedCards, initialCards,
        setAddedCards,
    } = useContext(Context)

    const { database } = useMemory()!
    const { t } = useTranslation()

    return <section className={style.options}>

        <button data-testid="scan-btn" onClick={() => setScanning(prev => !prev)}>
            {scanning ? t`close scanner` : t`scan QR`}
        </button>

        {scanning ? <Scanner deckId={id} onSuccess={cards => {

            setScanning(false)
            setAddedCards(prev => [
                ...cards, ...prev
            ])

        }} /> : null}

        {!scanning && showOptions ? <>

            <button className={ui.secondary} onClick={() => setShowOptions(false)}>
                {t`less options`}
            </button>

            <button data-testid="deck-copy-btn" onClick={() => {

                const text = [...addedCards, ...initialCards!]
                    .map(({ term, def }) => `${term} - ${def}`).join('\n')
                navigator.clipboard.writeText(text)

            }}>
                {t`copy as text`}
            </button>

            <TextInput deckId={id} onSuccess={cards => {

                setScanning(false)
                setAddedCards(prev => [
                    ...cards, ...prev
                ])

            }} />

            <Link to={links.pocket} role='button' className={ui.removal} data-testid="deck-remove-btn" onClick={() => {

                if (id) remove(id, database!)
                setState(State.REMOVED)

            }}>{t`remove deck`}</Link>

        </> : !scanning ? <button data-testid='more-opt-btn' onClick={() => setShowOptions(true)} className={ui.secondary}>
            {t`more options`}
        </button> : null}

    </section>
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
        <p>
            {(initialCards?.length || 0) + addedCards.length} {t`of cards`}
            <button data-testid="add-card-btn" onClick={() => {

                if (id) addCards(id, [{ term: '', def: '' }], database!)
                    .then(ids => setAddedCards([{
                        id: Number(ids[0]), term: '', def: '', deckId: id
                    }, ...addedCards!]))
                else setAddedCards([{
                    term: '', def: '', deckId: id
                }, ...addedCards!])

            }}>{t`add`}</button>
        </p>

        <ul className={style.cardlist}
            data-testid="added-cards"
            data-spread={spread}>

            {addedCards.map((card, i) => <li key={i}>
                {state == State.EXERCISES ?
                    <Card.Exercise {...card}
                        termLang={termLang!} defLang={defLang} /> :

                    <Card.Editor {...card}
                        termLang={termLang!} defLang={defLang} />
                }
            </li>)}

        </ul>

        <ul className={style.cardlist}
            data-testid='cards'
            data-spread={spread}>

            {initialCards?.map((card,i) => <li key={i}>
                {state == State.EXERCISES ?
                    <Card.Exercise {...card}
                        termLang={termLang!} defLang={defLang} /> :

                    <Card.Editor {...card}
                        termLang={termLang!} defLang={defLang} />
                }
            </li>)}

        </ul>
    </>
}

function orderLoadedCards(array: any[]) {

    return array.sort((a, b) => a.order! - b.order!).reverse()
}
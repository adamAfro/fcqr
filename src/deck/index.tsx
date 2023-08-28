import { useEffect, useState } from 'react'

import { useTranslation } from '../localisation'
import { useMemory } from "../memory"
import { get, modifyCards, remove, addCards, getData }
    from './database'

import { Scanner, Text as TextInput } from './input'
import * as Card from '../card'
import Editor from './editor'

import { Link, links } from '../app'

import ui from "../style.module.css"
import style from "./style.module.css"

enum State {
    NOT_FOUND,
    REMOVED,
    LOADING,
    PARTIAL_LOADED,
    LOADED,
    EXERCISES
}

export * from './database'

export { default as Editor } from './editor'


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

    const { t } = useTranslation()
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
    const [scanning, setScanning] = useState(false)
    const [showOptions, setShowOptions] = useState(false)

    return <>

        <div className={ui.quickaccess}>

            <div className={ui.faraccess}>
                <p><Link role="button" to={links.pocket}>{t`go back`}</Link></p>
            </div>

            <div className={ui.thumbaccess}>

                <div>

                    <button className={state == State.EXERCISES ? ui.secondary : ''} onClick={() => {

                        state != State.EXERCISES ? setState(State.EXERCISES) : setState(State.LOADED)

                        setAddedCards([])
                        if (id) get(id, database)
                            .then(({ cards }) => setInitialCards(orderLoadedCards(cards) as Card.Data[]))
                    }} data-testid="play-btn">
                        {state != State.EXERCISES ? t`exercises` : t`edition`}
                    </button>

                </div>

                <div className={style.buttonstack}>
                    <button className={state != State.EXERCISES ? ui.secondary : ''} data-testid="shuffle-cards-btn" onClick={() => {

                        const shuffled = initialCards?.map(card => ({ ...card, order: Math.random() }))
                            .sort((a, b) => a.order! - b.order!).reverse()

                        if (id) modifyCards(id, shuffled!, database!)
                        setInitialCards(shuffled)

                    }}>{t`shuffle`}</button>

                    <button className={state != State.EXERCISES ? ui.secondary : ''} data-testid="spread-cards-btn" onClick={() => setSpread(x => !x)}>{
                        spread ? t`shrink` : t`spread`
                    }</button>
                </div>
            </div>

        </div>

        {state > State.LOADING ? <Editor
            deckId={id} initalName={name!}
            termLang={termLang!} defLang={defLang!}
            setTermLang={setTermLang} setDefLang={setDefLang} /> : null}

        <section className={style.options}>

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

                <button data-testid="deck-copy-btn" className={ui.secondary} onClick={() => {

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

        {state >= State.LOADED ? <ul className={style.cardlist}
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

        </ul> : null}

    </>
}

function orderLoadedCards(array: any[]) {

    return array.sort((a, b) => a.order! - b.order!).reverse()
}
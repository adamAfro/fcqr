import { useContext, useState } from 'react'

import { useTranslation } from '../localisation'
import { useMemory } from "../memory"
import { read, readwrite } from './'

import { Data as CardData } from '../card'

import { Link, links } from '../app'

import { Context, State, layouts } from './'


import ui from "../style.module.css"
import style from "./style.module.css"


export default function Quickaccess() {

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

    const { state, setState } = useContext(Context)

    return <button className={
        state == State.EXERCISES ? '' : ui.primary
    } onClick={() => state != State.EXERCISES ? setState(State.EXERCISES) : setState(State.LOADED)} data-testid="play-btn">
        {state != State.EXERCISES ? '💪' : '📝'}
    </button>
}

function ShuffleButton() {

    const { id, cards, setCards } = useContext(Context)

    const { database } = useMemory()!

    return <button className={ui.primary} onClick={async () => {

        const shuffled = cards?.map(card => ({ ...card, order: Math.random() }))
            .sort((a, b) => a.order! - b.order!).reverse()

        setCards(shuffled)

        if (!id) return 
        
        const { done, cardStore } = readwrite(database)

        const modifications = cards.map(card => cardStore.put(card))

        await Promise.all(modifications)
        return await done

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

function AddButton() {

    const { id, setCards } = useContext(Context)

    const { database } = useMemory()!

    return <button data-testid="add-card-btn" onClick={async () => {

        if (!id) 
            return void setCards(prev => [{ ...card, id: -1 }, ...prev])

        const card = { term: '', def: '', deckId: id } as CardData

        const { done, cardStore } = readwrite(database)
        
        const cardId = await cardStore.add({ ...card, deckId: id })
        
        await done
        setCards(prev => [{ ...card, id: Number(cardId) }, ...prev])

    }}>➕</button>
}

function RemoveButton() {

    const { id, setState } = useContext(Context)

    const { database } = useMemory()!

    const { t } = useTranslation()

    return <Link role='button' className={ui.removal} onClick={async () => {

        setState(State.REMOVED)

        if (!id) return 
        
        const { done, store, cardStore } = readwrite(database)

        await store.delete(id)

        const index = cardStore.index('deckId')
        const cards = await index.getAll(IDBKeyRange.only(id)) as CardData[]
        const removals = cards.map(card => cardStore.delete(card.id!))

        await Promise.all(removals)
        
        return await done

    }} to={links.pocket} data-testid="deck-remove-btn">{t`remove deck`}</Link>
}
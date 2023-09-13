import { useContext, useState } from 'react'

import { useTranslation } from '../localisation'
import { useMemory } from "../memory"
import { readwrite } from '.'

import { Data as CardData } from '../card'

import { Link, links } from '../app'

import { Context, State, layouts } from '.'

import style from './style.module.css'

export function Dangerzone() {

    const { database } = useMemory()!

    const { id, setState } = useContext(Context)

    const [show, setShow] = useState(false)

    const { t } = useTranslation()

    return <p className={style.dangerzone}>

        <button className='icon' data-attention='weak' data-active={show}
            onClick={() => setShow(p => !p)}>{show ? '🔙' : '💀'}</button>

        {show ? <Link role='button' className='icon' data-attention='removal' onClick={async () => {

            setState(State.REMOVED)

            if (!id) return 

            const { done, store, cardStore } = readwrite(database)

            await store.delete(id)

            const index = cardStore.index('deckId')
            const cards = await index.getAll(IDBKeyRange.only(id)) as CardData[]
            const removals = cards.map(card => cardStore.delete(card.id!))

            await Promise.all(removals)

            return await done

        }} to={links.pocket}>🗑</Link> : null}

    </p>
}

export function ExerciseButton() {

    const { setState } = useContext(Context)

    return <button className='widget' data-attention='primary' 
        onClick={() => setState(State.EXERCISES)}>💪</button>
}

export function EditButton() {

    const { setState } = useContext(Context)

    return <button className='widget' 
        onClick={() => setState(State.LOADED)}>📝</button>
}

export function ShuffleButton() {

    const { id, cards, setCards } = useContext(Context)

    const { database } = useMemory()!

    return <button className='widget' onClick={async () => {

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

export function LayoutButton() {

    const { layout, setLayout } = useContext(Context)

    return <button className='widget' data-testid="layout-cards-btn" onClick={() => {

        const values = Object.values(layouts)
        const index = values.findIndex(v => v == layout)
        setLayout(values[index + 1 < values.length ? index + 1 : 0])
        
    }}>🔍</button>
}

export function AddButton() {

    const { id, setCards } = useContext(Context)

    const { database } = useMemory()!

    return <button className='widget' onClick={async () => {

        if (!id) 
            return void setCards(prev => [{ ...card, id: -1 }, ...prev])

        const card = { term: '', def: '', deckId: id } as CardData

        const { done, cardStore } = readwrite(database)
        
        const cardId = await cardStore.add({ ...card, deckId: id })
        
        await done
        setCards(prev => [{ ...card, id: Number(cardId) }, ...prev])

    }}>➕</button>
}
import { useContext, useState } from 'react'

import { useMemory } from "../memory"
import { readwrite } from '.'

import { Data as CardData } from '../card'

import { Link, links } from '../app'

import { Context, State, layouts } from '.'

import { Widget, Button } from '../interactions'

import style from './style.module.css'

export function Dangerzone() {

    const { database } = useMemory()!

    const { id, setState } = useContext(Context)

    const [show, setShow] = useState(false)

    return <p className={style.dangerzone}>

        <Widget symbol={show ? 'ArrowBack' : 'Danger'} attention='removal' active={show}
            onClick={() => setShow(p => !p)}/>

        {show ? <Widget symbol='Bin' attention='removal' onClick={async () => {

            setState(State.REMOVED)

            if (!id) return 

            const { done, store, cardStore } = readwrite(database)

            await store.delete(id)

            const index = cardStore.index('deckId')
            const cards = await index.getAll(IDBKeyRange.only(id)) as CardData[]
            const removals = cards.map(card => cardStore.delete(card.id!))

            await Promise.all(removals)

            return await done

        }} to={links.pocket}/> : null}

    </p>
}

export function ExerciseButton() {

    const { setState } = useContext(Context)

    return <Widget big symbol='ABC' attention='primary' 
        onClick={() => setState(State.EXERCISES)}/>
}

export function EditButton() {

    const { setState } = useContext(Context)

    return <Widget big symbol='Pencil' 
        onClick={() => setState(State.LOADED)}/>
}

export function ShuffleButton() {

    const { id, cards, setCards } = useContext(Context)

    const { database } = useMemory()!

    return <Widget big symbol='Shuffle' onClick={async () => {

        const shuffled = cards?.map(card => ({ ...card, order: Math.random() }))
            .sort((a, b) => a.order! - b.order!).reverse()

        setCards(shuffled)

        if (!id) return 
        
        const { done, cardStore } = readwrite(database)

        const modifications = cards.map(card => cardStore.put(card))

        await Promise.all(modifications)
        return await done

    }}/>
}

export function LayoutButton() {

    const { layout, setLayout } = useContext(Context)

    return <Widget big symbol='Magnifier' onClick={() => {

        const values = Object.values(layouts)
        const index = values.findIndex(v => v == layout)
        setLayout(values[index + 1 < values.length ? index + 1 : 0])
        
    }}/>
}

export function AddButton() {

    const { id, setCards } = useContext(Context)

    const { database } = useMemory()!

    return <Widget big symbol='Plus' onClick={async () => {

        if (!id) 
            return void setCards(prev => [{ ...card, id: -1 }, ...prev])

        const card = { term: '', def: '', deckId: id } as CardData

        const { done, cardStore } = readwrite(database)
        
        const cardId = await cardStore.add({ ...card, deckId: id })
        
        await done
        setCards(prev => [{ ...card, id: Number(cardId) }, ...prev])

    }}/>
}
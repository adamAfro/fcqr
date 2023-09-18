import { useContext } from 'react'

import { links } from '../app'
import { useNavigate } from "react-router-dom"   

import { useTranslation } from '../localisation'
import { useMemory } from '../memory'

import * as Deck from '../deck'
import { readwrite } from '../deck/properties'

import { Button, Widget } from '../interactions'

import { Context, Popup } from '.'

import style from './style.module.css'

export default function Entries() {

    const { activeTagId, decks } = useContext(Context)

    return <ul className={style.decks}>

        <li><AddButton/></li>
        
        {(activeTagId >= 0 ? decks.filter(deck => deck.tagId == activeTagId) : decks)
            .map(deck => <li key={deck.id}><Entry {...deck}/></li>)}

    </ul>
}

function Entry(deck: Deck.Data) {

    const { t } = useTranslation()

    return <Button contents={deck.name || t`unnamed deck`} key={deck.id}
        to={links.decks + '/' + deck.id!.toString()}/>
}

function AddButton() {

    const { popup } = useContext(Context)

    const navigate = useNavigate()

    const { database } = useMemory()!

    return <Widget symbol='Plus' attention='primary' onClick={async () => {

        const { done, store } = readwrite(database)
        
        const deckId = Number(await store.add({ name: '' }))
    
        await done
        return void navigate(links.decks + deckId.toString())

    }} disabled={popup != Popup.NONE}/>
}

import { useContext } from 'react'

import { links } from '../app'
import { useNavigate } from "react-router-dom"   

import { useTranslation } from '../localisation'
import { useMemory } from '../memory'

import * as Deck from '../deck'
import { readwrite } from '../deck/properties'

import Button from '../button'

import { Context, OptionName } from '.'

export default function Entries() {

    const { activeTagId, decks } = useContext(Context)

    return <div>

        <AddButton/> 
        {(activeTagId >= 0 ? decks.filter(deck => deck.tagId == activeTagId) : decks)
            .map(deck => <Entry {...deck}/>)}

    </div>
}

function Entry(deck: Deck.Data) {

    const { t } = useTranslation()

    return <Button contents={deck.name || t`unnamed deck`} key={deck.id}
        to={links.decks + '/' + deck.id!.toString()}/>
}

function AddButton() {

    const { activeOption } = useContext(Context)

    const navigate = useNavigate()

    const { database } = useMemory()!

    return <Button symbol='Plus' attention='primary' onClick={async () => {

        const { done, store } = readwrite(database)
        
        const deckId = Number(await store.add({ name: '' }))
    
        await done
        return void navigate(links.decks + deckId.toString())

    }} disabled={activeOption != OptionName.NONE}/>
}

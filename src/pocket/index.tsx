import { useState, useEffect} from 'react'

import { links, Link } from '../app'
    
import { useTranslation } from '../localisation'
import { useMemory } from '../memory'

import * as Deck from '../deck/database'


import style from './style.module.css'
import ui from '../style.module.css'


export default function(props: {
    decks?: Deck.Data[],
    ignoreDatabase?: boolean
}) {

    const { t } = useTranslation()

    const [decks, setDecks] = useState(props.decks || [])

    const { database } = useMemory()!
    useEffect(() => void (props.ignoreDatabase || Deck.getAllData(database)
        .then(decks => setDecks(decks.reverse()))), [database])

    const [addedDecks, setAddedDecks] = useState([] as Deck.Data[])

    const Entry = (props: Deck.Data) => <p>

        {props.id ? <Link className={style.deck} to={links.decks + '/' + props.id.toString()}>
            {props.name || t`unnamed deck`}
        </Link> : <Link className={style.deck} to={links.demo}>
            {props.name || t`unnamed deck`}
        </Link>}

    </p>

    return <>

        <nav className={ui.quickaccess}>
            <div className={ui.faraccess}>
                <p className={ui.brandname}>FCQR</p>
                <p><a target='_blank' href="https://github.com/adamAfro/fcqr">
                    by adamAfro
                </a></p>
                <p><Link role="button" data-testid="preferences-btn" to={links.settings}>{t`edit settings`}</Link></p>
            </div>

            <div className={ui.thumbaccess}>
                <button className={ui.primary} onClick={() => {

                    const deck = { name: '', termLang: '', defLang: '' }
                    
                    if (props.ignoreDatabase)
                        return void setAddedDecks(prev => [...prev, deck])

                    Deck.addData(deck, database)
                        .then(id => setAddedDecks(prev => [...prev, { id, ...deck}]))
                }} data-testid='add-btn'>➕</button>
            </div>
        </nav>

        <h1 className={ui.title}>{t`your decks`}</h1>

        <ul className={style.decklist} data-testid="added-decks">
            {addedDecks.map(deck => <li key={deck.id}><Entry {...deck}/></li>)}
        </ul>

        <ul className={style.decklist} data-testid="decks">
            {decks.map(deck => <li key={deck.id}><Entry {...deck}/></li>)}
        </ul>

    </>
}
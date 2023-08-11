import { useState, useEffect} from 'react'

import { links, Link } from '../app'
    
import { useTranslation } from '../localisation'
import { useDatabase } from '../database'

import * as Deck from '../deck'


import style from './style.module.css'
import ux from '../style.module.css'


export default function(props: any) {

    const { t } = useTranslation()

    const [decks, setDecks] = useState([] as Deck.Data[])

    const database = useDatabase()
    useEffect(() => void Deck.getAllData(database!)
        .then(decks => setDecks(decks.reverse())), [database])

    const [addedDecks, setAddedDecks] = useState([] as Deck.Data[])
    const addDeck = () => {

        const deck = { name: '', termLang: '', defLang: '' }
        Deck.addData(deck, database!)
            .then(id => setAddedDecks(prev => [...prev, { id, ...deck}]))
    }

    const Entry = (props: Deck.Data) => <p>

        <Link role='button' to={links.decks + props.name + '$' + props.id!.toString()}>
            {props.name || t`unnamed deck`}
        </Link>

    </p>


    return <main className={ux.panel} {...props} data-testid="pocket">

        <header className={ux.headline}>
            <div>
                <h1 style={{margin:0}}>FCQR</h1>
                <a target='_blank' href="https://github.com/adamAfro/fcqr">
                    by adamAfro
                </a>
            </div>
            <Link role="button" data-testid="preferences-btn" to={links.settings}>{t`edit settings`}</Link>
        </header>

        <h2>{t`your decks`}</h2>

        <ul className={style.decklist} data-testid="added-decks">
            {addedDecks.map(deck => <li key={deck.id}><Entry {...deck}/></li>)}
        </ul>

        <ul className={style.decklist} data-testid="decks">
            {decks.map(deck => <li key={deck.id}><Entry {...deck}/></li>)}
        </ul>

        <nav className={ux.quickaccess}>
            <button data-testid='add-btn' onClick={addDeck}>{t`add deck`}</button>
        </nav>

    </main>
}
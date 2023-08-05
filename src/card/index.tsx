import { Type as Database, Stores } from '../database'

import style from "./style.module.css"

export function Route() {

    const [deckPath, path] = window.location.pathname.split('/').slice(-2, 2)
    
    const deckId = Number(deckPath?.split('$').pop())
    const id = Number(path?.split('$').pop())
    
    return <Entry id={id} deckId={deckId}/>
}

export interface Data {
    id?: number
    deckId?: number
    term: string
    def: string
}

export function Entry(props: { id: number, deckId: number }) {

    return <>🚧</>
}


export function Card(props: Data) {

    return <p className={style.card} data-testid='card'>
        <span className={style.term}>
            <Letters text={props.term}/>
        </span>
        <span className={style.def}>    
            <Letters text={props.def}/>
        </span>
    </p>
}

function Letters(props: { text: string }) {
    
        return <span className={style.letters}>
            {Array.from(props.text).map(tagCharRandomly)}
        </span>
}

function tagCharRandomly(letter: string, index = 0) {

    return tagChar(letter, index, Math.random(), randInt(1, 5))
}

function tagChar(letter: string, index = 0, seed = 0, variant = 0) {

    return <span key={index} className={style.letter} style={{
        transform: `translate(${.25*seed}em, ${1.25*seed}em)`
    }} data-variant={variant}>
        {letter}
    </span>
}

function randInt(min = 0, max = 1) {

    return Math.floor(Math.random() * (max - min + 1)) + min
}



export async function getAllData(db: Database) {

    const transaction = db.transaction(Stores.CARDS, 'readonly')
    const deckStore = transaction.objectStore(Stores.CARDS)

    const decks = await deckStore.getAll() as Data[]
    await transaction.done

    return decks
}

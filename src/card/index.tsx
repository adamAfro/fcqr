import { useState } from 'react'

import { ChangeEvent, ButtonHTMLAttributes } from 'react'

import { useMemory, Database, Stores } from '../memory'

import { speak } from "../languages"


import ui from "../style.module.css"
import style from "./style.module.css"
import { useTranslation } from 'react-i18next'


export interface Data {
    id?: number
    deckId?: number
    term: string
    def: string
    order?: number
}

export function Card(props: Data) {

    return <p className={style.card} data-testid={`card-${props.id}`}>
        <span className={style.term}>
            <Letters text={props.term}/>
        </span>
        <span className={style.def}>    
            <Letters text={props.def}/>
        </span>
    </p>
}

export function Editor(props: Data & { termLang: string }) {

    const {t} = useTranslation()
    const { database } = useMemory()!

    const [removed, setRemoved] = useState(false)

    const [data, setData] = useState(props)
    const change = (event: ChangeEvent) => {

        const target = event.target as HTMLInputElement | HTMLSelectElement
        const key = target.name, value = target.value

        modifyData({ ...data, [key]: value } as Data, database)
        setData(prev => ({ ...prev, [key]: value }))
    }

    return <>{!removed ? 
        <p className={style.card} data-testid={`card-${data.id}`}>
            <input placeholder={t`term`} className={style.term} name="term" value={data.term} onChange={change}/>
            <Speech term={data.term} termLang={data.termLang}/>
            <textarea placeholder={t`definition`} className={style.def} name="def" value={data.def} onChange={change}/>
            <button data-role="removal" className={ui.removal} onClick={() => {

                removeData(props.id!, database!)
                setRemoved(true)

            }}>{t`remove card`}</button>
        </p> : <>{t`removed card`}</>
    }</>
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

export async function addData(data: Data, db: Database) {

    const transaction = db.transaction([Stores.CARDS], 'readwrite')
    const store = transaction.objectStore(Stores.CARDS)

    const id = Number(await store.add(data))
    await transaction.done

    return id
}

export async function getAllData(db: Database) {

    const transaction = db.transaction(Stores.CARDS, 'readonly')
    const deckStore = transaction.objectStore(Stores.CARDS)

    const decks = await deckStore.getAll() as Data[]
    await transaction.done

    return decks
}

export async function getData(id: number, db: Database) {

    const transaction = db.transaction(Stores.CARDS, 'readonly')
    const store = transaction.objectStore(Stores.CARDS)

    const data = await store.get(id) as Data
    await transaction.done

    return data
}

export async function modifyData(data: Data, db: Database) {

    const transaction = db.transaction(Stores.CARDS, 'readwrite')
    const store = transaction.objectStore(Stores.CARDS)

    await store.put(data)
    await transaction.done

    return true
}

export async function getLast(db: Database) {
    
    const transaction = db.transaction(Stores.CARDS, 'readonly')
    const store = transaction.objectStore(Stores.CARDS)

    const cursor = await store.openCursor(null, "prev")
    await transaction.done
    
    return cursor ? cursor.value : null
}

export async function removeData(id: number, db: Database) {

    const transaction = db.transaction([Stores.CARDS], 'readwrite')
    const store = transaction.objectStore(Stores.CARDS)

    await store.delete(id)
    await transaction.done

    return
}

/** @BUG deck's language change applies only after rerender */
export default function Speech(props: { 
	term: string, termLang: string, def?: string, defLang?: string 
} & ButtonHTMLAttributes<HTMLButtonElement>) {

	const { t } = useTranslation()

    const { languages } = useMemory()!

	const { term, termLang, ...rest } = props

	const readAloud = () => speak(term, { 
		voice: languages.find(lang => lang.name == termLang)?.voice
	})

	return <button onClick={readAloud} {...rest}>
		{t`read aloud`}
	</button>
}
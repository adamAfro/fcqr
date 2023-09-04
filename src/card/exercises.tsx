import { useState, useContext, createContext } from 'react'

import WideContext from '../deck/context'
import Speech from "./speech"
import Hearing from "./hearing"
import { useMemory } from '../memory'

import Color from "color"
import { stringSimilarity as calcSimilarity }
    from 'string-similarity-js'

import style from "./style.module.css"
import ui from "../style.module.css"

interface Props {
    term: string, def: string, 
    vocal?: boolean, audible?: boolean, defined?: boolean
}

const Context = createContext({
    vocal: false, setVocal: (x:boolean) => {},
    audible: false, setAudible: (x:boolean) => {},
    defined: false, setDefined: (x:boolean) => {},
})

export default function Exercise(props: Props) {

    const { termLang, defLang } = useContext(WideContext)
    const termLangCode = useMemory()!.languages
        .find(l => l.name === termLang)?.code

    const [vocal, setVocal] = useState(props.vocal || Math.random() > .5)
    const [audible, setAudible] = useState(props.audible || Math.random() > .5)
    const [defined, setDefined] = useState(props.defined || !audible)

    return <Context.Provider value={{
        vocal, setVocal,
        audible, setAudible,
        defined, setDefined
    }}><p className={style.card}>

        <Input term={props.term} langCode={termLangCode}/>

        <textarea disabled={true} className={style.def} value={defined ? props.def : ''}/>

        <span className={style.options}>

            {audible && termLang ? <Speech
                term={props.term} termLang={termLang}
                def={props.def} defLang={defLang}
            /> : null}

        </span>

    </p></Context.Provider>
}

function Input({ term, langCode }: {
    term: string, langCode?: string
}) {

    const { 
        vocal, setVocal, 
        audible, setAudible, 
        defined, setDefined 
    } = useContext(Context)

    const [answer, setAnswer] = useState('')
    const [similarity, setSimilarity] = useState(0)

    const respond = (value: string) => {

        const sim = calcSimilarity(value, term)

        setAnswer(value)
        setSimilarity(sim)
        if (sim == 1) {
            setAudible(true)
            setDefined(true)
            setAnswer(term)
        }
    }

    return <>

        <input data-is-long={term.length > 15} lang={langCode} 
            className={style.term} type="text" 
            value={answer} onChange={e => {
            respond(e.target.value)
        }} style={{
            color: new Color([255, 0, 0])
                .mix(new Color([0, 255, 0]), similarity == 1 ? similarity : similarity * 1 / 2)
                .string()
        }} placeholder='?'/>

        <span className={style.interactions}>

            {similarity < 1 ? <button onClick={() => {

                if (!audible)
                    return void setAudible(true)
                if (!defined)
                    return void setDefined(true)
                if (!vocal)
                    return void setVocal(true)

                return void respond(hint(answer, term))

            }} className={ui.removal}>❔</button> : null}

            <button style={{marginLeft:"auto"}} onClick={() => {

                setAnswer('')
                setSimilarity(0)

            }} className={ui.removal}>❌</button>

            {langCode && vocal && similarity < 1 ? <Hearing
                setResult={(heard:string) => respond(heard)} 
                langCode={langCode}/> : null}

        </span>

    </>
}

function hint(answer: string, term: string) {

    answer = answer.toLocaleLowerCase()
    term = term.toLocaleLowerCase()

    const initial = calcSimilarity(answer, term)
    let corrected: string
    
    corrected = correctGuess(answer, term)
    if (calcSimilarity(corrected, term) - initial > 0) 
        return corrected

    corrected = addToGuesses(answer, term)
    if (calcSimilarity(corrected, term) - initial > 0)
        return corrected

    return term
}

function correctGuess(answer: string, term: string) {

    const corrects = term.split(' ').filter(x => x.trim())
    const guesses = answer.split(' ').filter(x => x.trim())
    
    for (let i = 0; i < guesses.length; i++) {

        if (corrects.includes(guesses[i]))
            continue

        const sims = corrects.map(x => calcSimilarity(guesses[i], x))
        const m = Math.max(...sims)
        if (m == 0)
            continue

        const correct = corrects[sims.findIndex(s => s == m)]
        guesses.splice(i, 1, correct)
        
        return guesses.join(' ')
    }

    return ''
}

function addToGuesses(answer: string, term: string) {

    const all = term.split(' ').filter(x => x.trim())
    const provided = answer.split(' ').filter(x => x.trim())
        .filter(x => all.includes(x))

    if (provided.length == 0)
        return randomFrom(all)
        
    const indices = Array.from(all.keys()).filter(i => !provided.includes(all[i]))
    const randomIndex = randomFrom(indices)
    const indexToInsert = mapIndexToOrder(randomIndex, provided, all)

    provided.splice(indexToInsert, 0, all[randomIndex])

    return provided.join(' ')
}

function mapIndexToOrder(randomIndex: number, provided: any[], all: any[]) {

    let index = 0;
    while (index < provided.length + 1 && index < randomIndex) {

        const nextRealIndex = all.findIndex(x => x == provided[index])
        if (nextRealIndex > randomIndex)
            break

        index++
    }

    return index
}

function randomFrom(ar: any[]) {

    return ar[Math.floor(Math.random() * ar.length)]
}
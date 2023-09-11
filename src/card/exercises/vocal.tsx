import { useState, useContext } from 'react'

import { Context as DeckContext } from '../../deck'

import { Context, Speech, color, Hearing } from '../'

import { stringSimilarity as calcSimilarity }
    from 'string-similarity-js'

import style from "../style.module.css"
import ui from "../../style.module.css"

export default function Vocal() {

    const { language } = useContext(DeckContext)

    const { 
        term, 
        audible, setAudible, 
        defined, setDefined 
    } = useContext(Context)

    const [answer, setAnswer] = useState('')
    const [similarity, setSimilarity] = useState(0)
    function respond(value: string) {

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

        <input className={style.term} data-is-long={term.length > 15}
            value={answer} lang={language?.code} spellCheck={false}
            onChange={e => void respond(e.target.value)} 
            style={{ color: color(similarity) }} 
            placeholder='?' disabled/>
    
        <span className={style.interactions}>

            {similarity < 1 && (!defined || !audible)  ? <button onClick={() => {

                if (!defined)
                    return void setDefined(true)

                if (!audible)
                    return void setAudible(true)

            }} className={ui.removal}>❔</button> : null}

            {audible ? <Speech term={term}/> : null}
            <Hearing setResult={(heard:string) => respond(heard)}/>

        </span>
    
    </>
}
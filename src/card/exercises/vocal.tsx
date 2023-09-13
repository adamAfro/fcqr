import { useState, useContext, useEffect, createContext } from 'react'

import { Context as DeckContext } from '../../deck'
import { Context, Speech, color, Hearing } from '../'

import { stringSimilarity as calcSimilarity }
    from 'string-similarity-js'

import style from "../style.module.css"

const ExerciseContext = createContext({
    audible: false, setAudible: (_:boolean) => {},
    defined: false, setDefined: (_:boolean) => {}
})

export default function Vocal() {

    const { language, muted } = useContext(DeckContext)

    const { term } = useContext(Context)

    const [audible, setAudible] = useState(!muted && Math.random() > .5)
    useEffect(() => setAudible(!muted && Math.random() > .5), [muted])
    
    const [defined, setDefined] = useState(!audible)
    useEffect(() => (!defined && !audible) ? setDefined(true) : void null, [
        defined, audible
    ])

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

    return <ExerciseContext.Provider value={{
        audible, setAudible, 
        defined, setDefined
    }}>

        <input className={style.term} data-is-long={term.length > 15}
            value={answer} lang={language?.code} spellCheck={false}
            onChange={e => void respond(e.target.value)} 
            style={{ color: color(similarity) }} 
            placeholder='?' disabled/>

        <Definition/>
    
        <span className={style.interactions}>

            {similarity < 1 && (!defined || !audible) ? <HintButton/> : null}

            {audible ? <Speech/> : null}

            <Hearing setResult={(heard:string) => respond(heard)}/>

        </span>
    
    </ExerciseContext.Provider>
}

function Definition() {

    const { def } = useContext(Context)

    const { defined } = useContext(ExerciseContext)

    return <textarea className={style.def} 
        disabled={true} value={defined ? def : ''}/>
}

function HintButton() {

    const { audible, setAudible, defined, setDefined } = useContext(ExerciseContext)

    return <button className='icon' onClick={() => {

        if (!defined)
            return void setDefined(true)

        if (!audible)
            return void setAudible(true)

    }}>❔</button>
}
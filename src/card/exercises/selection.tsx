import { useState, useContext, useEffect, createContext } from 'react'

import { Context as DeckContext } from '../../deck'
import { Context, Speech, color } from '../'
import { randomInt, randomFrom, randomWeighted } 
    from '../../misc'

import { stringSimilarity as calcSimilarity }
    from 'string-similarity-js'

import Button from '../../button'

const ExerciseContext = createContext({
    isCorrect: false, setIsCorrect: (isCorrect:boolean) => {},

    audible: false, setAudible: (_:boolean) => {},
    defined: false, setDefined: (_:boolean) => {}
})

/**
 * @deprecated
 */
export default function Selection({ guesses }: { guesses: [string, number][]}) {

    const { muted } = useContext(DeckContext)

    const [isCorrect, setIsCorrect] = useState(false)

    const [audible, setAudible] = useState(!muted && Math.random() > .5)
    useEffect(() => setAudible(!muted && Math.random() > .5), [muted])
    
    const [defined, setDefined] = useState(!audible)
    useEffect(() => (!defined && !audible) ? setDefined(true) : void null, [
        defined, audible
    ])

    return <ExerciseContext.Provider value={{ 
        isCorrect, setIsCorrect,

        audible, setAudible, 
        defined, setDefined
    }}>

        <span className='term' data-is-long={true}>{guesses.map(([text, sim], i) => <Option 
            text={text} sim={sim} key={i}
        />)}</span>

        <Definition/>
    
        <span>

            {!isCorrect && !(audible && defined) ? <HintButton/> : null}

            {audible ? <Speech/> : null}

        </span>

    </ExerciseContext.Provider>
}

function Definition() {

    const { def } = useContext(Context)

    const { isCorrect, defined } = useContext(ExerciseContext)

    return <textarea className='def' disabled={true} value={(defined || isCorrect) ? def : ''}/>
}

function Option({ text, sim }: { text: string, sim: number }) {

    const { isCorrect, setIsCorrect } = useContext(ExerciseContext)

    const [showSim, setShowSim] = useState(false)

    return <button disabled={isCorrect && sim != 1}
        style={showSim ? {color: color(sim)} : {}} 
        onClick={() => {
            setShowSim(true)
            if (sim == 1)
                setIsCorrect(true)
        }
    }>{text}</button>
}

export function randomGuesses(term: string, cards: { term: string }[]) {

    const texts = cards.map(c => c.term).filter(x => x != term)
    const sims = texts.map(t => calcSimilarity(t, term))

    const guesses = [] as [string, number][]
    for (let i = 0; i < 3; i++) {
        
        let index = randomWeighted(sims)
        if (index == -1)
            index = randomFrom([...sims.keys()])
        
        guesses.push([texts[index], sims[index]])
        sims.splice(index, 1)
        texts.splice(index, 1)
    }

    guesses.splice(randomInt(0, guesses.length), 0, [term, 1])

    return guesses
}

function HintButton() {

    const { audible, setAudible, defined, setDefined } = useContext(ExerciseContext)

    const { muted } = useContext(DeckContext)

    return <Button symbol='Bulb' attention='removal' onClick={() => {

        if (!defined)
            return void setDefined(true)

        if (!audible && !muted)
            return void setAudible(true)

    }}/>
}
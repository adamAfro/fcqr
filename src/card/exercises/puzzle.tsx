import { useState, useContext, useEffect, createContext } from 'react'

import { Context as DeckContext } from '../../deck'
import { Context, Speech, color } from '../'
import { randomInt, randomFrom, randomWeighted } from '../../misc'

import { stringSimilarity as calcSimilarity }
    from 'string-similarity-js'

import Button from '../../button'

const ExerciseContext = createContext({
    index: 0, setIndex: (index:number) => {}, length: 0,
    isCorrect: false, setIsCorrect: (isCorrect:boolean) => {},

    audible: false, setAudible: (_:boolean) => {},
    defined: false, setDefined: (_:boolean) => {}
})

export default function Puzzle({ guesses, length }: { guesses: [string, number][], length: number}) {

    const { muted } = useContext(DeckContext)

    const [isCorrect, setIsCorrect] = useState(false)
    const [index, setIndex] = useState(0)

    const [audible, setAudible] = useState(!muted && Math.random() > .5)
    useEffect(() => setAudible(!muted && Math.random() > .5), [muted])
    
    const [defined, setDefined] = useState(!audible)
    useEffect(() => (!defined && !audible) ? setDefined(true) : void null, [
        defined, audible
    ])

    return <ExerciseContext.Provider value={{ 
        isCorrect, setIsCorrect,
        index, setIndex, length,
        
        audible, setAudible, 
        defined, setDefined
    }}>

        <span className='term' data-is-long={true}>
            {guesses.map(([text, order], i) => <Option 
                text={text} order={order} key={i}
            />)}
        </span>

        <Definition/>
    
        <span>

            {!isCorrect && !(audible && defined) ? <HintButton/> : null}

            {(audible || isCorrect) ? <Speech/> : null}

        </span>

    </ExerciseContext.Provider>
}

function Definition() {

    const { def } = useContext(Context)

    const { isCorrect, defined } = useContext(ExerciseContext)

    return <textarea className='def' disabled={true} value={(defined || isCorrect) ? def : ''}/>
}

enum Status { INCORRECT, UNANSWERED, CORRECT }
function Option({ text, order }: { text: string, order: number }) {

    const { 
        index, setIndex, length,
        isCorrect, setIsCorrect 
    } = useContext(ExerciseContext)
    
    const [status, setStatus] = useState(Status.UNANSWERED)
 
    return <button disabled={isCorrect && status != Status.CORRECT}
        style={status != Status.UNANSWERED ? {
            color: color(status == Status.CORRECT ? 1 : 0)
        } : {}} onClick={() => {
            
            if (status == Status.CORRECT)
                return

            if (index == order) {
                if (index + 1 == length)
                    setIsCorrect(true)
                setIndex(index + 1)

                return setStatus(Status.CORRECT)
            }

            return setStatus(Status.INCORRECT)
        }
    }>{text} ({isCorrect && order >= 0 ? (order + 1) : '?'})</button>
}

export function randomGuesses(term: string, cards: { term: string }[]) {

    const corrects = term.split(' ')
    const words = cards.map(c => c.term.split(' ')).flat()
        .filter(word => !corrects.includes(word))

    const guesses = [] as [string, number][]
    for (const word of corrects) {
        
        const sims = words.map(w => calcSimilarity(w, word))
        for (let i = 0, n = Math.random() * 2; i < n; i++) {
            
            let index = randomWeighted(sims)
            if (index == -1)
                index = randomFrom([...sims.keys()])
            
            guesses.push([words[index], -1])
            sims.splice(index, 1)
            words.splice(index, 1)
        }
    }

    for (let i = 0; i < corrects.length; i++)
        guesses.splice(randomInt(0, guesses.length), 0, [ corrects[i], i ])

    return guesses
}

function HintButton() {

    const { muted } = useContext(DeckContext)

    const { audible, setAudible, defined, setDefined } = useContext(ExerciseContext)

    return <Button symbol='Bulb' onClick={() => {

        if (!defined)
            return void setDefined(true)

        if (!audible && !muted)
            return void setAudible(true)

    }}/>
}
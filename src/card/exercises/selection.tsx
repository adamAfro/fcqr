import { useState, useContext, createContext } from 'react'

import { Context, Speech, color } from '../'
import { randomInt, randomFrom, randomWeighted } 
    from '../../misc'

import { stringSimilarity as calcSimilarity }
    from 'string-similarity-js'

import style from "../style.module.css"
import ui from "../../style.module.css"


const Options = createContext({
    isCorrect: false, setIsCorrect: (isCorrect:boolean) => {}
})

export default function Selection({ guesses }: { guesses: [string, number][]}) {

    const { audible } = useContext(Context)

    const [isCorrect, setIsCorrect] = useState(false)

    return <Options.Provider
        value={{ isCorrect, setIsCorrect }}>

        <span className={style.selection}>
            {guesses.map(([text, sim], i) => <Option 
                text={text} sim={sim} key={i}
            />)}
        </span>

        {audible ? <span className={style.interactions}>
            <Speech/>
        </span>:null}

    </Options.Provider>
}

function Option({ text, sim }: { text: string, sim: number }) {

    const { isCorrect, setIsCorrect } = useContext(Options)

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
        console.log(i, term, index, cards[index]?.term, sims[index])
        if (index == -1)
            index = randomFrom([...sims.keys()])
        
        guesses.push([texts[index], sims[index]])
        sims.splice(index, 1)
        texts.splice(index, 1)
    }

    guesses.splice(randomInt(0, guesses.length), 0, [term, 1])

    return guesses
}
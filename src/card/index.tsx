import { useState, useContext, createContext, useEffect } from 'react'

import { Context as DeckContext, State } from '../deck'

import Button from '../button'

import './default.css'

import { listen } from '../recognition'
import { speak } from '../speech'
import Color from "color"

import * as Exercises from './exercises'
import * as Inputs from './inputs'

export interface Data {
    id?: number
    deckId?: number
    term: string
    def: string
    order?: number
}

export enum ExerciseMode {
    TEXT = 'text',
    VOCAL = 'vocal',
    SELECTION_TEXT = 'selection-text',
    PUZZLE_TEXT = 'puzzle-text'
}

export const Context = createContext({

    id: -1,
    term: '', setTerm(_:string) {},
    def: '', setDef(_:string) {},
    removed: false, setRemoved(_:boolean) {},
        
    mode: ExerciseMode.TEXT, setMode: (_:ExerciseMode) => {}
})

export default function({ id, ...props}: Data) {

    const { silent, muted, state, cards } = useContext(DeckContext)

    const [removed, setRemoved] = useState(false)
    const [term, setTerm] = useState(props.term)
    const [def, setDef] = useState(props.def)
    
    const [mode, setMode] = useState(Exercises.random({ silent }))

    return <Context.Provider value={{

        id: id!, 
        removed, setRemoved,
        term, setTerm,
        def, setDef,
        mode, setMode

    }}>{removed || <p className='card' data-testid={`card-${id}`}>

        {state == State.EDITION ? <>

            <Inputs.Term/>

            <Inputs.Definition/>

            <span>
                <Inputs.Options/>

                {!muted ? <Speech/>:null}
            </span>

        </> : {

            [ExerciseMode.TEXT]: <Exercises.Text/>,
            [ExerciseMode.VOCAL]: <Exercises.Vocal/>,
            [ExerciseMode.SELECTION_TEXT]: <Exercises.Selection.default
                guesses={Exercises.Selection.randomGuesses(term, cards)}/>,
            [ExerciseMode.PUZZLE_TEXT]: <Exercises.Puzzle.default length={term.split(' ').length}
                guesses={Exercises.Puzzle.randomGuesses(term, cards)}/>

        }[mode]}

    </p>}</Context.Provider>
}

export function Hearing({ setResult }: { 
    setResult: (x:string) => void, 
}) {

    const { tag } = useContext(DeckContext)

	const [listening, setListening] = useState(false)

    if (!tag || !tag.code) return <Button symbol='SpeakerOff'/>

    return <Button symbol='Microphone' onClick={!listening ? () => {
        
        setListening(true)
        listen(alts => setResult(alts[0].trim()), { langCode: tag.code! })

    } : () => setListening(false)}/>}

export function Speech() {

    const { term } = useContext(Context)

    const { voice = undefined } = useContext(DeckContext).tag || {}

	return <Button symbol='Speaker' onClick={() => speak(term, { voice })}/>
}

export function color(value = 0) {

    return new Color([255, 0, 0])
        .mix(new Color([0, 255, 0]), value == 1 ? value : value * 1 / 2)
        .string()
}
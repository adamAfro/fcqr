import { useState, useContext, createContext, useEffect } from 'react'

import { Context as DeckContext, State } from '../deck'

import { listen } from '../languages/recognition'
import { speak } from '../languages/speech'
import Color from "color"

import * as Exercises from './exercises'
import * as Inputs from './inputs'

import style from "./style.module.css"

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
        
    mode: ExerciseMode.TEXT, setMode: (_:ExerciseMode) => {},
    audible: false, setAudible: (_:boolean) => {},
    defined: false, setDefined: (_:boolean) => {}
})

export default function({ id, ...props}: Data) {

    const { muted, silent } = useContext(DeckContext)

    const [removed, setRemoved] = useState(false)
    const [term, setTerm] = useState(props.term)
    const [def, setDef] = useState(props.def)

    const [audible, setAudible] = useState(!muted && Math.random() > .5)
    useEffect(() => setAudible(!muted && Math.random() > .5), [muted])
    
    const [defined, setDefined] = useState(!audible)
    useEffect(() => !defined ? setDefined(true) : void null, [audible])
    
    const [mode, setMode] = useState(Exercises.random({ silent }))

    return <Context.Provider value={{

        id: id!, 
        removed, setRemoved,
        term, setTerm,
        def, setDef,

        audible, setAudible,
        defined, setDefined,
        
        mode, setMode

    }}>{removed || <p className={style.root} data-testid={`card-${id}`}>

        <Term/>

        <Definition/>

    </p>}</Context.Provider>
}

function Term() {

    const { state, cards, muted } = useContext(DeckContext)

    const { mode, term } = useContext(Context)

    if (state == State.LOADED) {

        return <>
            <Inputs.Term/>
            <Inputs.Options/>
            {!muted ? <span className={style.interactions}>
                <Speech/>
            </span>:null}
        </>
    }

    if (mode == ExerciseMode.TEXT)
        return <Exercises.Text/>

    if (mode == ExerciseMode.VOCAL)
        return <Exercises.Vocal/>

    if (mode == ExerciseMode.SELECTION_TEXT)
        return <Exercises.Selection.default
            guesses={Exercises.Selection.randomGuesses(term, cards)}/>

    if (mode == ExerciseMode.PUZZLE_TEXT)
        return <Exercises.Puzzle.default length={term.split(' ').length}
            guesses={Exercises.Puzzle.randomGuesses(term, cards)}/>

    return <p>?</p>
}

function Definition() {

    const { state } = useContext(DeckContext)

    const { def, defined } = useContext(Context)

    if (state == State.LOADED)
        return <Inputs.Definition/>

    return <textarea disabled={true} className={style.def} value={defined ? def : ''}/>
}



export function Hearing({ setResult }: { 
    setResult: (x:string) => void, 
}) {

    const { language } = useContext(DeckContext)

	const [listening, setListening] = useState(false)

    if (!language || !language.code) return <button>
        🔇
    </button>

	return <button className='icon' onClick={!listening ? () => {
        
        setListening(true)
        listen(alts => setResult(alts[0].trim()), { langCode: language.code! })

    } : () => setListening(false)}>🎤</button>
}

export function Speech() {

    const { term } = useContext(Context)

    const { voice = undefined } = useContext(DeckContext).language || {}

	return <button className='icon' onClick={() => speak(term, { voice })}>
		🔈
	</button>
}

export function color(value = 0) {

    return new Color([255, 0, 0])
        .mix(new Color([0, 255, 0]), value == 1 ? value : value * 1 / 2)
        .string()
}
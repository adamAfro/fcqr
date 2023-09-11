import { useState, useContext, createContext } from 'react'

import WideContext from '../deck/context'
import { listen } from '../languages/recognition'
import { randomInt, randomFrom, randomWeighted, indexToSubindex, randomSubstring } 
    from '../misc'

import { speak } from '../languages/speech'

import Color from "color"
import { stringSimilarity as calcSimilarity }
    from 'string-similarity-js'

import style from "./style.module.css"
import ui from "../style.module.css"

interface Props {
    term: string, def: string, 
    audible?: boolean, defined?: boolean
}

enum InputMode {
    TEXT = 'text',
    VOCAL = 'vocal',
    SELECTION_TEXT = 'selection-text',
    PUZZLE_TEXT = 'puzzle-text'
}

const Context = createContext({

    term: '',
        
    mode: InputMode.TEXT, setMode: (_:InputMode) => {},
    audible: false, setAudible: (_:boolean) => {},
    defined: false, setDefined: (_:boolean) => {}
})

export default function Exercise(props: Props) {

    const { cards, language } = useContext(WideContext)

    const [audible, setAudible] = useState(language?.code ? (props.audible || Math.random() > .5) : false)
    const [defined, setDefined] = useState(props.defined || !audible)
    const [mode, setMode] = useState(randomFrom(audible ? [
        InputMode.TEXT,
        InputMode.VOCAL,
        InputMode.SELECTION_TEXT,
        InputMode.PUZZLE_TEXT
    ] : [
        InputMode.TEXT,
        InputMode.SELECTION_TEXT,
        InputMode.PUZZLE_TEXT
    ]))

    return <Context.Provider value={{

        audible, setAudible,
        defined, setDefined,
        
        mode, setMode,
        
        term: props.term

    }}><p className={style.card}>

        {mode == InputMode.TEXT ? <Text.Interactions/> : null}
        {mode == InputMode.VOCAL ? <Vocal.Interactions/> : null}
        {mode == InputMode.SELECTION_TEXT ? 
            <Selection.Text guesses={Selection.randomGuesses(props.term, cards)}/> : null}
        {mode == InputMode.PUZZLE_TEXT ? 
            <Puzzle.Text length={props.term.split(' ').length} 
                guesses={Puzzle.randomGuesses(props.term, cards)}/> : null}

        <textarea disabled={true} className={style.def} value={defined ? props.def : ''}/>

    </p></Context.Provider>
}

namespace Text {

    export function Interactions() {

        const { language } = useContext(WideContext)

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
                placeholder='?'/>
        
            <span className={style.interactions}>
    
                {similarity < 1 ? <button onClick={() => {
    
                    if (!defined)
                        return void setDefined(true)
    
                    if (!audible)
                        return void setAudible(true)
    
                    return void respond(hint(answer, term, { substring: true }))
    
                }} className={ui.removal}>❔</button> : null}
   
                {audible ? <Speech term={term}/> : null} 
    
                <button className={ui.primary} onClick={e => {
    
                    respond('')
    
                    const btn = e.target as HTMLButtonElement
                    const input = (btn.parentElement?.previousElementSibling) as HTMLElement
    
                    input.focus()
    
                }}>⌨</button>

            </span>
        </>
    }
    
    function hint(answer: string, term: string, { substring = false } = {}) {

        answer = answer.toLocaleLowerCase()
        term = term.toLocaleLowerCase()
    
        const initial = calcSimilarity(answer, term)
        let corrected: string
        
        corrected = correctGuess(answer, term)
        if (calcSimilarity(corrected, term) - initial > 0) 
            return corrected
    
        corrected = addToGuesses(answer, term, substring)
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
    
    function addToGuesses(answer: string, term: string, substring = false) {
    
        const all = term.split(' ').filter(x => x.trim())
        const provided = answer.split(' ').filter(x => x.trim())
            .filter(x => all.includes(x))
    
        if (provided.length > 0) return substring ? 
            randomSubstring(randomFrom(all)) : 
            randomFrom(all)
            
        const indices = Array.from(all.keys()).filter(i => !provided.includes(all[i]))
        const guessIndex = randomFrom(indices)
        const indexToInsert = indexToSubindex(guessIndex, provided, all)
        
        const guess = substring ? 
            randomSubstring(all[guessIndex]) : 
            all[guessIndex]
        
        provided.splice(indexToInsert, 0, guess)
    
        return provided.join(' ')
    }
}

namespace Vocal {

    export function Interactions() {

        const { language } = useContext(WideContext)

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
}

namespace Selection {

    const Options = createContext({
        isCorrect: false, setIsCorrect: (isCorrect:boolean) => {}
    })

    export function Text({ guesses }: { guesses: [string, number][]}) {

        const { term,  audible } = useContext(Context)
    
        const [isCorrect, setIsCorrect] = useState(false)
    
        return <Options.Provider
            value={{ isCorrect, setIsCorrect }}>
    
            <span className={style.selection}>
                {guesses.map(([text, sim], i) => <Option 
                    text={text} sim={sim} key={i}
                />)}
            </span>

            <span className={style.interactions}>

                {audible ? <Speech term={term}/> : null} 
            </span>
    
        </Options.Provider>
    }

    function Option({ text, sim }: { text: string, sim: number }) {
    
        const { isCorrect, setIsCorrect } = useContext(Options)
    
        const [showSim, setShowSim] = useState(false)
    
        return <button disabled={isCorrect && sim != 1} className={ui.primary}
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
    
            console.log(i, term, index, cards[index].term, sims[index])
            
            guesses.push([texts[index], sims[index]])
            sims.splice(index, 1)
            texts.splice(index, 1)
        }
    
        guesses.splice(randomInt(0, guesses.length), 0, [term, 1])
    
        return guesses
    }
}

namespace Puzzle {

    const Options = createContext({
        index: 0, setIndex: (index:number) => {}, length: 0,
        isCorrect: false, setIsCorrect: (isCorrect:boolean) => {}
    })

    export function Text({ guesses, length }: { guesses: [string, number][], length: number}) {

        const [index, setIndex] = useState(0)
        const [isCorrect, setIsCorrect] = useState(false)

        const { term, audible } = useContext(Context)
    
        return <Options.Provider
            value={{ index, setIndex, length, isCorrect, setIsCorrect }}>
    
            <span className={style.selection}>
                {guesses.map(([text, order], i) => <Option 
                    text={text} order={order} key={i}
                />)}
            </span>

            <span className={style.interactions}>

                {audible ? <Speech term={term}/> : null} 
            </span>
    
        </Options.Provider>
    }

    enum Status { INCORRECT, UNANSWERED, CORRECT }
    function Option({ text, order }: { text: string, order: number }) {
    
        const { 
            index, setIndex, length,
            isCorrect, setIsCorrect 
        } = useContext(Options)
        
        const [status, setStatus] = useState(Status.UNANSWERED)
     
        return <button disabled={isCorrect && status != Status.CORRECT} 
            className={ui.primary} 
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
        }>{text}</button>
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
}

function Hearing({ setResult }: { 
    setResult: (x:string) => void, 
}) {

    const { language } = useContext(WideContext)

	const [listening, setListening] = useState(false)

    if (!language || !language.code) return <button>
        🔇
    </button>

	return <button onClick={!listening ? () => {
        
        setListening(true)
        listen(alts => setResult(alts[0].trim()), { langCode: language.code! })

    } : () => setListening(false)}>🎤</button>
}

function Speech({ term }: { term: string }) {

    const { voice = undefined } = useContext(WideContext).language || {}

	return <button onClick={() => speak(term, { voice })}>
		🔈
	</button>
}

function color(value = 0) {

    return new Color([255, 0, 0])
        .mix(new Color([0, 255, 0]), value == 1 ? value : value * 1 / 2)
        .string()
}
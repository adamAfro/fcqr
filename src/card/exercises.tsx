import { useState } from 'react'

import Speech from "./speech"

import style from "./style.module.css"

export function Random(props: RandomProps) {
    
    const Ex = [...exercises.values()][Math.floor(Math.random() * exercises.size)]
    const ans = [...answers.keys()][Math.floor(Math.random() * answers.size)]

    return <Ex {...props} answer={ans}/>
}

export function Audible({ term, def, answer, termLang, defLang }: ExerciseProps) {

    const Answer = answers.get(answer)!

    return <p className={style.card}>

        <Answer correct={term} />
        <Speech
            term={term} termLang={termLang}
            def={def} defLang={defLang}/>
        <div className={style.def}></div>

    </p>
}

export function Defined({ term, def, answer, termLang, defLang }: ExerciseProps) {

    const Answer = answers.get(answer)!

    return <p className={style.card}>

        <Answer correct={term} />
        
        <div className={style.def}>{def}</div>

    </p>
}

export function Named() {

    return <p className={style.card}></p>
}

function Input({ correct }: { correct: string }) {

    const [similarity, setSimiliarity] = useState(0)
    const [value, setValue] = useState('')

    return <label>

        <input className={style.term} type="text" value={value} style={{color:color(similarity)}} onChange={e => {

            setValue(e.target.value)
            setSimiliarity(compare(e.target.value, correct))

        }}/>

        <span className={style.points}>{Math.round(similarity)}/100</span>

    </label>
}


interface RandomProps {
    term: string, termLang: string,
    def?: string, defLang?: string
}

interface ExerciseProps extends RandomProps {
    answer: AnswerType,
}

enum ExerciseType {
    AUDIBLE = 'audible', 
    DEFINED = 'defined', 
    //NAMED = 'named'
}

const exercises = new Map([
    [ExerciseType.AUDIBLE, Audible],
    [ExerciseType.DEFINED, Defined],
    //[ExerciseType.NAMED, Named]
])

enum AnswerType {
    VOCAL = 'vocal',
    SELECT = 'select',
    INPUT = 'input'
}

const answers = new Map([

    [AnswerType.INPUT, Input],
    //[AnswerType.SELECTION, Selection],
    //[AnswerType.VOCAl, Vocal]

]) as Map<AnswerType, (props: {
    correct: string, options?: string[]
}) => JSX.Element>


function compare(a: string, b: string, positionWeight = 1.5): number {

    const max = Math.max(a.length, b.length)
    let common = 0

    for (let i = 0; i < max; i++) {
        if (i < a.length && i < b.length) {

            if (a[i] === b[i])
                common += 1*positionWeight
            else if (i > 0 && a[i - 1] === b[i - 1])
                common += 1/positionWeight
            else if (i < a.length - 1 && i < b.length - 1 && a[i + 1] === b[i + 1])
                common += 1/positionWeight
        }
    }

    return (common / (max * positionWeight)) * 100
}

function color(value: number, minValue = 0, maxValue = 100) {
    const normalizedValue = (value - minValue) / (maxValue - minValue)
    const hue = 120 * normalizedValue
    const lightness = 25
  
    return `hsl(${hue}, 100%, ${lightness}%)`
}
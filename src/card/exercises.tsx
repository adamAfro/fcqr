import { useState } from 'react'

import Speech from "./speech"
import Hearing from "./hearing"

import style from "./style.module.css"

interface Props {
    term: string, termLang: string,
    def: string, defLang?: string,
    vocal?: boolean, audible?: boolean
}

export default function Exercise({ 
    term, termLang, def, defLang, 
    vocal = true, //Math.random() < 0.5 ? true : false,
    audible = Math.random() < 0.5 ? true : false
}: Props) {

    const [similarity, setSimiliarity] = useState(0)
    const [answer, setAnswer] = useState('')

    return <p className={style.card}>

        <label>

            <input className={style.term} type="text" value={answer} onChange={e => {

                setAnswer(e.target.value)
                setSimiliarity(compare(e.target.value, term))

            }} style={{color:color(similarity)}} disabled={vocal}/>

            <span className={style.points}>{Math.round(similarity)}/100</span>

        </label>

        <span className={style.buttons}>

            {!audible || <Speech
                term={term} termLang={termLang}
                def={def} defLang={defLang}
            />}

            {!vocal || <Hearing 
                setResult={setAnswer} lang={termLang}
            />}

        </span>

        <span className={style.def}>{def}</span>

    </p>
}

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
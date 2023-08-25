import { useState } from 'react'

import Speech from "./speech"
import Hearing from "./hearing"

import { useTranslation } from 'react-i18next'

import Color from "color"
import { stringSimilarity as calcSimilarity } 
    from 'string-similarity-js'

import style from "./style.module.css"
import ui from "../style.module.css"

interface Props {
    term: string, termLang: string,
    def: string, defLang?: string,
    vocal?: boolean, audible?: boolean, defined?: boolean
}

export default function Exercise({ 
    term, termLang, def, defLang,
    vocal = true,
    audible = Math.random() < 0.5,
    defined = !audible
}: Props) {

    return <div className={style.card}>

        <Input term={term} termLang={termLang} vocal={vocal}/>

        <span className={style.def}>{defined ? def : null}</span>

        <span className={style.options}>
            
            {!audible || <Speech
                term={term} termLang={termLang}
                def={def} defLang={defLang}
            />}

        </span>
    </div>
}

function Input({ term, termLang, vocal }: { 
    term: string, termLang: string, vocal: boolean
}) {

    const [answer, setAnswer] = useState('')
    const [similarity, setSimilarity] = useState(0)

    const { t } = useTranslation()

    return <div>

        <p className={style.buttons}>
            <input className={style.term} type="text" value={answer} onChange={e => {
                setAnswer(e.target.value)
                setSimilarity(calcSimilarity(e.target.value, term))

            }} style={{
                color: new Color([126,0,0])
                    .mix(new Color([0, 126, 0]), similarity == 1 ? similarity : similarity * 1/2 )
                    .string()
                }
            }/>
        </p>

        {!vocal || <Hearing
            setResult={x => setAnswer(p => p + ' ' + x)} lang={termLang}
        />}
        
        <button onClick={() => {

            if (answer.length == 0) {

                const hint = term.slice(0, term.indexOf(' '))
                setAnswer(hint)
                setSimilarity(calcSimilarity(hint, term))

                return
            }
                
            let end = answer.length
            for (end; end < term.length; end++)
                if (term[end] == ' ') break
            
            const hint = term.slice(0, end + 1)
            setAnswer(hint)
            setSimilarity(calcSimilarity(hint, term))

        }} className={ui.removal}>{t`hint`}</button>

    </div>
}
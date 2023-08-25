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

    const [hint, setHint] = useState(false)

    return <div className={style.card}>

        <Input term={term} termLang={termLang} vocal={vocal} hint={hint} setHint={setHint} />

        <span className={style.def}>{defined || hint ? def : null}</span>

        <span className={style.options}>

            {audible || hint ? <Speech
                term={term} termLang={termLang}
                def={def} defLang={defLang}
            /> : null}

        </span>
    </div>
}

function Input({ term, termLang, vocal, hint, setHint }: {
    term: string, termLang: string, vocal: boolean, 
    hint: boolean, setHint: (x:boolean) => void
}) {

    const [answer, setAnswer] = useState('')
    const [similarity, setSimilarity] = useState(0)

    const respond = (value: string) => {

        setAnswer(value)
        setSimilarity(calcSimilarity(value, term))
        if (value == term) 
            setHint(true)
    }

    const { t } = useTranslation()

    return <div>

        <p className={style.buttons}>

            <input className={style.term} type="text" value={answer} onChange={e => {
                respond(e.target.value)
            }} style={{
                color: new Color([126, 0, 0])
                    .mix(new Color([0, 126, 0]), similarity == 1 ? similarity : similarity * 1 / 2)
                    .string()
            }}/>

            {vocal && similarity < 1 ? <Hearing
                setResult={(heard:string) => respond(heard)} 
                lang={termLang}/> : null}
        </p>

        <div className={style.buttons}>

            {similarity < 1 ? <button onClick={() => {

                if (!hint)
                    return void setHint(true)

                if (answer.length == 0)
                    return void respond(term.slice(0, term.indexOf(' ')))

                let end = answer.length
                for (end; end < term.length; end++)
                    if (term[end] == ' ') break

                return void respond(term.slice(0, end + 1))

            }} className={hint ? ui.removal : ui.secondary}>{t`hint`}</button> : null}

            <button style={{marginLeft:"auto"}} onClick={() => {

                setAnswer('')
                setSimilarity(0)

            }} className={ui.removal}>{t`cancel`}</button>

        </div>

    </div>
}
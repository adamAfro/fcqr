import { useState, ChangeEvent } from 'react'

import { useMemory } from '../memory'
import { Data, modifyData, removeData } from './database'

import Speech from "./speech"

import ui from "../style.module.css"
import style from "./style.module.css"
import { useTranslation } from 'react-i18next'


export default function Editor(props: Data & { 
    termLang: string, defLang?: string
}) {

    const {t} = useTranslation()
    const { database } = useMemory()!

    const [removed, setRemoved] = useState(false)

    const [data, setData] = useState(props)
    const change = (event: ChangeEvent) => {

        const target = event.target as HTMLInputElement | HTMLSelectElement
        const key = target.name, value = target.value

        if (props.id)
            modifyData({ ...data, [key]: value } as Data, database)
    
        setData(prev => ({ ...prev, [key]: value }))
    }

    return <>{!removed ? 
        <p className={style.card} data-testid={`card-${data.id}`}>
            <input placeholder={t`term`} className={style.term} name="term" value={data.term} onChange={change}/>
            <textarea placeholder={t`definition`} className={style.def} name="def" value={data.def} onChange={change}/>
            
            <span className={style.options}>
        
                <button data-role="removal" className={ui.removal} onClick={() => {

                    if (props.id)
                        removeData(props.id, database!)
                    
                    setRemoved(true)

                }}>❌</button>

                <Speech term={data.term} termLang={props.termLang}/>
            
            </span>
        
        </p> : <>{t`removed card`}</>
    }</>
}
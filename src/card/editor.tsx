import { useState, ChangeEvent, useContext } from 'react'

import WideContext from '../deck/context'

import { useMemory } from '../memory'
import { Data, modifyData, removeData } from './database'

import Speech from "./speech"

import ui from "../style.module.css"
import style from "./style.module.css"
import { useTranslation } from 'react-i18next'


export default function Editor({ id, ...props }: Data) {
    
    const { termLang, defLang } = useContext(WideContext)

    const { database } = useMemory()!

    const [removed, setRemoved] = useState(false)
    const [term, setTerm] = useState(props.term)
    const [def, setDef] = useState(props.def)
    
    const { t } = useTranslation()

    return <>{!removed ? 
        
        <p className={style.card} data-testid={`card-${id}`}>

            <input data-is-long={term.length > 15} className={style.term} onChange={(e) => {

                if (id)
                    modifyData({ id, ...props, def, term: e.target.value } as Data, database)
                
                setTerm(e.target.value)

            }} placeholder={t`term`} value={term}/>


            <textarea className={style.def} onChange={(e) => {

                if (id)
                    modifyData({ id, ...props, def: e.target.value, term } as Data, database)
                
                setDef(e.target.value)

            }} placeholder={t`definition`} value={def}/>
            

            <span className={style.options}>
        
                <button data-role="removal" className={ui.removal} onClick={() => {

                    if (id)
                        removeData(id, database!)
                    
                    setRemoved(true)

                }}>❌</button>

                {!termLang || <Speech term={term} termLang={termLang}/>}
            
            </span>
        

        </p> : null
    }</>
}

import { useState, ChangeEvent, HTMLAttributes }  from 'react'

import { useTranslation } from '../localisation'
import { useMemory } from "../memory"
import { rename, changeLanguage } 
    from './database'

import ux from "../style.module.css"
import style from "./style.module.css"

export default function Editor({ 
    deckId, initalName, termLang, defLang, 
    setTermLang, setDefLang,
    ...htmlAttr
}: {
    deckId: number,
    initalName: string,
    termLang: string,
    defLang: string,
    setTermLang: ReturnType<typeof useState <string>>[1],
    setDefLang: ReturnType<typeof useState <string>>[1]
} & HTMLAttributes<HTMLParagraphElement>) {

    const { t } = useTranslation()
    const { database, languages } = useMemory()!

    const [name, setName] = useState(initalName)

    return <header className={style.properites} data-testid={`deck-${deckId}`}>
        
        <input className={ux.title} onChange={(e:ChangeEvent) => {

            const target = e.target as HTMLInputElement

            rename(deckId!, target.value, database!)
            setName(target.value)
            
        }} placeholder={t`unnamed deck`} type="text" value={name}/>

        <div className={style.languages}>

            <select onChange={(e:ChangeEvent) => {
                    
                const target = e.target as HTMLSelectElement

                changeLanguage(deckId!, "termLang", target.value, database!)
                setTermLang(target.value)
                
            }} defaultValue={termLang}>
                <option key={-1}>{t`no term language`}</option>
                {languages.map(({ name }, i) => <option key={i} value={name}>{name}</option>)}
            </select>

            <select onChange={(e:ChangeEvent) => {
                    
                const target = e.target as HTMLSelectElement

                changeLanguage(deckId!, "defLang", target.value, database!)
                setDefLang(target.value)
                
            }} defaultValue={defLang}>
                <option key={-1}>{t`no definition language`}</option>
                {languages.map(({ name }, i) => <option key={i} value={name}>{name}</option>)}
            </select>
        
        </div>

    </header>
}
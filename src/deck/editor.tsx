import { useState, ChangeEvent, HTMLAttributes }  from 'react'

import { useTranslation } from '../localisation'
import { useMemory } from "../memory"
import { rename, changeLanguage } 
    from './database'

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

    return <p data-testid={`deck-${deckId}`} {...htmlAttr}>
        
        <input placeholder={t`unnamed deck`} name="name" type="text" value={name} onChange={(e:ChangeEvent) => {

            const target = e.target as HTMLInputElement

            rename(deckId!, target.value, database!)
            setName(target.value)
            
        }}/>

        <span className={style.buttons}>

            <select name="termLang" defaultValue={termLang} onChange={(e:ChangeEvent) => {
                    
                const target = e.target as HTMLSelectElement

                changeLanguage(deckId!, "termLang", target.value, database!)
                setTermLang(target.value)
                
            }}>{languages.map(({ name }, i) => <option key={i} value={name}>{name}</option>)}</select>

            <select name="defLang" defaultValue={defLang} onChange={(e:ChangeEvent) => {
                    
                const target = e.target as HTMLSelectElement

                changeLanguage(deckId!, "defLang", target.value, database!)
                setDefLang(target.value)
                
            }}>{languages.map(({ name }, i) => <option key={i} value={name}>{name}</option>)}</select>
        
        </span>
    </p>
}
import { Data } from './database'

import style from "./style.module.css"


export * from './database'
export * from './exercises'

export { default as Editor } from './editor'

export default function Card(props: Data) {

    return <p className={style.card} data-testid={`card-${props.id}`}>
        <span className={style.term}>
            {props.term}
        </span>
        <span className={style.def}>    
            {props.def}
        </span>
    </p>
}
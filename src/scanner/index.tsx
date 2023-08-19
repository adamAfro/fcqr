import { HTMLAttributes, useState } from 'react'

import { useMemory, Database } from "../memory"

import Chunk from './chunk'
import QR from './html5qr'


import style from './style.module.css'


enum Status {
    NOT_FOUND = 0, 
    FOUND, READ, ADDED
}

/** @TODO remove db requirement here to somewhere else */
export default (props: { 
    handleData?: (data: string, meta: any, db: Database) => void
} & HTMLAttributes <HTMLDivElement>) => {

    const { database } = useMemory()!
    const 
        [checkPoints, setCheckpoints] = useState([] as boolean[]),
        [status, setStatus] = useState(Status.NOT_FOUND)

    let data: Chunk[] = [], 
        meta: any = {}, 
        indices: number[] = []
    
    const onScan = (decodedText = '') => {

        setStatus(Status.FOUND)
        
        const dataChunk = Chunk.FromDecodedText(decodedText)
        if (!dataChunk)
            return

        setStatus(Status.READ)

        const hasBeenRead = indices.includes(dataChunk.index)
        if (hasBeenRead)
            return

        indices.push(dataChunk.index)
        if (dataChunk.meta)
            meta = { ...meta, ...dataChunk.meta }
        
        data.push(dataChunk.data)

        if (indices.length == dataChunk.total) {

            if (props.handleData)
                props.handleData(data.sort((a,b) => a.index - b.index).join(''), meta, database)

            data = []
            meta = {}
            indices = []
        }

        setStatus(Status.ADDED)

        setCheckpoints(prev => {

            const checkPoints = [] as boolean[]
            for (let i = 0; i < dataChunk.total; i++)
                checkPoints.push(indices.includes(i))

            return checkPoints
        })
    }

    const onError = () => void (setStatus(Status.NOT_FOUND))

    const Checkpoints = () => <div className={style.checkpoints}>
        {checkPoints.map((state, i) => <div style={{display: 'flex'}}>
            <input key={i} type="checkbox" disabled defaultChecked={state}/>
        </div>)}
    </div>

    return <div className={style.scanner}>

        <QR className={style.camera} data-status={status} 
            onScan={onScan} onError={onError}/>

        <Checkpoints />

    </div>
}
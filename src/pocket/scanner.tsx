import { useEffect, HTMLAttributes, useState } from 'react'

import { Html5QrcodeScanner as Scanner, Html5QrcodeSupportedFormats as Formats } 
    from 'html5-qrcode'

import { Widget } from '../interactions'

import style from './style.module.css'

enum Status {
    NOT_FOUND = 0, 
    FOUND, READ, ADDED
}

/** @TODO remove db requirement here to somewhere else */
export default (props: { 
    handleData?: (data: string, meta: any) => void
} & HTMLAttributes <HTMLDivElement>) => {

    const 
        [checkPoints, setCheckpoints] = useState([] as boolean[]),
        [status, setStatus] = useState(Status.NOT_FOUND)

    let data: string[] = [], 
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

            const zip = [] as [number, string][]
            for (let i = 0; i < data.length; i++)
                zip.push([indices[i], data[i]])

            if (props.handleData)
                props.handleData(zip.sort(([a],[b]) => a - b).map(([n, txt]) => txt).join(''), meta)

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

    return <div className={style.scanner}>

        <QR className={style.camera} data-status={status} 
            onScan={onScan} onError={onError}/>

        <div className={style.checkpoints}>
            {checkPoints.map(state =>
                <Widget symbol='QR' active={state} labeled={<input type="checkbox" disabled defaultChecked={state}/>}/>)
            }
        </div>

    </div>
}

class Chunk {

    data: any = null
    index: number = -1
    total: number = 0
    meta?: any

    constructor(props: { data: any, index: number, total: number, meta: any }) {

        this.data = props.data
        this.index = props.index
        this.total = props.total
        this.meta = props.meta
    }

    static FromDecodedText(text: string) {

        let output = JSON.parse(text)
        const isDataChunk =
            output.data !== undefined &&
            output.index !== undefined &&
            output.total !== undefined
        if (!isDataChunk)
            return

        return new Chunk({ 
            data: output.data,
            index: output.index,
            total: output.total,
            meta: output.meta
        })
    }
}

function QR(props: {
    onScan: (dataString: string) => void, 
    onError: (error: any) => void
} & HTMLAttributes <HTMLDivElement>) {

    const { onScan, onError, ...attrs } = props

    useEffect(() => {
        
        const scanner = new Scanner("html5qr-code-full-region", {

            fps: 5, formatsToSupport: [Formats.QR_CODE]
    
        }, /** verbose */ false)

        scanner.render(onScan, onError)

        const unmount = () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error)
            })
        }

        return unmount
        
    }, [])

    return <div {...attrs} id={"html5qr-code-full-region"}></div>
}
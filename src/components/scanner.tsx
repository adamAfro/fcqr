import { Html5QrcodeScanner as Scan } from 'html5-qrcode'

import { useEffect, useState } from 'react'



/**
 * @example
 * // Sender side:
 * showQRDataFrames([ 
 *      { index: 0, total: 2, data: '...' },
 *      { index: 1, total: 2, data: '...' } 
 * ], { milisecondsBetweenFrames: 256, width: 256 })
 *
 * // Receiver's device scans the QR codes  1 by 1
 * import QR from this_file
 * <...>
 *      <QR done={useState([] as any[] | undefined)}
 *          data={useState(false as boolean | undefined)}
 *          meta={useState({} as any)} />
 * </...>
 */
export default (props: { 
    id?: string, 
    width?: number, 
    height?: number,
    data: ReturnType <typeof useState <any[]> >,
    done: ReturnType <typeof useState <boolean> >,
    meta: ReturnType <typeof useState <any> >
}) => {

    const width = (props.width || props.height) || 256
    const height = (props.height || props.width) || 256
    const id = props.id || 'qr-scanner'
         
    const [dataChunks, setData] = props.data
    const [isDone, setDone] = props.done
    const [metaData, setMeta] = props.meta
    
    const [progress, setProgress] = useState(0)
    const [total, setTotal] = useState(NaN)

    const indices = [] as number[]

    function onScan(decodedText = '') {

        if (indices.length == total) {
      
            setDone(true)
      
            return
        }
      
        let output = JSON.parse(decodedText)
        if (!isDataChunk(output))
            return
  
        const hasBeenRead = indices.includes(output.index)
        if (hasBeenRead)
            return
        
        indices.push(output.index)
        
        setData((prev) => [...prev as any[], output.data as any])
        setTotal(output.total)
        setProgress(indices.length)

        if (output.meta)
            setMeta((prev: any) => ({ ...output.meta, ...prev }))
    }

    useEffect(() => {

        const scan = new Scan(id, configure({width,height}), false)
            
        scan.render(onScan, console.error)

        return function onUnmount() {
         
            scan.clear()
                .catch(e => console.error("QR clearing failed", e))
        }

    }, [])

    return <div data-testid={id}>

        <div id={id}></div>
        <p>
            <span>{progress.toString()}</span>/<span>{total.toString()}</span>
        </p>

    </div>
}



function configure(props: any) {
    
    const config = {} as any
    if (props.fps) 
        config.fps = props.fps
    
    if (props.qrbox) 
        config.qrbox = props.qrbox
    
    if (props.aspectRatio) 
        config.aspectRatio = props.aspectRatio
    
    if (props.disableFlip !== undefined) 
        config.disableFlip = props.disableFlip
    
    return config
}



function isDataChunk(obj: any) {

    return obj &&
        obj.data !== undefined &&
        obj.index !== undefined &&
        obj.total !== undefined
}
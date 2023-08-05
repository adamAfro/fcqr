import { useState } from 'react'

import QR from './html5qr'

import style from './style.module.css' 


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
    setData: ReturnType <typeof useState <any[]> >[1],
    setDone: ReturnType <typeof useState <boolean> >[1],
    setMeta: ReturnType <typeof useState <any> >[1]
}) => {
    
    const indices = [] as number[]
    const 
        [checks, setChecks] = useState([] as boolean[]), 
        [total, setTotal] = useState(0)

    const onScan = (decodedText = '') => {
        
        let output = JSON.parse(decodedText)
        const isDataChunk = 
            output.data !== undefined &&
            output.index !== undefined &&
            output.total !== undefined
        if (!isDataChunk)
            return
  
        const hasBeenRead = indices.includes(output.index)
        if (hasBeenRead)
            return
        
        indices.push(output.index)
        
        props.setData((prev) => [...prev as any[], output.data as any])
        setTotal(output.total)
        setChecks(() => {

            const checks = [] as boolean[]
            for (let i = 0; i < output.total; i++)
                checks.push(indices.includes(i))

            return checks
        })

        if (output.meta)
            props.setMeta((prev: any) => ({ ...output.meta, ...prev }))

        if (indices.length == output.total) {
      
            props.setDone(true)
      
            return
        }
    }

    return <div className={style.scanner}>

        <QR onSuccess={onScan} onError={(e) => console.error(e)}/>
        {checks.map((state, i) => <div style={{display: 'flex'}}>
            <span 
                key={i} className={style.check} 
                data-checked={state}>
            </span>
        </div>)}

    </div>
}
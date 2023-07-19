import { Sets } from '../utilities/storage'

import Scanner from "./scanner"
import Card from './card'

import { useState, useEffect } from 'react'

export default function(props: any) {

    const [dataChunks, setData] = useState([] as any[] | undefined)
    const [scanned, setScanned] = useState(false as boolean | undefined)
    const [metaData, setMetaData] = useState({} as any | undefined)

    const [scanner, setScanner] = useState(false)
    const [cardsData, setCardsData] = useState([] as [string, string][])
    function chooseCardsData() {

        if (scanned && dataChunks) {

            Sets.create(dataChunks as string[], metaData as any)

            const data = dataChunks
                .map(chunk => chunk.split('\n')).flat()
                .map(line => line.split(',')) as [string, string][]

            return setCardsData(data)
        }

        const saved = Sets.get()
        if (saved)
            return setCardsData(saved)
    }

    const ActiveScanner = (props: {}) => scanner ? <Scanner
        id='scanner'
        done={[scanned, setScanned]}
        data={[dataChunks, setData]}
        meta={[metaData, setMetaData]}/> : null

    const ExistentCards = (props: {}) => cardsData.length ? <ul>
        
        {cardsData.map(([x, y], i) => <Card key={i} issue={x} comment={y} />)}
    
    </ul> : null

    useEffect(chooseCardsData, [scanned])

    return <main>

        <button data-testid='scanner-button'
            onClick={click => setScanner(prev => !prev)}>

            Scan QR

        </button>
        
        <ActiveScanner/>
        <ExistentCards/>

    </main>
}
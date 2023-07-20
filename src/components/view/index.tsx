import { Sets } from '../../utilities/storage'

import Scanner from "../scanner"
import Card from '../card'

import { useState, useEffect } from 'react'

import style from "./style.module.css"



export default function(props: any) {

    const [csvDataChunks, setData] = useState([] as any[] | undefined)
    const [scanned, setScanned] = useState(false as boolean | undefined)
    const [metaData, setMetaData] = useState({} as any | undefined)

    const [scanner, setScanner] = useState(false)
    const [cardsData, setCardsData] = useState([] as [string, string][])
    
    function chooseCardsData() {

        if (scanned && csvDataChunks) {

            Sets.create(csvDataChunks as string[])

            const data = csvDataChunks
                .map(chunk => chunk.split('\n')).flat()
                .map(line => line.split(',')) as [string, string][]

            return setCardsData(data)
        }

        const saved = Sets.get()
        if (saved)
            return setCardsData(saved)
    }

    const ExistentCards = (props: {}) => cardsData.length ? <ul className={style.cards}>
        
        {cardsData.map(([x, y], i) => <Card key={i} issue={x} comment={y} />)}
    
    </ul> : null

    useEffect(chooseCardsData, [scanned, csvDataChunks])

    return <main className={style.view}>

        <header>
            <h1>FCQR</h1>
            <button data-testid='scanner-button' className={scanner ? style.active : ''}
                onClick={click => setScanner(prev => !prev)}>

                Scan QR

            </button>
        </header>
        
        {scanner ? <div data-testid='scanner'><Scanner
            setDone={setScanned}
            setData={setData}
            setMeta={setMetaData}/></div> : null}

        <ExistentCards/>

    </main>
}
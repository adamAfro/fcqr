import { useState, ButtonHTMLAttributes } from 'react'

import { useMemory } from '../memory'

import { listen, Recognition } from "../languages"

export default function Hearing({ langCode, setResult }: { 
	langCode: string, 
    setResult: (x:string) => void 
} & ButtonHTMLAttributes<HTMLButtonElement>) {

	const [listening, setListening] = useState(false)

	return <button onClick={!listening ? () => {
        
        setListening(true)
        listen(alts => setResult(alts[0].trim()), { langCode })

    } : () => setListening(false)}>🎤</button>
}
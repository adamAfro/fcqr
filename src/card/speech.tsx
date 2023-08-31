import { useMemory } from '../memory'

import { speak } from "../languages"

export default function Speech({
	term, termLang, def, defLang
}: { 
	term: string, termLang: string, 
	def?: string, defLang?: string,
}) {

    const { languages } = useMemory()!

	return <>{termLang ? <button onClick={() => speak(term, { 
		
		voice: languages
			.find(lang => lang.name == termLang)?.voice

	})}>🔈</button> : null}</>
}
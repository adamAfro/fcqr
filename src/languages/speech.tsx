

interface SpeakOptions {

	voice?: string
	volume?: number
	rate?: number
	pitch?: number
}

export async function getVoices(): Promise <SpeechSynthesisVoice[]> {

	if (!speechSynthesis)
		return []
	
	const voices = speechSynthesis.getVoices()
	if (voices.length > 0)
		return voices

	return new Promise((ok, er) => {

		let i = 0
		const checkout = setInterval(() => {

			if (i < 10)
				return void i++

			er("No were voices found")
			clearInterval(checkout)

		}, 250)

		const resolve = () => {

			const voices = speechSynthesis.getVoices() as SpeechSynthesisVoice[]
			if (voices.length > 0)
				ok(voices)
			else
				er(voices)
		}
		
		speechSynthesis.addEventListener("voiceschanged", resolve, {once: true})
	})
}

export async function speak(text: string, options: SpeakOptions) {

	if (!speechSynthesis) return void Promise
		.reject("Speech synthesis is not supported in this browser.")
	
	const msg = new SpeechSynthesisUtterance(text)
		msg.volume = options.volume || 1.0
		msg.rate = options.rate || 1.0
		msg.pitch = options.pitch || 1.0
		msg.voice = getVoiceByName(options.voice!)
		msg.lang = msg.voice.lang

	window.speechSynthesis.speak(msg)

	return new Promise((ok, er) => {
		msg.onend = () => ok(true)
		msg.onerror = () => er(false)
	})
}

export function getVoiceByName(name: string) {

	const voices = speechSynthesis.getVoices()
	if (voices.length == 0)
		throw new Error("No voices available.")

	const voice = voices.find((voice) => voice.name == name)
	if (!voice) 
		throw `Speech synthesis "${name}" not found among ${voices.map(({name}) => name).join(', ')}`

	return voice
}
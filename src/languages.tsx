export interface LanguageConfig {
    id: number,
    name: string,
    voice?: string
}

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

		setTimeout(er, 1000)
		const resolve = () => ok(speechSynthesis.getVoices() as SpeechSynthesisVoice[])
		speechSynthesis.addEventListener("voiceschanged", resolve, {once: true})
	})
}

export async function speak(text: string, options: SpeakOptions) {

	if (!speechSynthesis)
		return Promise.reject(false)
	
	const msg = new SpeechSynthesisUtterance(text)

	msg.volume = options.volume || 1.0
	msg.rate = options.rate || 1.0
	msg.pitch = options.pitch || 1.0

	const voices = speechSynthesis.getVoices()
	if (voices.length == 0)
		return Promise.resolve(false)

	const voice = voices.find(({name}) => name == options.voice)
	if (!voice)
		return Promise.reject(false)
	msg.voice = voice
	msg.lang = voice.lang

	window.speechSynthesis.speak(msg)

	return new Promise((ok, er) => {
		msg.onend = () => ok(true)
		msg.onerror = () => er(false)
	})
}
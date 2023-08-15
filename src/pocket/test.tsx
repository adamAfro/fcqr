import '@testing-library/jest-dom'
import { MemoryRouter as Router } from 'react-router-dom'
import { act } from 'react-dom/test-utils'
import { render, screen, fireEvent, waitFor }
    from '@testing-library/react'

import Pocket from "."
import * as Deck from "../deck/database"

import { Provider as SettingsProvider } from '../settings' 
import { open as openDB, Provider as DatabaseProvider } 
    from "../database"
import * as fakeIDB from 'fake-indexeddb'
    Object.assign(global, fakeIDB)

jest.mock('../speech', () => {

    class SpeechSynthesisVoice {
        localService = true
        default = false
        lang: string
        name: string
        voiceURI = 'tts'
    
        constructor(name: string, lang: string) { 
            this.name = name
            this.lang = lang 
        }
    }

    return {
        speak: jest.fn(async () => true),
        getVoices: async () => [
            new SpeechSynthesisVoice("Polish", 'pl-PL'),
            new SpeechSynthesisVoice("English", 'en-GB'),
            new SpeechSynthesisVoice("English US", 'en-US'),
            new SpeechSynthesisVoice("French", 'fr-ME'),
        ]
    }
})


async function expectFullLoad() {

    await waitFor(() => expect(screen.queryByTestId('database-unloaded')).toBeNull())
}

beforeEach(async function() {

    indexedDB = new IDBFactory()

    render(<DatabaseProvider><SettingsProvider>
    
        <Router basename={'/'}><Pocket /></Router>
    
    </SettingsProvider></DatabaseProvider>)

    await expectFullLoad()
})

test('deck can be added', async () => {

    const db = await openDB()
    const initLength = (await Deck.getAllData(db)).length

    await waitFor(() => screen.getByTestId('added-decks'))

    const
        addBtn = screen.getByTestId('add-btn'),
        container = screen.getByTestId('added-decks')

    expect(container).toBeEmptyDOMElement()

    await act(() => fireEvent.click(addBtn))

    await waitFor(() => expect(container).not.toBeEmptyDOMElement())
    expect(await Deck.getAllData(db)).toHaveLength(initLength + 1)
})

test.todo('if there is any deck it is visible')
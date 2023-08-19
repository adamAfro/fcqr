import '@testing-library/jest-dom'
import { MemoryRouter as Router } from 'react-router-dom'
import { act } from 'react-dom/test-utils'
import { render, screen, fireEvent, waitFor }
    from '@testing-library/react'

import { langConfigs } from './examples'

import { openDatabase, Provider as MemoryProvider, LANGUAGES_KEY } 
    from "../memory"
import * as fakeIDB from 'fake-indexeddb'
    Object.assign(global, fakeIDB)

import Settings from "./index"
 
const App = () => <MemoryProvider> 
    <Router basename={'/'}><Settings/></Router>
</MemoryProvider>

async function waitForFullLoad() {

    await waitFor(() => expect(screen.queryByTestId('database-unloaded')).toBeNull())
    await waitFor(() => expect(screen.queryByTestId('loading-deck')).toBeNull())
    await waitFor(() => expect(screen.queryByTestId('cards')).not.toBeNull())
}

beforeEach(() => localStorage.setItem(LANGUAGES_KEY, JSON.stringify(langConfigs)))
function getLangConfig(selected: number) {
    
    return JSON.parse(localStorage.getItem(LANGUAGES_KEY)!)
        .find(({id}: {id:number}) => id == selected) as { id:number, name:string, voice:string }
}

test.todo("adding new language")

describe.skip('', () => {

    test.each(langConfigs)("modifying language's name", async ({ id, name, voice }) => {

        await act(() => render(<App/>))
        await waitForFullLoad()
        
        const changes = { name: 'New language name' }
        const nameInput = screen.getByTestId(`language-config-${id}`)
            .querySelector('input')!
        
        expect(nameInput.value).not.toEqual(changes.name)
        await act(() => fireEvent.input(nameInput, { target: { value: changes.name } }))
        expect(nameInput.value).toEqual(changes.name)
        
        expect(getLangConfig(id).name).toEqual(changes.name)
    })
})


test.todo("modifying language's voice")
import '@testing-library/jest-dom'
import { MemoryRouter as Router } from 'react-router-dom'
import { act } from 'react-dom/test-utils'
import { render, screen, fireEvent, waitFor }
    from '@testing-library/react'

import Pocket from "."
import * as Deck from "../deck/database"

import { openDatabase, Provider as MemoryProvider } 
    from "../memory"
import * as fakeIDB from 'fake-indexeddb'
    Object.assign(global, fakeIDB)

async function expectFullLoad() {

    await waitFor(() => expect(screen.queryByTestId('database-unloaded')).toBeNull())
}

beforeEach(async function() {

    indexedDB = new IDBFactory()

    render(<MemoryProvider>
    
        <Router basename={'/'}><Pocket /></Router>
    
    </MemoryProvider>)

    await expectFullLoad()
})

test('deck can be added', async () => {

    const db = await openDatabase()
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
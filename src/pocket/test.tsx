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

test.todo('deck can be added')

test.todo('if there is any deck it is visible')
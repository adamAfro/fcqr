// https://github.com/testing-library/jest-dom
import { createElement, useEffect } from 'react'
import App from './components/view'

import '@testing-library/jest-dom'

import { render, screen, fireEvent } 
    from '@testing-library/react'

import * as fakeIDB from 'fake-indexeddb'
Object.assign(global, fakeIDB)

import * as DB from "./utilities/database"

test('clicking scanner button toggles the scanner', async () => {
    
    render(createElement(App))

    const scannerButton = screen.getByTestId('scanner-button')
    
    let scanner = screen.queryByTestId('scanner')
    expect(scanner).toBeNull()


    fireEvent.click(scannerButton)

    scanner = screen.queryByTestId('scanner')
    expect(scanner).not.toBeNull()
    expect(scanner).toBeVisible()


    fireEvent.click(scannerButton)
    
    scanner = screen.queryByTestId('scanner')
    expect(scanner).toBeNull()
})



test('renders example cards saved in local storage', async() => {

    const data = [
        ['ciao', 'cześć'],
        ['elo', 'siema'],
    ]

    const 
        keptString = data.map(row => row.join(',')).join('\n'),
        expectedContents = data.map(row => row.join(''))


    localStorage.setItem('saved-set-temporary', keptString)



    render(createElement(App))

    const cards = screen.getAllByTestId('card')
    expect(cards).toHaveLength(data.length)
    for (let i = 0; i < cards.length; i++)
        expect(cards[i]).toHaveTextContent(expectedContents[i])
})



test('renders words that were scanned and ignores kept ones', async() => {

    const ignoredData = [
        ['ciao', 'cześć'],
        ['elo', 'siema'],
    ]

    const keptString = ignoredData.map(row => row.join(',')).join('\n')
        
    localStorage.setItem('saved-set-temporary', keptString)



    const dataChunks = [
        { index: 0, total: 2, data: 'ola,helo\ny,and' },
        { index: 1, total: 2, data: 'cze,h' }
    ]

    const expectedContents = dataChunks
        .map(chunk => chunk.data)
        .join('\n').split('\n')
        .map(row => row.split(',').join(''))



    const html5qr = require('./components/scanner/html5qr')
    html5qr.default = jest.fn((props: { 
        onSuccess: (data: string) => void,
        onError: (data: any) => void
    }) => {
    
        useEffect(() => {

            for (let i = 0; i < dataChunks.length; i++)
                props.onSuccess(JSON.stringify(dataChunks[i]))
    
        }, [])
        
        return null
    })



    render(createElement(App))

    const scannerButton = screen.getByTestId('scanner-button')
    
    let scanner = screen.queryByTestId('scanner')
    expect(scanner).toBeNull()


    fireEvent.click(scannerButton)

    scanner = screen.queryByTestId('scanner')
    expect(scanner).not.toBeNull()
    expect(scanner).toBeVisible()


    const cards = screen.getAllByTestId('card')
    expect(cards).toHaveLength(expectedContents.length)
    for (let i = 0; i < cards.length; i++)
        expect(cards[i]).toHaveTextContent(expectedContents[i])
})



test.todo('progress of scanning is visible')



test('database works more or less', async () => {

    const db = await DB.open()

    const deck = {
      name: 'Test Deck',
      termLang: 'English',
      defLang: 'Spanish',
    }
    
    const cards = [
      { term: 'Hello', def: 'Hola' },
      { term: 'Goodbye', def: 'Adiós' },
    ]

    const deckId = await DB.add(deck, cards, db)

    expect(deckId).not.toBeNull()

    const retrievedDeck = await DB.get(deckId, db)

    expect(retrievedDeck).toEqual({ ...deck, id: deckId })

    await DB.remove(deckId, db)

    const removedDeck = await DB.get(deckId, db)
    expect(removedDeck).toBeUndefined()
})
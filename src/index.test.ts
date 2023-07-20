// https://github.com/testing-library/jest-dom
import { createElement, useState } from 'react'
import App from './components/view'

import '@testing-library/jest-dom'

import { render, screen, fireEvent, waitFor } 
    from '@testing-library/react'



test('clicking scanner button toggles the scanner', async () => {
    
    render(createElement(App))

    const scannerButton = screen.getByTestId('scanner-button')
    
    let scanner = screen.queryByTestId('scanner')
    expect(scanner).toBeNull()


    fireEvent.click(scannerButton)

    scanner = screen.queryByTestId('scanner')
    await waitFor(() => expect(scanner).not.toBeNull())
    expect(scanner).toBeVisible()


    fireEvent.click(scannerButton)
    
    scanner = screen.queryByTestId('scanner')
    await waitFor(() => expect(scanner).toBeNull())
})



test('renders example cards saved in local storage', async () => {

    localStorage.setItem('saved-set-temporary', 'ciao,cześć\nhi,siema')

    render(createElement(App))

    await waitFor(() => {

        const cards = screen.getAllByTestId('card')

        expect(cards).toHaveLength(2)
        expect(cards[0]).toHaveTextContent('ciao'+'cześć')
        expect(cards[1]).toHaveTextContent('hi'+'siema')
    })
})



// no idea how to do it
// mocking html5-qrcode didn't work
// don't know how to do it with mocking scanner
// because it has state shared with it's wrapper
// gosshshshhshimangryscrewthat
// it works when i scann with my phone soo
test.todo('renders words that were scanned')
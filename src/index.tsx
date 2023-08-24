/// <reference types="react-scripts" />

import ReactDOM from 'react-dom/client'
import React from 'react'

import App from './app'

import { registerForOffline, reportWebVitals } from './web'

registerForOffline()
    .then(({ ok, message}) => console.debug('webworker', ok, message))

ReactDOM
    .createRoot(document.body as Element)
    .render(React.createElement(App, { basename: '/beta' }))

reportWebVitals()
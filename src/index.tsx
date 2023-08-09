/// <reference types="react-scripts" />

import ReactDOM from 'react-dom/client'
import React from 'react'

import App from './app'
import localise from './localisation'

import { registerForOffline, reportWebVitals } from './web'

localise()
ReactDOM
    .createRoot(document.getElementById('root') as Element)
    .render(React.createElement(App))

reportWebVitals()
registerForOffline()
import { HTMLAttributes } from 'react'

import { useTranslation } from '../localisation'

import Voices from './voices'


export { useSettings, Provider } from './context'

export function Settings(props: HTMLAttributes<HTMLDivElement>) {

    return <Voices/>
}
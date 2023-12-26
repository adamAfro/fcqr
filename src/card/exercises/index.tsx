import { randomFrom } from '../../misc'

import { default as Text } from './text'
import { default as Vocal } from './vocal'
//import * as Selection from './selection'
//import * as Puzzle from './puzzle'

export function random({ silent }: { silent: boolean }) {
 
    return randomFrom(!silent ? [
        Key.TEXT,
        Key.VOCAL
    ] : [
        Key.TEXT
    ])
}

export enum Key {
    TEXT = 'text',
    VOCAL = 'vocal'
}

export const Dictionary = {

    [Key.TEXT]: <Text/>,
    [Key.VOCAL]: <Vocal/>
}
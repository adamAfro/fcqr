import { ExerciseMode } from '../'
import { randomFrom } from '../../misc'

export { default as Text } from './text'
export { default as Vocal } from './vocal'
export * as Selection from './selection'
export * as Puzzle from './puzzle'

export function random({ audible }: { audible: boolean }) {
 
    return randomFrom(audible ? [
        ExerciseMode.TEXT,
        ExerciseMode.VOCAL,
        ExerciseMode.SELECTION_TEXT,
        ExerciseMode.PUZZLE_TEXT
    ] : [
        ExerciseMode.TEXT,
        ExerciseMode.SELECTION_TEXT,
        ExerciseMode.PUZZLE_TEXT
    ])
}
import { ExerciseMode } from '../'
import { randomFrom } from '../../misc'

export { default as Text } from './text'
export { default as Vocal } from './vocal'
export * as Selection from './selection'
export * as Puzzle from './puzzle'

export function random({ silent }: { silent: boolean }) {
 
    return randomFrom(!silent ? [
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
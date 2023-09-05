export function indexToSubindex <T> (serieIndex: number, subserie: T[], serie: T[]) {

    let subserieIndex = 0;
    while (subserieIndex < subserie.length + 1 && subserieIndex < serieIndex) {

        const nextRealIndex = serie.findIndex(x => x == subserie[subserieIndex])
        if (nextRealIndex > serieIndex)
            break

        subserieIndex++
    }

    return subserieIndex
}

export function randomFrom <T> (ar: T[]) {

    return ar[randomInt(0, ar.length)]
}

export function randomInt(a = 0, b = 1) {

    return Math.floor(Math.random() * (b - a) + a)
}

export function randomWeighted(weights: number[]) {

    const sum = weights.reduce((acc, weight) => acc + weight, 0)
    const random = Math.random() * sum
    
    for (let i = 0, cumulative = 0; i < weights.length; i++) {

        cumulative += weights[i]
        if (random < cumulative)
            return i
    }

    return -1
}

export function randomSubstring(text: string) {
        
    if (text.length > 2) {

        const start = randomInt(0, text.length - 2)
        const end = start + randomInt(start + 1, text.length)

        return text.substring(start, end)
    }

    return text
}
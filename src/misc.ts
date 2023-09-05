export function subindexToIndex <T> (subserieIndex: number, subserie: T[], serie: T[]) {

    let serieIndex = 0;
    while (serieIndex < subserie.length + 1 && serieIndex < subserieIndex) {

        const nextRealIndex = serie.findIndex(x => x == subserie[serieIndex])
        if (nextRealIndex > subserieIndex)
            break

        serieIndex++
    }

    return serieIndex
}

export function randomFrom <T> (ar: T[]) {

    return ar[randomIndex(ar)]
}

export function randomIndex <T> (ar: T[]) {

    return Math.floor(Math.random() * ar.length)
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
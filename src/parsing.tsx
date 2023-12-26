/**
 * @bug handling CSV with coma separators and quotas works badly
 * * text in quotas needs to be handled as it is in quotas and not normally
 * * results in not removed quotas when comma is in text during CSV parsing
 */
export function handleText(text: string, meta?: any) {

    const { endline = '\n' } = meta?.characters || {}
    let lines = handleCSVMultilines(text.split(endline))
        .filter(line => line.trim() || line == endline)
    const { separator = getProbableSeparator(lines) } = meta?.characters || {}

    lines = lines.filter(line => line.length > 2 && line != separator)

    let cardsData = lines
        .map(line => line.split(separator) as [string, string])
        .map(([term, ...def]: [string, string]) => ({
            term: fixCSVQuotas(term), 
            def: def.map(d => fixCSVQuotas(d)).join(', ') 
        }))

    return cardsData
}

const separators = [
    ' — ', ' - ', ' | ', ', ', ' , ', ' ; ', '; ',
    '—', '-', '|', ',', ';', '\t', ' '
]

function getProbableSeparator(lines: string[]) {

    return separators.find(separator => {

        let count = 0;
        for (const line of lines)
            if (line.includes(separator)) count++

        console.log(separator, 0.80 * count / lines.length)

        if (count >= 0.80 * lines.length)
            return true

    }) || ','
}

function fixCSVQuotas(text: string, quota = '"') {

    let trimmed = text.trim()
    if (trimmed[0] == quota && trimmed[trimmed.length - 1] == quota)
        return trimmed.slice(1, -1).replaceAll(`${quota}${quota}`, `${quota}`)

    return text
}

function handleCSVMultilines(lines: string[], endline = '\n', quota = '"') {

    const mayBeCSV = (lines[0][0] == '"')
    if (!mayBeCSV)
        return lines

    const newLines = [] as string[]
    let multiline = false, multilineText = ''

    for (const line of lines) {

        if (multiline) {

            multilineText += endline + line

            if (line.endsWith(quota)) {

                multiline = false
                newLines.push(multilineText)
            }

        } else {

            if (line.startsWith(quota) && !line.endsWith(quota)) {

                multiline = true
                multilineText = line

            } else {

                newLines.push(line)
            }
        }
    }

    return newLines
}
export namespace Sets {

    const prefix = 'saved-set-'
    const defName = 'temporary'

    /** Creates local storage entry with CSV string
     * @example
     * create(csvString)
     * @example
     * create(csvStringChunks)
     * @example
     * create([['one', 'uno'], ['two', 'due'], ['three', 'tre']])
     */
    export function create(set: string | string[] | [string,string][], name = defName) {

        if (typeof set !== 'string') {

            if (typeof set[0] !== 'string')
                set = (set as [string,string][]).map((pair) => pair.join(','))

            set = set.join('\n')
        }
    
        localStorage.setItem(prefix + name, set)
    }

    export function get(name = defName) {
        
        return localStorage.getItem(prefix + name)
            ?.split('\n').map((pair) => pair.split(',')) as [string,string][]
    }
}
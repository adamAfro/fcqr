export default class Chunk {

    data: any = null
    index: number = -1
    total: number = 0
    meta?: any

    constructor(props: { data: any, index: number, total: number, meta: any }) {

        this.data = props.data
        this.index = props.index
        this.total = props.total
        this.meta = props.meta
    }

    static FromDecodedText(text: string) {

        let output = JSON.parse(text)
        const isDataChunk =
            output.data !== undefined &&
            output.index !== undefined &&
            output.total !== undefined
        if (!isDataChunk)
            return

        return new Chunk({ 
            data: output.data,
            index: output.index,
            total: output.total,
            meta: output.meta
        })
    }
}
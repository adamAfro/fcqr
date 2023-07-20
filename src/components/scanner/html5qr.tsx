import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect } from 'react'

const qrcodeRegionId = "html5qr-code-full-region"

const createConfig = (props: any) => {

    let config = {} as any
    if (props.fps) {
        config.fps = props.fps
    }
    if (props.qrbox) {
        config.qrbox = props.qrbox
    }
    if (props.aspectRatio) {
        config.aspectRatio = props.aspectRatio
    }
    if (props.disableFlip !== undefined) {
        config.disableFlip = props.disableFlip
    }
    return config
}

const Html5QrcodePlugin = (props: {
    onSuccess: (dataString: string) => void, 
    onError: (error: any) => void
}) => {

    useEffect(() => {
        
        const config = createConfig(props)
        const verbose = false
        
        if (!(props.onSuccess)) {
            throw "onSuccess is required callback."
        }

        const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose)
        html5QrcodeScanner.render(props.onSuccess, props.onError)

        return () => {
            html5QrcodeScanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error)
            })
        }
    }, [])

    return <div id={qrcodeRegionId}></div>
}

export default Html5QrcodePlugin
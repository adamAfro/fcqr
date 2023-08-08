import { useEffect } from 'react'

import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } 
    from 'html5-qrcode'

const qrcodeRegionId = "html5qr-code-full-region"

export default (props: {
    onScan: (dataString: string) => void, 
    onError: (error: any) => void
}) => {

    useEffect(() => {
        
        const verbose = false
        
        if (!(props.onScan)) {
            throw "onScan is required callback."
        }

        const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, {

            fps: 5,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE
            ]
    
        }, verbose)
        html5QrcodeScanner.render(props.onScan, props.onError)

        return () => {
            html5QrcodeScanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error)
            })
        }
    }, [])

    return <div id={qrcodeRegionId}></div>
}
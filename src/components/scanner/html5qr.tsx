import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } 
    from 'html5-qrcode'
import { useEffect } from 'react'

const qrcodeRegionId = "html5qr-code-full-region"

const Html5QrcodePlugin = (props: {
    onSuccess: (dataString: string) => void, 
    onError: (error: any) => void
}) => {

    useEffect(() => {
        
        const verbose = false
        
        if (!(props.onSuccess)) {
            throw "onSuccess is required callback."
        }

        const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, {

            fps: 5,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE
            ]
    
        }, verbose)
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
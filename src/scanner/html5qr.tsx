import { useEffect } from 'react'

import { Html5QrcodeScanner as Scanner, Html5QrcodeSupportedFormats as Formats } 
    from 'html5-qrcode'

const qrcodeRegionId = "html5qr-code-full-region"

export default (props: {
    onScan: (dataString: string) => void, 
    onError: (error: any) => void
}) => {

    useEffect(() => {
        
        const scanner = new Scanner(qrcodeRegionId, {

            fps: 5, formatsToSupport: [Formats.QR_CODE]
    
        }, /** verbose */ false)

        scanner.render(props.onScan, props.onError)

        const unmount = () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error)
            })
        }

        return unmount
        
    }, [])

    return <div id={qrcodeRegionId}></div>
}
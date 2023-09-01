const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
)

interface Report {
    ok: boolean,
    message?: string
}

export async function register(): Promise<Report> {

    if (process.env.NODE_ENV !== 'production')
        return { ok: false, message: 'service worker does not work on develomepent' }

    if (!('serviceWorker' in navigator))
        return { ok: false, message: 'service worker is not supported' }
    
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href)
    if (publicUrl.origin !== window.location.origin)
        return { ok: false, message: 'public URL is not the same as the current origin' }

    return new Promise((ok,er) => {
        
        setTimeout(() => er({ ok: false, message: 'timeout' }), 5000)
        window.addEventListener('load', async () => {

            const workerURL = `${process.env.PUBLIC_URL}/service-worker.js`
            if (isLocalhost) {
    
                const report = findWorker(workerURL)
                
                await navigator.serviceWorker.ready
    
                return void ok(await report)
            }
    
            return void ok(registerWorker(workerURL))
        })
    })
}

export async function unregister(): Promise<Report> {

    if (!('serviceWorker' in navigator))
        return { ok: false, message: 'service worker is not supported' }
    
    return unregisterWorker()
}

async function registerWorker(workerURL: string): Promise<Report> {

    const reg = await navigator.serviceWorker.register(workerURL)
        .catch((error) => void console.error(error))

    if (!reg)
        return { ok: false, message: 'service worker registration failed' }

    return await new Promise((ok,er) => reg.onupdatefound = () => {

        if (!reg.installing)
            return void er({ ok: false, message: 'service worker registration failed' })
        
        reg.installing.onerror = () => void er({ 
            ok: false, message: 'service worker installation failed' 
        })
        
        reg.installing.onstatechange = () => {

            const report = install(reg)
            if (report.ok)
                ok(report)
            else
                console.log(report.message)
        }
    })
}

function install(reg: ServiceWorkerRegistration) {

    if (reg.installing && reg.installing.state !== 'installed')
        return { ok: false, message: 'service worker installation has not yet started' }

    if (navigator.serviceWorker.controller)
        return { ok: true, message: 'new content is available, please refresh' }

    return { ok: true, message: 'content is cached for offline use' }
}

async function findWorker(workerURL: string) {

    const res = await fetch(workerURL, { headers: { 'Service-Worker': 'script' } })
        .catch(() => null)
    if (!res)
        return { ok: true, message: 'no internet connection, offline mode' }

    const contentType = res.headers.get('content-type')
    if (res.status === 404 || (contentType != null && contentType.indexOf('javascript') === -1)) {

        unregisterWorker()
        const report = Promise.resolve({ ok: false,
            message: 'no service worker found, offline mode'
        })
        
        report.then(() => window.location.reload())

        return report
    }
    
    return registerWorker(workerURL)
}

async function unregisterWorker() {

    const reg = await navigator.serviceWorker.ready
        .catch((error) => void console.error(error.message))

    if (!reg)
        return { ok: false, message: 'service worker unregistration failed' }    

    return { ok: await reg.unregister(), message: 'service worker unregistered'}
}
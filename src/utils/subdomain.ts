export function getSubdomain(): 'guest' | 'app' | 'love' | 'main' {
    const hostname = window.location.hostname;

    // Local testing support (e.g., love.localhost or query param)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'love') return 'love';

    if (hostname.startsWith('guest.')) return 'guest';
    if (hostname.startsWith('app.')) return 'app';
    if (hostname.startsWith('love.')) return 'love';

    return 'main';
}
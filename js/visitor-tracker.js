
(function(){
    try {
        var scriptEl = document.currentScript;
        if (!scriptEl) return;

        function detectStage() {
            var path = (window.location.pathname || '').toLowerCase();
            if (scriptEl.dataset.trackStage) return scriptEl.dataset.trackStage;
            if (path.includes('payment') || path.includes('pix')) return 'pix';
            if (path.includes('checkout') || path.includes('cart')) return 'checkout';
            // produto/produto.html or index falls back to vitrine
            return 'vitrine';
        }

        var stage = detectStage();
        var slug = window.LOJA_SLUG || scriptEl.dataset.trackSlug || (window.TRACK_SLUG || window.location.hostname);
        var domain = window.LOJA_DOMAIN || window.location.origin;
        var apiKey = scriptEl.dataset.trackApi || window.TRACK_API_KEY || '';
        var endpoint = scriptEl.dataset.trackEndpoint || window.TRACK_ENDPOINT || 'https://blackfystore.com/app/api/track_visitor.php';
        if (!slug || !apiKey) {
            return;
        }
        var allowedStages = ['vitrine','checkout','pix'];
        if (allowedStages.indexOf(stage) === -1) {
            stage = 'vitrine';
        }

        function payload() {
            return {
                slug: slug,
                domain: domain,
                stage: stage,
                apiKey: apiKey,
                url: window.location.href,
                referrer: document.referrer || null,
                userAgent: navigator.userAgent,
                path: window.location.pathname,
            };
        }

        function sendPing() {
            var data = payload();
            if (navigator.sendBeacon) {
                var blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                navigator.sendBeacon(endpoint, blob);
                return;
            }
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': apiKey
                },
                body: JSON.stringify(data),
                keepalive: true
            }).catch(function(){});
        }

        // primeira batida
        sendPing();
        // mantém sessão ativa
        setInterval(sendPing, 60000);
    } catch (err) {
        console.error('Visitor tracker error', err);
    }
})();

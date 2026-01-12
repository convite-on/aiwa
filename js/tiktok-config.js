// TikTok Pixel config with runtime override + UI to change the pixel ID across tabs
(function(){
    const DEFAULT_ID = (window.TIKTOK_PIXEL_ID && String(window.TIKTOK_PIXEL_ID)) || 'TIKTOK-PIXEL-ID';

    // Read override from localStorage (if user changed the ID via the UI)
    function getStoredId(){
        try { return localStorage.getItem('TIKTOK_PIXEL_ID') || null; } catch(e){ return null; }
    }

    function setStoredId(id){
        try { if (id == null) localStorage.removeItem('TIKTOK_PIXEL_ID'); else localStorage.setItem('TIKTOK_PIXEL_ID', String(id)); } catch(e){}
    }

    // Apply current effective ID to global var
    function applyId(id){
        window.TIKTOK_PIXEL_ID = String(id || DEFAULT_ID);
    }

    // Try to (re)load ttq with new id when possible
    function reloadTikTok(id){
        try {
            // if ttq exists and has load, call it
            if (window.ttq && typeof window.ttq.load === 'function'){
                window.ttq.load(id);
                if (typeof window.ttq.page === 'function') window.ttq.page();
                showToast('TikTok Pixel atualizado: ' + id, 'success');
                return;
            }

            // otherwise inject the loader (safe: won't duplicate if already present)
            const scriptUrl = 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + encodeURIComponent(id) + '&lib=ttq';
            const s = document.createElement('script');
            s.async = true;
            s.src = scriptUrl;
            document.head.appendChild(s);
            showToast('TikTok Pixel carregado: ' + id, 'success');
        } catch(e){
            console.error('Erro ao recarregar TikTok pixel', e);
            showToast('Erro ao atualizar TikTok Pixel', 'error');
        }
    }

    // Small toast helper
    function showToast(msg, type){
        try {
            const el = document.createElement('div');
            el.textContent = msg;
            el.style.cssText = 'position:fixed;top:12px;right:12px;padding:10px 14px;border-radius:8px;color:#fff;z-index:99999;font-weight:600;';
            el.style.background = (type==='error'?'#e74c3c':'#2ecc71');
            document.body.appendChild(el);
            setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>el.remove(),300); }, 2000);
        } catch(e){/* ignore */}
    }

    // (Removido: botão de gerenciamento do Pixel TikTok)

    // Listen to other tabs changes
    window.addEventListener('storage', (e) => {
        if (!e) return;
        if (e.key === 'TIKTOK_PIXEL_ID'){
            const newId = e.newValue || DEFAULT_ID;
            applyId(newId);
            reloadTikTok(newId);
        }
    });

    // Init: decide which id to use now
    const initial = getStoredId() || DEFAULT_ID;
    applyId(initial);

    // (Removido: criação do botão de gerenciamento do Pixel TikTok)

    // expose setter for programmatic use
    window.setTikTokPixelId = function(id){ setStoredId(id); applyId(id||DEFAULT_ID); reloadTikTok(id||DEFAULT_ID); };
})();

(function() {
    'use strict';

    // 1. CONFIGURACIÓN Y CONSTANTES
    const CONFIG = {
        TARGET_DOMAIN: 'variousplan.com',
        LIST_PATH: '/#/loaned_management/pedding_list',
        DETAIL_PATH: '/detail',
        TOGGLE_KEY: 'KeyQ', // Ctrl + Shift + Q
        CACHE_HOURS: 20,    // ⏳ TIEMPO DE MEMORIA (HORAS)
        COLUMNS: {
            KEY_ID: 'column_4',  // ID Orden
            USER_ID: 'column_2', // User ID
            PLAZO: 'column_6'    // Plazo
        },
        SELECTORS: {
            PAGINATION_NEXT: '.el-pagination .btn-next',
            TABLE_ROW: '.el-table__row',
            TABLE_WRAPPER: '.el-table__body-wrapper',
            DETAIL_FIELD: 'div.mb-10'
        }
    };

    const TAB_ID = Date.now().toString(36) + Math.random().toString(36).substr(2);
    let iframeEl = null, searchTimer = null, retryTimer = null, isProcessing = false, currentPage = 1;

    // 2. UTILIDADES
    const getOrderIdFromPage = (keyword) => {
        const elements = Array.from(document.querySelectorAll(CONFIG.SELECTORS.DETAIL_FIELD));
        const found = elements.find(el => el.innerText.includes(keyword));
        if (!found) return '';
        const clone = found.cloneNode(true);
        clone.querySelectorAll('button, .std-tool-btn').forEach(b => b.remove());
        const text = clone.innerText.trim();
        return text.includes(':') ? text.substring(text.indexOf(':') + 1).trim() : '';
    };

    // 🔥 NUEVA FUNCIÓN: EXTRAER FECHA DESEMBOLSO (Script Modal)
    async function obtenerFechaDesembolso() {
        try {
            // 1. Buscar y abrir el diálogo "Fundamento de desembolso"
            const botones = Array.from(document.querySelectorAll('button span'));
            const btnFundamento = botones.find(span => span.innerText.trim() === "Fundamento de desembolso");

            if (!btnFundamento) return "No disponible";

            btnFundamento.parentElement.click();

            // Esperamos un poco para asegurar que el texto cargue
            await new Promise(r => setTimeout(r, 500)); 

            // 2. Buscar el dato "Hora de confirmación"
            let soloFecha = "No encontrada";
            const items = document.querySelectorAll('.el-dialog__body .item');
            
            for (let item of items) {
                const labelDiv = item.querySelector('div:first-child');
                if (labelDiv && labelDiv.innerText.includes("Hora de confirmación")) {
                    const valueDiv = item.querySelector('div:nth-child(2)');
                    if (valueDiv) {
                        const textoCompleto = valueDiv.innerText.trim(); // Ej: "2026-02-04 14:58:31"
                        const partes = textoCompleto.split(' ');
                        if (partes.length > 0) {
                            soloFecha = partes[0]; // Toma "2026-02-04"
                        } else {
                            soloFecha = textoCompleto;
                        }
                    }
                    break;
                }
            }

            // 3. Cerrar el diálogo inmediatamente
            const btnApagaSpan = Array.from(document.querySelectorAll('.el-dialog__footer button span'))
                .find(span => span.innerText.trim() === "Apaga");
            
            if (btnApagaSpan) {
                btnApagaSpan.parentElement.click();
            }
            
            // Pequeña espera para que la UI se limpie visualmente
            await new Promise(r => setTimeout(r, 100));

            return soloFecha;

        } catch (e) {
            console.error("Error extrayendo fecha:", e);
            return "Error";
        }
    }

    // 3. INTERFAZ (PANEL CRISTAL)
    function createStatusPanel() {
        if (document.getElementById('visor-top-status')) return;
        const panel = document.createElement('div');
        panel.id = 'visor-top-status';
        Object.assign(panel.style, {
            position: 'fixed', zIndex: 10000, bottom: '1px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(12px)', webkitBackdropFilter: 'blur(12px)',
            padding: '10px 20px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.5)', display: 'none', flexDirection: 'column', gap: '4px',
            pointerEvents: 'auto', textAlign: 'left', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif',
            fontSize: '12px', lineHeight: '1.4', color: '#1f2937', minWidth: '220px'
        });

        // 🔥 AGREGADA LINEA DE DESEMBOLSO
        panel.innerHTML = `
            <div id="v-loading" style="font-weight:800; margin-bottom:6px; text-align:center; text-transform:uppercase; font-size:11px;"></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:#6b7280;">Orden:</span> <span id="v-ref" style="font-weight:700;">--</span></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:#6b7280;">User ID:</span> <span id="v-userid" style="font-weight:700; color:#2563eb;">--</span></div>
            <div style="display:flex; justify-content:space-between;"><span style="color:#6b7280;">Plazo:</span> <span id="v-plazo" style="font-weight:700;">--</span></div>
            <div style="display:flex; justify-content:space-between; border-top:1px dashed #cbd5e1; margin-top:2px; padding-top:2px;">
                <span style="color:#6b7280;">Desembolso:</span> 
                <span id="v-desembolso" style="font-weight:800; color:#16a34a;">--</span>
            </div>
        `;
        document.body.appendChild(panel);
    }

    let hideTimeout = null;
    function updatePanel(data, searchId, status, extraInfo = '') {
        const panel = document.getElementById('visor-top-status');
        if (!panel) return;
        if (searchId) document.getElementById('v-ref').innerText = searchId;

        if (data) {
            document.getElementById('v-userid').innerText = data.userId || '--';
            document.getElementById('v-plazo').innerText = data.plazo || '--';
            // 🔥 MOSTRAR FECHA
            document.getElementById('v-desembolso').innerText = data.fechaDesembolso || '--';
        }

        const lEl = document.getElementById('v-loading');
        if (status === 'success') {
            lEl.innerText = '✅ DATOS GUARDADOS ' + extraInfo; lEl.style.color = '#059669';
            if (hideTimeout) clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => { lEl.style.display = 'none'; }, 4000);
        } else {
            lEl.style.display = 'block';
            if (status === 'cache') { lEl.innerText = '⚡ MEMORIA CACHÉ'; lEl.style.color = '#7c3aed'; }
            else if (status === 'queue') { lEl.innerText = '⏳ EN COLA...'; lEl.style.color = '#d97706'; }
            else if (status === 'extracting') { lEl.innerText = '🔍 LEYENDO MODAL...'; lEl.style.color = '#2563eb'; }
            else if (status === 'retry') { lEl.innerText = '♻️ REINTENTANDO...'; lEl.style.color = '#d97706'; }
            else { lEl.innerText = '⬆️ BUSCANDO ' + extraInfo; lEl.style.color = '#4b5563'; }
        }
    }

    function togglePanel(forceState = null) {
        const panel = document.getElementById('visor-top-status');
        if (panel) {
            if (forceState === true) panel.style.display = 'flex';
            else if (forceState === false) panel.style.display = 'none';
            else panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        }
    }

    // 4. SISTEMA DE COLA (LOCK)
    async function waitForLock() {
        const MAX_WAIT = 600000; const START_TIME = Date.now();
        return new Promise(resolve => {
            const check = () => {
                const lock = localStorage.getItem('VISUAL_CHECK_LOCK');
                const lockTime = parseInt(localStorage.getItem('VISUAL_CHECK_TIME') || '0');
                const now = Date.now();
                if (!lock || lock === TAB_ID || (now - lockTime > 12000)) { 
                    localStorage.setItem('VISUAL_CHECK_LOCK', TAB_ID);
                    localStorage.setItem('VISUAL_CHECK_TIME', now.toString());
                    resolve(true);
                } else {
                    if (now - START_TIME > MAX_WAIT) resolve(false);
                    else setTimeout(check, Math.floor(Math.random() * 200) + 100);
                }
            };
            check();
        });
    }

    function releaseLock() {
        if (localStorage.getItem('VISUAL_CHECK_LOCK') === TAB_ID) {
            localStorage.removeItem('VISUAL_CHECK_LOCK');
            localStorage.removeItem('VISUAL_CHECK_TIME');
        }
    }

    // 5. LÓGICA DE BÚSQUEDA
    function stopSearch() {
        isProcessing = false;
        if (searchTimer) clearTimeout(searchTimer);
        if (retryTimer) clearTimeout(retryTimer);
        
        const iframe = document.getElementById('iframe-buscador-hidden');
        if (iframe) {
            iframe.src = 'about:blank';
            setTimeout(() => iframe.remove(), 100);
        }
        iframeEl = null;
        releaseLock();
    }

    function startSearch(searchId) {
        if (document.hidden) {
            updatePanel(null, searchId, 'queue', '(2do Plano)');
            const onVisible = () => {
                if (!document.hidden && !isProcessing) {
                    document.removeEventListener('visibilitychange', onVisible);
                    initIframeSearch(searchId);
                }
            };
            document.addEventListener('visibilitychange', onVisible);
        } else {
            initIframeSearch(searchId);
        }
    }

    async function initIframeSearch(searchId) {
        if (isProcessing && iframeEl) return;
        updatePanel(null, searchId, 'queue');
        if (!(await waitForLock())) { updatePanel(null, searchId, 'retry', '(Timeout)'); setTimeout(() => initIframeSearch(searchId), 5000); return; }
        
        isProcessing = true;
        if (searchTimer) clearTimeout(searchTimer);
        const old = document.getElementById('iframe-buscador-hidden'); if(old) old.remove();
        
        updatePanel(null, searchId, 'loading', 'init');
        createIframe(searchId, 1);
    }

    function createIframe(searchId, page) {
        isProcessing = true; currentPage = page;
        iframeEl = document.createElement('iframe');
        iframeEl.id = 'iframe-buscador-hidden';
        iframeEl.setAttribute('sandbox', 'allow-scripts allow-same-origin'); 
        iframeEl.src = window.location.origin + CONFIG.LIST_PATH;
        Object.assign(iframeEl.style, { width: '1000px', height: '800px', position: 'absolute', left: '-9999px', visibility: 'hidden' });
        document.body.appendChild(iframeEl);

        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(() => { if (isProcessing) retrySearch(searchId); }, 40000);
        scanIframe(searchId, page);
    }

    function retrySearch(searchId) {
        updatePanel(null, searchId, 'retry');
        const iframe = document.getElementById('iframe-buscador-hidden'); 
        if(iframe) { iframe.src = 'about:blank'; setTimeout(() => iframe.remove(), 50); }
        setTimeout(() => { if(document.visibilityState === 'visible') createIframe(searchId, 1); else stopSearch(); }, 800);
    }

    // 🔄 LÓGICA PRINCIPAL MODIFICADA (IFRAME + MODAL)
function scanIframe(searchId, page) {
        const checkLoop = async () => {
            if (!isProcessing || !iframeEl) return;
            try {
                if (retryTimer) clearTimeout(retryTimer);
                retryTimer = setTimeout(() => { if (isProcessing) retrySearch(searchId); }, 30000);

                const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
                const wrapper = doc.querySelector(CONFIG.SELECTORS.TABLE_WRAPPER);
                if (wrapper) wrapper.scrollTop = wrapper.scrollHeight;

                const rows = Array.from(doc.querySelectorAll(CONFIG.SELECTORS.TABLE_ROW));
                if (rows.length > 0) {
                    const reversedRows = [...rows].reverse();
                    for (let row of reversedRows) {
                        const cellId = row.querySelector(`td[class*="${CONFIG.COLUMNS.KEY_ID}"]`);
                        
                        // ✅ SI ENCONTRAMOS EL ID EN LA LISTA
                        if (cellId && cellId.innerText.trim() === searchId) {
                            
                            // 1. Extraemos datos del Iframe (User ID y Plazo siempre vienen de aquí)
                            const userId = row.querySelector(`td[class*="${CONFIG.COLUMNS.USER_ID}"]`)?.innerText.trim();
                            const plazo = row.querySelector(`td[class*="${CONFIG.COLUMNS.PLAZO}"]`)?.innerText.trim();
                            let fechaFinal = "Pendiente";

                            // 🛑 2. VERIFICACIÓN DE CARRERA: ¿YA GANÓ EL USUARIO?
                            const cacheKey = 'VC_CACHE_' + searchId;
                            const cachedRaw = localStorage.getItem(cacheKey);
                            const cachedData = cachedRaw ? JSON.parse(cachedRaw) : {};

                            if (cachedData.fechaDesembolso && cachedData.fechaDesembolso.length > 5 && !cachedData.fechaDesembolso.includes("No")) {
                                // 🏆 ¡SÍ! EL USUARIO YA CLICKEÓ SOPORTE. NO ABRIMOS MODAL.
                                console.log("⏩ Visual Check: Saltando modal, dato ya existe en caché.");
                                updatePanel(null, searchId, 'cache', '(Sincronizado)');
                                fechaFinal = cachedData.fechaDesembolso;
                            } else {
                                // 🐢 EL USUARIO NO HA CLICKEADO. NOS TOCA ABRIR MODAL.
                                updatePanel(null, searchId, 'extracting');
                                fechaFinal = await obtenerFechaDesembolso(); // Abre modal
                            }

                            // 3. Guardamos/Actualizamos el Paquete Completo
                            const dataEncontrada = {
                                userId: userId,
                                plazo: plazo,
                                fechaDesembolso: fechaFinal,
                                timestamp: Date.now() 
                            };

                            localStorage.setItem(cacheKey, JSON.stringify(dataEncontrada));

                            // 4. Finalizar
                            updatePanel(dataEncontrada, searchId, 'success', `(Pág ${page})`);
                            stopSearch(); 
                            return;
                        }
                    }
                    const btnNext = doc.querySelector(CONFIG.SELECTORS.PAGINATION_NEXT);
                    if (btnNext && !btnNext.disabled) {
                        currentPage++; updatePanel(null, searchId, 'loading', `Pág ${currentPage}`);
                        btnNext.click(); searchTimer = setTimeout(checkLoop, 800);
                    } else retrySearch(searchId);
                } else searchTimer = setTimeout(checkLoop, 500);
            } catch (e) { searchTimer = setTimeout(checkLoop, 500); }
        };
        searchTimer = setTimeout(checkLoop, 600);
    }

    // 6. INICIALIZACIÓN
    function init() {
        const currentUrl = window.location.href;
        if (!currentUrl.includes(CONFIG.TARGET_DOMAIN)) return;
        if (!currentUrl.includes(CONFIG.DETAIL_PATH)) {
            const panel = document.getElementById('visor-top-status'); if (panel) panel.remove();
            stopSearch(); return;
        }
        createStatusPanel();
        
        setTimeout(() => {
            const orderId = getOrderIdFromPage('ID de orden');
            
            if (orderId) {
                // 🔥 VERIFICACIÓN DE CACHÉ (20 HORAS)
                const cacheKey = 'VC_CACHE_' + orderId;
                const cachedRaw = localStorage.getItem(cacheKey);
                
                if (cachedRaw) {
                    const cached = JSON.parse(cachedRaw);
                    const edadHoras = (Date.now() - cached.timestamp) / (1000 * 60 * 60);
                    
                    if (edadHoras < CONFIG.CACHE_HOURS) {
                        updatePanel(cached, orderId, 'cache');
                        return; // ✅ DATOS ENCONTRADOS EN MEMORIA, NO EJECUTAMOS NADA
                    }
                }

                // SI NO HAY CACHÉ: INICIAMOS TODO EL PROCESO
                const currentVal = document.getElementById('v-userid')?.innerText; 
                if (!currentVal || currentVal === '--') startSearch(orderId);
            } else updatePanel(null, '...', 'loading', 'init');
        }, 1500);
    }

    window.addEventListener('keydown', (e) => {
        // Detectar si es Mac (Apple) o Windows/Linux
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        // Asignar el modificador correcto: Command en Mac (metaKey), Control en PC (ctrlKey)
        const modifierKey = isMac ? e.metaKey : e.ctrlKey;

        // Si presiona Modificador + Shift + Q
        if (modifierKey && e.shiftKey && e.code === CONFIG.TOGGLE_KEY) {
            e.preventDefault();
            const panel = document.getElementById('visor-top-status');
            const shouldShow = (!panel || panel.style.display === 'none');
            togglePanel(shouldShow);
            localStorage.setItem('VISUAL_CHECK_GLOBAL_TOGGLE', JSON.stringify({ show: shouldShow, time: Date.now() }));
        }
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'VISUAL_CHECK_GLOBAL_TOGGLE' && e.newValue) {
            try { togglePanel(JSON.parse(e.newValue).show); } catch (err) {}
        }
    });

    window.addEventListener('beforeunload', stopSearch);
    let lastUrl = location.href;
    setTimeout(init, 500);
    new MutationObserver(() => {
        if (location.href !== lastUrl) { lastUrl = location.href; stopSearch(); setTimeout(init, 1500); }
    }).observe(document, { subtree: true, childList: true });
})();
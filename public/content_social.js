(function() {
    'use strict';

    // ========================================================================
    // 1. CONFIGURACIÓN
    // ========================================================================
    const CONFIG_CRMS = [{
        prefix: '+57', country: 'Colombia', domains: ['https://co-crm.certislink.com'], mode: 'AUTO', digits: 10
    }, {
        prefix: '+56', country: 'Chile', domains: ['https://cl-crm.certislink.com'], mode: 'AUTO', digits: 9
    }, {
        prefix: '+52', country: 'México (Cashimex)', domains: ['https://mx-crm.certislink.com'], mode: 'MANUAL', digits: 10
    }, {
        prefix: '+52', country: 'México (Various)', domains: ['https://mx-ins-crm.variousplan.com'], mode: 'MANUAL', digits: 10
    }, {
        prefix: '+51', country: 'Perú', domains: ['https://pe-crm.certislink.com'], mode: 'MANUAL', digits: 9
    }, {
        prefix: '+55', country: 'Brasil', domains: ['https://crm.creddireto.com'], mode: 'AUTO', digits: 11
    }, {
        prefix: '+54', country: 'Argentina', domains: ['https://crm.rayodinero.com'], mode: 'AUTO', digits: 10
    }];

    // ========================================================================
    // 2. ESTILOS CSS
    // ========================================================================
    const STYLES_CSS = `
        /* --- PROTECCIÓN VISUAL --- */
        #social-panel-wrapper, #btn-ver-id-ext, #btn-ghost-mode, 
        #visor-id-overlay, #manual-search-overlay, .ghost-toast-msg {
            filter: none !important;
            isolation: isolate;
        }

        /* --- NOTIFICACIONES TEMPORALES (TOAST) --- */
        .ghost-toast-msg {
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-20px);
            padding: 10px 20px; border-radius: 30px; font-family: 'Segoe UI', sans-serif;
            font-size: 13px; font-weight: 700; color: white; z-index: 2147483644; /* Nivel 4 */
            display: flex; align-items: center; gap: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px);
            opacity: 0; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: none;
        }
        .ghost-toast-msg.visible { opacity: 1; transform: translateX(-50%) translateY(0); }
        .ghost-toast-msg.success { background-color: rgba(16, 185, 129, 0.9); border: 1px solid #34d399; }
        .ghost-toast-msg.warning { background-color: rgba(245, 158, 11, 0.9); border: 1px solid #fbbf24; }

        /* --- BOTONES LATERALES (SLIDE) --- */
        .side-btn-app {
            position: fixed; left: -42px; width: 55px; height: 45px;
            z-index: 2147483644; /* Nivel 4 */ background-color: rgba(15, 23, 42, 0.85); color: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.15); border-left: none; border-radius: 0 12px 12px 0;
            cursor: pointer; font-weight: bold; font-size: 20px; display: flex; align-items: center;
            justify-content: flex-end; padding-right: 12px; backdrop-filter: blur(8px);
            box-shadow: 2px 2px 10px rgba(0,0,0,0.3); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .side-btn-app:hover { left: 0; justify-content: center; padding-right: 0; width: 60px; color: #fff; }

        /* Botón Cámara */
        #btn-ver-id-ext { top: 220px; }
        #btn-ver-id-ext:hover { background-color: rgba(16, 185, 129, 0.95); box-shadow: 0 0 15px rgba(16, 185, 129, 0.6); }

        /* Botón Ghost */
        #btn-ghost-mode { top: 275px; } 
        #btn-ghost-mode.active { background-color: rgba(139, 92, 246, 0.9); color: #fff; border-color: #a78bfa; box-shadow: 0 0 8px rgba(139, 92, 246, 0.4); }
        #btn-ghost-mode:hover { background-color: rgba(139, 92, 246, 1); box-shadow: 0 0 15px rgba(139, 92, 246, 0.6); }

        /* --- VISOR IMÁGENES Y MODALES --- */
        #visor-id-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5, 5, 5, 0.98); z-index: 2147483646; /* Nivel 6 */ display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0; animation: fadeIn 0.2s forwards; }
        @keyframes fadeIn { to { opacity: 1; } }
        #visor-img-container { flex: 1; width: 100%; display: flex; justify-content: center; align-items: center; overflow: hidden; cursor: grab; }
        #visor-editor-canvas { max-width: 90%; max-height: 80vh; box-shadow: 0 0 50px rgba(0,0,0,0.8); transition: transform 0.05s linear; }
        #visor-controls-wrapper { position: absolute; bottom: 30px; display: flex; flex-direction: column; align-items: center; gap: 10px; z-index: 2147483646; /* Nivel 6 */ background: rgba(30, 30, 30, 0.8); backdrop-filter: blur(15px); padding: 10px 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.15); }
        #visor-toolbar { display: flex; gap: 12px; align-items: center; }
        .visor-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; width: 44px; height: 44px; border-radius: 8px; cursor: pointer; font-size: 20px; display: flex; justify-content: center; align-items: center; transition: 0.2s; }
        .visor-btn:hover { background: rgba(255,255,255,0.2); transform: translateY(-3px); }
        .visor-btn.active { background: #3b82f6; border-color: #3b82f6; }
        #visor-close { position: absolute; top: 30px; right: 30px; background: rgba(220, 38, 38, 0.8); border: none; color: white; font-size: 24px; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; z-index: 2147483646; /* Nivel 6 */ transition: 0.2s; }
        #visor-close:hover { transform: rotate(90deg); background: #dc2626; }
        #tool-options-panel { display: none; gap: 10px; background: rgba(0,0,0,0.6); padding: 8px 15px; border-radius: 20px; }
        #tool-options-panel.visible { display: flex; }
        #visor-brush-cursor { position: fixed; pointer-events: none; z-index: 2147483646; /* Nivel 6 */ border-radius: 50%; border: 2px solid white; display: none; transform: translate(-50%, -50%); }
        #visor-thumbnails { display: flex; gap: 10px; margin-left: 10px; padding-left: 10px; border-left: 1px solid rgba(255,255,255,0.2); }
        .visor-thumb { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; cursor: pointer; opacity: 0.5; transition: 0.2s; }
        .visor-thumb.active { border: 2px solid #3b82f6; opacity: 1; transform: scale(1.1); }
        #manual-search-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 2147483644; /* Nivel 4 */ display: flex; justify-content: center; align-items: center; backdrop-filter: blur(8px); }
        #manual-search-box { background: #111827; width: 600px; padding: 25px; border-radius: 16px; display: flex; flex-direction: column; gap: 15px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px rgba(0,0,0,0.7); }
        #manual-viewer-frame { width: 100%; height: 400px; background: #000; border-radius: 12px; position: relative; overflow: hidden; display: flex; justify-content: center; align-items: center; cursor: grab; border: 1px solid #374151; }
        #manual-mini-toolbar { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(30, 30, 30, 0.9); padding: 8px 20px; border-radius: 30px; display: flex; gap: 20px; border: 1px solid rgba(255,255,255,0.2); }
        .mini-btn { background: none; border: none; color: white; font-size: 18px; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; transition: 0.2s; }
        .mini-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.1); }
        #manual-input { width: 100%; padding: 15px; border-radius: 8px; border: 1px solid #374151; background: #1f2937; color: #f9fafb; font-size: 18px; font-weight: bold; text-align: center; text-transform: uppercase; outline: none; }
        #manual-input:focus { border-color: #3b82f6; }
        #manual-confirm-btn { width: 100%; padding: 15px; border-radius: 8px; border: none; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
    `;

    const styleEl = document.createElement('style');
    styleEl.innerText = STYLES_CSS;
    document.head.appendChild(styleEl);

    // ========================================================================
    // 3. UTILIDADES
    // ========================================================================
    const getSavedNames = () => { try { return JSON.parse(localStorage.getItem('SOCIAL_NAMES_CACHE') || '{}'); } catch (e) { return {}; } };
    const saveName = (url, name) => { const cache = getSavedNames(); cache[url] = name; localStorage.setItem('SOCIAL_NAMES_CACHE', JSON.stringify(cache)); };
    function getCurrentConfig() { const url = window.location.href; return CONFIG_CRMS.find(c => c.domains.some(d => url.startsWith(d))) || null; }
    const scrapeField = (labels) => { 
        const arrLabels = Array.isArray(labels) ? labels : [labels];
        const el = [...document.querySelectorAll("div.mb-10")].find(e => {
            const text = e.innerText.trim();
            return arrLabels.some(lbl => text.startsWith(lbl));
        }); 
        return el ? (el.innerText.includes(":") ? el.innerText.substring(el.innerText.indexOf(":")+1).trim() : "") : ""; 
    };
    
    // 🔥 HELPER NUEVO: Convierte a "Formato Título" (Title Case)
    const toTitleCase = (str) => {
        if (!str) return "";
        return str.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };

    // 🔥 ACTUALIZADO: Permite /detail Y /loaned_management
    const isValidPage = (u) => u.includes('/detail') || u.includes('/loaned_management');

    function extractImages() {
        const found = [];
        const cImg = document.querySelector('img.image');
        if (cImg && cImg.src && !cImg.src.includes('data:image/gif')) found.push({ type: "Carnet", src: cImg.src });
        document.querySelectorAll('img').forEach(img => {
            if (found.some(fi => fi.src === img.src)) return; 
            if (img.naturalWidth > 50 && (img.src.includes('liveness') || img.src.includes('blob:') || img.closest('.sidebar') || img.classList.contains('avatar'))) {
                found.push({ type: "Selfie", src: img.src });
            }
        });
        return found;
    }

    function rotateCanvasInternally(canvas, ctx, degrees) {
        const temp = document.createElement('canvas'); const tCtx = temp.getContext('2d');
        if (Math.abs(degrees) % 180 === 90) { temp.width = canvas.height; temp.height = canvas.width; } else { temp.width = canvas.width; temp.height = canvas.height; }
        tCtx.translate(temp.width / 2, temp.height / 2); tCtx.rotate(degrees * Math.PI / 180);
        tCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2); canvas.width = temp.width; canvas.height = temp.height; ctx.drawImage(temp, 0, 0);
    }

    // ========================================================================
    // 4. LÓGICA ANTI-MARCA DE AGUA (GHOST MODE) + NOTIFICACIONES
    // ========================================================================
    let isGhostModeActive = localStorage.getItem('CRM_GHOST_MODE') === 'true';

    

    const removeWatermarks = () => {
        if (!isGhostModeActive) return; 
        const overlays = document.querySelectorAll('div[style*="fixed"][style*="z-index"]');
        overlays.forEach(el => {
            const style = window.getComputedStyle(el);
            const isHighZ = parseInt(style.zIndex) >= 90000;
            const isFixed = style.position === 'fixed';
            const isNoPointer = style.pointerEvents === 'none';
            const hasBackground = style.backgroundImage.includes('data:image/png') || style.backgroundImage.includes('url');
            
            // Protección: No borrar elementos de la extensión
            const isExtension = el.id.includes('social') || el.id.includes('visor') || el.id.includes('manual') || 
                                el.id.includes('wrapper') || el.id.includes('panel') || el.id.includes('btn') || 
                                el.id.includes('toast') || el.className.includes('ghost');

            if (isHighZ && isFixed && isNoPointer && hasBackground && !isExtension) {
                el.remove();
            }
        });
    };

    const updateGhostButtonVisuals = () => {
        const btn = document.getElementById('btn-ghost-mode');
        if (!btn) return;
        if (isGhostModeActive) btn.classList.add('active');
        else btn.classList.remove('active');
    };

    window.addEventListener('storage', (e) => {
        if (e.key === 'CRM_GHOST_MODE') {
            isGhostModeActive = e.newValue === 'true';
            updateGhostButtonVisuals();
            if (isGhostModeActive) removeWatermarks();
        }
    });

    // ========================================================================
    // 5. INYECCIÓN UI (BOTONES LATERALES)
    // ========================================================================
    const injectSideButtons = () => {
        const url = window.location.href;
        
        // --- 1. Botón Cámara (Mantenemos solo este) ---
        if (url.includes('/detail')) {
            if (!document.getElementById('btn-ver-id-ext')) {
                const btnCam = document.createElement('button');
                btnCam.id = 'btn-ver-id-ext';
                btnCam.className = 'side-btn-app';
                btnCam.innerHTML = '📷'; 
                btnCam.title = 'Ver Fotos del Cliente';
                btnCam.onclick = () => {
                    const imgs = extractImages();
                    if (imgs.length) openImageViewer(imgs);
                    else alert("⚠️ No se han encontrado imágenes.");
                };
                document.body.appendChild(btnCam);
            }
        } else {
            document.getElementById('btn-ver-id-ext')?.remove();
        }
        
        // El botón Ghost ha sido ELIMINADO de aquí.
    };

    // 🔥 PUENTE PARA EL MENÚ CONTEXTUAL 🔥
    // Esta función permite que el menú de 'content_auth.js' active el fantasma
    window.addEventListener('SST_ACTIVATE_GHOST', () => {
        isGhostModeActive = !isGhostModeActive;
        localStorage.setItem('CRM_GHOST_MODE', isGhostModeActive);
        if (isGhostModeActive) {
            removeWatermarks();
        }
        // Nota: Las notificaciones ahora las dispara content_auth.js directamente
    });

    // ========================================================================
    // 6. PANEL SOCIAL (SOLO EN DETAIL)
    // ========================================================================
    const injectSocialPanel = () => {
        const url = window.location.href;
        // Solo inyectar en páginas de detalle donde hay datos del cliente
        if (!url.includes('/detail')) {
            document.getElementById('social-panel-wrapper')?.remove();
            return;
        }
        
        const config = getCurrentConfig(); if (!config) return;
        if (document.getElementById('social-panel-wrapper')) return;

        const wrapper = document.createElement('div');
        wrapper.id = 'social-panel-wrapper';
        Object.assign(wrapper.style, {
            position: 'fixed', right: '0', bottom: '0', zIndex: '2147483644', 
            display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-end',
            pointerEvents: 'none', fontFamily: "'Segoe UI', sans-serif"
        });

        const panel = document.createElement('div');
        Object.assign(panel.style, {
            pointerEvents: 'auto', backgroundColor: 'rgba(10, 15, 30, 0.85)',
            backdropFilter: 'blur(20px)', padding: '12px', borderRadius: '14px',
            display: 'none', flexDirection: 'column', width: '200px',
            border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
            marginRight: '160px', marginBottom: '5px', transformOrigin: 'bottom right'
        });

        const closePanelBtn = document.createElement('div');
        closePanelBtn.innerHTML = '−';
        Object.assign(closePanelBtn.style, {
            position: 'absolute', top: '5px', right: '5px', width: '20px', height: '20px',
            borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
            fontWeight: 'bold', cursor: 'pointer'
        });
        closePanelBtn.onclick = () => { panel.style.display = 'none'; toggleBtn.style.display = 'flex'; };

        panel.innerHTML = `<div style="font-size:11px; color:#94a3b8; font-weight:700; letter-spacing:0.5px; margin-bottom:8px; text-align:center; padding-right: 15px;">SOCIAL <span style="color:#38bdf8">${config.country.toUpperCase()}</span></div>`;
        panel.appendChild(closePanelBtn);

        const createSocialBtn = (text, color, icon, onClick) => {
            const btn = document.createElement('button');
            btn.innerHTML = `<span style="margin-right:8px; font-size:14px;">${icon}</span>${text}`;
            Object.assign(btn.style, {
                width: '100%', padding: '8px 12px', fontSize: '12px', borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                backgroundColor: 'rgba(255,255,255,0.05)', color: '#e2e8f0',
                fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                transition: 'all 0.2s', marginBottom: '6px'
            });
            btn.onmouseenter = () => Object.assign(btn.style, { backgroundColor: color, borderColor: color, color: '#fff', transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${color}60` });
            btn.onmouseleave = () => Object.assign(btn.style, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#e2e8f0', transform: 'translateY(0)', boxShadow: 'none' });
            btn.onclick = onClick;
            return btn;
        };

        const socialActions = [
            { name: "TikTok", color: "#000000", icon: "🎵", u: n => `https://www.tiktok.com/search/user?q=${encodeURIComponent(n)}` },
            { name: "Telegram", color: "#0088cc", icon: "✈️", u: () => `tg://resolve?phone=${config.prefix.replace('+','')}${scrapeField(["Teléfono", "Celular Pessoal"]).replace(/\D/g, '')}` },
            { name: "Facebook", color: "#1877f2", icon: "📘", u: n => `https://www.facebook.com/search/top/?q=${encodeURIComponent(n)}` },
            { name: "Instagram", color: "#E1306C", icon: "📸", u: n => `https://www.google.com/search?q=${encodeURIComponent('site:instagram.com ' + n)}` }
        ];

        socialActions.forEach(s => {
            panel.appendChild(createSocialBtn(s.name, s.color, s.icon, () => {
                if (config.mode === "MANUAL" && s.name !== "Telegram" && !getSavedNames()[window.location.href]) {
                    alert("⚠️ Configura nombre.");
                    // MODIFICACIÓN: Pasamos callback con formato Title Case
                    openManualSearchModal(() => {
                        const newName = getSavedNames()[window.location.href];
                        if (newName) window.open(s.u(toTitleCase(newName.replace(/[0-9%]/g, '').trim())), '_blank');
                    });
                    panel.style.display = 'none'; toggleBtn.style.display = 'flex';
                    return;
                }
                if (s.name === "Telegram") window.location.href = s.u();
                else {
                    // 🔥 MODIFICACIÓN: Aplicamos toTitleCase aquí
                    const rawName = (getSavedNames()[window.location.href] || scrapeField(["Nombre", "Nome do Usuário"])).replace(/[0-9%]/g, '').trim();
                    window.open(s.u(toTitleCase(rawName)), '_blank');
                }
                panel.style.display = 'none'; toggleBtn.style.display = 'flex';
            }));
        });

        if (config.mode === "MANUAL") {
            const btnConf = createSocialBtn("Configurar", "#f59e0b", "⚙️", () => {
                openManualSearchModal();
                panel.style.display = 'none'; toggleBtn.style.display = 'flex';
            });
            btnConf.style.borderStyle = 'dashed'; panel.appendChild(btnConf);
        }

        const toggleBtn = document.createElement('div');
        Object.assign(toggleBtn.style, {
            width: 'auto', height: '33px', padding: '0 15px', borderRadius: '20px',
            backgroundColor: 'rgba(10, 15, 30, 0.9)', color: 'white',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', 
            transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.2)', 
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)', pointerEvents: 'auto', backdropFilter: 'blur(10px)',
            zIndex: '2147483644', marginRight: '160px', marginBottom: '5px'
        });
        
        toggleBtn.onmouseenter = () => { 
            const colors = ['#38bdf8', '#f472b6', '#4ade80', '#fbbf24', '#a78bfa', '#ef4444'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            toggleBtn.style.transform = 'translateY(-2px)'; 
            toggleBtn.style.borderColor = randomColor; 
            toggleBtn.style.color = randomColor; 
            toggleBtn.style.boxShadow = `0 4px 15px ${randomColor}40`; 
        };
        toggleBtn.onmouseleave = () => { 
            toggleBtn.style.transform = 'translateY(0)'; 
            toggleBtn.style.borderColor = 'rgba(255,255,255,0.2)'; 
            toggleBtn.style.color = 'white'; 
            toggleBtn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)'; 
        };
        toggleBtn.innerHTML = 'R. Social';
        toggleBtn.onclick = () => { toggleBtn.style.display = 'none'; panel.style.display = 'flex'; };

        wrapper.append(panel, toggleBtn);
        document.body.appendChild(wrapper);
    };

    // ========================================================================
    // 7. FUNCIONES MODALES (VISOR & MANUAL)
    // ========================================================================
    // --- MODAL MANUAL ---
    let mState = { scale: 1, posX: 0, posY: 0, isDragging: false, startX: 0, startY: 0 };
    // MODIFICACIÓN: Callback aceptado
    function openManualSearchModal(postSaveAction = null) {
        if (document.getElementById('manual-search-overlay')) return;
        const imgs = extractImages();
        const src = imgs[0]?.src || ""; 
        const url = window.location.href;
        const val = getSavedNames()[url] || scrapeField(["Nombre", "Nome do Usuário"]).replace(/[0-9%]/g, '').trim();
        mState = { scale: 1, posX: 0, posY: 0, isDragging: false };

        const ov = document.createElement("div"); ov.id = "manual-search-overlay";
        ov.innerHTML = `<div id="manual-search-box"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="color:white; font-weight:bold;">📸 REFERENCIA VISUAL</span><button id="manual-close" style="background:none; border:none; color:#9ca3af; cursor:pointer; font-size:16px;">✕ Cerrar</button></div><div id="manual-viewer-frame"><canvas id="manual-editor-canvas"></canvas><div id="manual-mini-toolbar"><button class="mini-btn" id="m-rot-l" title="Rotar Izquierda">⟲</button><button class="mini-btn" id="m-zoom-out" title="Alejar">➖</button><button class="mini-btn" id="m-zoom-in" title="Acercar">➕</button><button class="mini-btn" id="m-rot-r" title="Rotar Derecha">⟳</button></div></div><div style="display:flex; flex-direction:column; gap:5px;"><label style="color:#d1d5db; font-size:12px; font-weight:600;">NOMBRE PARA BÚSQUEDA:</label><input id="manual-input" value="${val}" placeholder="ESCRIBE EL NOMBRE..." spellcheck="false"></div><button id="manual-confirm-btn">✅ GUARDAR Y ACTUALIZAR</button></div>`;
        document.body.appendChild(ov);

        const canvas = document.getElementById('manual-editor-canvas'); const ctx = canvas.getContext('2d');
        const loadImage = (source) => {
            const img = new Image(); img.crossOrigin = "anonymous";
            img.onload = () => { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; ctx.drawImage(img, 0, 0); const frame = document.getElementById('manual-viewer-frame'); const scaleX = frame.clientWidth / img.naturalWidth; const scaleY = frame.clientHeight / img.naturalHeight; mState.scale = Math.min(scaleX, scaleY, 1) * 0.9; updateTransform(); };
            img.onerror = () => { const retry = new Image(); retry.src = source; retry.onload = () => { canvas.width = retry.naturalWidth; canvas.height = retry.naturalHeight; ctx.drawImage(retry, 0, 0); updateTransform(); }; };
            img.src = source;
        };
        if (src) loadImage(src);
        const updateTransform = () => { canvas.style.transform = `translate(${mState.posX}px, ${mState.posY}px) scale(${mState.scale})`; };
        document.getElementById('m-zoom-in').onclick = () => { mState.scale *= 1.2; updateTransform(); };
        document.getElementById('m-zoom-out').onclick = () => { mState.scale *= 0.8; updateTransform(); };
        document.getElementById('m-rot-l').onclick = () => rotateCanvasInternally(canvas, ctx, -90);
        document.getElementById('m-rot-r').onclick = () => rotateCanvasInternally(canvas, ctx, 90);
        const frame = document.getElementById('manual-viewer-frame');
        frame.onmousedown = (e) => { mState.isDragging = true; mState.startX = e.clientX - mState.posX; mState.startY = e.clientY - mState.posY; frame.style.cursor = 'grabbing'; };
        window.onmousemove = (e) => { if (mState.isDragging) { mState.posX = e.clientX - mState.startX; mState.posY = e.clientY - mState.startY; updateTransform(); } };
        window.onmouseup = () => { mState.isDragging = false; frame.style.cursor = 'grab'; };
        frame.onwheel = (e) => { e.preventDefault(); mState.scale *= e.deltaY > 0 ? 0.9 : 1.1; updateTransform(); };
        
        document.getElementById('manual-confirm-btn').onclick = () => { 
            const newVal = document.getElementById('manual-input').value.trim(); 
            if (newVal) { 
                saveName(url, newVal); 
                ov.remove(); 
                document.getElementById('social-panel-wrapper')?.remove(); 
                injectSocialPanel(); 
                if (postSaveAction) postSaveAction();
            } else { 
                alert("⚠️ Escribe un nombre."); 
            } 
        };
        
        document.getElementById('manual-close').onclick = () => ov.remove();
        setTimeout(() => document.getElementById('manual-input').select(), 100);
    }

    // --- VISOR ---
    let vState = { mode: 'VIEW', scale: 1, flip: 1, posX: 0, posY: 0, isDragging: false };
    function openImageViewer(imagesList) {
        if (document.getElementById('visor-id-overlay')) document.getElementById('visor-id-overlay').remove();
        vState = { mode: 'VIEW', scale: 1, flip: 1, posX: 0, posY: 0 };
        const overlay = document.createElement('div'); overlay.id = 'visor-id-overlay';
        overlay.innerHTML = `<div id="visor-brush-cursor"></div><div id="visor-img-container"><canvas id="visor-editor-canvas"></canvas></div><div id="visor-controls-wrapper"><div id="tool-options-panel"><span style="color:white; font-size:12px;">Color:</span><input type="color" id="brush-color" value="#ef4444"><span style="color:white; font-size:12px; margin-left:10px;">Tamaño:</span><input type="range" id="brush-size" min="5" max="50" value="15"></div><div id="visor-toolbar"></div></div><button id="visor-close" title="Cerrar (Esc)">✕</button>`;
        document.body.appendChild(overlay);
        const canvas = document.getElementById('visor-editor-canvas'); const ctx = canvas.getContext('2d'); const container = document.getElementById('visor-img-container');
        const loadCanvasImage = (src) => {
            const img = new Image(); img.crossOrigin = "anonymous";
            img.onload = () => { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; ctx.drawImage(img, 0, 0); vState.scale = Math.min(window.innerWidth / img.naturalWidth, window.innerHeight / img.naturalHeight) * 0.9; vState.posX = 0; vState.posY = 0; vState.flip = 1; updateCanvasTransform(); };
            img.onerror = () => { const retry = new Image(); retry.src = src; retry.onload = () => { canvas.width = retry.naturalWidth; canvas.height = retry.naturalHeight; ctx.drawImage(retry, 0, 0); updateCanvasTransform(); }; };
            img.src = src;
        };
        loadCanvasImage(imagesList[0].src);
        const updateCanvasTransform = () => { canvas.style.transform = `translate(${vState.posX}px, ${vState.posY}px) scale(${vState.scale}) scaleX(${vState.flip})`; };
        const toolbar = document.getElementById('visor-toolbar');
        const addBtn = (icon, action, id) => { const btn = document.createElement('button'); btn.className = 'visor-btn'; if(id) btn.id = id; btn.innerHTML = icon; btn.onclick = (e) => { e.stopPropagation(); action(btn); }; toolbar.appendChild(btn); return btn; };
        const setMode = (mode) => {
            vState.mode = mode; document.querySelectorAll('.visor-btn').forEach(b => b.classList.remove('active'));
            if (mode === 'VIEW') { 
                document.getElementById('btn-view-mode').classList.add('active'); 
                container.style.cursor = 'grab'; 
                canvas.style.cursor = 'grab'; 
                document.getElementById('tool-options-panel').classList.remove('visible'); 
                document.getElementById('visor-brush-cursor').style.display = 'none'; 
            } else { 
                document.getElementById('btn-draw-mode').classList.add('active'); 
                container.style.cursor = 'default'; // El fondo negro vuelve a ser flecha normal
                canvas.style.cursor = 'none';       // Solo la imagen esconde el cursor nativo
                document.getElementById('tool-options-panel').classList.add('visible'); 
            }
        };
        addBtn('✋', () => setMode('VIEW'), 'btn-view-mode'); addBtn('✏️', () => setMode('DRAW'), 'btn-draw-mode');
        const sep = document.createElement('div'); sep.style.cssText = 'width:1px; height:30px; background:rgba(255,255,255,0.2); margin:0 5px;'; toolbar.appendChild(sep);
        addBtn('⟲', () => rotateCanvasInternally(canvas, ctx, -90)); addBtn('⟳', () => rotateCanvasInternally(canvas, ctx, 90)); addBtn('↔️', () => { vState.flip *= -1; updateCanvasTransform(); }); addBtn('🔄', () => loadCanvasImage(imagesList[0].src));
        if (imagesList.length > 1) {
            const thumbsContainer = document.createElement('div'); thumbsContainer.id = 'visor-thumbnails';
            imagesList.forEach((item, idx) => { const th = document.createElement('img'); th.className = `visor-thumb ${idx === 0 ? 'active' : ''}`; th.src = item.src; th.onclick = (e) => { e.stopPropagation(); loadCanvasImage(item.src); document.querySelectorAll('.visor-thumb').forEach(t => t.classList.remove('active')); th.classList.add('active'); }; thumbsContainer.appendChild(th); });
            toolbar.appendChild(thumbsContainer);
        }
        setMode('VIEW');
        const cursor = document.getElementById('visor-brush-cursor');
        window.addEventListener('mousemove', (e) => {
            if (vState.mode === 'DRAW' && e.target === canvas) {
                const size = document.getElementById('brush-size').value; const scaledSize = size * vState.scale;
                cursor.style.display = 'block'; cursor.style.width = `${scaledSize}px`; cursor.style.height = `${scaledSize}px`; cursor.style.borderColor = document.getElementById('brush-color').value; cursor.style.left = `${e.clientX}px`; cursor.style.top = `${e.clientY}px`;
                if (vState.isDrawing) { const rect = canvas.getBoundingClientRect(); ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.strokeStyle = document.getElementById('brush-color').value; const x = (e.clientX - rect.left) * (canvas.width / rect.width); const y = (e.clientY - rect.top) * (canvas.height / rect.height); ctx.lineTo(x, y); ctx.stroke(); }
            } else { cursor.style.display = 'none'; }
            if (vState.mode === 'VIEW' && vState.isDragging) { vState.posX = e.clientX - vState.startX; vState.posY = e.clientY - vState.startY; updateCanvasTransform(); }
        });
        container.addEventListener('mousedown', (e) => {
            if (vState.mode === 'VIEW') { vState.isDragging = true; vState.startX = e.clientX - vState.posX; vState.startY = e.clientY - vState.posY; container.style.cursor = 'grabbing'; } 
            else if (vState.mode === 'DRAW' && e.target === canvas) { vState.isDrawing = true; const rect = canvas.getBoundingClientRect(); const x = (e.clientX - rect.left) * (canvas.width / rect.width); const y = (e.clientY - rect.top) * (canvas.height / rect.height); ctx.beginPath(); ctx.moveTo(x, y); }
        });
        window.addEventListener('mouseup', () => { vState.isDragging = false; vState.isDrawing = false; if (vState.mode === 'VIEW') container.style.cursor = 'grab'; });
        overlay.addEventListener('wheel', (e) => { e.preventDefault(); vState.scale *= e.deltaY > 0 ? 0.9 : 1.1; updateCanvasTransform(); });
        document.getElementById('visor-close').onclick = () => overlay.remove();
        const escHandler = (e) => { if (e.key === 'Escape') { overlay.remove(); window.removeEventListener('keydown', escHandler); } };
        window.addEventListener('keydown', escHandler);
    }

    // ========================================================================
    // 8. INICIALIZACIÓN
    // ========================================================================
    let lastUrl = location.href;
    const initAll = () => {
        injectSideButtons();
        injectSocialPanel();
        if (isGhostModeActive) removeWatermarks();
    };

    setTimeout(initAll, 1500);
    new MutationObserver(() => {
        if (location.href !== lastUrl) { lastUrl = location.href; initAll(); }
        // Re-inyección si se pierde (SPA)
        if (isValidPage(location.href) && !document.getElementById('btn-ghost-mode')) initAll();
        // Ejecución constante
        if (isGhostModeActive) removeWatermarks();
    }).observe(document.body, {subtree:true, childList:true});

    // ==============================================================================
    // 📡 ESCUCHADOR DE ÓRDENES DEL MENÚ OSCURO (Abre la imagen exacta)
    // ==============================================================================
    window.addEventListener('SST_OPEN_VIEWER', (e) => {
        const targetUrl = e.detail?.url;
        if (!targetUrl) return;
        
        const imgs = extractImages();
        // Buscamos si la imagen clickeada está en la lista del CRM
        const index = imgs.findIndex(img => img.src === targetUrl);
        
        if (index !== -1) {
            // Si la encuentra, la saca de donde esté y la pone en el lugar #1 (índice 0)
            const clickedImg = imgs.splice(index, 1)[0];
            imgs.unshift(clickedImg);
        } else {
            // Si por alguna razón es una foto suelta, la inyecta como la primera
            imgs.unshift({ type: "Seleccionada", src: targetUrl });
        }
        
        // Abre el visor, que automáticamente carga la imagen #1
        openImageViewer(imgs);
    });

})();
// ==============================================================================
// 📡 ESCUCHADOR DE COMANDOS DEL MENÚ CONTEXTUAL (content_auth.js)
// ==============================================================================
window.addEventListener('storage', (e) => {
    // Si la clave es nuestro comando y tiene datos nuevos
    if (e.key === 'SST_TRIGGER_VISOR_COMMAND' && e.newValue) {
        try {
            const commandData = JSON.parse(e.newValue);
            const targetImageUrl = commandData.url;
            console.log("SST SOCIAL: Recibida orden de visor para:", targetImageUrl);

            //
            // (Asumimos que content_social ya inyectó el modal y las variables globales)
            const modalVisor = document.getElementById('modal_visor_cedulas');
            const imgVisor = document.getElementById('img_visor_grande');
            
            if (!modalVisor || !imgVisor || typeof arrayImagesVisor === 'undefined') {
                console.error("SST SOCIAL: El Visor no está inicializado en esta pestaña.");
                return;
            }

            //
            let indexToOpen = arrayImagesVisor.indexOf(targetImageUrl);

            if (indexToOpen !== -1) {
                //
                console.log("SST SOCIAL: Imagen encontrada en el array. Abriendo índice:", indexToOpen);
                
                // Actualizamos variables globales del visor (definidas en content_social)
                currentVisorIndex = indexToOpen; 
                imgVisor.src = targetImageUrl;
                modalVisor.style.display = 'flex'; // Mostramos modal
                
                // (Opcional) Guardar caché para que persista al cerrar
                localStorage.setItem('CACHED_VISOR_INDEX', indexToOpen);
            } else {
                //
                console.log("SST SOCIAL: Imagen nueva. Inyectando en Visor temporalmente.");
                arrayImagesVisor.unshift(targetImageUrl); // Añadir al inicio
                currentVisorIndex = 0; 
                imgVisor.src = targetImageUrl;
                modalVisor.style.display = 'flex';
                // (Opcional) Re-cachear array
                localStorage.setItem('CACHED_VISOR_IMAGES', JSON.stringify(arrayImagesVisor));
            }

        } catch (err) {
            console.error("SST SOCIAL: Error al procesar comando de visor:", err);
        } finally {
            //
            localStorage.removeItem('SST_TRIGGER_VISOR_COMMAND');
        }
    }
});

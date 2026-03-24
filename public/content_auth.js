(function() {
    'use strict';

// =========================================================================
    // 🛡️ MÓDULO 1: MENÚ OSCURO INTELIGENTE V36 (NOMBRES, BORDES Y COOLDOWN) 🛡️
    // =========================================================================
    
    const styleBlindaje = document.createElement('style');
    styleBlindaje.innerHTML = `
        /* Blindaje visual */
        [id*="addon"], [id*="addon"] *, [id*="visor"], [id*="visor"] *,
        [id*="panel"], [id*="panel"] *, [id*="wrapper"], [id*="wrapper"] *,
        [id*="social"], [id*="social"] *, [id*="manual"], [id*="manual"] *,
        [id*="tool"], [id*="tool"] *, [id*="plantilla"], [id*="plantilla"] *,
        [id*="editor"], [id*="editor"] *, [id*="herramientas"], [id*="herramientas"] *,
        [id*="modal"], [id*="modal"] *, [id*="custom"], [id*="custom"] *,
        [id*="btn-"], [id*="btn-"] *, [id*="dyn-"], [id*="dyn-"] *,
        [id*="floating"], [id*="floating"] *, [id*="guide"], [id*="guide"] *,
        [class*="addon"], [class*="addon"] *, [class*="panel"], [class*="panel"] *,
        .side-btn-app, .side-btn-app *, .visor-btn, .visor-btn *,
        .ghost-toast-msg, .ghost-toast-msg *, .btn-copy-tag, .btn-copy-tag * {
            user-select: none !important;
            -webkit-user-select: none !important;
        }
        input, textarea {
            user-select: auto !important;
            -webkit-user-select: auto !important;
        }

        /* 🎨 ESTILOS DEL MENÚ DIGITAL PRO (WINDOWS 11) */
        #sst-global-context-menu {
            position: absolute; z-index: 2147483647; 
            background: rgba(10, 10, 12, 0.85); 
            backdrop-filter: blur(45px) saturate(180%);
            -webkit-backdrop-filter: blur(45px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.08); 
            border-radius: 12px; box-shadow: 0 15px 40px rgba(0,0,0,0.7);
            padding: 6px; display: none; flex-direction: column; min-width: 260px; max-width: 320px;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .sst-ctx-group { display: flex; flex-direction: column; gap: 2px; padding: 4px 0; }
        .sst-ctx-group:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 4px; }
        .sst-ctx-item {
            padding: 8px 12px; color: #e2e8f0; font-size: 13px; font-weight: 500;
            cursor: pointer; border-radius: 6px; transition: all 0.15s ease;
            display: flex; align-items: center; justify-content: space-between;
            position: relative;
        }
        .sst-ctx-item:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        .sst-ctx-icon { opacity: 0.8; font-size: 15px; width: 18px; text-align: center; }
        .sst-ctx-item:hover .sst-ctx-icon { opacity: 1; }
        
        .sst-nav-row { display: flex; justify-content: space-between; padding: 4px 14px; }
        .sst-nav-btn {
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
            color: white; border-radius: 6px; width: 30%; padding: 6px 0; cursor: pointer;
            text-align: center; transition: 0.2s; font-size: 14px;
        }
        .sst-nav-btn:hover { background: rgba(255, 255, 255, 0.15); }
        .sst-ctx-separator { height: 1px; background: rgba(255,255,255,0.1); margin: 4px 8px; isolation: isolate; }

        /* 🔥 ESTILOS PARA SUBMENÚS 🔥 */
        .sst-has-submenu::after {
            content: '▸';
            font-size: 11px; color: rgba(255,255,255,0.5); margin-left: 8px;
        }
        .sst-has-submenu:hover::after { color: #38bdf8; }

        .sst-submenu {
            display: none; position: absolute;
            /* La posición (left/right) ahora la maneja JS dinámicamente */
            top: -5px;
            background: rgba(10, 10, 12, 0.90); 
            backdrop-filter: blur(45px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.08); 
            border-radius: 12px; box-shadow: 0 15px 40px rgba(0,0,0,0.8);
            padding: 6px; min-width: 200px; z-index: 2147483647;
        }
        
        /* Atracción invisible AMPLIADA para mayor margen de error al mover el ratón */
        .sst-submenu::before {
            content: ''; position: absolute;
            top: -50px; bottom: -50px; left: -50px; right: -50px; /* 🔥 Sube a -40px o -50px si lo quieres más grande */
            z-index: -1;
        }

        /* 🔥 TOAST FLOTANTE EN CURSOR 🔥 */
        #toast-blindaje-fix {
            position: fixed; z-index: 2147483647; pointer-events: none;
            background: rgba(32, 32, 35, 0.85); color: #fff; padding: 10px 18px; border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.2); font-family: 'Segoe UI', sans-serif; font-size: 13px; font-weight: 600;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5); backdrop-filter: blur(15px);
            transition: transform 0.3s ease, opacity 0.3s ease; display: none; opacity: 0;
        }
    `;
    document.head.appendChild(styleBlindaje);

    const ctxMenu = document.createElement('div');
    ctxMenu.id = 'sst-global-context-menu';
    ctxMenu.innerHTML = `
        <div class="sst-ctx-group" id="sst-group-nav">
            <div class="sst-nav-row">
                <button class="sst-nav-btn" id="ctx-nav-back" title="Atrás">⬅️</button>
                <button class="sst-nav-btn" id="ctx-nav-fwd" title="Adelante">➡️</button>
                <button class="sst-nav-btn" id="ctx-nav-reload" title="Recargar">🔄</button>
            </div>
            <div class="sst-ctx-separator"></div>
            
            <div class="sst-ctx-item" id="ctx-tool-rafaga" style="color:#fcd34d;">Panel de Correos <span class="sst-ctx-icon">📧</span></div>
            
            <div class="sst-ctx-item sst-has-submenu" id="ctx-submenu-editor-trigger" style="color:#a78bfa;">
                <div>Editor Visual <span class="sst-ctx-icon">✏️</span></div>
                <div class="sst-submenu" id="sst-submenu-editor">
                    <div class="sst-ctx-item" id="ctx-tool-editor" style="color:#a78bfa;">Abrir Editor Visual <span class="sst-ctx-icon">🚀</span></div>
                    <div class="sst-ctx-item" id="ctx-tool-ghost" style="color:#d8b4fe;">Modo Fantasma <span class="sst-ctx-icon">👻</span></div>
                    <div class="sst-ctx-separator"></div>
                    <div class="sst-ctx-item" id="ctx-tool-soporte" style="color:#ef4444;">Soporte <span class="sst-ctx-icon">🆘</span></div>
                </div>
            </div>
            
            <div class="sst-ctx-item sst-has-submenu" id="ctx-submenu-plantilla-trigger" style="color:#34d399;">
                <div>Gestión de Plantillas <span class="sst-ctx-icon">📄</span></div>
                <div class="sst-submenu" id="sst-submenu-plantilla">
                    <div class="sst-ctx-item" id="ctx-tool-plantilla" style="color:#38bdf8;">Crear Plantilla <span class="sst-ctx-icon">➕</span></div>
                    <div class="sst-ctx-separator"></div>
                    <div class="sst-ctx-item" id="ctx-plantilla-import" style="color:#f59e0b;">Importar Backup <span class="sst-ctx-icon">📥</span></div>
                    <div class="sst-ctx-item" id="ctx-plantilla-export" style="color:#10b981;">Exportar Backup <span class="sst-ctx-icon">📤</span></div>
                </div>
            </div>

            <div class="sst-ctx-separator"></div>
            
            <div class="sst-ctx-item" id="ctx-tool-hoja" style="color:#10b981;">Abrir Mi Hoja (Sheets) <span class="sst-ctx-icon">📊</span></div>
            <div class="sst-ctx-item" id="ctx-tool-listado" style="color:#f97316;">Abrir Todo (Clientes) <span class="sst-ctx-icon">📋</span></div>
            <div class="sst-ctx-item" id="ctx-tool-facebook" style="color:#3b82f6;">Facebook <span class="sst-ctx-icon">📘</span></div>

            <div class="sst-ctx-separator"></div>

            <div class="sst-ctx-item sst-has-submenu" id="ctx-submenu-sistema-trigger" style="color:#94a3b8;">
                <div>Sistema y Sesión <span class="sst-ctx-icon">⚙️</span></div>
                <div class="sst-submenu" id="sst-submenu-sistema">
                    <div class="sst-ctx-item" id="ctx-sys-cache" style="color:#22d3ee;">Borrar Caché <span class="sst-ctx-icon">🧹</span></div>
                    <div class="sst-ctx-separator"></div>
                    <div class="sst-ctx-item" id="ctx-sys-logout" style="color:#ef4444;">Cerrar Sesión <span style="font-size:16px; padding-top: 4px; padding-left: 4px;">⏻</span></div>
                    <div class="sst-ctx-item" id="ctx-sys-reset" style="color:#f97316;">Restablecer <span style="font-size:18px; font-weight:bold; padding-bottom:2px;">↺</span></div>
                </div>
            </div>

        </div>

        <div class="sst-ctx-group" id="sst-group-image" style="display:none;">
            <div class="sst-ctx-item" id="ctx-img-view" style="color:#38bdf8; font-weight:bold;">Ver en Visor SST <span class="sst-ctx-icon">📷</span></div>
            <div class="sst-ctx-separator"></div>
            <div class="sst-ctx-item" id="ctx-img-open">Abrir imagen en nueva pestaña <span class="sst-ctx-icon">👁️</span></div>
            <div class="sst-ctx-item" id="ctx-img-save" title="Descarga silenciosa al PC">Guardar imagen como... <span class="sst-ctx-icon">💾</span></div>
            <div class="sst-ctx-item" id="ctx-img-copy-url">Copiar enlace de imagen <span class="sst-ctx-icon">🔗</span></div>
            <div class="sst-ctx-item" id="ctx-img-lens">Buscar imagen con Google <span class="sst-ctx-icon">🔍</span></div>
        </div>
        
        <div class="sst-ctx-group" id="sst-group-edit" style="display:none;">
            <div class="sst-ctx-item" id="ctx-copy">Copiar Texto <span class="sst-ctx-icon">📋</span></div>
            <div class="sst-ctx-item" id="ctx-cut" style="display:none;">Cortar <span class="sst-ctx-icon">✂️</span></div>
            <div class="sst-ctx-item" id="ctx-paste" style="display:none;">Pegar <span class="sst-ctx-icon">📝</span></div>
        </div>
    `;
    document.body.appendChild(ctxMenu);

    const toastBlindaje = document.createElement('div');
    toastBlindaje.id = 'toast-blindaje-fix';
    document.body.appendChild(toastBlindaje);

    let lastClickX = 0;
    let lastClickY = 0;

    const showSSTToast = (msg, isError = false) => {
        toastBlindaje.innerText = msg;
        toastBlindaje.style.display = 'block';
        toastBlindaje.style.borderColor = isError ? '#ef4444' : 'rgba(255,255,255,0.2)';
        
        let posX = lastClickX + 15;
        let posY = lastClickY + 15;
        
        const ancho = toastBlindaje.offsetWidth || 200;
        const alto = toastBlindaje.offsetHeight || 40;
        if (posX + ancho > window.innerWidth) posX = window.innerWidth - ancho - 10;
        if (posY + alto > window.innerHeight) posY = window.innerHeight - alto - 10;

        toastBlindaje.style.left = posX + 'px';
        toastBlindaje.style.top = posY + 'px';
        
        toastBlindaje.style.transform = 'translateY(15px)';
        toastBlindaje.style.opacity = '0';
        
        setTimeout(() => {
            toastBlindaje.style.transform = 'translateY(0)';
            toastBlindaje.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            toastBlindaje.style.transform = 'translateY(-20px)';
            toastBlindaje.style.opacity = '0';
            setTimeout(() => toastBlindaje.style.display = 'none', 300);
        }, 2000); 
    };

    // 🔥 FUNCIÓN CENTRALIZADA PARA CERRAR EL MENÚ Y SUBMENÚS
    const closeMenuCompletely = () => {
        ctxMenu.style.display = 'none';
        ctxMenu.querySelectorAll('.sst-submenu').forEach(sub => sub.style.display = 'none');
    };

    // 🔥 CONTROL INTELIGENTE DE SUBMENÚS (Hover Magnético y Colisión Lateral)
    const submenusTriggers = ctxMenu.querySelectorAll('.sst-has-submenu');
    submenusTriggers.forEach(trigger => {
        const submenu = trigger.querySelector('.sst-submenu');

        trigger.addEventListener('mouseenter', () => {
            // Cierra inmediatamente los otros submenús para que no se crucen
            submenusTriggers.forEach(t => {
                if (t !== trigger) {
                    t.querySelector('.sst-submenu').style.display = 'none';
                }
            });

            submenu.style.display = 'flex';
            submenu.style.flexDirection = 'column';
            submenu.style.gap = '2px';

            // Detección inteligente de bordes
            const rect = trigger.getBoundingClientRect();
            if (rect.right + 220 > window.innerWidth) {
                submenu.style.left = 'auto';
                submenu.style.right = 'calc(100% + 5px)'; // Lo abre hacia la izquierda
            } else {
                submenu.style.left = 'calc(100% + 5px)';
                submenu.style.right = 'auto'; // Lo abre hacia la derecha normal
            }
        });

        trigger.addEventListener('mouseleave', () => {
            // Se cierra al instante al salir del menú y su zona magnética
            submenu.style.display = 'none';
        });
    });

    let elementoActivo = null;
    let urlImagenActiva = null;
    let textoCapturado = "";

    document.addEventListener('contextmenu', (e) => {
        if (e.altKey) return; 
        e.preventDefault(); 
        
        lastClickX = e.clientX;
        lastClickY = e.clientY;
        
        elementoActivo = e.target;
        textoCapturado = window.getSelection().toString().trim();

        const path = e.composedPath();
        let esZonaProhibida = path.some(el => {
            if (!el || !el.tagName) return false;
            const tag = el.tagName.toLowerCase();
            const id = (el.id || '').toLowerCase();
            const cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();
            
            if (tag === 'button' || tag === 'a' || cls.includes('el-button')) return true;
            return id.includes('addon') || id.includes('visor') || id.includes('panel') || 
                   id.includes('wrapper') || id.includes('social') || id.includes('manual') || 
                   id.includes('tool') || id.includes('plantilla') || id.includes('editor') || 
                   id.includes('herramientas') || id.includes('modal') || id.includes('custom') || 
                   id.includes('btn-') || id.includes('dyn-') || id.includes('floating') || 
                   id.includes('guide') || cls.includes('addon') || cls.includes('side-btn') || 
                   cls.includes('visor-btn') || cls.includes('btn-copy-tag') || cls.includes('sst-submenu');
        });

        const esCajaTexto = (elementoActivo.tagName === 'INPUT' || elementoActivo.tagName === 'TEXTAREA');
        if (esCajaTexto) esZonaProhibida = false;

        const gNav = document.getElementById('sst-group-nav');
        const gImg = document.getElementById('sst-group-image');
        const gEdit = document.getElementById('sst-group-edit');
        const iCut = document.getElementById('ctx-cut');
        const iPaste = document.getElementById('ctx-paste');
        
        gNav.style.display = 'none'; gImg.style.display = 'none'; gEdit.style.display = 'none';
        urlImagenActiva = null;

        let mostrarMenu = false;

        if (esCajaTexto) {
            mostrarMenu = true; gEdit.style.display = 'flex'; iCut.style.display = 'flex'; iPaste.style.display = 'flex';
            if (!textoCapturado) textoCapturado = elementoActivo.value.substring(elementoActivo.selectionStart, elementoActivo.selectionEnd);
        } else if (elementoActivo.tagName === 'IMG' && !esZonaProhibida) {
            mostrarMenu = true; gImg.style.display = 'flex'; urlImagenActiva = elementoActivo.src;
        } else if (textoCapturado !== '' && !esZonaProhibida) {
            mostrarMenu = true; gEdit.style.display = 'flex'; iCut.style.display = 'none'; iPaste.style.display = 'none';
        } else if (!esZonaProhibida) {
            mostrarMenu = true; gNav.style.display = 'flex';
        }

        if (mostrarMenu) {
            closeMenuCompletely(); // Resetear estado de submenús

            // 🔥 VISIBILIDAD POR PESTAÑAS 🔥
            const currentUrl = window.location.href;
            const isDetail = currentUrl.includes('/detail');
            const isListado = currentUrl.includes('loaned_management/pedding_list');

            // Exclusivo Pestaña "Detail"
            document.getElementById('ctx-tool-plantilla').style.display = isDetail ? 'flex' : 'none';
            document.getElementById('ctx-tool-facebook').style.display = isDetail ? 'flex' : 'none';
            document.getElementById('ctx-tool-editor').style.display = isDetail ? 'flex' : 'none';
            document.getElementById('ctx-tool-soporte').style.display = isDetail ? 'flex' : 'none';

            // Ocultar líneas separadoras de detail
            const sepSoporte = document.getElementById('ctx-tool-soporte').previousElementSibling;
            if (sepSoporte) sepSoporte.style.display = isDetail ? 'block' : 'none';
            const sepPlantilla = document.getElementById('ctx-tool-plantilla').nextElementSibling; // Porque Crear Plantilla subió
            if (sepPlantilla) sepPlantilla.style.display = isDetail ? 'block' : 'none';

            // Exclusivo Pestaña "Listado"
            document.getElementById('ctx-tool-listado').style.display = isListado ? 'flex' : 'none';


            ctxMenu.style.display = 'flex';
            const menuAncho = ctxMenu.offsetWidth;
            const menuAlto = ctxMenu.offsetHeight;
            let x = lastClickX; 
            let y = lastClickY;
            
            if (x + menuAncho > window.innerWidth) x = window.innerWidth - menuAncho - 10; 
            if (y + menuAlto > window.innerHeight) y = window.innerHeight - menuAlto - 10;
            
            ctxMenu.style.position = 'fixed';
            ctxMenu.style.left = x + 'px'; 
            ctxMenu.style.top = y + 'px';
        } else {
            closeMenuCompletely();
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#sst-global-context-menu')) closeMenuCompletely();
    });

    // ---------------------------------------------------------
    // 🔥 EVENTOS DE CLIC - HERRAMIENTAS 🔥
    // ---------------------------------------------------------
    
    // Evitar que el clic en los textos padres cierre el menú
    document.getElementById('ctx-submenu-editor-trigger').onclick = (e) => { e.stopPropagation(); };
    document.getElementById('ctx-submenu-plantilla-trigger').onclick = (e) => { e.stopPropagation(); };
    document.getElementById('ctx-submenu-sistema-trigger').onclick = (e) => { e.stopPropagation(); };

    document.getElementById('ctx-tool-rafaga').onclick = () => {
        closeMenuCompletely();
        const isMac = navigator.userAgent.toUpperCase().indexOf('MAC OS') >= 0 || (navigator.userAgentData && navigator.userAgentData.platform === 'macOS');
        const eventParams = { key: 'Z', code: 'KeyZ', shiftKey: true, bubbles: true };
        if (isMac) eventParams.metaKey = true; else eventParams.ctrlKey = true;
        document.dispatchEvent(new KeyboardEvent('keydown', eventParams));
    };

    document.getElementById('ctx-tool-editor').onclick = (e) => {
        e.stopPropagation(); 
        closeMenuCompletely();
        const btn = document.getElementById('btn-open-editor'); 
        if (btn) btn.click(); else showSSTToast("⚠️ Abre un perfil para usar el Editor", true);
    };

    document.getElementById('ctx-tool-ghost').onclick = (e) => {
        e.stopPropagation();
        closeMenuCompletely();
        window.dispatchEvent(new CustomEvent('SST_ACTIVATE_GHOST'));
        setTimeout(() => {
            const isActive = localStorage.getItem('CRM_GHOST_MODE') === 'true';
            if (isActive) showSSTToast('👻 Marca de agua OCULTA', false);
            else showSSTToast('👁️ Marca de agua VISIBLE', true);
        }, 30);
    };

    document.getElementById('ctx-tool-soporte').onclick = (e) => {
        e.stopPropagation();
        closeMenuCompletely();
        const btnSoporte = document.getElementById('btn-soporte-nativo');
        if (btnSoporte) btnSoporte.click(); else showSSTToast("⚠️ Botón Soporte no cargado", true);
    };

    document.getElementById('ctx-plantilla-import').onclick = (e) => {
        e.stopPropagation();
        closeMenuCompletely();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json, .txt';
        input.onchange = ev => {
            const file = ev.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (Array.isArray(data)) {
                        localStorage.setItem('CUSTOM_BTNS_LIST', JSON.stringify(data));
                        window.dispatchEvent(new StorageEvent('storage', { key: 'CUSTOM_BTNS_LIST', newValue: JSON.stringify(data) }));
                        showSSTToast("📥 Backup restaurado con éxito", false);
                    } else showSSTToast("⚠️ Formato incorrecto", true);
                } catch(err) { showSSTToast("❌ Error: Archivo corrupto", true); }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    document.getElementById('ctx-plantilla-export').onclick = (e) => {
        e.stopPropagation();
        closeMenuCompletely();
        const data = localStorage.getItem('CUSTOM_BTNS_LIST') || "[]";
        if (data === "[]") { showSSTToast("⚠️ No hay plantillas para exportar", true); return; }
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Plantillas_SST_Backup_${new Date().toISOString().slice(0,10)}.json`; 
        a.click();
        URL.revokeObjectURL(url);
        showSSTToast("📤 Backup exportado con éxito", false);
    };

    document.getElementById('ctx-tool-plantilla').onclick = (e) => {
        e.stopPropagation();
        closeMenuCompletely();
        const container = document.getElementById('custom-btns-container');
        const btnCrear = container ? Array.from(container.children).find(el => el.textContent && el.textContent.includes('Crear Plantilla')) : null;
        if (btnCrear) btnCrear.click(); else showSSTToast("⚠️ Contenedor de plantillas inactivo", true);
    };

    document.getElementById('ctx-tool-hoja').onclick = async () => {
        closeMenuCompletely();
        const user = localStorage.getItem('usuarioLogueado');
        if (!user) { showSSTToast('❌ Falta Usuario', true); return; }
        showSSTToast('🔍 Buscando hoja...');
        try {
            const response = await fetch(`${API_URL}?token=SST_V12_CORP_SECURE_2026_X9&usuario=${user}`);
            const data = await response.json();
            if (data.id) { window.open('https://docs.google.com/spreadsheets/d/' + data.id + '/edit', '_blank'); showSSTToast('📊 Hoja abierta'); }
            else showSSTToast('❌ Sin hoja asignada', true);
        } catch (err) { showSSTToast('⚠️ Error servidor', true); }
    };

    document.getElementById('ctx-tool-listado').onclick = () => {
        closeMenuCompletely();
        const btnListado = Array.from(document.querySelectorAll('button, div, span')).find(btn => btn.textContent && btn.textContent.trim() === '⚡ ABRIR TODO ⚡');
        if (btnListado) btnListado.click(); else showSSTToast("⚠️ Botón ⚡ ABRIR TODO ⚡ no encontrado", true);
    };

    document.getElementById('ctx-tool-facebook').onclick = () => {
        closeMenuCompletely();
        const btnFB = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent && btn.textContent.includes('Facebook') && !btn.closest('#sst-global-context-menu'));
        if (btnFB) btnFB.click(); else showSSTToast("⚠️ Botón de Facebook no encontrado", true);
    };

    document.getElementById('ctx-sys-cache').onclick = (e) => {
        e.stopPropagation();
        closeMenuCompletely();
        const isVitalKey = (key) => {
            const exactMatches = ['usuarioLogueado', 'sessionId', 'loginTimestamp', 'sessionLimit', 'configRef', 'deviceUniqueId', 'CUSTOM_BTNS_LIST', 'CRM_GHOST_MODE', 'SYSTEM_NOTIF_SOUND', 'firebaseToken'];
            const prefixes = ['LAST_', 'CRM_', 'ALERT_', 'NOTIF_', 'DELIVERED_', 'SHARED_', 'RAFAGA_'];
            if (exactMatches.includes(key)) return true;
            if (prefixes.some(prefix => key.startsWith(prefix))) return true;
            return false;
        };
        let countBorrados = 0;
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (!isVitalKey(key)) {
                localStorage.removeItem(key);
                countBorrados++;
            }
        }
        localStorage.setItem('SST_CACHE_CLEARED', Date.now().toString());
        showSSTToast(`🧹 Caché limpiado: ${countBorrados}`, false);
    };

    document.getElementById('ctx-sys-reset').onclick = (e) => {
        e.stopPropagation();
        closeMenuCompletely();
        
        const data = localStorage.getItem('CUSTOM_BTNS_LIST') || "[]";
        if (data !== "[]" && data.length > 5) {
            showSSTToast("📤 Guardando backup de plantillas...", false);
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SST_Backup_Auto_Reseteo_${new Date().toISOString().slice(0,10)}.json`; 
            a.click();
            URL.revokeObjectURL(url);
        }

        const isDetail = window.location.href.includes('/detail');
        localStorage.setItem('cerrar_detalles', Date.now().toString());
        localStorage.setItem('SST_SYNC_REPAIR', Date.now().toString());

        setTimeout(() => {
            if (isDetail) {
                window.close(); 
            } else {
                if (typeof window.SST_GLOBAL_REPAIR === 'function') window.SST_GLOBAL_REPAIR();
            }
        }, 800); 
    };

    document.getElementById('ctx-sys-logout').onclick = (e) => {
        e.stopPropagation();
        closeMenuCompletely();
        
        localStorage.setItem('SST_SYNC_SHOW_LOGOUT', Date.now().toString());
        window.dispatchEvent(new CustomEvent('SST_SHOW_LOGOUT_PROMPT'));
    };

    // ---------------------------------------------------------
    // FUNCIONES DE IMÁGENES Y TEXTO
    // ---------------------------------------------------------
    
    document.getElementById('ctx-img-view').onclick = () => {
        if (!urlImagenActiva) return;
        closeMenuCompletely();
        window.dispatchEvent(new CustomEvent('SST_OPEN_VIEWER', { detail: { url: urlImagenActiva } }));
    };

    document.getElementById('ctx-img-open').onclick = () => {
        if (!urlImagenActiva) return;
        closeMenuCompletely();
        const novaAba = window.open('', '_blank');
        novaAba.document.write(`
            <html><head><title>Visor SST PRO</title></head><body style="margin: 0; display: flex; justify-content: center; align-items: center; background-color: #0e1117; height: 100vh;"><img src="${urlImagenActiva}" style="max-width: 100%; max-height: 100%; object-fit: contain;"></body></html>
        `);
        novaAba.document.close();
    };

    document.getElementById('ctx-img-save').onclick = () => {
        if (!urlImagenActiva) return;
        closeMenuCompletely();
        showSSTToast("💾 Descargando imagen...");
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none'; iframe.src = urlImagenActiva;
        document.body.appendChild(iframe);
        setTimeout(() => document.body.removeChild(iframe), 5000);
    };

    document.getElementById('ctx-img-copy-url').onclick = () => {
        if (urlImagenActiva) { navigator.clipboard.writeText(urlImagenActiva); showSSTToast("🔗 Enlace copiado"); }
        closeMenuCompletely();
    };

    document.getElementById('ctx-img-lens').onclick = () => {
        if (urlImagenActiva) window.open(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(urlImagenActiva)}`, '_blank');
        closeMenuCompletely();
    };

    document.getElementById('ctx-nav-back').onclick = () => window.history.back();
    document.getElementById('ctx-nav-fwd').onclick = () => window.history.forward();
    document.getElementById('ctx-nav-reload').onclick = () => location.reload();

    document.getElementById('ctx-copy').onclick = () => {
        if (textoCapturado) { navigator.clipboard.writeText(textoCapturado); showSSTToast("📋 Texto copiado"); }
        else document.execCommand('copy');
        closeMenuCompletely();
    };
    
    document.getElementById('ctx-cut').onclick = () => {
        if (textoCapturado && (elementoActivo.tagName === 'INPUT' || elementoActivo.tagName === 'TEXTAREA')) {
            navigator.clipboard.writeText(textoCapturado);
            elementoActivo.value = elementoActivo.value.replace(textoCapturado, '');
        }
        closeMenuCompletely();
    };
    
    document.getElementById('ctx-paste').onclick = async () => {
        try {
            const txt = await navigator.clipboard.readText();
            if (elementoActivo && (elementoActivo.tagName === 'INPUT' || elementoActivo.tagName === 'TEXTAREA')) {
                const s = elementoActivo.selectionStart; const e = elementoActivo.selectionEnd;
                elementoActivo.value = elementoActivo.value.substring(0, s) + txt + elementoActivo.value.substring(e);
                elementoActivo.selectionStart = elementoActivo.selectionEnd = s + txt.length;
                elementoActivo.dispatchEvent(new Event('input', { bubbles: true })); 
            }
        } catch (err) { showSSTToast("Error. Usa Ctrl+V.", true); }
        closeMenuCompletely();
    };

    window.addEventListener('keydown', (e) => {
        const isMac = navigator.userAgent.toUpperCase().indexOf('MAC OS') >= 0 || (navigator.userAgentData && navigator.userAgentData.platform === 'macOS');
        const key = e.key.toLowerCase();

        // Atajos de Windows (Ctrl + Shift + I/J/C) o (Ctrl + U/P)
        const isWinDev = e.ctrlKey && e.shiftKey && (key === 'i' || key === 'j' || key === 'c');
        const isWinSource = e.ctrlKey && (key === 'u' || key === 'p');

        // Atajos de Mac (Cmd + Option + I/J/C/U) o (Cmd + U/P)
        const isMacDev = isMac && e.metaKey && e.altKey && (key === 'i' || key === 'j' || key === 'c' || key === 'u');
        const isMacSource = isMac && e.metaKey && (key === 'u' || key === 'p');

        if (e.key === 'F12' || isWinDev || isWinSource || isMacDev || isMacSource) {
            e.preventDefault();
        }
    });
    // =========================================================================
    // 🛡️ MÓDULO 2: AUTENTICACIÓN, FIREBASE Y ALERTAS (CRM SUITE) 🛡️
    // =========================================================================
    const CONFIG_CRMS = [{
        'prefix': '+57', 'country': 'COLOMBIA', 'domains': ['https://co-crm.certislink.com'], 'digits': 10
    }, {
        'prefix': '+52', 'country': 'MÉXICO', 'domains': ['https://mx-crm.certislink.com', 'https://mx-ins-crm.variousplan.com'], 'digits': 10
    }, {
        'prefix': '+56', 'country': 'CHILE', 'domains': ['https://cl-crm.certislink.com'], 'digits': 9
    }, {
        'prefix': '+51', 'country': 'PERÚ', 'domains': ['https://pe-crm.certislink.com'], 'digits': 9
    }, {
        'prefix': '+55', 'country': 'BRASIL', 'domains': ['https://crm.creddireto.com'], 'digits': 11
    }, {
        'prefix': '+54', 'country': 'ARGENTINA', 'domains': ['https://crm.rayodinero.com'], 'digits': 10
    }];

    // 🔥 URLS PARA EL BOTÓN Y RELOJ
    const TARGET_URLS = CONFIG_CRMS.flatMap(item => item.domains.flatMap(domain => [domain + '/#/loaned_management/pedding_list', domain + '/#/login?']));

    // ==========================================
    // 🌐 EL ENRUTADOR INTELIGENTE V12
    // ==========================================
    const CEREBRO_URL = 'https://script.google.com/macros/s/AKfycbxsyFiCV1bhHvfPFXCANqN9Ce4ap-DtABPgqdZ_5H74NMwa_1tk1Y8FNzvfUvUkjBiLbQ/exec';
    const FIREBASE_URL = "https://notificacionalamza-default-rtdb.firebaseio.com/alerta_activa.json";
    
    const API_URL = CEREBRO_URL;
    
    // Variable para detener intervalos
    let isExtensionAlive = true;
    let audioContextUnlocked = false;
    let lastHeartbeatTime = 0; // 🔥 FIX: Para control de disparo inmediato

    // Recuperamos variables de sesión
    let deviceUniqueId = localStorage.getItem('deviceUniqueId');
    if (!deviceUniqueId) {
        deviceUniqueId = 'dev_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceUniqueId', deviceUniqueId);
    }
    let sessionId = localStorage.getItem('sessionId') || Date.now().toString(36) + Math.random().toString(36).substring(2);
// 🔥 BLOQUEO ANTI-FUGA (Evita cerrar la pestaña si hay alerta)
   // window.addEventListener('beforeunload', (e) => {
     //  if (document.getElementById('addon-alert-overlay') || document.querySelector('.addon-aviso-temp')) {
          ////  e.returnValue = 'Tienes un aviso urgente pendiente por leer.';
 //       }
  //  });
    // UTILS
    function getCountryName() {
        const currentUrl = window.location.href;
        const found = CONFIG_CRMS.find(c => c.domains.some(d => currentUrl.startsWith(d)));
        return found ? found.country : 'CRM GLOBAL';
    }

    function isValidCrmDomain() {
        const currentUrl = window.location.href;
        return CONFIG_CRMS.some(c => c.domains.some(d => currentUrl.startsWith(d)));
    }
    
// ==========================================
    // 🛡️ MOTOR VISUAL DE ALERTAS Y MODALES (NIVEL 7)
    // ==========================================
    const blindarElemento = (el) => {
        if (!el) return;
        ['mousedown', 'mouseup', 'click', 'keydown', 'keyup', 'keypress'].forEach(evt => {
            el.addEventListener(evt, (e) => e.stopPropagation());
        });
    };

    const mostrarConfirmacionHTML = (titulo, mensaje, textoConfirmar = 'Aceptar', colorConfirmar = '#3b82f6') => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            Object.assign(overlay.style, {
                position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: '2147483647',
                display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '20px', backdropFilter: 'blur(5px)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            });

            const modal = document.createElement('div');
            Object.assign(modal.style, {
                background: '#1e293b', padding: '25px', borderRadius: '12px', border: `1px solid ${colorConfirmar}`,
                width: '420px', maxWidth: '90%', color: 'white', boxShadow: `0 15px 40px rgba(0,0,0,0.6), 0 0 15px ${colorConfirmar}40`,
                textAlign: 'center'
            });

            blindarElemento(overlay);

            modal.innerHTML = `
                <h3 style="margin: 0 0 15px 0; color: ${colorConfirmar}; font-size: 20px; font-weight: bold;">${titulo}</h3>
                <p style="margin: 0 0 25px 0; font-size: 15px; color: #cbd5e1; line-height: 1.5;">${mensaje}</p>
                <div style="display: flex; justify-content: center; gap: 15px;">
                    <button id="btn-modal-cancel" style="background: transparent; border: 1px solid #64748b; color: #cbd5e1; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">Cancelar</button>
                    <button id="btn-modal-confirm" style="background: ${colorConfirmar}; border: none; color: ${colorConfirmar === '#eab308' || colorConfirmar === '#34d399' ? 'black' : 'white'}; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 0 10px ${colorConfirmar}80; transition: 0.2s;">${textoConfirmar}</button>
                </div>
            `;

            const btnCancel = modal.querySelector('#btn-modal-cancel');
            const btnConfirm = modal.querySelector('#btn-modal-confirm');
            
            btnCancel.onmouseover = () => btnCancel.style.background = 'rgba(100, 116, 139, 0.2)';
            btnCancel.onmouseout = () => btnCancel.style.background = 'transparent';
            btnConfirm.onmouseover = () => btnConfirm.style.transform = 'scale(1.05)';
            btnConfirm.onmouseout = () => btnConfirm.style.transform = 'scale(1)';

            btnCancel.onclick = () => { overlay.remove(); resolve(false); };
            btnConfirm.onclick = () => { overlay.remove(); resolve(true); };

            overlay.appendChild(modal);
            document.body.appendChild(overlay);
        });
    };

    const mostrarModalReparacion = () => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            Object.assign(overlay.style, {
                position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: '2147483647',
                display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '20px', backdropFilter: 'blur(5px)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            });

            const modal = document.createElement('div');
            Object.assign(modal.style, {
                background: '#1e293b', padding: '25px', borderRadius: '12px', border: `1px solid #ef4444`,
                width: '420px', maxWidth: '90%', color: 'white', boxShadow: `0 15px 40px rgba(0,0,0,0.6), 0 0 15px #ef444440`,
                textAlign: 'center'
            });

            blindarElemento(overlay);

            modal.innerHTML = `
                <h3 style="margin: 0 0 15px 0; color: #ef4444; font-size: 20px; font-weight: bold;">🚨 Recuperación Total</h3>
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #cbd5e1; line-height: 1.5;">
                    Ingresa tus credenciales para <strong>cerrar todas las sesiones activas</strong> en el servidor y limpiar la extensión.
                </p>
                <input type="text" id="rep-user" placeholder="Usuario" style="width: 100%; padding: 12px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #475569; background: rgba(0,0,0,0.3); color: white; outline: none; box-sizing: border-box; text-align: center; font-size: 14px;">
                <input type="password" id="rep-pass" placeholder="Contraseña" style="width: 100%; padding: 12px; margin-bottom: 20px; border-radius: 6px; border: 1px solid #475569; background: rgba(0,0,0,0.3); color: white; outline: none; box-sizing: border-box; text-align: center; font-size: 14px;">
                <div style="display: flex; justify-content: center; gap: 15px;">
                    <button id="btn-rep-cancel" style="background: transparent; border: 1px solid #64748b; color: #cbd5e1; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">Cancelar</button>
                    <button id="btn-rep-confirm" style="background: #ef4444; border: none; color: white; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 0 10px #ef444480; transition: 0.2s;">Limpiar Todo</button>
                </div>
            `;

            const btnCancel = modal.querySelector('#btn-rep-cancel');
            const btnConfirm = modal.querySelector('#btn-rep-confirm');
            const inpUser = modal.querySelector('#rep-user');
            const inpPass = modal.querySelector('#rep-pass');

            const loggedUser = localStorage.getItem('usuarioLogueado');
            if (loggedUser) inpUser.value = loggedUser;

            btnCancel.onmouseover = () => btnCancel.style.background = 'rgba(100, 116, 139, 0.2)';
            btnCancel.onmouseout = () => btnCancel.style.background = 'transparent';
            btnConfirm.onmouseover = () => btnConfirm.style.transform = 'scale(1.05)';
            btnConfirm.onmouseout = () => btnConfirm.style.transform = 'scale(1)';

            btnCancel.onclick = () => { overlay.remove(); resolve({ confirmado: false }); };
            
            const ejecutar = () => { 
                const u = inpUser.value.trim();
                const p = inpPass.value.trim();
                if(!u || !p) {
                    inpUser.style.borderColor = '#fbbf24'; inpPass.style.borderColor = '#fbbf24';
                    setTimeout(() => { inpUser.style.borderColor = '#475569'; inpPass.style.borderColor = '#475569'; }, 2000);
                    return;
                }
                overlay.remove(); resolve({ confirmado: true, user: u, pass: p }); 
            };
            
            btnConfirm.onclick = ejecutar;
            inpPass.onkeydown = (e) => { if(e.key === 'Enter') ejecutar(); };

            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            if(loggedUser) inpPass.focus(); else inpUser.focus();
        });
    };
    // ==========================================
    // 🕵️ INICIO BLOQUE ESPÍA V2.1
    // ==========================================
    async function getPublicIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (e) { return 'Oculta/Error'; }
    }

    async function getAdvancedBrowserInfo() {
        let browserName = "Chrome/Chromium";
        let osName = "Windows";
        const ua = navigator.userAgent;

        if ((navigator.brave && await navigator.brave.isBrave()) || ua.includes("Brave")) browserName = "Brave 🦁";
        else if (ua.includes("Edg/")) browserName = "Edge 🔵";
        else if (ua.includes("OPR/") || ua.includes("Opera")) browserName = "Opera 🔴";
        else if (ua.includes("Firefox")) browserName = "Firefox 🦊";

        try {
            if (navigator.userAgentData) {
                const highEntropy = await navigator.userAgentData.getHighEntropyValues(["platformVersion"]);
                if (navigator.userAgentData.platform === "Windows") {
                    const majorVersion = parseInt(highEntropy.platformVersion.split('.')[0]);
                    if (majorVersion >= 13) osName = "Windows 11 💎";
                    else osName = "Windows 10";
                }
            } else {
                if (ua.includes("Windows NT 10.0")) osName = "Windows 10/11";
            }
        } catch (e) {}

        return `${browserName} en ${osName}`;
    }

    function getHardwareInfo() {
        const cores = navigator.hardwareConcurrency || '?';
        const ram = navigator.deviceMemory || '?'; 
        const suffix = (ram === 2 || ram === 4 || ram === 8) ? ' (Virtual/Privado)' : '';
        return `${cores} Cores / ~${ram}GB RAM${suffix}`;
    }

    async function getBatteryStatus() {
        try {
            if (navigator.getBattery) {
                const bat = await navigator.getBattery();
                const level = Math.round(bat.level * 100) + '%';
                const status = bat.charging ? 'Cargando ⚡' : 'Batería 🔋';
                return `${status} (${level})`;
            }
        } catch (e) {}
        return 'Desktop (PC)';
    }

    function removeOverlays() {
        // 🔥 AÑADIDO: removemos también el modal de logout sincronizado
        document.querySelectorAll('#bloqueo-global-device, #addon-login-overlay, .addon-aviso-temp, #addon-session-timer, #addon-alert-overlay, #sst-logout-modal-sync').forEach(el => el.remove());
    }

    // 🔥 FIX 1: COMUNICACIÓN "INMORTAL" (Nunca se rinde)
    function safeSendMessage(message, callback) {
        if (!isExtensionAlive) return; 
        try {
            if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
                console.warn("Contexto perdido."); return;
            }
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    const err = chrome.runtime.lastError.message || "";
                    // Solo matamos si la extensión murió de verdad (Update/Unistall)
                    if (err.includes("invalidated") || err.includes("context")) {
                        isExtensionAlive = false;
                        const msgBox = document.querySelector('#addon-login-overlay div[style*="text-align: center"]');
                        if (msgBox) {
                            msgBox.innerText = '⚠️ Extensión actualizada. Recarga (F5).';
                            msgBox.style.color = '#ffd700';
                        }
                    }
                    return;
                }
                if (callback) callback(response);
            });
        } catch (e) { isExtensionAlive = false; }
    }

// ==========================================
    // 🚨 SISTEMA DE ALERTA FORZOSA Y SINTETIZADOR
    // ==========================================
    let audioCtx = null;
    let alarmaInterval = null;
// 🛠️ HERRAMIENTA: Convierte texto en HTML (Links azules + Saltos de línea)
    function formatMessageHTML(text) {
        if (!text) return "";
        // Detectar URLs y convertirlas en enlaces clicables
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let html = text.replace(urlRegex, function(url) {
            return `<a href="${url}" target="_blank" style="color:#60a5fa; text-decoration:underline; cursor:pointer; font-weight:bold;">${url}</a>`;
        });
        return html;
    }

function showPersistentAlert(msg, msgId) {
        if (document.getElementById('addon-alert-overlay')) return; 

        const overlay = document.createElement('div');
        overlay.id = 'addon-alert-overlay';
        Object.assign(overlay.style, {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(20, 0, 0, 0.95)', backdropFilter: 'blur(20px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2147483647,
            fontFamily: "'Segoe UI', sans-serif", flexDirection: 'column'
        });

        const box = document.createElement('div');
        Object.assign(box.style, {
            width: '600px', maxWidth: '90%', padding: '40px', backgroundColor: '#000',
            border: '2px solid #ef4444', borderRadius: '20px', boxShadow: '0 0 50px rgba(239,68,68,0.5)',
            textAlign: 'center', animation: 'shake 0.5s infinite'
        });

        const style = document.createElement('style');
        style.innerHTML = `@keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }`;
        document.head.appendChild(style);

        const icon = document.createElement('div');
        icon.innerText = '🚨 ALERTA 🚨';
        Object.assign(icon.style, { fontSize: '40px', color: '#ef4444', fontWeight: '900', marginBottom: '20px', letterSpacing: '2px' });

        const text = document.createElement('div');
        // 🔥 AQUI APLICAMOS EL FORMATO DE LINKS Y ESPACIOS
        text.innerHTML = formatMessageHTML(msg);
        Object.assign(text.style, { 
            fontSize: '24px', color: '#fff', marginBottom: '40px', lineHeight: '1.5',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word' // Esto respeta los saltos de línea
        });

        const btn = document.createElement('button');
        btn.innerText = 'LEÍDO / ENTENDIDO';
        Object.assign(btn.style, {
            padding: '20px 40px', fontSize: '20px', fontWeight: 'bold', color: 'white',
            background: '#ef4444', border: 'none', borderRadius: '10px', cursor: 'pointer',
            boxShadow: '0 0 20px #ef4444'
        });

        btn.onclick = (e) => {
            e.stopPropagation(); // 🔥 MAGIA: Evita que el clic traspase y re-active la voz zombie
            overlay.remove();
            stopAlertSound();
            
            // 🔒 DOBLE CANDADO: Forzamos el silencio de la voz del sistema 100ms después por si acaso
            setTimeout(() => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, 100);

            localStorage.setItem('ALERT_ACK_' + msgId, Date.now());
            const user = localStorage.getItem('usuarioLogueado');
            // 🔥 RED BLINDADA
            const urlLeido = `${CEREBRO_URL}?token=SST_V12_CORP_SECURE_2026_X9&action=ack_aviso&msgId=${msgId}&usuario=${encodeURIComponent(user)}&ts=${Date.now()}&status=LEIDO`;
            try { safeSendMessage({ action: 'proxy_fetch', url: urlLeido, options: { method: 'GET' } }); } catch(e){}
        };
        box.append(icon, text, btn);
        overlay.append(box);
        document.body.appendChild(overlay);
        playPersistentSound();
    }
// ============================================================================
// 🚨 TRIPLE ATAQUE ANTI-SILENCIO Y AUTOPLAY (SOLO CONTENT SCRIPT)
// ============================================================================
let alertIntervals = [];

function playPersistentSound(esUrgente = true) {
    stopAlertSound(); 

    // 🔥 BLOQUEO ANTI-ECO MODO ALERTA (El secreto de la sincronización)
    // Evita que 10 pestañas griten al mismo tiempo. Solo la primera tomará el control del audio.
    const lastAlertSound = parseInt(localStorage.getItem('LAST_ALERT_SOUND_TS') || '0');
    if (Date.now() - lastAlertSound < 2000) return; 
    localStorage.setItem('LAST_ALERT_SOUND_TS', Date.now().toString());

    const soundData = localStorage.getItem('SYSTEM_NOTIF_SOUND') || 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3';
    let audioObj = new Audio(soundData);
    audioObj.loop = true;
    audioObj.volume = 1.0;

    // 🔥 MOTOR ANTI-SUEÑO PARA AUDIO: Obliga al navegador a repetir el audio minimizado
    audioObj.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play().catch(e=>{});
    });

    let titleToggle = false;
    const originalTitle = document.title;

    const triggerAttack = () => {
        if (audioObj.paused) {
            audioObj.muted = false;
            audioObj.play().catch(e => console.log("Esperando interacción..."));
        }

        if (esUrgente && 'speechSynthesis' in window && !window.speechSynthesis.speaking) {
            let msgVoz = new SpeechSynthesisUtterance("Atención, tienes un nuevo mensaje urgente.");
            msgVoz.volume = 1.0;
            msgVoz.rate = 1.2;
            msgVoz.lang = 'es-ES';
            
            // 🔥 Repite la voz robótica cada 4 segundos
            msgVoz.onend = function() {
                if (window.currentAlertAttack) {
                    setTimeout(() => {
                        if (window.currentAlertAttack) window.speechSynthesis.speak(msgVoz);
                    }, 4000);
                }
            };
            window.speechSynthesis.speak(msgVoz);
        }
        
        document.removeEventListener('mousemove', triggerAttack);
        document.removeEventListener('keydown', triggerAttack);
        document.removeEventListener('click', triggerAttack); 
    };

    document.addEventListener('mousemove', triggerAttack);
    document.addEventListener('keydown', triggerAttack);
    document.addEventListener('click', triggerAttack);
    
    triggerAttack();

    if (esUrgente) {
        const visualInterval = setInterval(() => {
            titleToggle = !titleToggle;
            document.title = titleToggle ? "🚨 URGENTE 🚨" : "👀 LEE EL AVISO 👀";
            const overlayBox = document.getElementById('addon-alert-overlay');
            if(overlayBox) {
                overlayBox.style.backgroundColor = titleToggle ? 'rgba(150, 0, 0, 0.95)' : 'rgba(15, 23, 42, 0.95)';
            }
            if(audioObj.paused) audioObj.play().catch(e=>{});
        }, 600); 
        alertIntervals.push(visualInterval);
    }

    window.currentAlertAttack = { audio: audioObj, originalTitle: originalTitle };
}

function stopAlertSound() {
    // Apagar parpadeos
    alertIntervals.forEach(clearInterval);
    alertIntervals = [];
    
    // Apagar Audio Clásico y restaurar título
    if (window.currentAlertAttack) {
        window.currentAlertAttack.audio.pause();
        window.currentAlertAttack.audio.currentTime = 0;
        document.title = window.currentAlertAttack.originalTitle;
        window.currentAlertAttack = null;
    }
    
    // Apagar Text-to-Speech
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}
// ==========================================
    // NOTIFICACIÓN PERSISTENTE (CON BOTÓN ACEPTAR)
    // ==========================================
function showNotification(message, msgId, type = 'info') {
        const existing = document.querySelectorAll('.addon-aviso-temp');
        existing.forEach(e => e.remove());
        
        const toast = document.createElement('div');
        toast.className = 'addon-aviso-temp';
        toast.id = 'notif-' + msgId; // ID para cerrar remotamente
        
        let icon = 'ℹ️'; let borderColor = '#60a5fa';
        if (type === 'success' || message.includes('✅')) { icon = '✅'; borderColor = '#34d399'; }
        if (type === 'error' || message.includes('❌')) { icon = '⛔'; borderColor = '#f87171'; }
        
        // 🔥 Aplicamos formato de links y espacios
        const formattedMsg = formatMessageHTML(message);

        toast.innerHTML = `
            <div style="display:flex; align-items:flex-start; margin-bottom:10px;">
                <span style="font-size:20px; margin-right:12px; margin-top:2px;">${icon}</span>
                <span style="font-weight:600; font-size:14px; line-height: 1.4; white-space: pre-wrap; word-break: break-word;">${formattedMsg}</span>
            </div>
            <div style="text-align:right;">
                <button id="btn-close-${msgId}" style="
                    background: ${borderColor}; color: #0f172a; border: none; padding: 6px 15px; 
                    border-radius: 6px; font-weight: 800; cursor: pointer; font-size: 11px;
                    text-transform: uppercase; transition: transform 0.1s;
                ">ACEPTAR</button>
            </div>
        `;
        
        Object.assign(toast.style, {
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%) translateY(-20px)',
            padding: '15px 20px', backgroundColor: 'rgba(15, 23, 42, 0.98)', color: '#ffffff',
            borderRadius: '12px', zIndex: 2147483647, opacity: '0', transition: 'all 0.4s',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)', borderLeft: `5px solid ${borderColor}`, 
            display: 'flex', flexDirection: 'column', backdropFilter: 'blur(10px)',
            maxWidth: '400px', minWidth: '320px'
        });
        
        toast.style.pointerEvents = 'auto'; // Permitir clic en links
        document.body.appendChild(toast);
        requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; });

        // 🔥 BOTÓN ACEPTAR: Cierra local y avisa al servidor
        document.getElementById(`btn-close-${msgId}`).onclick = function() {
            closeThisToast(toast);
            localStorage.setItem('NOTIF_ACK_' + msgId, Date.now()); // Memoria Local
            const user = localStorage.getItem('usuarioLogueado');
            // 🔥 RED BLINDADA
            const urlAceptado = `${CEREBRO_URL}?token=SST_V12_CORP_SECURE_2026_X9&action=ack_aviso&msgId=${msgId}&usuario=${encodeURIComponent(user)}&ts=${Date.now()}&status=ACEPTADO`;
            try { safeSendMessage({ action: 'proxy_fetch', url: urlAceptado, options: { method: 'GET' } }); } catch(e){}
        };
    }

    function closeThisToast(element) {
        if (!element) return;
        element.style.opacity = '0'; element.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => element.remove(), 300);
    }

   // 🔥 Alerta de Windows NATIVA (Solo en Segundo Plano)
    function trySystemNotification(bodyMsg, msgId, customTitle = '📢 AVISO CRM') {
        // Si el usuario ya está viendo la pestaña, NO molestamos a Windows
        if (!document.hidden) return; 

        // Si ya enviamos ESTA alerta a Windows antes, NO la repetimos
        if (localStorage.getItem('SYS_NOTIF_SHOWN_' + msgId)) return;
        localStorage.setItem('SYS_NOTIF_SHOWN_' + msgId, 'true');
        
        safeSendMessage({ 
            action: 'notificar', 
            titulo: customTitle, 
            mensaje: bodyMsg 
        });
    }
    function clearAuthSession() {
        localStorage.removeItem('usuarioLogueado');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('loginTimestamp');
        localStorage.removeItem('sessionLimit'); 
        localStorage.removeItem('configRef');
        localStorage.removeItem('LAST_MSG_ID');
        localStorage.removeItem('SHARED_MSG_DATA');
    }

    // ==========================================
    // 🖥️ UI: BOTÓN SALIR
    // ==========================================
    function checkLogoutButton() {
        const currentUrl = window.location.href;
        const isTargetUrl = TARGET_URLS.some(url => currentUrl.startsWith(url));
        const loggedUser = localStorage.getItem('usuarioLogueado');
        const existingBtn = document.getElementById('btn-auth-salir-listado');

        if (!isTargetUrl || !loggedUser) { if (existingBtn) existingBtn.remove(); return; }
        if (existingBtn) return;

        const btn = document.createElement('button');
        btn.id = 'btn-auth-salir-listado';
        btn.innerHTML = '<span style="font-size:20px; padding-top: 4px; padding-left: 4px;">⏻</span>';
        
        Object.assign(btn.style, {
            position: 'fixed', bottom: '0', right: '0', zIndex: '2147483647',
            width: '45px', height: '45px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)', backdropFilter: 'blur(5px)',
            color: '#ef4444', borderRadius: '24px 0 0 0', 
            borderTop: '1px solid #ef4444', borderLeft: '1px solid #ef4444', borderRight: 'none', borderBottom: 'none',
            cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', 
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });

        btn.onmouseenter = () => {
            btn.style.width = '50px'; btn.style.height = '50px';
            btn.style.backgroundColor = 'rgba(255, 0, 0, 0.50)'; btn.style.color = '#ffffff'; btn.style.borderColor = '#ff0000';
            btn.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.5), inset 0 0 10px rgba(239, 68, 68, 0.1)';
            btn.style.textShadow = '0 0 8px rgba(239, 68, 68, 1)';
        };
        btn.onmouseleave = () => {
            btn.style.width = '45px'; btn.style.height = '45px';
            btn.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; btn.style.color = '#ef4444';
            btn.style.borderTop = '1px solid #ef4444'; btn.style.borderLeft = '1px solid #ef4444';
            btn.style.boxShadow = 'none'; btn.style.textShadow = 'none';
        };

        btn.onclick = () => {
            localStorage.setItem('SST_SYNC_SHOW_LOGOUT', Date.now().toString());
            window.dispatchEvent(new CustomEvent('SST_SHOW_LOGOUT_PROMPT'));
        };
        document.body.appendChild(btn);
    }

    // 🔥 EVENTO GLOBAL DE CONFIRMACIÓN DE LOGOUT SINCRONIZADO 🔥
    window.addEventListener('SST_SHOW_LOGOUT_PROMPT', () => {
        if (document.getElementById('sst-logout-modal-sync')) return; 
        
        const overlay = document.createElement('div');
        overlay.id = 'sst-logout-modal-sync';
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: '2147483647',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '20px', backdropFilter: 'blur(5px)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            background: '#1e293b', padding: '25px', borderRadius: '12px', border: `1px solid #ef4444`,
            width: '420px', maxWidth: '90%', color: 'white', boxShadow: `0 15px 40px rgba(0,0,0,0.6), 0 0 15px #ef444440`,
            textAlign: 'center'
        });

        blindarElemento(overlay); 

        modal.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #ef4444; font-size: 20px; font-weight: bold;">🚪 Cerrar Sesión</h3>
            <p style="margin: 0 0 25px 0; font-size: 15px; color: #cbd5e1; line-height: 1.5;">¿Estás seguro de querer <strong>cerrar tu sesión</strong> en el CRM?</p>
            <div style="display: flex; justify-content: center; gap: 15px;">
                <button id="btn-sync-logout-cancel" style="background: transparent; border: 1px solid #64748b; color: #cbd5e1; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">Cancelar</button>
                <button id="btn-sync-logout-confirm" style="background: #ef4444; border: none; color: white; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 0 10px #ef444480; transition: 0.2s;">Sí, Cerrar</button>
            </div>
        `;

        const btnCancel = modal.querySelector('#btn-sync-logout-cancel');
        const btnConfirm = modal.querySelector('#btn-sync-logout-confirm');
        
        btnCancel.onmouseover = () => btnCancel.style.background = 'rgba(100, 116, 139, 0.2)';
        btnCancel.onmouseout = () => btnCancel.style.background = 'transparent';
        btnConfirm.onmouseover = () => btnConfirm.style.transform = 'scale(1.05)';
        btnConfirm.onmouseout = () => btnConfirm.style.transform = 'scale(1)';

        // Al Cancelar: Manda señal a TODAS las pestañas para que oculten la ventana
        btnCancel.onclick = () => { 
            overlay.remove(); 
            localStorage.setItem('SST_SYNC_CANCEL_LOGOUT', Date.now().toString());
        };
        
        // Al Aceptar: Cierra la sesión (la red se encargará de desconectar a todos)
        btnConfirm.onclick = () => { 
            overlay.remove(); 
            logoutAndClean(); 
        };

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    });
// 🔥 FUNCIÓN GLOBAL DE REPARACIÓN (SIEMPRE DISPONIBLE PARA EL MENÚ OSCURO) 🔥
    window.SST_GLOBAL_REPAIR = async () => {
        const result = await mostrarModalReparacion();
        if (!result.confirmado) return;
        
        const targetBtn = document.getElementById('btn-auth-repair-global') || document.createElement('button');
        targetBtn.innerHTML = '<span style="font-size:16px;">⏳</span>';

        const mostrarProgreso = (texto, icono, color) => {
            let cartel = document.getElementById('toast-reparacion');
            if (!cartel) {
                cartel = document.createElement('div');
                cartel.id = 'toast-reparacion';
                Object.assign(cartel.style, {
                    position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%) translateY(-20px)',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', border: `1px solid ${color}`,
                    color: 'white', padding: '12px 25px', borderRadius: '50px',
                    zIndex: '2147483647', fontWeight: 'bold', fontSize: '14px',
                    boxShadow: `0 10px 30px ${color}40`, display: 'flex', alignItems: 'center', gap: '10px',
                    backdropFilter: 'blur(10px)', transition: 'all 0.3s', opacity: '0'
                });
                document.body.appendChild(cartel);
                requestAnimationFrame(() => { cartel.style.opacity = '1'; cartel.style.transform = 'translateX(-50%) translateY(0)'; });
            } else {
                cartel.style.border = `1px solid ${color}`;
                cartel.style.boxShadow = `0 10px 30px ${color}40`;
            }
            cartel.innerHTML = `<span style="font-size:18px; animation: pulse 1s infinite alternate;">${icono}</span> <span>${texto}</span>`;
        };

        if (!document.getElementById('anim-pulse')) {
            const style = document.createElement('style');
            style.id = 'anim-pulse';
            style.innerHTML = `@keyframes pulse { from { transform: scale(1); } to { transform: scale(1.2); } }`;
            document.head.appendChild(style);
        }

        try {
            mostrarProgreso('Validando credenciales...', '🔐', '#3b82f6'); 
            
            const urlLogin = new URL(API_URL);
            urlLogin.searchParams.append('token', 'SST_V12_CORP_SECURE_2026_X9');
            urlLogin.searchParams.append('action', 'login');
            urlLogin.searchParams.append('usuario', result.user);
            urlLogin.searchParams.append('contrasena', result.pass);
            urlLogin.searchParams.append('sessionId', 'repair_check_' + Date.now());

            const loginRes = await new Promise(resolve => {
                safeSendMessage({ action: 'proxy_fetch', url: urlLogin.toString(), options: { method: 'GET' } }, resolve);
            });

            if (!loginRes || !loginRes.success || !loginRes.data || !loginRes.data.success) {
                throw new Error('Contraseña Incorrecta');
            }

            mostrarProgreso('Borrando sesiones activas...', '🔥', '#ef4444'); 
            
            const urlKill = new URL(API_URL);
            urlKill.searchParams.append('token', 'SST_V12_CORP_SECURE_2026_X9');
            urlKill.searchParams.append('action', 'kill_all');
            urlKill.searchParams.append('usuario', result.user);
            
            await new Promise(resolve => {
                safeSendMessage({ action: 'proxy_fetch', url: urlKill.toString(), options: { method: 'GET' } }, resolve);
            });

            mostrarProgreso('Reiniciando extensión...', '♻️', '#f59e0b'); 
            
            if (localStorage.getItem('usuarioLogueado')) logoutAndClean(); 
            localStorage.clear(); sessionStorage.clear();
            try { if (chrome && chrome.storage && chrome.storage.local) chrome.storage.local.clear(); } catch(e) {}
            
            mostrarProgreso('¡Restauración Completa!', '✅', '#10b981'); 
            
            setTimeout(() => window.location.reload(true), 1500);

        } catch (e) {
            targetBtn.innerHTML = '<span style="font-size:24px; font-weight:bold; padding-bottom:4px; padding-right:2px;">↺</span>';
            mostrarProgreso(e.message || 'Fallo de conexión', '❌', '#ef4444');
            setTimeout(() => {
                const cartel = document.getElementById('toast-reparacion');
                if (cartel) {
                    cartel.style.opacity = '0';
                    setTimeout(() => cartel.remove(), 300);
                }
            }, 4000);
        }
    };

    // 🖥️ UI: BOTÓN DE REPARACIÓN (Solo se muestra en el login)
    function checkRepairButton() {
        if (!isValidCrmDomain()) return;

        const currentUrl = window.location.href.toLowerCase();
        const loggedUser = localStorage.getItem('usuarioLogueado');
        const existingBtn = document.getElementById('btn-auth-repair-global');

        // Solo visible en Login o cuando no hay sesión.
        if (loggedUser && !currentUrl.includes('/login')) {
            if (existingBtn) existingBtn.remove();
            return;
        }

        if (existingBtn) return;

        const btn = document.createElement('button');
        btn.id = 'btn-auth-repair-global';
        btn.innerHTML = '<span style="font-size:24px; font-weight:bold; padding-bottom:4px; padding-right:2px;">↺</span>';
        
        Object.assign(btn.style, {
            position: 'fixed', top: '0', right: '0', zIndex: '2147483647',
            width: '45px', height: '45px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)', backdropFilter: 'blur(5px)',
            color: '#f59e0b', borderRadius: '0 0 0 24px',
            borderBottom: '1px solid #f59e0b', borderLeft: '1px solid #f59e0b', borderRight: 'none', borderTop: 'none',
            cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', 
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });

        btn.onmouseenter = () => {
            btn.style.width = '50px'; btn.style.height = '50px';
            btn.style.backgroundColor = 'rgba(245, 158, 11, 0.50)'; btn.style.color = '#ffffff'; btn.style.borderColor = '#f59e0b';
            btn.style.boxShadow = '0 0 15px rgba(245, 158, 11, 0.5), inset 0 0 10px rgba(245, 158, 11, 0.1)';
            btn.style.textShadow = '0 0 8px rgba(245, 158, 11, 1)';
        };
        btn.onmouseleave = () => {
            btn.style.width = '45px'; btn.style.height = '45px';
            btn.style.backgroundColor = 'rgba(245, 158, 11, 0.1)'; btn.style.color = '#f59e0b';
            btn.style.borderBottom = '1px solid #f59e0b'; btn.style.borderLeft = '1px solid #f59e0b';
            btn.style.boxShadow = 'none'; btn.style.textShadow = 'none';
        };

        btn.onclick = window.SST_GLOBAL_REPAIR;
        document.body.appendChild(btn);
    } // <--- ¡ESTA LLAVE FALTABA Y ROMPÍA TODO TU MENÚ!

    function logoutAndClean() {
        const user = localStorage.getItem('usuarioLogueado');
        const sessId = localStorage.getItem('sessionId');
        
        if (user && sessId) {
            const url = new URL(API_URL);
            url.searchParams.append('token', 'SST_V12_CORP_SECURE_2026_X9');
            url.searchParams.append('action', 'logout');
            url.searchParams.append('usuario', user);
            url.searchParams.append('sessionId', sessId);
            try { safeSendMessage({ action: 'proxy_fetch', url: url.toString(), options: { method: 'GET' } }); } catch(e){}
        }
        
        // 1. Detener sonido de alerta si estaba sonando
        stopAlertSound(); 

        // 2. Limpieza normal
        clearAuthSession();
        document.getElementById('btn-auth-salir-listado')?.remove();
        document.getElementById('addon-session-timer')?.remove();
        removeOverlays(); // Quitar también la alerta roja
        showLoginOverlay();
    }

    function showLoginOverlay(callback = null) {
        if (document.getElementById('addon-login-overlay')) return;
        if (!isValidCrmDomain()) return;

        const overlay = document.createElement('div');
        overlay.id = 'addon-login-overlay';
        Object.assign(overlay.style, {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(10, 15, 30, 0.65)', backdropFilter: 'blur(20px)', webkitBackdropFilter: 'blur(20px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '2147483646',
            fontFamily: "'Segoe UI', 'Roboto', sans-serif"
        });

        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            .crm-login-input::placeholder { color: rgba(255,255,255,0.7); font-weight: 300; }
            .crm-login-input:focus { background-color: rgba(255,255,255,0.2) !important; border-color: #fff !important; }
            .crm-login-btn:hover { background-color: #00A3E0 !important; transform: scale(1.02); }
            .crm-login-btn:active { transform: scale(0.98); }
        `;
        document.head.appendChild(styleEl);

        const formContainer = document.createElement('div');
        Object.assign(formContainer.style, { width: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px', padding: '40px 20px', zIndex: 1 });

        const countryName = getCountryName();
        const title = document.createElement('div');
        title.innerHTML = `LOGIN <br><span style="font-size: 24px; font-weight: 300;">(${countryName})</span>`;
        Object.assign(title.style, { color: '#fff', fontSize: '32px', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.5)', marginBottom: '10px' });

        const createInput = (placeholder, type, iconChar) => {
            const wrap = document.createElement('div');
            Object.assign(wrap.style, { position: 'relative', width: '100%', maxWidth: '350px' });
            const inp = document.createElement('input');
            inp.type = type; inp.placeholder = placeholder; inp.className = 'crm-login-input';
            Object.assign(inp.style, {
                width: '100%', padding: '15px 50px 15px 25px', borderRadius: '50px',
                border: '2px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#fff', fontSize: '16px', outline: 'none', textAlign: 'left', transition: 'all 0.3s', boxSizing: 'border-box',
                userSelect: 'auto', WebkitUserSelect: 'auto' // <-- AÑADIDO PARA BLINDAJE
            });
            const icon = document.createElement('span');
            if (type === 'password') {
                icon.innerText = '👁️'; 
                Object.assign(icon.style, { position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#fff', fontSize: '20px', cursor: 'pointer', opacity: '0.9', zIndex: '10', userSelect: 'none' });
                icon.onclick = () => {
                    if (inp.type === 'password') { inp.type = 'text'; icon.innerText = '🙈'; } 
                    else { inp.type = 'password'; icon.innerText = '👁️'; }
                };
            } else {
                icon.innerText = iconChar;
                Object.assign(icon.style, { position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#fff', fontSize: '20px', pointerEvents: 'none', opacity: '0.9' });
            }
            wrap.append(inp, icon);
            return { wrap, inp };
        };

        const userInput = createInput('Ingrese su usuario', 'text', '👤');
        const passInput = createInput('Ingrese su contraseña', 'password', '');

        const btnLogin = document.createElement('button');
        btnLogin.id = 'crm-main-login-btn'; 
        btnLogin.innerText = 'INGRESAR';
        btnLogin.className = 'crm-login-btn';
        Object.assign(btnLogin.style, {
            width: '100%', maxWidth: '350px', padding: '15px', borderRadius: '50px', border: 'none',
            backgroundColor: '#00b4ff', color: '#fff', fontSize: '18px', fontWeight: 'bold',
            letterSpacing: '1px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 15px rgba(0, 180, 255, 0.4)', transition: 'all 0.3s'
        });

        const btnRepair = document.createElement('button');
        btnRepair.id = 'crm-hidden-repair-btn';
        btnRepair.innerHTML = '🧹 REPARAR EXTENSIÓN';
        Object.assign(btnRepair.style, {
            display: 'none', marginTop: '10px', backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid #ef4444', color: '#ef4444',
            padding: '8px 20px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s',
            letterSpacing: '1px', width: 'auto', maxWidth: '350px'
        });
        btnRepair.onmouseenter = () => { btnRepair.style.backgroundColor = '#ef4444'; btnRepair.style.color = '#fff'; btnRepair.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)'; };
        btnRepair.onmouseleave = () => { btnRepair.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'; btnRepair.style.color = '#ef4444'; btnRepair.style.boxShadow = 'none'; };

        btnRepair.onclick = async () => {
            const inputUser = userInput.inp.value.trim();
            const inputPass = passInput.inp.value.trim();

            if (!inputUser || !inputPass) {
                msgBox.innerText = '⚠️ Escribe Usuario y Contraseña para Reparar';
                msgBox.style.color = '#fbbf24';
                userInput.inp.style.borderColor = '#fbbf24';
                setTimeout(() => userInput.inp.style.borderColor = 'rgba(255,255,255,0.4)', 2000);
                return;
            }

            if (confirm(`🚨 MODO RECUPERACIÓN TOTAL\n\nUsuario: ${inputUser}\n\n1. Validar tus credenciales.\n2. ELIMINAR todas tus sesiones del Servidor.\n3. Reiniciar la extensión de fábrica.\n\n¿Proceder?`)) {
                btnRepair.innerText = '🔐 VALIDANDO...'; btnRepair.disabled = true;

                try {
                    const urlLogin = new URL(API_URL);
                    urlLogin.searchParams.append('token', 'SST_V12_CORP_SECURE_2026_X9'); // 🛡️ LLAVE MAESTRA
                    urlLogin.searchParams.append('action', 'login');
                    urlLogin.searchParams.append('usuario', inputUser);
                    urlLogin.searchParams.append('contrasena', inputPass);
                    urlLogin.searchParams.append('sessionId', 'repair_check_' + Date.now());

                    const loginRes = await new Promise(resolve => {
                        safeSendMessage({ action: 'proxy_fetch', url: urlLogin.toString(), options: { method: 'GET' } }, resolve);
                    });

                    if (!loginRes || !loginRes.success || !loginRes.data || !loginRes.data.success) {
                        throw new Error('Contraseña Incorrecta');
                    }

                    btnRepair.innerText = '🔥 BORRANDO SESIONES...';
                    const urlKill = new URL(API_URL);
                    urlKill.searchParams.append('token', 'SST_V12_CORP_SECURE_2026_X9'); // 🛡️ LLAVE MAESTRA
                    urlKill.searchParams.append('action', 'kill_all');
                    urlKill.searchParams.append('usuario', inputUser);
                    
                    await new Promise(resolve => {
                        safeSendMessage({ action: 'proxy_fetch', url: urlKill.toString(), options: { method: 'GET' } }, resolve);
                    });

                    btnRepair.innerText = '♻️ REINICIANDO...';
                    localStorage.clear(); sessionStorage.clear();
                    try { if (chrome && chrome.storage && chrome.storage.local) chrome.storage.local.clear(); } catch(e) {}
                    
                    setTimeout(() => window.location.reload(true), 1500);

                } catch (e) {
                    btnRepair.innerText = '❌ ERROR';
                    msgBox.innerText = '⛔ ' + (e.message || 'Error de conexión');
                    setTimeout(() => { btnRepair.innerText = '🧹 REPARAR EXTENSIÓN'; btnRepair.disabled = false; }, 3000);
                }
            }
        };

        const msgBox = document.createElement('div');
        Object.assign(msgBox.style, { minHeight: '20px', fontSize: '14px', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'center' });

        const handleLogin = async () => {
            if (!isExtensionAlive) { msgBox.innerText = '⚠️ Recarga (F5)'; msgBox.style.color = '#ffd700'; return; }

            const u = userInput.inp.value.trim();
            const p = passInput.inp.value.trim();
            if (!u || !p) { msgBox.innerText = '⚠️ Ingrese credenciales'; msgBox.style.color = '#ffd700'; return; }

            // 🔥 REGLA RESTAURADA: OBLIGAR A QUE EL DEVICE_ID TENGA EL NOMBRE DEL USUARIO
            let deviceUniqueId = localStorage.getItem('deviceUniqueId');
            const cleanUser = u.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); 
            
            // Si el ID no existe o si es de los "viejos" que no tienen el nombre, lo regeneramos
            if (!deviceUniqueId || !deviceUniqueId.includes(cleanUser)) {
                const randomSuffix = Math.random().toString(36).substr(2, 5);
                deviceUniqueId = `dev_${cleanUser}_${randomSuffix}`;
                localStorage.setItem('deviceUniqueId', deviceUniqueId);
            }
            btnLogin.disabled = true; btnLogin.innerText = 'Ingresando..'; btnLogin.style.opacity = '0.7';
            
            const currentIP = await getPublicIP();
            const batteryData = await getBatteryStatus();
            const userAgentInfo = await getAdvancedBrowserInfo();
            const hardwareData = getHardwareInfo();
            const netData = navigator.connection ? navigator.connection.effectiveType : 'Desconocida';
            const screenInfo = `${window.screen.width}x${window.screen.height}`;
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            
            const url = new URL(API_URL);
            url.searchParams.append('token', 'SST_V12_CORP_SECURE_2026_X9'); // 🛡️ LLAVE MAESTRA
            url.searchParams.append('action', 'login');
            url.searchParams.append('usuario', u);
            url.searchParams.append('contrasena', p);
            // ... (el resto queda igual)
            url.searchParams.append('sessionId', sessionId);
            url.searchParams.append('deviceId', deviceUniqueId);
            url.searchParams.append('ip', currentIP);
            url.searchParams.append('crm', window.location.hostname);
            url.searchParams.append('userAgent', userAgentInfo);
            url.searchParams.append('screen', screenInfo);
            url.searchParams.append('battery', batteryData);
            url.searchParams.append('net', netData);
            url.searchParams.append('hardware', hardwareData);
            url.searchParams.append('timezone', timeZone);

            safeSendMessage({ action: 'proxy_fetch', url: url.toString(), options: { method: 'GET' } }, response => {
                const res = (response && response.success) ? response.data : { success: false, message: response?.error || 'Error de conexión' };
                
                if (res.forceUpdate) {
                    const isMacMsg = navigator.userAgent.toUpperCase().indexOf('MAC OS') >= 0 || (navigator.userAgentData && navigator.userAgentData.platform === 'macOS');
                    msgBox.innerText = `⚠️ ACTUALIZACIÓN REQUERIDA. USA ${isMacMsg ? '⌘' : 'CTRL'}+SHIFT+Z`; 
                    msgBox.style.color = '#fbbf24';
                    btnLogin.style.display = 'none';
                    btnRepair.style.display = 'block';
                    btnRepair.style.marginTop = '0';
                    btnRepair.style.width = '100%';
                    btnRepair.style.padding = '15px';
                    btnRepair.innerText = '🛠️ EJECUTAR LIMPIEZA OBLIGATORIA';
                    return; 
                }

                if (res.success) {
                    localStorage.setItem('usuarioLogueado', u);
                    localStorage.setItem('sessionId', sessionId);
                    localStorage.setItem('loginTimestamp', Date.now().toString());
                    localStorage.setItem('sessionLimit', res.limit);
                    localStorage.setItem('configRef', res.permisoRef || 'si'); 

                    const userRole = res.puesto ? ` ${res.puesto}` : ''; 
                    
                    msgBox.innerText = `✅ Acceso Autorizado${userRole}`; msgBox.style.color = '#51cf66';
                    showNotification(`Bienvenido${userRole}: ${res.message}`, 3000, 'success');
                    
                    initAudioSystem();

                    setTimeout(() => { 
                        overlay.remove(); 
                        checkLogoutButton(); 
                        checkTimerWidget(); 
                        if (callback) callback(u); 
                        heartbeat(); // 🔥 LLAMADA INMEDIATA AL ENTRAR
                    }, 1000);

                } else {
                    btnLogin.disabled = false; btnLogin.innerText = 'INGRESAR'; btnLogin.style.opacity = '1';
                    msgBox.innerText = '❌ ' + res.message; msgBox.style.color = '#ff6b6b';

                    if (res.message.toLowerCase().includes('límite') || res.message.toLowerCase().includes('limite')) {
                        if (!document.getElementById('btn-kill-limit')) {const btnKill = document.createElement('button');
                            btnKill.id = 'btn-kill-limit';
                            btnKill.innerHTML = '🗑️ BORRAR SESIONES ACTIVAS';
                            Object.assign(btnKill.style, {
                                marginTop: '15px', width: '100%', padding: '10px',
                                backgroundColor: 'rgba(220, 38, 38, 0.15)', border: '1px solid #ef4444',
                                color: '#fca5a5', borderRadius: '50px', fontSize: '13px', fontWeight: 'bold',
                                cursor: 'pointer', transition: 'all 0.3s', letterSpacing: '0.5px'
                            });
                            btnKill.onmouseenter = () => { btnKill.style.backgroundColor = '#ef4444'; btnKill.style.color = 'white'; };
                            btnKill.onmouseleave = () => { btnKill.style.backgroundColor = 'rgba(220, 38, 38, 0.15)'; btnKill.style.color = '#fca5a5'; };
                            
                            // 🔥 AQUÍ EMPIEZA LA LÓGICA CORREGIDA (CON TOKEN)
                            btnKill.onclick = async () => {
                                const kUser = userInput.inp.value.trim();
                                const kPass = passInput.inp.value.trim();
                                if (!kUser || !kPass) { msgBox.innerText = '⚠️ Se requiere Usuario y Contraseña'; return; }

                                btnKill.disabled = true; btnKill.innerText = '⏳ Verificando...';

                                try {
                                    // 1. VERIFICAR CREDENCIALES
                                    const urlCheck = new URL(API_URL);
                                    urlCheck.searchParams.append('token', 'SST_V12_CORP_SECURE_2026_X9'); // 🔥 AGREGADO
                                    urlCheck.searchParams.append('action', 'login');
                                    urlCheck.searchParams.append('usuario', kUser);
                                    urlCheck.searchParams.append('contrasena', kPass);
                                    urlCheck.searchParams.append('sessionId', 'check_kill_' + Date.now());

                                    const checkRes = await new Promise(resolve => {
                                        safeSendMessage({ action: 'proxy_fetch', url: urlCheck.toString(), options: { method: 'GET' } }, resolve);
                                    });

                                    if (!checkRes || !checkRes.success || !checkRes.data) throw new Error('Error de conexión');
                                    if (checkRes.data.success === false && checkRes.data.message.includes('Credenciales')) throw new Error('Contraseña Mal');

                                    // 2. EJECUTAR EL BORRADO REAL
                                    btnKill.innerText = '🔥 Borrando...';
                                    const urlKK = new URL(API_URL);
                                    urlKK.searchParams.append('token', 'SST_V12_CORP_SECURE_2026_X9'); // 🔥 AGREGADO
                                    urlKK.searchParams.append('action','kill_all');
                                    urlKK.searchParams.append('usuario', kUser);
                                    
                                    await new Promise(r => safeSendMessage({ action: 'proxy_fetch', url: urlKK.toString(), options: { method: 'GET' } }, r));
                                    
                                    msgBox.innerText = '✅ Sesiones borradas. Intenta ingresar.'; 
                                    msgBox.style.color = '#34d399'; 
                                    btnKill.remove();
                                    
                                } catch (e) {
                                    btnKill.innerText = '❌ Error'; 
                                    msgBox.innerText = '⛔ ' + e.message; 
                                    setTimeout(() => { btnKill.disabled=false; btnKill.innerText='🗑️ BORRAR SESIONES ACTIVAS'; }, 3000);
                                }
                            };
                            // Inyectar botón en el DOM (Esto también estaba en tu original)
                            msgBox.parentNode.insertBefore(btnKill, msgBox.nextSibling);
                        }
                    }
                }
            });
        };
        btnLogin.onclick = handleLogin;
        passInput.inp.onkeydown = (e) => { if (e.key === 'Enter') handleLogin(); };

        formContainer.append(title, userInput.wrap, passInput.wrap, btnLogin, btnRepair, msgBox);
        overlay.appendChild(formContainer); document.body.appendChild(overlay);
    }

    // ============================================================
    // ⏱️ WIDGET RELOJ
    // ============================================================
    function checkTimerWidget() {
        const currentUrl = window.location.href;
        const isTargetUrl = TARGET_URLS.some(url => currentUrl.startsWith(url));
        const loggedUser = localStorage.getItem('usuarioLogueado');
        const existingTimer = document.getElementById('addon-session-timer');

        if (!isTargetUrl || !loggedUser) { if (existingTimer) existingTimer.remove(); return; }
        if (existingTimer) { updateTimerText(existingTimer); return; }

        const timer = document.createElement('div');
        timer.id = 'addon-session-timer';
        Object.assign(timer.style, {
            position: 'fixed', bottom: '0', left: '50%', transform: 'translateX(-50%)', zIndex: '2147483647',
            backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', color: '#94a3b8', 
            fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px',
            padding: '2px 15px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px',
            borderTop: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none', userSelect: 'none'
        });

        document.body.appendChild(timer);
        updateTimerText(timer);
    }

    function updateTimerText(element) {
        const loginTime = parseInt(localStorage.getItem('loginTimestamp') || '0');
        let limit = parseInt(localStorage.getItem('sessionLimit'));
        if (isNaN(limit)) { element.innerText = '--:--:--'; return; }
        if (limit === -1) { element.innerText = '∞:∞:∞'; element.style.color = '#34d399'; return; }

        const remaining = (loginTime + limit) - Date.now();
        if (remaining <= 0) { 
            element.innerText = '00:00:00'; element.style.color = '#ef4444'; 
            // 🔥 SI EL TIEMPO LLEGA A CERO, CIERRA SESIÓN AUTOMÁTICAMENTE
            if (localStorage.getItem('usuarioLogueado')) logoutAndClean();
            return; 
        }

        const h = Math.floor((remaining / (1000 * 60 * 60)));
        const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((remaining % (1000 * 60)) / 1000);
        element.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        element.style.color = (remaining < 300000) ? '#fbbf24' : '#94a3b8';
    }

    // ==========================================
    // 🎵 FUNCIONES DE AUDIO
    // ==========================================
    const SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
    
    async function initAudioSystem() {
        const cachedSound = localStorage.getItem('SYSTEM_NOTIF_SOUND');
        if (!cachedSound) {
            try {
                const response = await fetch(SOUND_URL);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = function() { localStorage.setItem('SYSTEM_NOTIF_SOUND', reader.result); };
                reader.readAsDataURL(blob);
            } catch (e) { console.error('Error cacheando audio:', e); }
        }
    }

    function unlockAudio() {
        if (audioContextUnlocked) return;
        const sound = localStorage.getItem('SYSTEM_NOTIF_SOUND');
        if (sound) {
            const a = new Audio(sound); a.volume = 0;
            a.play().then(() => { audioContextUnlocked = true; document.removeEventListener('click', unlockAudio); }).catch(e => {});
        }
    }
    document.addEventListener('click', unlockAudio);
    initAudioSystem();

    function playAlertSound(times = 1) {
        const soundData = localStorage.getItem('SYSTEM_NOTIF_SOUND');
        if (!soundData) return; 

        // Bloqueo Anti-Eco entre pestañas
        const lastSound = parseInt(localStorage.getItem('LAST_SOUND_PLAY_TS') || '0');
        if (Date.now() - lastSound < 2000) return; 
        localStorage.setItem('LAST_SOUND_PLAY_TS', Date.now());


        const audio = new Audio(soundData);
        audio.volume = 1.0; 
        let playCount = 0;
        audio.addEventListener('ended', function() {
            playCount++;
            if (playCount < times) { audio.currentTime = 0; audio.play().catch(e => {}); }
        });
        audio.play().catch(e => console.warn('Audio bloqueado (falta interacción)'));
    }
    // =========================================================
    // 🔥 ESCUCHA EN TIEMPO REAL (FIREBASE) + ANTI-SUEÑO
    // =========================================================
    function iniciarEscuchaFirebase() {
        if (window.firebaseEscuchando) return; 
        window.firebaseEscuchando = true;

        let source = null; // Lo declaramos aquí para que toda la función lo vea

        const procesarAviso = (aviso) => {
            if (!aviso || !aviso.id) return;
            
            // 🔥 REGLA 1 HORA: Ignorar mensajes viejos
            if (Date.now() - aviso.id > 3600000) return;

            const miUsuario = localStorage.getItem('usuarioLogueado');
            if (!miUsuario) return;

            // 🔥 ESCUDO ANTI-ECO PROPIO: Si yo soy el remitente (sender), ignoro el mensaje.
            if (aviso.sender && aviso.sender.toUpperCase() === miUsuario.toUpperCase()) return;

            let esParaMi = (aviso.target === 'ALL' || aviso.target.toUpperCase() === miUsuario.toUpperCase());
            if (aviso.target === 'ALL' && aviso.omitRoles) {
                const miRol = localStorage.getItem('userRole') || 'AGENTE';
                if (aviso.omitRoles.includes(miRol)) esParaMi = false;
            }

            if (esParaMi) {
                const isAlertAck = localStorage.getItem('ALERT_ACK_' + aviso.id);
                const isNotifShown = localStorage.getItem('NOTIF_SHOWN_' + aviso.id);
                const isDelivered = localStorage.getItem('DELIVERED_' + aviso.id);

                if (!isDelivered) {
                    localStorage.setItem('DELIVERED_' + aviso.id, 'true');
                    
                    // 1. CLAVAMOS LA HORA EXACTA (Al milisegundo)
                    const tiempoCapturado = Date.now(); 
                    
                    // 2. Dispersamos un poco a los agentes (entre 1 y 12 segundos)
                    const randomDelay = Math.floor(Math.random() * 11000) + 1000; 
                    
                    setTimeout(() => {
                        const urlEntrega = `${CEREBRO_URL}?token=SST_V12_CORP_SECURE_2026_X9&action=ack_aviso&msgId=${aviso.id}&usuario=${encodeURIComponent(miUsuario)}&ts=${tiempoCapturado}&status=ENTREGADO`;
                        
                        // 3. 🔥 MOTOR DE INSISTENCIA: No se rinde si Google está lleno
                        const enviarConInsistencia = (intentosRestantes) => {
                            try {
                                safeSendMessage({ action: 'proxy_fetch', url: urlEntrega, options: { method: 'GET' } }, (response) => {
                                    // Si Google falla por exceso de tráfico, response será null o success: false
                                    if (!response || !response.success || (response.data && response.data.error)) {
                                        if (intentosRestantes > 0) {
                                            // Reintentar en un tiempo aleatorio de 2 a 5 segundos
                                            setTimeout(() => enviarConInsistencia(intentosRestantes - 1), 2000 + Math.random() * 3000);
                                        } else {
                                            console.warn("Ping perdido tras 6 intentos"); // Muy raro que pase de 6
                                        }
                                    }
                                });
                            } catch(e) {}
                        };

                        enviarConInsistencia(6); // 🔥 Le damos 6 VIDAS (intentos) a esta petición.
                    }, randomDelay);
                }
                if (aviso.type === 'ALERT' && !isAlertAck) {
                    localStorage.setItem('SHARED_MSG_DATA', JSON.stringify({id: aviso.id, msg: aviso.msg, timestamp: Date.now(), type: 'ALERT'}));
                    safeSendMessage({ action: "unmute_tab" });
                    showPersistentAlert(aviso.msg, aviso.id);
                    
                } else if (aviso.type === 'NORMAL' && !isNotifShown) {
                    localStorage.setItem('NOTIF_SHOWN_' + aviso.id, 'true'); 
                    localStorage.setItem('SHARED_MSG_DATA', JSON.stringify({id: aviso.id, msg: aviso.msg, timestamp: Date.now(), type: 'NORMAL'}));
                    safeSendMessage({ action: "unmute_tab" });
                    playAlertSound(1);
                    showNotification('📢 ' + aviso.msg, aviso.id, 'info');
                    trySystemNotification(aviso.msg, aviso.id, '📢 NUEVO AVISO CRM');
                }
            }
        };

        // 🔥 MAGIA NEGRA: WEB LOCKS API (Garantiza 1 sola conexión a Firebase por PC)
        if (navigator.locks) {
            navigator.locks.request('sst_firebase_leader', { mode: 'exclusive' }, () => {
                // SOLO 1 PESTAÑA LOGRA ENTRAR AQUÍ. LAS DEMÁS SE QUEDAN ESPERANDO EN SILENCIO.
                return new Promise((resolve) => {
                    const conectar = () => {
                        source = new EventSource(FIREBASE_URL);
                        source.addEventListener('put', function(e) {
                            try {
                                const fbData = JSON.parse(e.data);
                                if (fbData && fbData.data) procesarAviso(fbData.data);
                            } catch (err) {}
                        });
                        source.onerror = function() {
                            source.close();
                            setTimeout(conectar, 5000); // Reconexión si falla el internet
                        };
                    };
                    conectar();
                    // La promesa nunca se resuelve. Esto mantiene el "candado" cerrado
                    // hasta que el asesor cierre esta pestaña. Al cerrarla, otra toma el control al instante.
                });
            }).catch(e => {});
        } else {
            // Fallback por si usan un navegador muy viejo que no soporta Web Locks
            source = new EventSource(FIREBASE_URL);
            source.addEventListener('put', function(e) {
                try {
                    const fbData = JSON.parse(e.data);
                    if (fbData && fbData.data) procesarAviso(fbData.data);
                } catch (err) {}
            });
            source.onerror = function() {
                source.close();
                setTimeout(() => { source = new EventSource(FIREBASE_URL); }, 5000);
            };
        }

        // El escudo anti-spam de respaldo (Mantiene vivos los mensajes perdidos)
        setInterval(() => {
            if (document.hidden || !source || source.readyState === EventSource.CLOSED) {
                const lastFbPoll = parseInt(localStorage.getItem('LAST_FB_POLL_TS') || '0');
                if (Date.now() - lastFbPoll < 12000) return;
                localStorage.setItem('LAST_FB_POLL_TS', Date.now().toString());

                fetch(FIREBASE_URL + "?r=" + Date.now()) 
                    .then(res => res.json())
                    .then(data => { if (data) procesarAviso(data); })
                    .catch(e => {});
            }
        }, 15000);
    }
    // ==========================================
    // ❤️ HEARTBEAT (CRONÓMETRO + AVISOS)
    // ==========================================
    function heartbeat(fromVisibility = false) {
        if (!isExtensionAlive) return;

        // 🔥 ESCUDO ANTI-COLAPSO DE GOOGLE (Límites de Cuota)
        const lastGlobalHb = parseInt(localStorage.getItem('LAST_GLOBAL_HB_TS') || '0');
        const umbral = fromVisibility ? 30000 : 110000; 
        if (Date.now() - lastGlobalHb < umbral) {
            return; 
        }
        localStorage.setItem('LAST_GLOBAL_HB_TS', Date.now().toString());

        lastHeartbeatTime = Date.now();

        const user = localStorage.getItem('usuarioLogueado');
        const sessId = localStorage.getItem('sessionId'); 
        const devId = localStorage.getItem('deviceUniqueId'); 

        if (!user || !sessId) return;

        const lastVisTs = parseInt(localStorage.getItem('CRM_TAB_VISIBLE_TS') || '0');
        const isGloballyVisible = (Date.now() - lastVisTs) < 5000; 
        let accumulatedMs = parseInt(localStorage.getItem('CRM_ACCUMULATED_MS') || '0');
        let lastEval = parseInt(localStorage.getItem('LAST_EVAL_TS') || Date.now().toString());
        let elapsed = Date.now() - lastEval;
        localStorage.setItem('LAST_EVAL_TS', Date.now().toString());
        if (elapsed > 25000) elapsed = 20000; 
        if (elapsed < 0) elapsed = 0;

        let shouldUpdateExcel = false;
        if (isGloballyVisible) {
            accumulatedMs += elapsed; 
            if (accumulatedMs >= (3 * 60 * 1000)) { 
                shouldUpdateExcel = true;
                accumulatedMs = 0; 
            }
            localStorage.setItem('CRM_ACCUMULATED_MS', accumulatedMs.toString());
        }

        const url = new URL(API_URL);
        url.searchParams.append('token', 'SST_V12_CORP_SECURE_2026_X9');
        url.searchParams.append('action', 'heartbeat');
        url.searchParams.append('usuario', user);
        url.searchParams.append('sessionId', sessId); 
        if (devId) url.searchParams.append('deviceId', devId);
        url.searchParams.append('cb', Date.now()); 
        url.searchParams.append('updateExcel', shouldUpdateExcel ? 'true' : 'false');
        url.searchParams.append('ts', Date.now()); 
        
        safeSendMessage({ action: 'proxy_fetch', url: url.toString(), options: { method: 'GET' } }, response => {
            const res = (response && response.success) ? response.data : null;
            if (res && res.success === false) { logoutAndClean(); return; }

            if (res && res.success === true && res.aviso) {
                const msgId = res.aviso.id;
                
                // 🔥 REGLA 1 HORA EN HEARTBEAT
                if (Date.now() - msgId > 3600000) return;

                const isAlertAck = localStorage.getItem('ALERT_ACK_' + msgId);
                const isNotifAck = localStorage.getItem('NOTIF_ACK_' + msgId);
                const isNotifShown = localStorage.getItem('NOTIF_SHOWN_' + msgId);
                const isDelivered = localStorage.getItem('DELIVERED_' + msgId);

                // Evitar repeticiones zombie
                if (isAlertAck || isNotifAck || (res.aviso.type === 'NORMAL' && isNotifShown)) return; 

                // Reportar entregado si Firebase falló
                if (!isDelivered) {
                    localStorage.setItem('DELIVERED_' + msgId, 'true');
                    const urlEntregaHB = `${CEREBRO_URL}?token=SST_V12_CORP_SECURE_2026_X9&action=ack_aviso&msgId=${msgId}&usuario=${encodeURIComponent(user)}&ts=${Date.now()}&status=ENTREGADO`;
                    try { safeSendMessage({ action: 'proxy_fetch', url: urlEntregaHB, options: { method: 'GET' } }); } catch(e){}
                }

                localStorage.setItem('SHARED_MSG_DATA', JSON.stringify({id: msgId, msg: res.aviso.msg, timestamp: Date.now(), type: res.aviso.type}));
                safeSendMessage({ action: "unmute_tab" });

                if (res.aviso.type === 'ALERT') {
                    showPersistentAlert(res.aviso.msg, msgId);
                    // 🚫 NO HAY ALERTA DE WINDOWS PARA LA ROJA
                } else {
                    localStorage.setItem('NOTIF_SHOWN_' + msgId, 'true');
                    playAlertSound(1);
                    showNotification('📢 ' + res.aviso.msg, msgId, 'info'); 
                    trySystemNotification(res.aviso.msg, msgId, '📢 NUEVO AVISO CRM'); // ✅ Windows solo en Normal
                }
            }
        });
    }

    // ==========================================
    // 🧠 CEREBRO DE SINCRONIZACIÓN (PESTAÑA A PESTAÑA)
    // ==========================================
    window.addEventListener('storage', (e) => {
        // 🔴 1. SINCRONIZACIÓN DE LOGOUT
        if (e.key === 'usuarioLogueado' && !e.newValue) {
            logoutAndClean();
        }

        // 🟢 2. SINCRONIZACIÓN DE LOGIN
        if (e.key === 'usuarioLogueado' && e.newValue) {
            document.getElementById('addon-login-overlay')?.remove();
            checkLogoutButton();
            checkTimerWidget();
            initAudioSystem();
            heartbeat();
        }
        
        // 📢 3. SINCRONIZACIÓN DE MENSAJES (Alertas compartidas)
        if (e.key === 'SHARED_MSG_DATA' && e.newValue) {
            const data = JSON.parse(e.newValue);
            if (Date.now() - data.timestamp < 10000) { 
                
                safeSendMessage({ action: "unmute_tab" });

                if (data.type === 'ALERT') {
                    showPersistentAlert(data.msg, data.id);
                    // 🚫 Sin Windows para la roja
                } else {
                    playAlertSound(1);
                    showNotification('📢 ' + data.msg, data.id, 'info');
                    trySystemNotification(data.msg, data.id, '📢 NUEVO AVISO CRM');
                }
            }
        }

        // 👁️ 4. SINCRONIZACIÓN DE "LEÍDO" (Cierra Alerta Roja en todas)
        if (e.key.startsWith('ALERT_ACK_')) {
            document.getElementById('addon-alert-overlay')?.remove();
            stopAlertSound();
        }

        // ✔️ 5. SINCRONIZACIÓN DE "ACEPTAR" (Cierra Notificación Negra en todas)
        if (e.key.startsWith('NOTIF_ACK_')) {
            const id = e.key.replace('NOTIF_ACK_', '');
            const toast = document.getElementById('notif-' + id);
            if (toast) closeThisToast(toast);
        }

        // 🚪 6. SINCRONIZACIÓN MAESTRA DE LOGOUT (Muestra modal o lo cancela en vivo)
        if (e.key === 'SST_SYNC_SHOW_LOGOUT' && e.newValue) {
            window.dispatchEvent(new CustomEvent('SST_SHOW_LOGOUT_PROMPT'));
        }
        if (e.key === 'SST_SYNC_CANCEL_LOGOUT' && e.newValue) {
            document.getElementById('sst-logout-modal-sync')?.remove();
        }

        // 🧹 6. AVISO VISUAL DE CACHÉ BORRADO DESDE OTRA PESTAÑA
        if (e.key === 'SST_CACHE_CLEARED' && e.newValue) {
            const aviso = document.createElement('div');
            aviso.innerText = '🧹 Sistema optimizado en otra pestaña';
            Object.assign(aviso.style, {
                position: 'fixed', bottom: '20px', left: '20px', background: 'rgba(34, 211, 238, 0.95)', 
                color: '#000', padding: '10px 20px', borderRadius: '8px', zIndex: '2147483647',
                fontWeight: 'bold', fontSize: '13px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                transition: 'opacity 0.5s', opacity: '0', pointerEvents: 'none'
            });
            document.body.appendChild(aviso);
            requestAnimationFrame(() => aviso.style.opacity = '1');
            setTimeout(() => {
                aviso.style.opacity = '0';
                setTimeout(() => aviso.remove(), 500);
            }, 3000);
        }

        // 🛠️ 7. SINCRONIZACIÓN DE "RESTABLECER" (Solo reacciona la página principal/listado)
        if (e.key === 'SST_SYNC_REPAIR' && e.newValue) {
            if (!window.location.href.includes('/detail')) {
                if (typeof window.SST_GLOBAL_REPAIR === 'function') window.SST_GLOBAL_REPAIR();
            }
        }

        // (El evento de sincronizar la alerta de Cierre de Sesión se ha eliminado)
        // La sesión se cierra globalmente por la red gracias al borrado de 'usuarioLogueado'
    });

    // 2. DISPARO INMEDIATO AL ACTIVAR PESTAÑA (🔥 FIX CLAVE)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            localStorage.setItem('CRM_TAB_VISIBLE_TS', Date.now().toString());
            // Si pasaron más de 5 seg desde el último chequeo, CHEQUEAR YA.
            if (Date.now() - lastHeartbeatTime > 5000) {
                heartbeat(true); // Le avisa al escudo que viene por un cambio de pestaña visual
            }
        }
    });

    // 3. WORKER INMORTAL
    let useWorker = true;
    try {
        const workerBlob = new Blob([`
            self.onmessage = function(e) {
                if(e.data === 'start') setInterval(() => postMessage('tick'), 20000);
            };
        `], { type: 'application/javascript' });
        
        const backgroundWorker = new Worker(URL.createObjectURL(workerBlob));
        backgroundWorker.onmessage = function(e) {
            if (e.data === 'tick') {
                if (isValidCrmDomain()) {
                    heartbeat();
                    checkLogoutButton();
                    checkRepairButton(); // <--- AÑADIDO
                }
            }
        };
        backgroundWorker.postMessage('start');
    } catch (e) {
        useWorker = false;
        console.warn("Worker bloqueado, usando reloj clásico.");
    }

    if (!useWorker) {
        setInterval(() => {
            if (isValidCrmDomain()) {
                heartbeat();
                checkLogoutButton();
                checkRepairButton(); // <--- AÑADIDO
            }
        }, 20000);
    }

    // 🔥 BUCLE DE VIGILANCIA UI 
    setInterval(() => { 
        checkTimerWidget(); 
        checkLogoutButton(); 
        checkRepairButton(); // <--- AÑADIDO
    }, 1000);

    window.addEventListener('keydown', (e) => {
        const isMac = navigator.userAgent.toUpperCase().indexOf('MAC OS') >= 0 || (navigator.userAgentData && navigator.userAgentData.platform === 'macOS');
        const modifierKey = isMac ? e.metaKey : e.ctrlKey;
        
        if (modifierKey && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
            const btnRepair = document.getElementById('crm-hidden-repair-btn');
            const btnLogin = document.getElementById('crm-main-login-btn');
            
            if (btnRepair && btnLogin) {
                e.preventDefault(); 
                if (btnRepair.style.display === 'none') {
                    btnLogin.style.display = 'none';
                    btnRepair.style.display = 'block';
                    btnRepair.style.width = '100%';
                    btnRepair.style.padding = '15px';
                    btnRepair.style.fontSize = '16px'; 
                    btnRepair.innerText = '🧹 REPARAR EXTENSIÓN';
                    btnRepair.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }], { duration: 500, iterations: 1 });
                } else {
                    btnRepair.style.display = 'none';
                    btnLogin.style.display = 'block';
                }
            }
        }
    });

    async function init() {
        if (!isValidCrmDomain()) return; 

        checkRepairButton(); // <--- AÑADIDO

        const user = localStorage.getItem('usuarioLogueado');
        const loginTime = localStorage.getItem('loginTimestamp');
        
        let limit = parseInt(localStorage.getItem('sessionLimit'));
        const isTimeValid = !loginTime || isNaN(limit) || limit === -1 || (Date.now() - parseInt(loginTime) < limit);

        if (user && loginTime && isTimeValid) {
            heartbeat();
            checkLogoutButton();
            checkTimerWidget();
            iniciarEscuchaFirebase(); // 🔥 INICIAMOS FIREBASE AQUÍ

            // 🔥 ANTI-F5: REVISA SI QUEDÓ UN MENSAJE PENDIENTE AL RECARGAR (F5)
            setTimeout(() => {
                const sharedMsg = localStorage.getItem('SHARED_MSG_DATA');
                if (sharedMsg) {
                    try {
                        const data = JSON.parse(sharedMsg);
                        
                        // 🔥 REGLA 1 HORA: Si el mensaje pendiente es muy viejo, lo ignoramos
                        if (Date.now() - data.id > 3600000) return;

                        const isAlertAck = localStorage.getItem('ALERT_ACK_' + data.id);
                        const isNotifAck = localStorage.getItem('NOTIF_ACK_' + data.id);
                        
                        if (data.type === 'ALERT' && !isAlertAck) {
                            showPersistentAlert(data.msg, data.id);
                        } else if (data.type === 'NORMAL' && !isNotifAck) {
                            showNotification('📢 ' + data.msg, data.id, 'info');
                        }
                    } catch(e) {}
                }
            }, 1500);            
        } else {
            removeOverlays();
            showLoginOverlay();
        }
    }

    (async () => {
        if (!document.body) await new Promise(r => setTimeout(r, 500));
        await init();
        console.log('Auth System Ready');
    })();

    window.addEventListener('popstate', () => { checkLogoutButton(); checkRepairButton(); });
    window.addEventListener('hashchange', () => { checkLogoutButton(); checkRepairButton(); });
    
    // 🔥 OBSERVADOR DE SPA (Vue.js Router) - Detecta cambios de URL en tiempo real
    let lastAuthUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastAuthUrl) { 
            lastAuthUrl = location.href; 
            checkLogoutButton(); 
            checkRepairButton(); 
            checkTimerWidget();
        }
    }).observe(document, { subtree: true, childList: true });

    // 🔥 RASTREADOR MULTI-PESTAÑA
    setInterval(() => {
        if (!document.hidden) {
            localStorage.setItem('CRM_TAB_VISIBLE_TS', Date.now().toString());
        }
    }, 2000);

})();

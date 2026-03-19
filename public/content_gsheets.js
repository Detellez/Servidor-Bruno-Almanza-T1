(function() {
    'use strict';

    // ==========================================
    // 1. CONFIGURACIÓN Y ENRUTADOR INTELIGENTE V12
    // ==========================================
    const CEREBRO_URL = 'https://script.google.com/macros/s/AKfycbxsyFiCV1bhHvfPFXCANqN9Ce4ap-DtABPgqdZ_5H74NMwa_1tk1Y8FNzvfUvUkjBiLbQ/exec';
    
    // URLs de los Obreros Activos
    const OBRERO_MEXICO_URL = 'https://script.google.com/macros/s/AKfycbxsyFiCV1bhHvfPFXCANqN9Ce4ap-DtABPgqdZ_5H74NMwa_1tk1Y8FNzvfUvUkjBiLbQ/exec';
    const OBRERO_PERU_URL = 'https://script.google.com/macros/s/AKfycbxsyFiCV1bhHvfPFXCANqN9Ce4ap-DtABPgqdZ_5H74NMwa_1tk1Y8FNzvfUvUkjBiLbQ/exec';
    const OBRERO_BRASIL_URL = 'https://script.google.com/macros/s/AKfycbxsyFiCV1bhHvfPFXCANqN9Ce4ap-DtABPgqdZ_5H74NMwa_1tk1Y8FNzvfUvUkjBiLbQ/exec';
    const OBRERO_COLOMBIA_URL = 'https://script.google.com/macros/s/AKfycbxsyFiCV1bhHvfPFXCANqN9Ce4ap-DtABPgqdZ_5H74NMwa_1tk1Y8FNzvfUvUkjBiLbQ/exec';

    const API_URL = (function() {
        const href = window.location.href;
        if (href.includes('mx-crm.certislink.com') || href.includes('variousplan.com')) return OBRERO_MEXICO_URL;
        if (href.includes('pe-crm.certislink.com')) return OBRERO_PERU_URL;
        if (href.includes('creddireto.com')) return OBRERO_BRASIL_URL;
        if (href.includes('co-crm.certislink.com')) return OBRERO_COLOMBIA_URL;
        return CEREBRO_URL;
    })();

    // 🛡️ LLAVE MAESTRA DE SEGURIDAD
    const SECURITY_TOKEN = 'SST_V12_CORP_SECURE_2026_X9';

    // Obtener usuario logueado
    const getLoggedUser = () => localStorage.getItem('usuarioLogueado');

    // ==========================================
    // 2. UTILIDADES DE UI
    // ==========================================

    // Sistema de notificaciones (Toasts)
    function showNotification(message, duration = 3000, type = 'info') {
        document.querySelectorAll('.addon-aviso-temp').forEach(el => el.remove());

        const toast = document.createElement('div');
        toast.className = 'addon-aviso-temp';
        
        let icon = 'ℹ️';
        let accentColor = '#3b82f6'; // Azul

        if (type === 'success' || message.includes('✅')) {
            icon = '✅';
            accentColor = '#10b981'; // Verde
        } else if (type === 'error' || message.includes('❌')) {
            icon = '⛔';
            accentColor = '#ef4444'; // Rojo
        } else if (type === 'warning' || message.includes('⚠️')) {
            icon = '⚠️';
            accentColor = '#f59e0b'; // Amarillo
        }

        toast.innerHTML = `
            <span style="font-size:16px; margin-right:10px;">${icon}</span>
            <span style="font-weight:600; font-size:13px; color: #fff; letter-spacing: 0.5px;">${message}</span>
        `;

        Object.assign(toast.style, {
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            padding: '12px 24px', 
            backgroundColor: 'rgba(10, 15, 30, 0.8)', 
            color: '#ffffff',
            borderRadius: '50px', zIndex: '2147483647',
            boxShadow: `0 0 15px ${accentColor}40`, 
            border: `1px solid ${accentColor}`,
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', fontFamily: "'Segoe UI', sans-serif"
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, duration);
    }

    // Efectos Hover Especiales (Gris -> Color Vivo) - Slim Version
    const applyDynamicHover = (btn, targetColor) => {
        const baseStyle = {
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#e2e8f0', 
            transform: 'scale(1)',
            boxShadow: 'none'
        };
        const hoverStyle = {
            backgroundColor: targetColor,
            border: `1px solid ${targetColor}`,
            color: '#ffffff', 
            transform: 'translateY(-1px)',
            boxShadow: `0 2px 10px ${targetColor}60`
        };

        Object.assign(btn.style, baseStyle);
        btn.onmouseenter = () => Object.assign(btn.style, hoverStyle);
        btn.onmouseleave = () => Object.assign(btn.style, baseStyle);
        btn.onmousedown = () => btn.style.transform = 'scale(0.96)';
        btn.onmouseup = () => btn.style.transform = 'translateY(-1px)'; 
    };

    // ==========================================
    // 3. CONSTRUCCIÓN DEL PANEL
    // ==========================================

    function buildPanel() {
        if (!window.location.href.includes('/#/loaned_management/pedding_list')) {
            const existingPanel = document.querySelector('.addon-panel-independent');
            if (existingPanel) existingPanel.remove();
            return;
        }

        if (document.querySelector('.addon-panel-independent')) return;

        // Wrapper Flotante (Apegado a la esquina 0,0)
         const wrapper = document.createElement('div');
        wrapper.className = 'addon-panel-independent';
        Object.assign(wrapper.style, {
            position: 'fixed', left: '0', bottom: '0', 
            zIndex: '2147483647', // 🔥 FIX: Z-Index máximo para estar siempre arriba
            display: 'flex', flexDirection: 'column-reverse', // Botón abajo, menú arriba
            alignItems: 'flex-start',
            pointerEvents: 'none', 
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        });

        // --- PANEL PRINCIPAL (MENÚ FLOTANTE COMPACTO) ---
        const menuContent = document.createElement('div');
        Object.assign(menuContent.style, {
            pointerEvents: 'auto',
            // Estilo Glass Dark
            backgroundColor: 'rgba(10, 15, 30, 0.75)', 
            backdropFilter: 'blur(20px)', webkitBackdropFilter: 'blur(20px)',
            
            // 🔥 REDUCCIÓN DE ESPACIOS
            padding: '12px', // Antes 20px
            borderRadius: '14px', 
            display: 'none', flexDirection: 'column', gap: '6px', // Antes 10px
            width: '260px', // Un poco más estrecho
            
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
            position: 'relative', 
            
            // 🔥 MÁRGENES REDUCIDOS
            marginLeft: '10px', 
            marginBottom: '10px',
            
            transformOrigin: 'bottom left'
        });

        // Definimos esto aquí para usarlo en todos los botones
        const hidePanel = () => {
            menuContent.style.display = 'none';
            toggleBtn.style.display = 'flex'; // toggleBtn se define más abajo, pero el closure lo capturará
        };

        // --- BOTÓN DE MINIMIZAR ---
        const minimizeBtn = document.createElement('div');
        minimizeBtn.innerHTML = '×';
        minimizeBtn.title = "Ocultar Panel";
        Object.assign(minimizeBtn.style, {
            position: 'absolute', top: '8px', right: '8px',
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)', 
            color: 'rgba(255,255,255,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '16px', fontWeight: 'bold',
            transition: 'all 0.2s ease', border: '1px solid rgba(255,255,255,0.1)'
        });
        
        minimizeBtn.onmouseenter = () => { minimizeBtn.style.background = 'rgba(255,255,255,0.25)'; minimizeBtn.style.color = '#fff'; minimizeBtn.style.transform = 'scale(1.1)'; };
        minimizeBtn.onmouseleave = () => { minimizeBtn.style.background = 'rgba(255,255,255,0.1)'; minimizeBtn.style.color = 'rgba(255,255,255,0.8)'; minimizeBtn.style.transform = 'scale(1)'; };

        // Encabezado Compacto
        const headerContent = document.createElement('div');
        headerContent.innerHTML = `
            <div style="text-align:center; margin-bottom: 2px; margin-top: 2px;">
                <div style="color:#ffffff; font-size:14px; font-weight:800; letter-spacing:0.5px; text-transform:uppercase;">
                    PANEL CONTROL
                </div>
                <div style="font-size:11px; color:#9ca3af;">
                    Usuario: <span id="lbl-usuario-panel" style="font-weight:700; color:#fbbf24; text-shadow: 0 0 5px rgba(251, 191, 36, 0.6);">Cargando...</span>
                </div>
                <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); margin: 8px 0;"></div>
            </div>
        `;

        menuContent.appendChild(minimizeBtn);
        menuContent.appendChild(headerContent);

        // --- BOTÓN PRINCIPAL "ABRIR MI HOJA" ---
        const btnOpenSheet = document.createElement('button');
        btnOpenSheet.innerText = 'ABRIR MI HOJA';
        Object.assign(btnOpenSheet.style, {
            width: '100%', padding: '7px', borderRadius: '6px', cursor: 'pointer',
            fontWeight: '800', fontSize: '12px', marginBottom: '5px', transition: 'all 0.2s ease-out'
        });
        applyDynamicHover(btnOpenSheet, '#1877f2'); 

        btnOpenSheet.onclick = async () => {
            hidePanel(); 
            const user = getLoggedUser();
            if (!user) return showNotification('❌ Falta Usuario', 3000, 'error');
            
            showNotification('🔍 Buscando hoja...', 2000);
            try {
                // 🔥 CIRUGÍA GET: Usa la ruta dinámica y envía el token
                const response = await fetch(`${API_URL}?token=${SECURITY_TOKEN}&usuario=${user}`);
                const data = await response.json();
                if (data.id) {
                    window.open('https://docs.google.com/spreadsheets/d/' + data.id + '/edit', '_blank');
                } else {
                    showNotification('❌ Sin hoja asignada', 3000, 'error');
                }
            } catch (err) {
                showNotification('⚠️ Error conexión', 3000, 'warning');
            }
        };
        menuContent.appendChild(btnOpenSheet);

        // Grilla de Botones (Gap reducido)
        const grid = document.createElement('div');
        Object.assign(grid.style, {
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px'
        });

        // --- HELPER DE BOTONES SECUNDARIOS ---
        const createActionBtn = (text, targetColor, action) => {
            const btn = document.createElement('button');
            btn.innerText = text;
            
            btn.onclick = () => {
                hidePanel(); 
                action();    
            };

            Object.assign(btn.style, {
                padding: '7px 5px', width: '100%', fontSize: '12px', 
                borderRadius: '6px', cursor: 'pointer', fontWeight: '700', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            });
            applyDynamicHover(btn, targetColor);
            return btn;
        };

        // --- BOTONES ---
        grid.append(createActionBtn('Actualizar G', '#f59e0b', async () => {
            const user = getLoggedUser();
            if (!user) return showNotification('❌ Falta Usuario', 3000, 'error');
            const tableBody = document.querySelector('table.el-table__body');
            if (!tableBody) return showNotification('❌ Sin tabla', 3000, 'error');
            if (!confirm('⚠️ USUARIO: ' + user + '\n\n¿Actualizar tu hoja personal?')) return;

            try {
                showNotification('Limpiando...', 1500);
                await new Promise((res, rej) => {
                    chrome.runtime.sendMessage({
                        action: 'proxy_fetch', url: API_URL, // 🔥 Usa API_URL dinámica
                        // 🔥 Inyecta Token
                        options: { method: 'POST', body: JSON.stringify({ token: SECURITY_TOKEN, vendedor: user, action: 'delete' }) }
                    }, r => r && r.success ? res() : rej(r?.error));
                });
                await new Promise(r => setTimeout(r, 500));
                showNotification('Enviando...', 2000);
                const rows = Array.from(tableBody.querySelectorAll('tr')).map(tr => 
                    Array.from(tr.querySelectorAll('td, th')).map(td => td.innerText.trim())
                );
                await new Promise((res, rej) => {
                    chrome.runtime.sendMessage({
                        action: 'proxy_fetch', url: API_URL, // 🔥 Usa API_URL dinámica
                        // 🔥 Inyecta Token
                        options: { method: 'POST', body: JSON.stringify({ token: SECURITY_TOKEN, vendedor: user, tabla: rows, action: 'send' }) }
                    }, r => r && r.success ? res() : rej(r?.error));
                });
                showNotification('Actualizado ✅', 3000, 'success');
            } catch (err) { showNotification('❌ Error: ' + err, 4000, 'error'); }
        }));

        grid.append(createActionBtn('Reset G', '#c0392b', async () => {
            const user = getLoggedUser();
            if (!user) return showNotification('❌ Falta Usuario', 3000, 'error');
            if (!confirm('¿Resetear hoja para nueva gestión?')) return;
            showNotification('Reseteando...', 2000);
            try {
                await new Promise((res, rej) => {
                    chrome.runtime.sendMessage({
                        action: 'proxy_fetch', url: API_URL, // 🔥 Usa API_URL dinámica
                        // 🔥 Inyecta Token
                        options: { method: 'POST', body: JSON.stringify({ token: SECURITY_TOKEN, vendedor: user, action: 'reset' }) }
                    }, r => r && r.success ? res() : rej(r?.error));
                });
                showNotification('Reseteada ✅', 3000, 'success');
            } catch (e) { showNotification('❌ Error Reset', 3000, 'error'); }
        }));

        grid.append(createActionBtn('Enviar G', '#10b981', async () => {
            const user = getLoggedUser();
            if (!user) return showNotification('❌ Falta Usuario', 3000, 'error');
            const tableBody = document.querySelector('table.el-table__body');
            if (!tableBody || !confirm('¿Enviar datos adicionales?')) return;
            showNotification('Enviando...', 2000);
            const rows = Array.from(tableBody.querySelectorAll('tr')).map(tr => 
                Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim())
            );
            try {
                await new Promise((res, rej) => {
                    chrome.runtime.sendMessage({
                        action: 'proxy_fetch', url: API_URL, // 🔥 Usa API_URL dinámica
                        // 🔥 Inyecta Token
                        options: { method: 'POST', body: JSON.stringify({ token: SECURITY_TOKEN, vendedor: user, tabla: rows, action: 'send' }) }
                    }, r => r && r.success ? res() : rej(r?.error));
                });
                showNotification('Enviado ✅', 3000, 'success');
            } catch (e) { showNotification('❌ Error Envio', 3000, 'error'); }
        }));

        grid.append(createActionBtn('Eliminar G', '#ea580c', async () => {
            const user = getLoggedUser();
            if (!user) return showNotification('❌ Falta Usuario', 3000, 'error');
            if (!confirm('¿Eliminar datos de la hoja?')) return;
            showNotification('Eliminando...', 2000);
            try {
                await new Promise((res, rej) => {
                    chrome.runtime.sendMessage({
                        action: 'proxy_fetch', url: API_URL, // 🔥 Usa API_URL dinámica
                        // 🔥 Inyecta Token
                        options: { method: 'POST', body: JSON.stringify({ token: SECURITY_TOKEN, vendedor: user, action: 'delete' }) }
                    }, r => r && r.success ? res() : rej(r?.error));
                });
                showNotification('Datos eliminados ✅', 3000, 'success');
            } catch (e) { showNotification('❌ Error Eliminar', 3000, 'error'); }
        }));

        grid.append(createActionBtn('Copy Data', '#0d9488', () => {
            const tableBody = document.querySelector('table.el-table__body');
            if (tableBody) {
                const text = Array.from(tableBody.querySelectorAll('tr'))
                    .map(tr => Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim()).join('\t'))
                    .join('\n');
                navigator.clipboard.writeText(text).then(() => showNotification('Datos copiados 📋', 1500));
            }
        }));

        grid.append(createActionBtn('Copy HTML', '#8b5cf6', () => {
            const tableBody = document.querySelector('table.el-table__body');
            if (tableBody) {
                navigator.clipboard.writeText(tableBody.outerHTML).then(() => showNotification('HTML copiado 📋', 1500));
            }
        }));

        menuContent.appendChild(grid);

        // --- BOTÓN FLOTANTE (TOGGLE) ---
        // PEGADO A LA ESQUINA INFERIOR IZQUIERDA (Estilo Cuarto de Círculo)
        const toggleBtn = document.createElement('div');
        Object.assign(toggleBtn.style, {
            width: '45px', height: '45px', // Reducido a 45px
            backgroundColor: 'rgba(10, 15, 30, 0.95)', 
            color: 'white',
            borderRadius: '0 24px 0 0', // Esquina redondeada solo arriba-derecha
            display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end',
            paddingLeft: '10px', paddingBottom: '10px', boxSizing: 'border-box',
            cursor: 'pointer', fontSize: '22px', fontWeight: 'bold', 
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            borderTop: '1px solid rgba(255,255,255,0.2)', 
            borderRight: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 -4px 15px rgba(0,0,0,0.3)',
            pointerEvents: 'auto',
            backdropFilter: 'blur(10px)'
        });
        toggleBtn.innerHTML = '+';

        toggleBtn.onmouseenter = () => { 
            toggleBtn.style.width = '50px'; 
            toggleBtn.style.height = '50px';
            toggleBtn.style.color = '#fbbf24'; 
            toggleBtn.style.borderColor = '#fbbf24';
        };
        toggleBtn.onmouseleave = () => { 
            toggleBtn.style.width = '45px'; 
            toggleBtn.style.height = '45px';
            toggleBtn.style.color = 'white';
            toggleBtn.style.borderColor = 'rgba(255,255,255,0.2)';
        };

        toggleBtn.onclick = () => {
            toggleBtn.style.display = 'none';
            menuContent.style.display = 'flex';
            
            // Animación de entrada
            menuContent.style.opacity = '0';
            menuContent.style.transform = 'scale(0.9) translateY(10px)';
            setTimeout(() => {
                menuContent.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                menuContent.style.opacity = '1';
                menuContent.style.transform = 'scale(1) translateY(0)';
            }, 10);
        };

        minimizeBtn.onclick = () => {
            menuContent.style.display = 'none';
            toggleBtn.style.display = 'flex';
        };

        wrapper.append(menuContent, toggleBtn);
        document.body.appendChild(wrapper);
    }

    // ==========================================
    // 4. INICIALIZACIÓN
    // ==========================================

    setInterval(() => {
        const label = document.getElementById('lbl-usuario-panel');
        if (label) {
            const user = getLoggedUser();
            if (user) {
                if (label.innerText !== user) {
                    label.innerText = user;
                    label.style.color = '#fbbf24';
                }
            } else if (label.innerText !== 'Sin Usuario') {
                label.innerText = 'Sin Usuario';
                label.style.color = '#ef4444';
            }
        }
    }, 1000);

    setTimeout(buildPanel, 1500);

    let currentUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== currentUrl) {
            currentUrl = location.href;
            setTimeout(buildPanel, 1500);
        }
    }).observe(document, { subtree: true, childList: true });

})();

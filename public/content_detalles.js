(function() {
    'use strict';
    
    // 🔥 FIX OBLIGATORIO: Evitar que el script cuente doble por culpa de los iframes invisibles
    if (window.self !== window.top) return;

    // 1. CONFIGURACIÓN
    const CONFIG = [{
        prefix: '+57', country: 'Colombia', domains: ['co-crm.certislink.com'], digits: 10
    }, {
        prefix: '+52', country: 'México (Cashimex)', domains: ['mx-crm.certislink.com'], digits: 10
    }, {
        prefix: '+52', country: 'México (Various)', domains: ['mx-ins-crm.variousplan.com'], digits: 10
    }, {
        prefix: '+56', country: 'Chile', domains: ['cl-crm.certislink.com'], digits: 9
    }, {
        prefix: '+51', country: 'Perú', domains: ['pe-crm.certislink.com'], digits: 9
    }, {
        prefix: '+55', country: 'Brasil', domains: ['crm.creddireto.com'], digits: 11
    }, {
        prefix: '+54', country: 'Argentina', domains: ['crm.rayodinero.com'], digits: 10
    }];

    // ID ÚNICO DE PESTAÑA
    const TAB_ID = 'tab_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);

    let state = { 'yoMismo': false, 'emergencia1': false, 'emergencia2': false };
    let monitorInterval = null;
    let keepAliveInterval = null; 
    let currentClientId = null;
    
    // --- NUEVAS FUNCIONES VISUALES PARA ALERTAS ---
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
                backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: '2147483642',
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
    // ----------------------------------------------

    function loadState() {
        const clientId = getUniqueClientId();
        if (!clientId) return;
        
        if (currentClientId !== clientId) {
            state = { 'yoMismo': false, 'emergencia1': false, 'emergencia2': false };
            currentClientId = clientId;
        }
        
        const saved = localStorage.getItem('CRM_BTN_STATE_' + clientId);
        if (saved) {
            try { 
                const data = JSON.parse(saved);
                // 🧠 MAGIA: Si el dato es de un día anterior, lo ignoramos para que amanezca limpio
                if (data.fechaGuardado !== new Date().toDateString()) {
                    localStorage.removeItem('CRM_BTN_STATE_' + clientId);
                } else {
                    state = Object.assign(state, data); 
                }
            } catch(e){}
        }
    }
    
    function saveState() {
        const clientId = getUniqueClientId();
        if (clientId) {
            // Guardamos el estado sellándolo con la fecha de hoy
            const dataToSave = Object.assign({}, state, { fechaGuardado: new Date().toDateString() });
            localStorage.setItem('CRM_BTN_STATE_' + clientId, JSON.stringify(dataToSave));
        }
    }

    function getUniqueClientId() {
        try {
            const hash = window.location.hash;
            if (!hash || !hash.includes('?')) return null;
            const queryString = hash.split('?')[1]; 
            const params = new URLSearchParams(queryString);
            return params.get('userId') || params.get('phone') || params.get('orderId');
        } catch (e) { return null; }
    }

    const applyDynamicHover = (btn, targetColor) => {
        const baseStyle = { backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#e2e8f0' };
        Object.assign(btn.style, baseStyle);
        btn.onmouseenter = () => { if(!btn.disabled) Object.assign(btn.style, { backgroundColor: targetColor, borderColor: targetColor, color: '#fff' }); };
        btn.onmouseleave = () => { if(!btn.disabled) Object.assign(btn.style, baseStyle); };
    };

    function waitForText(selector, textOrArray, timeout = 4000) {
        return new Promise((resolve) => {
            const arrTexts = Array.isArray(textOrArray) ? textOrArray : [textOrArray];
            const check = () => Array.from(document.querySelectorAll(selector)).find(el => {
                const elText = el.textContent.toLowerCase();
                return arrTexts.some(t => elText.includes(t.toLowerCase()));
            });
            if (check()) return resolve(check());
            const i = setInterval(() => { const f = check(); if(f) { clearInterval(i); resolve(f); } }, 100);
            setTimeout(() => { clearInterval(i); resolve(null); }, timeout);
        });
    }

    function waitForElement(selector, timeout = 4000) {
        return new Promise((r) => {
            if (document.querySelector(selector)) return r(document.querySelector(selector));
            const i = setInterval(() => { const el = document.querySelector(selector); if(el) { clearInterval(i); r(el); } }, 100);
            setTimeout(() => { clearInterval(i); r(null); }, timeout);
        });
    }

    const detectCountry = () => {
        const currentUrl = window.location.href;
        return CONFIG.find(c => c.domains.some(domain => currentUrl.includes(domain))) || { country: 'Desconocido', prefix: '??' };
    };

    // 🔥 FILTRO SUPER ESTRICTO (SOLO DETAIL2 Y DETAIL3)
    const isDetailPage = () => {
        const url = window.location.href;
        return url.includes('/detail2') || url.includes('/detail3');
    };

    const renderGlobalToast = () => {
        const rawData = localStorage.getItem('crm_display_status');
        let toast = document.getElementById('toast-crm-global');

        if (!rawData) {
            if (toast) { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }
            return;
        }

        const data = JSON.parse(rawData);
        
        if (Date.now() - data.timestamp > 15000) { 
            localStorage.removeItem('crm_display_status');
            if (toast) toast.remove();
            return;
        }

        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-crm-global';
            Object.assign(toast.style, {
                position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 2147483642, backgroundColor: 'rgba(15, 23, 42, 0.95)', color: 'white',
                padding: '12px 24px', borderRadius: '12px', 
                fontFamily: "'Segoe UI', sans-serif", fontSize: '13px', lineHeight: '1.4',
                backdropFilter: 'blur(10px)', transition: 'all 0.3s ease',
                maxWidth: '450px', textAlign: 'center', minWidth: '220px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            });
            document.body.appendChild(toast);
        }

        toast.style.borderColor = data.color;
        toast.style.boxShadow = `0 4px 15px ${data.color}40`;
        toast.innerHTML = data.html;
        toast.style.opacity = '1';
    };

    const updateButtonVisuals = () => {
        const btnYo = document.getElementById('btn-yomismo');
        if (!btnYo) return;
        
        const setVisual = (id, isActive, textNormal, textSent) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.disabled = isActive;
            if (isActive) {
                btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed'; btn.innerText = textSent;
                btn.style.backgroundColor = 'rgba(255,255,255,0.05)';
            } else {
                btn.style.opacity = '1'; btn.style.cursor = 'pointer'; btn.innerText = textNormal;
                btn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
        };
        setVisual('btn-yomismo', state.yoMismo, '👤 Yo Mismo', '🔒 Yo (Enviado)');
        setVisual('btn-em1', state.emergencia1, '🚨 Emergencia 1', '🔒 Em. 1 (Enviado)');
        setVisual('btn-em2', state.emergencia2, '🚨 Emergencia 2', '🔒 Em. 2 (Enviado)');
    };

    // --- AUTOMATIZACIÓN BLINDADA ---
    const executeAutomation = async (radioKeyword, stateKey) => {
        if (!isDetailPage()) return;
        const message = localStorage.getItem('u_s') || '';

        try {
            // Aumentamos los tiempos. Mac en 2do plano es más lento.
            const targetRadio = await waitForText('.el-radio-button__inner', radioKeyword, 15000);
            if (targetRadio) targetRadio.click();
            
            const noAnswerRadio = await waitForText('.el-radio-button__inner', ['No contestado', 'Não Atendido'], 15000);
            if (noAnswerRadio) noAnswerRadio.click();

            const textarea = await waitForElement('textarea.el-textarea__inner', 15000);
            if (textarea && message) {
                // 💉 INYECCIÓN AGRESIVA PARA VUE.JS (Despierta pestañas dormidas)
                textarea.focus(); // Obligamos al navegador a mirar el elemento
                textarea.value = message;
                
                // Disparamos la trinidad de eventos de Vue
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.dispatchEvent(new Event('change', { bubbles: true }));
                textarea.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
                
                // Chequeo de seguridad
                if (textarea.value !== message) {
                    await new Promise(r => setTimeout(r, 200));
                    textarea.value = message;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    textarea.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }

            // Dale 600ms a Vue para que actualice su DOM virtual internamente
            await new Promise(r => setTimeout(r, 600)); 
            
            const submitBtn = await waitForText('button span', ['Entregar los resultados', 'Enviar Resultado do Acompanhamento'], 10000);
            if (submitBtn) {
                submitBtn.click();
                localStorage.setItem('crm_task_' + TAB_ID, 'done');
                state[stateKey] = true;
                saveState();
                updateButtonVisuals();
            } else {
                localStorage.setItem('crm_task_' + TAB_ID, 'error');
            }
        } catch (error) {
            localStorage.setItem('crm_task_' + TAB_ID, 'error');
        }
    };

    // --- COORDINADOR MAESTRO Y WATCHDOG (Supervisión Total) ---
    const startMasterMonitor = () => {
        if (monitorInterval) clearInterval(monitorInterval);
        
        const msgText = localStorage.getItem('u_s') || 'Sin texto';
        const msgShort = msgText.length > 50 ? msgText.substring(0, 50) + '...' : msgText;
        
        const updateDisplay = (html, color) => {
            localStorage.setItem('crm_display_status', JSON.stringify({ html: html, color: color, timestamp: Date.now() }));
            renderGlobalToast();
        };

        let settlementTimer = 0; 
        let lastCompleted = -1;
        let stuckTicks = 0;

        monitorInterval = setInterval(() => {
            let totalPestanas = 0, done = 0, pending = 0, errors = 0, duplicados = 0;
            
            // 1. Escaneo de memoria
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('crm_task_')) {
                    totalPestanas++;
                    const val = localStorage.getItem(key);
                    if (val === 'done') done++;
                    else if (val === 'pending') pending++;
                    else if (val === 'error') errors++; 
                    else if (val === 'duplicate') duplicados++; 
                }
            }

            // 2. LA MAGIA MATEMÁTICA: Separar reales de clones
            const clientesProcesados = done + errors; 
            const avanceTotal = done + errors + duplicados; 

            // 3. PERRO GUARDIÁN (Anti-Atascos)
            if (pending > 0 && avanceTotal === lastCompleted) {
                stuckTicks++;
                if (stuckTicks >= 10) { 
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith('crm_task_') && localStorage.getItem(key) === 'pending') {
                            localStorage.setItem(key, 'error'); 
                        }
                    }
                }
            } else {
                stuckTicks = 0;
                lastCompleted = avanceTotal;
            }

            const percentage = totalPestanas > 0 ? Math.round((avanceTotal / totalPestanas) * 100) : 0;
            
            // 4. NOTIFICACIÓN MIENTRAS PROCESA
            if (settlementTimer < 5) {
                updateDisplay(
                    `<div style="font-weight:700; margin-bottom:4px; font-size:14px;">
                        ⏳ LEYENDO: <b>${avanceTotal}/${totalPestanas}</b> PESTAÑAS (${percentage}%)
                      </div>
                      <div style="font-size:11.5px; color:#cbd5e1; border-top:1px solid rgba(255,255,255,0.2); padding-top:4px;">
                        Seguimientos reales: <b style="color:#fbbf24; font-size:13px;">${clientesProcesados}</b> | Omitidos: <b style="color:#ef4444; font-size:13px;">${duplicados}</b>
                      </div>`, 
                    '#3b82f6'
                );
            }

            // 5. NOTIFICACIÓN FINAL
            if (totalPestanas > 0 && avanceTotal >= totalPestanas) {
                settlementTimer++;
                if (settlementTimer >= 3) { 
                    clearInterval(monitorInterval);
                    updateDisplay(
                        `<div style="font-weight:800; font-size:15px; margin-bottom:5px;">✅ FINALIZADO COMPLETAMENTE</div>
                         <div style="font-size:14px; margin-bottom:5px; color:#fbbf24;">
                            Se hicieron <b>${clientesProcesados}</b> seguimientos reales.
                         </div>
                         <div style="font-size:11.5px; color:#cbd5e1; border-top:1px solid rgba(255,255,255,0.2); padding-top:5px; line-height: 1.4;">
                            Se omitieron <b>${duplicados}</b> pestañas duplicadas.<br>
                            <span style="color:#64748b;">(De un total de ${totalPestanas} pestañas detectadas)</span>
                          </div>`, 
                        '#10b981'
                    );

                    setTimeout(() => {
                        localStorage.removeItem('crm_display_status'); 
                        Object.keys(localStorage).forEach(k => {
                            if (k.startsWith('crm_task_')) localStorage.removeItem(k);
                        });
                        const toast = document.getElementById('toast-crm-global');
                        if (toast) { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }
                    }, 4500); 
                }
            } else {
                if (pending > 0) settlementTimer = 0; 
            }

        }, 800); 
    };

    // --- PANEL DE CONTROL ---
    const injectControlPanel = () => {
        if (document.getElementById('wrapper-crm-masivo')) return;

        // 🚛 CAMIÓN DE BASURA INTELIGENTE (Solo borra lo viejo, respeta lo que está trabajando ahora)
        try {
            const ahora = Date.now();
            const keysToDelete = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key) continue;

                // 1. Borrar candados (LOCK_) que tengan más de 2 minutos de antigüedad
                if (key.startsWith('LOCK_')) {
                    const partes = key.split('_');
                    const timestamp = parseInt(partes[partes.length - 1]); // Extraemos la hora
                    if (ahora - timestamp > 120000) { // 120,000ms = 2 minutos
                        keysToDelete.push(key);
                    }
                }
                
                // 2. Borrar tareas colgadas (crm_task_) si ya no hay ráfaga activa
                if (key.startsWith('crm_task_')) {
                    const statusData = localStorage.getItem('crm_display_status');
                    if (!statusData) {
                        keysToDelete.push(key); 
                    } else {
                        const parsedStatus = JSON.parse(statusData);
                        if (ahora - parsedStatus.timestamp > 120000) keysToDelete.push(key);
                    }
                }
            }
            // Borramos la basura real
            keysToDelete.forEach(k => localStorage.removeItem(k));
        } catch (e) {}

        const currentInfo = detectCountry();
        const wrapper = document.createElement('div');
        wrapper.id = 'wrapper-crm-masivo';
        Object.assign(wrapper.style, { position: 'fixed', left: '0', top: '0', zIndex: '2147483642', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', pointerEvents: 'none', fontFamily: "'Segoe UI', sans-serif" });

        const panel = document.createElement('div');
        panel.id = 'panel-crm-masivo';
        Object.assign(panel.style, {
            pointerEvents: 'auto', backgroundColor: 'rgba(10, 15, 30, 0.75)', backdropFilter: 'blur(20px)',
            padding: '10px', borderRadius: '12px', display: 'none', flexDirection: 'column', gap: '5px', width: '220px',
            border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)', marginLeft: '10px', marginTop: '10px'
        });

        const toggleBtn = document.createElement('div');
        toggleBtn.id = 'btn-toggle-masivo';
        Object.assign(toggleBtn.style, {
            width: '30px', height: '30px', backgroundColor: 'rgba(10, 15, 30, 0.95)', color: 'white', borderRadius: '0 0 20px 0',
            display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', paddingLeft: '7px', paddingTop: '1px',
            cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', transition: 'all 0.3s ease', borderRight: '1px solid rgba(255,255,255,0.2)',
            borderBottom: '1px solid rgba(255,255,255,0.2)', pointerEvents: 'auto', backdropFilter: 'blur(10px)'
        });
        toggleBtn.innerHTML = '+';
        
        toggleBtn.onmouseenter = () => { toggleBtn.style.width = '35px'; toggleBtn.style.height = '35px'; toggleBtn.style.color = '#fbbf24'; toggleBtn.style.borderColor = '#fbbf24'; };
        toggleBtn.onmouseleave = () => { toggleBtn.style.width = '30px'; toggleBtn.style.height = '30px'; toggleBtn.style.color = 'white'; toggleBtn.style.borderColor = 'rgba(255,255,255,0.2)'; };

        toggleBtn.onclick = () => { toggleBtn.style.display = 'none'; panel.style.display = 'flex'; localStorage.setItem('CRM_ACTIVE_PANEL_TAB', TAB_ID); };

        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '×';
        Object.assign(closeBtn.style, { position: 'absolute', top: '2px', right: '6px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '18px', fontWeight: 'bold' });
        closeBtn.onclick = () => { panel.style.display = 'none'; toggleBtn.style.display = 'flex'; };

        panel.innerHTML += `<div style="text-align:center;color:white;font-weight:800;margin-bottom:4px;font-size:12px;">🚀 ${currentInfo.country.toUpperCase()}</div>`;
        panel.appendChild(closeBtn);

        const msgInput = document.createElement('input');
        msgInput.id = 'txt-msg-masivo'; msgInput.type = 'text'; msgInput.value = localStorage.getItem('u_s') || ''; msgInput.placeholder = 'Seguimiento';
        Object.assign(msgInput.style, { width: '100%', padding: '5px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', textAlign: 'center', fontSize: '11px', marginBottom: '5px', outline: 'none' });
        msgInput.oninput = (e) => localStorage.setItem('u_s', e.target.value);
        panel.appendChild(msgInput);

        const createBtn = (id, text, color, actionKey, keyword) => {
            const btn = document.createElement('button');
            btn.id = id; btn.innerText = text;
            Object.assign(btn.style, { padding: '6px 5px', width: '100%', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', marginBottom: '4px', transition: 'all 0.2s' });
            applyDynamicHover(btn, color);
            
            // 🔥 CIRUGÍA: Mostrar el texto exacto en la alerta antes de confirmar
            btn.onclick = async () => {
                // Capturamos lo que el usuario escribió justo antes de hacer clic
                const msgText = localStorage.getItem('u_s') || 'Sin texto';
                const msgShort = msgText.length > 100 ? msgText.substring(0, 100) + '...' : msgText;

                const confirmado = await mostrarConfirmacionHTML(
                    '⚠️ Seguimientos Masivos',
                    `Acción a ejecutar: <strong style="color: ${color}; font-size: 16px; letter-spacing: 0.5px; text-transform: uppercase;">[ ${text} ]</strong><br><br>
                    Asegúrate de no repetir los seguimientos.<br>Se enviará el siguiente texto a <strong>todas las pestañas abiertas</strong>:<br><br>
                    <div style="background: rgba(0,0,0,0.3); padding: 12px 10px; border-radius: 6px; font-style: italic; color: #93c5fd; font-size: 13px; word-break: break-word; border: 1px solid ${color}; text-align: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);">
                        📝 "${msgShort}"
                    </div>`,
                    'Sí, Ejecutar',
                    color
                );
                
                if (!confirmado) return;
                
                // 1. Limpieza inicial para el Monitor
                Object.keys(localStorage).forEach(k => { if (k.startsWith('crm_task_')) localStorage.removeItem(k); });
                
                // 2. Inicia el Monitor
                startMasterMonitor(); 

                // 3. Dispara la orden BROADCAST a las esclavas
                const cmdId = Date.now().toString();
                localStorage.setItem('crm_cmd_broadcast', JSON.stringify({ 
                    action: actionKey, 
                    keyword: keyword, 
                    id: cmdId 
                }));

                // 🔥 LA CURA: EL MAESTRO SE EJECUTA A SÍ MISMO INSTANTÁNEAMENTE 🔥
                const clientId = getUniqueClientId();
                if (clientId && !state[actionKey]) {
                    localStorage.setItem('crm_task_' + TAB_ID, 'pending');
                    const lockKey = `LOCK_${clientId}_${cmdId}`;
                    localStorage.setItem(lockKey, TAB_ID); // Protege su propio cliente de las esclavas
                    executeAutomation(keyword, actionKey); // Se despacha de inmediato
                } else {
                    localStorage.setItem('crm_task_' + TAB_ID, 'done');
                }
            };
            panel.appendChild(btn);
        };

        createBtn('btn-yomismo', '👤 Yo Mismo', '#3b82f6', 'yoMismo', ['Yo mismo', 'Próprio']);
        createBtn('btn-em1', '🚨 Emergencia 1', '#ef4444', 'emergencia1', ['emergencia 1', 'Contato de Emergência 1']);
        createBtn('btn-em2', '🚨 Emergencia 2', '#f97316', 'emergencia2', ['emergencia 2', 'Contato de Emergência 2']);

        const actionRow = document.createElement('div');
        actionRow.style.cssText = 'display: flex; gap: 5px; margin-top: 2px;';

        const createSmallBtn = (text, color, onClick) => {
            const btn = document.createElement('button');
            btn.innerText = text; btn.onclick = onClick;
            Object.assign(btn.style, {
                flex: '1', padding: '5px', fontSize: '10px', borderRadius: '6px',
                cursor: 'pointer', fontWeight: '700', border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(255,255,255,0.05)', color: '#cbd5e1', transition: 'all 0.2s'
            });
            btn.onmouseenter = () => { btn.style.backgroundColor = color; btn.style.color = 'white'; btn.style.borderColor = color; };
            btn.onmouseleave = () => { btn.style.backgroundColor = 'rgba(255,255,255,0.05)'; btn.style.color = '#cbd5e1'; btn.style.borderColor = 'rgba(255,255,255,0.1)'; };
            return btn;
        };

        // 🔥 AJUSTE: Alerta de Reseteo (Morada)
        const btnReset = createSmallBtn('🔓 Reset', '#8b5cf6', async () => {
            const confirmado = await mostrarConfirmacionHTML(
                '🔓 Reiniciar Estado',
                'Desbloquear botones para seguimientos Nuevos.<br>¿Continuar?',
                'Sí, Reiniciar',
                '#8b5cf6' 
            );
            
            if (!confirmado) return; 
            
            state = { 'yoMismo': false, 'emergencia1': false, 'emergencia2': false };
            saveState(); 
            updateButtonVisuals();
            localStorage.setItem('reset_masivo', Date.now().toString());
            localStorage.removeItem('crm_display_status'); 
            renderGlobalToast(); 
        });

        // 🔥 AJUSTE: Alerta de Cierre (Roja/Peligro)
        const btnClose = createSmallBtn('❌ Cerrar', '#64748b', async () => {
            const confirmado = await mostrarConfirmacionHTML(
                '❌ Cerrar Pestañas',
                '¿Estás seguro de querer cerrar <strong>TODAS</strong> las pestañas de clientes?',
                'Sí, Cerrar todo',
                '#ef4444' 
            );
            
            if (confirmado) {
                localStorage.setItem('cerrar_detalles', Date.now().toString());
                window.close();
            }
        });

        actionRow.append(btnReset, btnClose);
        panel.appendChild(actionRow);

        wrapper.append(toggleBtn, panel);
        document.body.appendChild(wrapper);
        updateButtonVisuals();
    };

    // --- HANDLERS GLOBALES (Recepción del Broadcast) ---
    const handleStorageChange = (e) => {
        if (!isDetailPage()) return;

        if (e.key === 'CRM_ACTIVE_PANEL_TAB' && e.newValue && e.newValue !== TAB_ID) {
            const p = document.getElementById('panel-crm-masivo');
            const b = document.getElementById('btn-toggle-masivo');
            if (p && p.style.display !== 'none') { p.style.display = 'none'; b.style.display = 'flex'; }
        }

        // 🔥 BROADCAST: LAS PESTAÑAS ESCLAVAS ESCUCHAN Y TRABAJAN 🔥
        if (e.key === 'crm_cmd_broadcast' && e.newValue) {
            const cmd = JSON.parse(e.newValue);
            const clientId = getUniqueClientId();

            // 1. Me anoto inmediatamente al totalizador
            localStorage.setItem('crm_task_' + TAB_ID, 'pending');

            // 2. Si ya procesé esta orden, me marco como hecho en secreto y salgo
            if (state[cmd.action] || !clientId) {
                localStorage.setItem('crm_task_' + TAB_ID, 'done');
                return;
            }

            // 3. Retraso aleatorio rápido (0 a 2.5 seg) para no congelar Brave
            const randomDelay = Math.floor(Math.random() * 2500);

            setTimeout(() => {
                const lockKey = `LOCK_${clientId}_${cmd.id}`;
                
                // Si el Maestro (u otra pestaña) ya tomó a este cliente, me cancelo silenciosamente
                if (localStorage.getItem(lockKey)) {
                    localStorage.setItem('crm_task_' + TAB_ID, 'duplicate'); // Marcado como duplicado para el monitor
                    state[cmd.action] = true;
                    saveState();
                    updateButtonVisuals();
                    return; 
                }

                // Es mi turno, bloqueo al cliente para las demás
                localStorage.setItem(lockKey, TAB_ID);
                
                // Ejecuto mi seguimiento
                executeAutomation(cmd.keyword, cmd.action);
                
            }, randomDelay);
        }

        // 4. Reset
        if (e.key === 'reset_masivo' && e.newValue) {
            state = { 'yoMismo': false, 'emergencia1': false, 'emergencia2': false };
            saveState(); 
            updateButtonVisuals();
        }

        // 5. Cerrar Pestañas
        if (e.key === 'cerrar_detalles' && e.newValue) {
            window.close();
        }

        if (e.key === 'crm_display_status') renderGlobalToast();

        if (e.key === 'u_s') {
            const msgInput = document.getElementById('txt-msg-masivo');
            if (msgInput && msgInput.value !== e.newValue) msgInput.value = e.newValue || '';
        }
    };

    window.addEventListener('storage', handleStorageChange);
    
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    keepAliveInterval = setInterval(() => { const _ = Math.sin(Date.now()); }, 5000);

    // BUCLE PRINCIPAL
    setInterval(() => {
        renderGlobalToast();
        if (isDetailPage()) {
            loadState(); 
            injectControlPanel();
            updateButtonVisuals(); 
        } else {
            document.getElementById('wrapper-crm-masivo')?.remove();
        }
    }, 2000);

})(); 

// =========================================================================
// 🕵️ FUNCIÓN NUEVA AISLADA: OCULTAR REFERENCIAS (SEGÚN EXCEL)
// =========================================================================
(function() {
    'use strict';

    function aplicarRestriccionReferencias() {
        const permiso = localStorage.getItem('configRef');
        if (!permiso || permiso.trim().toLowerCase() === 'si') return;
        const botones = document.querySelectorAll('button'); 

        botones.forEach(btn => {
            const texto = btn.innerText.toLowerCase();
            if (texto.includes('emergencia 1') || texto.includes('emergencia 2') || texto.includes('emergência 1') || texto.includes('emergência 2')) {
                btn.style.setProperty('display', 'none', 'important');
            }
        });
    }

    const observer = new MutationObserver(() => { aplicarRestriccionReferencias(); });
    
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
        aplicarRestriccionReferencias();
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
            aplicarRestriccionReferencias();
        });
    }
})();

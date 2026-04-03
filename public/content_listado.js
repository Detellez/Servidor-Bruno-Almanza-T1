(function() {
    'use strict';

    // Variable global para el intervalo de chequeo
    let intervalId = null;

    // 1. CONFIGURACIÓN DE DOMINIOS Y PAÍSES (Intacta)
    const CONFIG_CRMS = [{
        prefix: '+57', country: 'Colombia', domains: ['https://co-crm.certislink.com'], digits: 10
    }, {
        prefix: '+52', country: 'México (Cashimex)', domains: ['https://mx-crm.certislink.com'], digits: 10
    }, {
        prefix: '+52', country: 'México (Various)', domains: ['https://mx-ins-crm.variousplan.com'], digits: 10
    }, {
        prefix: '+56', country: 'Chile', domains: ['https://cl-crm.certislink.com'], digits: 9
    }, {
        prefix: '+51', country: 'Perú', domains: ['https://pe-crm.certislink.com'], digits: 9
    }, {
        prefix: '+55', country: 'Brasil', domains: ['https://crm.creddireto.com'], digits: 11
    }, {
        prefix: '+54', country: 'Argentina', domains: ['https://crm.rayodinero.com'], digits: 10
    }];

    // --- UTILS DE UI (Estilo Premium) ---

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

    // --- NOTIFICACIÓN ESTÉTICA (GLOBAL) ---
    const mostrarAlertaEstetica = (totalPestanas, totalClientesReales) => {
        if (document.getElementById('crm-alerta-fin')) return; 
        
        const modal = document.createElement('div');
        modal.id = 'crm-alerta-fin';
        Object.assign(modal.style, {
            position: 'fixed', 
            top: '50%',  // 🔥 Centrado vertical absoluto
            left: '50%', // 🔥 Centrado horizontal absoluto
            transform: 'translate(-50%, -50%) scale(0.9)', // 🔥 Anclaje exacto al centro
            opacity: '0', backgroundColor: 'rgba(15, 23, 42, 0.95)', 
            border: '1px solid rgba(255, 255, 255, 0.15)', padding: '15px 25px', 
            borderRadius: '12px', boxShadow: '0 15px 40px rgba(0,0,0,0.7)', 
            display: 'flex', alignItems: 'center', gap: '15px',
            zIndex: '2147483647', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: '#fff', minWidth: '300px', width: 'max-content',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            backdropFilter: 'blur(10px)'
        });

        modal.innerHTML = `
            <div style="font-size: 28px; text-shadow: 0 0 15px rgba(16, 185, 129, 0.5);">✅</div>
            <div style="display: flex; flex-direction: column; flex-grow: 1; text-align: left;">
                <span style="font-size: 14px; color: #10b981; font-weight: 800; letter-spacing: 0.5px;">APERTURA FINALIZADA</span>
                <span style="font-size: 13px; color: #e2e8f0; margin-top: 3px;">
                    <strong style="color: #fbbf24; font-size: 14px;">${totalPestanas}</strong> pestañas abiertas.
                </span>
                <span style="font-size: 12px; color: #9ca3af;">
                    (${totalClientesReales} clientes únicos)
                </span>
            </div>
        `;

        const btn = document.createElement('button');
        btn.innerText = 'OK';
        Object.assign(btn.style, {
            backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px',
            borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
            fontSize: '13px', transition: 'all 0.2s', marginLeft: '10px'
        });
        
        btn.onmouseover = () => { btn.style.backgroundColor = '#059669'; btn.style.transform = 'translateY(-2px)'; };
        btn.onmouseout = () => { btn.style.backgroundColor = '#10b981'; btn.style.transform = 'translateY(0)'; };
        btn.onmousedown = () => { btn.style.transform = 'scale(0.95)'; };
        
        btn.onclick = () => {
            modal.style.transform = 'translate(-50%, -50%) scale(0.9)'; // 🔥 Animación de cierre al centro
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        };

        modal.appendChild(btn);
        document.body.appendChild(modal);

        requestAnimationFrame(() => {
            modal.style.transform = 'translate(-50%, -50%) scale(1)'; // 🔥 Animación de entrada al centro
            modal.style.opacity = '1';
        });
    };

    // --- LÓGICA DE SELECTORES ---

    function getDynamicColumnSelector(keywords, defaultSelector) {
        try {
            const headers = Array.from(document.querySelectorAll('.el-table__header-wrapper th, .el-table__fixed-header-wrapper th'));
            const foundIndex = headers.findIndex(header => 
                keywords.some(keyword => header.innerText.toLowerCase().includes(keyword.toLowerCase()))
            );
            if (foundIndex !== -1) {
                const classes = Array.from(headers[foundIndex].classList);
                const columnClass = classes.find(cls => cls.includes('el-table_') && cls.includes('_column_'));
                return columnClass ? '.' + columnClass : defaultSelector;
            }
        } catch (err) { console.warn('Error columna:', err); }
        return defaultSelector;
    }

    // --- LÓGICA PRINCIPAL ---

    function init() {
        if (intervalId) clearInterval(intervalId);

        // 🚀 NUEVA LÓGICA: Atrapa la alerta en la pestaña 'detail'
        if (window.location.href.toLowerCase().includes('detail')) {
            // Le damos 1.5 segundos para que la ráfaga de pestañas termine
            // y no se la robe una pestaña intermedia que cargó más rápido.
            setTimeout(() => {
                if (localStorage.getItem('CRM_SHOW_ALERT') === 'true') {
                    const checkVisibilityAndShow = () => {
                        // Si es la pestaña que estás viendo AHORA MISMO
                        if (document.visibilityState === 'visible') {
                            localStorage.removeItem('CRM_SHOW_ALERT'); // Consumimos la alerta
                            const totalClientes = localStorage.getItem('CRM_TOTAL_CLIENTES_REALES') || '0';
                            const totalPestanas = localStorage.getItem('CRM_TOTAL_PESTANAS') || '0';
                            mostrarAlertaEstetica(totalPestanas, totalClientes);
                        } else {
                            // Si está en segundo plano, espera a que cambies a ella
                            document.addEventListener('visibilitychange', function onVis() {
                                if (document.visibilityState === 'visible' && localStorage.getItem('CRM_SHOW_ALERT') === 'true') {
                                    localStorage.removeItem('CRM_SHOW_ALERT');
                                    const totalClientes = localStorage.getItem('CRM_TOTAL_CLIENTES_REALES') || '0';
                                    const totalPestanas = localStorage.getItem('CRM_TOTAL_PESTANAS') || '0';
                                    mostrarAlertaEstetica(totalPestanas, totalClientes);
                                    document.removeEventListener('visibilitychange', onVis);
                                }
                            });
                        }
                    };
                    checkVisibilityAndShow();
                }
            }, 1500); 
        }

        const currentUrl = window.location.href;
        const currentCrm = CONFIG_CRMS.find(c => c.domains.some(domain => currentUrl.includes(domain))) || {
            country: 'CRM', prefix: 'GLOBAL'
        };

        // 🔥 AJUSTE UNIFICADO: Todo el mundo usa la estructura de Cashimex 🔥
        const isVarious = currentUrl.includes('variousplan.com');

        // Ahora TODOS los CRMs usan los índices 13, 23 y 20 por defecto
        const defaultSelDate = '.el-table_1_column_13';
        const defaultSelAction = '.el-table_1_column_23';
        const defaultSelRegistry = '.el-table_1_column_20';
        
        // El User ID es 3 para todo el mundo (Cashimex, Global), excepto Various que usa la 2
        const defaultSelUser = isVarious ? '.el-table_1_column_2' : '.el-table_1_column_3';

        const getSelectorDate = () => getDynamicColumnSelector(['fecha', 'date', 'time'], defaultSelDate);
        const getSelectorAction = () => getDynamicColumnSelector(['operación', 'operation', 'acción', 'action'], defaultSelAction);
        const getSelectorRegistry = () => getDynamicColumnSelector(['registro de seguimiento', 'registro'], defaultSelRegistry);
        const getSelectorUser = () => getDynamicColumnSelector(['user id', 'user'], defaultSelUser);

        // --- ACCIONES ---

        const clickVisibleButtons = (reverseOrder) => {
            let buttons = Array.from(document.querySelectorAll('button.el-button--text.el-button--small'))
                .filter(btn => btn.innerText.includes('Seguimiento'));

            if (buttons.length === 0) return alert('No se encontraron botones.');
            if (reverseOrder) buttons.reverse();

            const isMac = navigator.userAgent.toUpperCase().indexOf('MAC OS') >= 0 || (navigator.userAgentData && navigator.userAgentData.platform === 'macOS');

            if (isMac) {
                const abrirSeguro = async () => {
                    for (let i = 0; i < buttons.length; i++) {
                        buttons[i].dispatchEvent(new MouseEvent('click', { view: window, bubbles: true, cancelable: true, ctrlKey: false, metaKey: true }));
                        await new Promise(resolve => setTimeout(resolve, 450));
                    }
                };
                abrirSeguro();
            } else {
                buttons.forEach((btn, index) => {
                    setTimeout(() => {
                        btn.dispatchEvent(new MouseEvent('click', { view: window, bubbles: true, cancelable: true, ctrlKey: true, metaKey: false }));
                    }, index * 150); 
                });
            }
        };

        const filterAndOpen = () => {
            const date1 = document.getElementById('input-fecha-1').value.trim().toLowerCase();
            const date2 = document.getElementById('input-fecha-2').value.trim().toLowerCase();
            const filterText = document.getElementById('input-filtro').value.trim().toLowerCase();

            if (!date1 && !date2 && !filterText) return alert('Introduce una fecha o un texto.');

            const rows = Array.from(document.querySelectorAll('.el-table__row'));
            if (rows.length === 0) return;

            const selectorDate = getSelectorDate();
            const selectorRegistry = getSelectorRegistry();

            const filteredRows = rows.filter(row => {
                const cellDate = row.querySelector(selectorDate);
                const textDate = cellDate ? cellDate.innerText.toLowerCase() : '';
                const matchDate = (!date1 && !date2) || (date1 && textDate.includes(date1)) || (date2 && textDate.includes(date2));
                
                const cellReg = row.querySelector(selectorRegistry);
                const textReg = cellReg ? cellReg.innerText.trim().toLowerCase() : '';
                
                let matchReg = false;
                if (!filterText) {
                    matchReg = true; 
                } else if (filterText === 'sin seguimiento') {
                    matchReg = textReg === ''; 
                } else {
                    matchReg = (textReg === filterText); 
                }

                return matchDate && matchReg;
            });

            if (filteredRows.length === 0) return alert('Sin registros que coincidan.');
            processAndClickRows(filteredRows);
        };

        const openAll = () => {
            const rows = Array.from(document.querySelectorAll('.el-table__row'));
            if (rows.length === 0) return;
            processAndClickRows(rows);
        };

        const processAndClickRows = (rows) => {
            const counts = {}; 
            const groupedRows = {}; 
            const selectorUser = getSelectorUser();
            const selectorDate = getSelectorDate(); 

            rows.forEach(row => {
                const cellUser = row.querySelector(selectorUser) || row.querySelectorAll('td')[2];
                const userId = cellUser ? cellUser.innerText.trim() : '';
                if (userId) {
                    counts[userId] = (counts[userId] || 0) + 1;
                    if (!groupedRows[userId]) groupedRows[userId] = [];
                    groupedRows[userId].push(row);
                }
            });

            const sortByDateDesc = (rowA, rowB) => {
                const cellA = rowA.querySelector(selectorDate);
                const cellB = rowB.querySelector(selectorDate);
                const dateA = cellA ? cellA.innerText.trim().toLowerCase() : '';
                const dateB = cellB ? cellB.innerText.trim().toLowerCase() : '';
                return dateB.localeCompare(dateA); 
            };

            let duplicateGroups = []; 
            let uniques = [];

            Object.keys(groupedRows).forEach(userId => {
                let userRows = groupedRows[userId];
                userRows.sort(sortByDateDesc);

                if (counts[userId] > 1) {
                    duplicateGroups.push(userRows); 
                } else {
                    uniques.push(userRows[0]);
                }
            });

            duplicateGroups.sort((groupA, groupB) => sortByDateDesc(groupA[0], groupB[0]));
            uniques.sort(sortByDateDesc);

            let duplicates = duplicateGroups.flat();
            const finalOrder = [...duplicates, ...uniques];
            const selectorAction = getSelectorAction();
            const isMac = navigator.userAgent.toUpperCase().indexOf('MAC OS') >= 0 || (navigator.userAgentData && navigator.userAgentData.platform === 'macOS');

            // 🧠 1. CALCULAMOS LOS DATOS REALES
            const totalClientesReales = Object.keys(groupedRows).length;
            const totalPestanas = finalOrder.length;
            
            localStorage.setItem('CRM_TOTAL_CLIENTES_REALES', totalClientesReales);
            localStorage.setItem('CRM_TOTAL_PESTANAS', totalPestanas);
            
            // Borramos la bandera por si quedó pegada de un uso anterior
            localStorage.removeItem('CRM_SHOW_ALERT');

            if (isMac) {
                const abrirPestañasSeguro = async () => {
                    for (let i = 0; i < finalOrder.length; i++) {
                        const row = finalOrder[i];
                        const cellAction = row.querySelector(selectorAction + ' span') || 
                                           Array.from(row.querySelectorAll('span, button')).find(el => el.innerText.includes('Seguimiento'));
                        if (cellAction) {
                            cellAction.dispatchEvent(new MouseEvent('click', { view: window, bubbles: true, cancelable: true, ctrlKey: false, metaKey: true }));
                        }
                        await new Promise(resolve => setTimeout(resolve, 450));
                    }
                    // 🔥 Al finalizar de abrir todas, activamos la bandera
                    localStorage.setItem('CRM_SHOW_ALERT', 'true');
                };
                abrirPestañasSeguro();
            } else {
                finalOrder.forEach((row, index) => {
                    setTimeout(() => {
                        const cellAction = row.querySelector(selectorAction + ' span') || 
                                           Array.from(row.querySelectorAll('span, button')).find(el => el.innerText.includes('Seguimiento'));
                        if (cellAction) {
                            cellAction.dispatchEvent(new MouseEvent('click', { view: window, bubbles: true, cancelable: true, ctrlKey: true, metaKey: false }));
                        }
                        
                        // 🔥 Si es la ÚLTIMA pestaña en abrirse, activamos la bandera
                        if (index === finalOrder.length - 1) {
                            setTimeout(() => {
                                localStorage.setItem('CRM_SHOW_ALERT', 'true');
                            }, 300); // Pequeño margen para asegurar que el click ya se dio
                        }
                    }, index * 150); 
                });
            }
        };

        // --- LÓGICA DEL PANEL ADMINISTRATIVO MAESTRO ---
        
        function obtenerToken() {
            const match = document.cookie.match(/(?:^|; )Admin-Token=([^;]*)/);
            return match ? decodeURIComponent(match[1]) : null;
        }

        async function fetchDataAPI() {
            window.appState.token = obtenerToken();
            if (!window.appState.token) { alert("No se pudo extraer el token. Actualiza la página."); return false; }
            try {
                const headers = { 'Authentication': window.appState.token, 'Content-Type': 'application/json' };
                
                const req1 = fetch(`${window.appState.baseUrl}/api/manage/urge/task/waitUrgeTaskPage?v=${Date.now()}`, {
                    method: 'POST', headers: headers, body: JSON.stringify({ stageId: 1, current: 1, size: 5000 })
                });
                
                const req2 = fetch(`${window.appState.baseUrl}/api/manage/urge/task/urgeTaskPage?v=${Date.now()}`, {
                    method: 'POST', headers: headers, body: JSON.stringify({closeType:null, userId:null, repayId:null, appCode:null, userName:null, finishTimeStart:null, finishTimeEnd:null, urgeUserId:null, repayType:null, current:1, size:100})
                });

                const [resp1, resp2] = await Promise.all([req1, req2]);
                const data1 = await resp1.json();
                const data2 = await resp2.json();

                if (data1.code === 401 || data1.code === 403 || data2.code === 401 || data2.code === 403) {
                    alert("Token expirado. Recargando para actualizar..."); location.reload(); return false;
                }

                let records = data1.data?.records || [];
                if (records.length > 0) window.appState.stageGeneral = records[0].stageName || 'UNKNOWN';
                
                const counts = {}; records.forEach(c => counts[c.userId] = (counts[c.userId] || 0) + 1);
                records.sort((a, b) => {
                    if ((counts[a.userId] > 1) !== (counts[b.userId] > 1)) return (counts[b.userId] > 1) - (counts[a.userId] > 1);
                    return new Date(b.openTime || 0) - new Date(a.openTime || 0);
                });

                window.appState.rawData = records; window.appState.filteredData = [...records];
                window.appState.paidData = data2.data?.records || [];
                window.appState.currentPage = 1; return true;
            } catch (e) { console.error("Error API:", e); return false; }
        }

        function buildAdminPanel() {
            if (document.getElementById('crm-admin-master-panel')) document.getElementById('crm-admin-master-panel').remove();

            const panel = document.createElement('div');
            panel.id = 'crm-admin-master-panel';
            Object.assign(panel.style, {
                position: 'fixed', top: '5vh', left: '15vw', width: '70vw', height: '90vh',
                backgroundColor: 'rgba(5, 10, 15, 0.85)', border: '1px solid #39ff14', // 🔥 Estilo Hacker Dark + Neon
                borderRadius: '12px', boxShadow: '0 0 35px rgba(57, 255, 20, 0.25)',
                display: 'flex', flexDirection: 'column', zIndex: '2147483647',
                fontFamily: "'Courier New', Courier, monospace", color: '#e2e8f0', // 🔥 Letra Terminal
                backdropFilter: 'blur(8px)' // 🔥 Efecto Blur translúcido
            });

            // 🔥 DOBLE CLIC PARA COPIAR 🔥
            panel.addEventListener('dblclick', (e) => {
                const copyEl = e.target.closest('.copy-id');
                if (copyEl) {
                    navigator.clipboard.writeText(copyEl.getAttribute('data-id') || copyEl.innerText).then(() => {
                        const orig = copyEl.innerText; copyEl.innerText = "¡Copiado!"; copyEl.style.color = "#39ff14";
                        setTimeout(() => { copyEl.innerText = orig; copyEl.style.color = ""; }, 800);
                    });
                    window.getSelection().removeAllRanges();
                }
            });

            // 🔥 SCROLL NATIVO Y ESTILO DE COPIA 🔥
            const style = document.createElement('style');
            style.innerHTML = `
                #crm-admin-master-panel ::-webkit-scrollbar { width: 8px; height: 8px; }
                #crm-admin-master-panel ::-webkit-scrollbar-track { background: rgba(0,0,0,0.4); border-radius: 4px; }
                #crm-admin-master-panel ::-webkit-scrollbar-thumb { background: rgba(57, 255, 20, 0.3); border-radius: 4px; }
                #crm-admin-master-panel ::-webkit-scrollbar-thumb:hover { background: #39ff14; }
                .copy-id:hover { text-decoration: underline; background: rgba(57, 255, 20, 0.15); border-radius: 3px; }
            `;
            panel.appendChild(style);

            const header = document.createElement('div');
            Object.assign(header.style, { padding: '15px 20px', borderBottom: '1px solid rgba(57, 255, 20, 0.3)', display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.4)', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', cursor: 'grab' });
            header.innerHTML = `<div><strong style="color:#39ff14; text-shadow: 0 0 5px #39ff14;">TERMINAL ADMINISTRATIVA</strong> | Etapa: <span style="color:#fbbf24">${window.appState.stageGeneral}</span></div>`;
            const closeBtn = document.createElement('button'); closeBtn.innerHTML = '×';
            Object.assign(closeBtn.style, { background: 'transparent', border: 'none', color: '#ef4444', fontSize: '28px', cursor: 'pointer', lineHeight: '1' });
            closeBtn.onclick = () => panel.remove(); 
            header.appendChild(closeBtn);
            
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            header.onmousedown = (e) => { e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY; document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; }; document.onmousemove = (e) => { e.preventDefault(); pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY; panel.style.top = (panel.offsetTop - pos2) + "px"; panel.style.left = (panel.offsetLeft - pos1) + "px"; }; };
            panel.appendChild(header);

            const bodyContainer = document.createElement('div');
            Object.assign(bodyContainer.style, { display: 'flex', flexGrow: '1', overflow: 'hidden' });

            const leftCol = document.createElement('div');
            Object.assign(leftCol.style, { flexGrow: '1', display: 'flex', flexDirection: 'column', padding: '15px', borderRight: '1px solid rgba(57, 255, 20, 0.15)', overflow: 'hidden' });

            const toolbar = document.createElement('div');
            Object.assign(toolbar.style, { display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-end' });

            const msgGuardado = sessionStorage.getItem('crm_saved_msg') || '';
            const sizeGuardado = sessionStorage.getItem('crm_saved_size') || '50';
            window.appState.pageSize = sizeGuardado === 'ALL' ? 'ALL' : parseInt(sizeGuardado);

            // 🔥 CAJA DE MENSAJE MÁS COMPACTA 🔥
            const msgContainer = document.createElement('div'); 
            Object.assign(msgContainer.style, { width: '220px', flexShrink: '0' }); 
            msgContainer.innerHTML = `<label style="font-size:11px;color:#39ff14;display:block;margin-bottom:2px;">Mensaje a enviar:</label>`;
            const inputMsg = document.createElement('input'); inputMsg.type = 'text'; inputMsg.value = msgGuardado;
            Object.assign(inputMsg.style, { width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid #39ff14', backgroundColor: 'rgba(0,0,0,0.5)', color: '#39ff14', outline: 'none', fontFamily: 'inherit' });
            inputMsg.oninput = () => sessionStorage.setItem('crm_saved_msg', inputMsg.value); 
            msgContainer.appendChild(inputMsg);

            const sizeContainer = document.createElement('div');
            sizeContainer.innerHTML = `<label style="font-size:11px;color:#9ca3af;display:block;margin-bottom:2px;">Selección (Visible):</label>`;
            const selectSize = document.createElement('select');
            [5, 50, 100, 200, 'ALL'].forEach(v => {
                const isSelected = String(v) === sizeGuardado ? 'selected' : '';
                selectSize.innerHTML += `<option value="${v}" ${isSelected}>${v === 'ALL' ? 'Todo' : v}</option>`;
            });
            Object.assign(selectSize.style, { padding: '7px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: '#1e293b', color: '#fff', outline: 'none' });
            selectSize.onchange = (e) => { 
                window.appState.pageSize = e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value); 
                window.appState.currentPage = 1; 
                sessionStorage.setItem('crm_saved_size', e.target.value);
                renderTable(); 
            };
            sizeContainer.appendChild(selectSize);

            window.appState.isPaused = false; window.appState.shouldStop = false;

            // 🔥 UTILIDAD PARA GENERAR COLORES ÚNICOS POR APLICACIÓN 🔥
            window.getAppColor = (appName) => {
                const colors = ['#0ea5e9', '#d946ef', '#f43f5e', '#8b5cf6', '#14b8a6', '#f59e0b', '#3b82f6'];
                if (!appName) return '#9ca3af';
                let hash = 0;
                for (let i = 0; i < appName.length; i++) hash = appName.charCodeAt(i) + ((hash << 5) - hash);
                return colors[Math.abs(hash) % colors.length];
            };

            const controlesContainer = document.createElement('div');
            Object.assign(controlesContainer.style, { display: 'flex', gap: '8px', flexGrow: '1', justifyContent: 'flex-start' });

            // 🔥 BOTONES ESTILO TERMINAL HACKER (MÁS GRUESOS Y LLAMATIVOS) 🔥
            const terminalBtnStyle = {
                padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '900', fontSize: '13px', letterSpacing: '0.5px',
                backgroundColor: 'rgba(0,0,0,0.6)', border: '2px solid #39ff14', color: '#39ff14',
                textShadow: '0 0 8px rgba(57,255,20,0.8)', fontFamily: "'Courier New', Courier, monospace",
                textTransform: 'uppercase', transition: 'all 0.2s ease', outline: 'none'
            };
            
            const hoverTerminal = (btn, color) => {
                btn.onmouseenter = () => { btn.style.backgroundColor = color; btn.style.color = '#000'; btn.style.boxShadow = `0 0 10px ${color}`; };
                btn.onmouseleave = () => { btn.style.backgroundColor = 'rgba(0,0,0,0.6)'; btn.style.color = color; btn.style.boxShadow = 'none'; };
            };

            const btnEjecutar = document.createElement('button'); 
            btnEjecutar.id = "btn-ejecutar-masivo"; btnEjecutar.innerHTML = "[> SEGUIMIENTO MASIVO]";
            Object.assign(btnEjecutar.style, terminalBtnStyle); hoverTerminal(btnEjecutar, '#39ff14');

            const btnAbrirVisibles = document.createElement('button'); 
            btnAbrirVisibles.id = "btn-abrir-masivo"; btnAbrirVisibles.innerHTML = "[> ABRIR CLIENTES]";
            Object.assign(btnAbrirVisibles.style, { ...terminalBtnStyle, border: '1px solid #0ea5e9', color: '#0ea5e9', textShadow: '0 0 5px rgba(14,165,233,0.5)' });
            hoverTerminal(btnAbrirVisibles, '#0ea5e9');

            const btnPausar = document.createElement('button');
            btnPausar.id = "btn-pausar-masivo"; btnPausar.innerHTML = "[|| PAUSAR]";
            Object.assign(btnPausar.style, { ...terminalBtnStyle, border: '1px solid #f59e0b', color: '#f59e0b', textShadow: '0 0 5px rgba(245,158,11,0.5)', display: 'none' });
            hoverTerminal(btnPausar, '#f59e0b');

            const btnReiniciar = document.createElement('button');
            btnReiniciar.id = "btn-reiniciar-masivo"; btnReiniciar.innerHTML = "[X DETENER]";
            Object.assign(btnReiniciar.style, { ...terminalBtnStyle, border: '1px solid #ef4444', color: '#ef4444', textShadow: '0 0 5px rgba(239,68,68,0.5)', display: 'none' });
            hoverTerminal(btnReiniciar, '#ef4444');

            controlesContainer.append(btnEjecutar, btnAbrirVisibles, btnPausar, btnReiniciar);

            btnEjecutar.onclick = () => {
                if (window.appState.isPaused) {
                    window.appState.isPaused = false;
                    btnPausar.style.display = 'block'; btnEjecutar.style.display = 'none'; logMsg("▶️ Proceso reanudado.", "#3b82f6");
                } else { runMassFollowUp(inputMsg.value); }
            };

            // 🔥 MODAL CONFIRMACIÓN ESTILO HACKER (CON BLUR) 🔥
            const mostrarConfirmacionHacker = (mensaje) => {
                return new Promise((resolve) => {
                    const overlay = document.createElement('div');
                    Object.assign(overlay.style, {
                        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)', // Desenfoca el fondo
                        zIndex: '2147483647', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Courier New', Courier, monospace"
                    });
                    
                    const modal = document.createElement('div');
                    Object.assign(modal.style, {
                        backgroundColor: 'rgba(5, 10, 15, 0.95)', border: '1px solid #39ff14',
                        boxShadow: '0 0 35px rgba(57, 255, 20, 0.4)', borderRadius: '8px',
                        padding: '20px 30px', textAlign: 'center', color: '#e2e8f0', minWidth: '320px'
                    });
                    
                    modal.innerHTML = `
                        <div style="color:#fbbf24; font-size:22px; margin-bottom:15px; font-weight:900; text-shadow:0 0 10px rgba(251,191,36,0.8);">[?] CONFIRMAR ACCIÓN</div>
                        <div style="font-size:14px; margin-bottom:25px; line-height:1.5;">${mensaje}</div>
                        <div style="display:flex; justify-content:center; gap:15px;">
                            <button id="btn-modal-cancel" style="padding:10px 20px; background:rgba(0,0,0,0.6); border:2px solid #ef4444; color:#ef4444; cursor:pointer; font-weight:900; font-size:13px; border-radius:4px; font-family:inherit; text-shadow:0 0 5px rgba(239,68,68,0.8);">[X] CANCELAR</button>
                            <button id="btn-modal-ok" style="padding:10px 20px; background:rgba(57,255,20,0.1); border:2px solid #39ff14; color:#39ff14; cursor:pointer; font-weight:900; font-size:13px; border-radius:4px; font-family:inherit; text-shadow:0 0 5px rgba(57,255,20,0.8);">[>] ACEPTAR</button>
                        </div>
                    `;
                    
                    overlay.appendChild(modal); document.body.appendChild(overlay);
                    
                    const btnCancel = overlay.querySelector('#btn-modal-cancel'); const btnOk = overlay.querySelector('#btn-modal-ok');
                    btnCancel.onmouseenter = () => { btnCancel.style.backgroundColor = '#ef4444'; btnCancel.style.color = '#000'; };
                    btnCancel.onmouseleave = () => { btnCancel.style.backgroundColor = 'rgba(0,0,0,0.6)'; btnCancel.style.color = '#ef4444'; };
                    btnOk.onmouseenter = () => { btnOk.style.backgroundColor = '#39ff14'; btnOk.style.color = '#000'; };
                    btnOk.onmouseleave = () => { btnOk.style.backgroundColor = 'rgba(57,255,20,0.1)'; btnOk.style.color = '#39ff14'; };

                    btnCancel.onclick = () => { overlay.remove(); resolve(false); };
                    btnOk.onclick = () => { overlay.remove(); resolve(true); };
                });
            };

            btnAbrirVisibles.onclick = async () => {
                let targetData = window.appState.pageSize === 'ALL' ? window.appState.filteredData : window.appState.filteredData.slice((window.appState.currentPage - 1) * window.appState.pageSize, window.appState.currentPage * window.appState.pageSize);
                if(targetData.length === 0) return alert("No hay clientes visibles.");
                
                const confirmado = await mostrarConfirmacionHacker(`¿Abrir <b>${targetData.length}</b> productos en total?<br><span style="color:#39ff14; font-size:12px;">(Se abrirán TODOS los productos. Los clientes duplicados se agruparán al inicio).</span>`);
                if(!confirmado) return;
                
                logMsg(`> Preparando lista de ${targetData.length} productos...`, '#0ea5e9');

                // 1. Contar frecuencias para saber quiénes son múltiples
                const counts = {};
                targetData.forEach(c => counts[c.userId] = (counts[c.userId] || 0) + 1);

                // 2. Separar duplicados de únicos
                const duplicadosArr = []; const unicosArr = [];
                
                // 3. Ordenar todo por fecha antes de separar (Más reciente primero)
                const sortedData = [...targetData].sort((a, b) => new Date(b.openTime || 0) - new Date(a.openTime || 0));

                sortedData.forEach(c => {
                    if (counts[c.userId] > 1) duplicadosArr.push(c);
                    else unicosArr.push(c);
                });

                // 4. Unir priorizando múltiples al inicio
                const finalToOpen = [...duplicadosArr, ...unicosArr];
                let abiertas = 0;

                for(let i=0; i<finalToOpen.length; i++) {
                    const c = finalToOpen[i];
                    const appColor = window.getAppColor ? window.getAppColor(c.appName) : '#9ca3af';
                    const coloredAppProd = `<span style="color:${appColor}">[${c.appName || 'N/A'} - ${c.productName || 'N/A'}]</span>`;

                    abiertas++;
                    const isMult = counts[c.userId] > 1 ? `<span style="color:#fbbf24; font-weight:bold;">[MÚLTIPLE]</span> ` : '';
                    logMsg(`[+] Orden #${abiertas} | Abriendo: ${isMult}${c.userName} ${coloredAppProd}`, '#39ff14');
                    
                    await window.abrirClienteUnico(c); 
                    await new Promise(r => setTimeout(r, 450));
                }
                
                // 🔥 LOG FINAL SÚPER RESALTADO (BLANCO CON BORDE NEÓN) Y SIN ALERTA 🔥
                logMsg(`<div style="background:#e2e8f0; color:#0f172a; padding:8px 12px; border-radius:6px; font-weight:900; font-size:14px; text-transform:uppercase; border:3px solid #39ff14; text-shadow:none; margin-top:8px; box-shadow:0 0 15px rgba(57,255,20,0.7); text-align:center;">
                    > FIN: ${abiertas} PESTAÑAS ABIERTAS (TODAS). MÚLTIPLES PRIMERO.
                </div>`, '#39ff14');
            };

            btnPausar.onclick = () => {
                window.appState.isPaused = true; btnPausar.style.display = 'none'; btnEjecutar.innerHTML = "▶️ CONTINUAR";
                btnEjecutar.style.display = 'block'; btnEjecutar.style.backgroundColor = '#3b82f6'; logMsg("⏸️ Proceso en pausa...", "#f59e0b");
            };

            btnReiniciar.onclick = () => {
                window.appState.shouldStop = true; window.appState.isPaused = false; btnPausar.style.display = 'none'; btnReiniciar.style.display = 'none';
                btnEjecutar.style.display = 'block'; btnEjecutar.style.backgroundColor = '#10b981'; renderTable(); 
            };

            toolbar.append(msgContainer, sizeContainer, controlesContainer); leftCol.appendChild(toolbar);

            if (true) {
                const filterBar = document.createElement('div');
                Object.assign(filterBar.style, { display: 'flex', gap: '10px', marginBottom: '10px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px', flexWrap: 'wrap', alignItems: 'center' });
                
                const uniqueApps = [...new Set(window.appState.rawData.map(c => c.appName || c.productName).filter(Boolean))].sort();
                const uniqueDays = [...new Set(window.appState.rawData.map(c => c.overdueDay).filter(d => d !== undefined))].sort((a,b)=>a-b);
                const uniqueDates = [...new Set(window.appState.rawData.map(c => c.openTime ? c.openTime.split(' ')[0] : null).filter(Boolean))].sort((a,b)=>new Date(b)-new Date(a));
                const top5Dates = uniqueDates.slice(0, 5);

                const baseInputStyle = "background:#1e293b;color:#fff;border:1px solid #475569;padding:4px;border-radius:4px;font-size:11px;outline:none;";
                const getOptionsHtml = (arr) => arr.map(o => `<option value="${o}">${o}</option>`).join('');

                // 🔥 NUEVA UI: Función para crear menú desplegable con checkboxes
                const createMultiCheckHtml = (id, title, items) => {
                    const chks = items.map(i => `<label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:3px 2px;"><input type="checkbox" class="${id}-chk" value="${i}"> ${i}</label>`).join('');
                    return `
                    <div style="display:flex; flex-direction:column; gap:2px; position:relative;" class="crm-dropdown-container">
                        <span style="font-size:10px;color:#9ca3af;">${title}</span>
                        <div id="${id}-btn" style="${baseInputStyle} height:24px; min-width:90px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                            <span id="${id}-lbl" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:70px;">Todos</span> 
                            <span style="font-size:8px; margin-left:5px;">▼</span>
                        </div>
                        <div id="${id}-menu" style="display:none; position:absolute; top:40px; left:0; width:max-content; min-width:120px; max-height:180px; overflow-y:auto; background:#1e293b; border:1px solid #475569; border-radius:6px; padding:8px; z-index:99999; box-shadow:0 15px 30px rgba(0,0,0,0.8);">
                            ${chks}
                        </div>
                    </div>`;
                };

                // 🔥 HTML MODIFICADO: Ahora f-dates usa el menú tiqueable 🔥
                filterBar.innerHTML = `
                    ${createMultiCheckHtml('f-app', 'App (Multi)', uniqueApps)}
                    ${createMultiCheckHtml('f-days', 'Días (Multi)', uniqueDays)}
                    <div style="width:1px; height:40px; background:rgba(255,255,255,0.2); margin:0 5px;"></div>
                    ${createMultiCheckHtml('f-dates', 'Fechas (Top 5)', top5Dates)}
                    <div style="width:1px; height:40px; background:rgba(255,255,255,0.2); margin:0 5px;"></div>
                    <div style="display:flex; flex-direction:column; gap:2px;"><span style="font-size:10px;color:#9ca3af;">Pago?</span><select id="f-repay" style="${baseInputStyle} height:24px;"><option value="ALL">Todos</option><option value="Si">Si</option><option value="No">No</option></select></div>
                `;

                // 🔥 LÓGICA VISUAL: Manejo de clics en los nuevos desplegables
                const setupDropdown = (id) => {
                    const btn = filterBar.querySelector(`#${id}-btn`);
                    const menu = filterBar.querySelector(`#${id}-menu`);
                    const lbl = filterBar.querySelector(`#${id}-lbl`);
                    
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        const isVisible = menu.style.display === 'block';
                        filterBar.querySelectorAll('.crm-dropdown-container > div:last-child').forEach(m => m.style.display = 'none');
                        menu.style.display = isVisible ? 'none' : 'block';
                    };
                    
                    menu.onclick = (e) => e.stopPropagation(); 
                    
                    menu.addEventListener('change', () => {
                        const checked = Array.from(filterBar.querySelectorAll(`.${id}-chk:checked`)).map(cb => cb.value);
                        lbl.innerText = checked.length === 0 ? 'Todos' : (checked.length === 1 ? checked[0] : `${checked.length} selec.`);
                        applyAllFilters();
                    });
                };
                
                setupDropdown('f-app');
                setupDropdown('f-days');
                setupDropdown('f-dates'); // 🔥 Inicializamos el nuevo selector de fechas 🔥
                
                // Cerrar menús al hacer clic afuera
                document.addEventListener('click', () => {
                    document.querySelectorAll('.crm-dropdown-container > div:last-child').forEach(m => m.style.display = 'none');
                });

                // 🔥 LÓGICA DE FILTRADO ACTUALIZADA (AHORA ES SUMATORIA / OR) 🔥
                const applyAllFilters = () => {
                    const selectedApps = Array.from(document.querySelectorAll('.f-app-chk:checked')).map(cb => cb.value);
                    const selectedDays = Array.from(document.querySelectorAll('.f-days-chk:checked')).map(cb => cb.value);
                    const selectedDates = Array.from(document.querySelectorAll('.f-dates-chk:checked')).map(cb => cb.value.toLowerCase());
                    
                    const fRepay = document.getElementById('f-repay') ? document.getElementById('f-repay').value : 'ALL';

                    window.appState.filteredData = window.appState.rawData.filter(c => {
                        // Si TODOS los filtros están en "Todos" o vacíos, mostramos toda la cartera original
                        if (selectedApps.length === 0 && selectedDays.length === 0 && selectedDates.length === 0 && fRepay === 'ALL') {
                            return true;
                        }

                        // 1. Evaluamos App
                        const cApp = c.appName || c.productName;
                        const matchApp = selectedApps.length > 0 && selectedApps.includes(cApp);
                        
                        // 2. Evaluamos Días
                        const matchDay = selectedDays.length > 0 && selectedDays.includes(String(c.overdueDay));
                        
                        // 3. Evaluamos Pago
                        const matchRepay = fRepay !== 'ALL' && (c.isRepay ? "Si" : "No") === fRepay;
                        
                        // 4. Evaluamos Fechas
                        const openT = (c.openTime || "").toLowerCase();
                        const matchDate = selectedDates.length > 0 && selectedDates.some(date => openT.includes(date));
                        
                        // 🔥 SUMATORIA (Lógica OR): Si cumple AL MENOS UNO de los filtros, se incluye en la lista.
                        // Al usar .filter() aseguramos que, aunque cumpla 2 o más filtros a la vez, se mostrará UNA SOLA VEZ.
                        return matchApp || matchDay || matchRepay || matchDate;
                    });
                    
                    window.appState.currentPage = 1; 
                    renderTable();
                };

                // Listeners nativos para el select de "Pago?"
                filterBar.addEventListener('change', (e) => { if(e.target.tagName === 'SELECT') applyAllFilters(); });
                leftCol.appendChild(filterBar);
            }

            // 🔥 AJUSTE VERTICAL: 65% Tabla 🔥
            const tableContainer = document.createElement('div');
            Object.assign(tableContainer.style, { flex: '6.5', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.4)', minHeight: '0' });
            const table = document.createElement('table');
            Object.assign(table.style, { width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' });
            tableContainer.appendChild(table);
            leftCol.appendChild(tableContainer);

            const footerPage = document.createElement('div');
            Object.assign(footerPage.style, { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' });
            const lblInfo = document.createElement('span'); lblInfo.style.fontSize = '12px';
            const pageControls = document.createElement('div');
            pageControls.innerHTML = `<button id="btn-prev" style="padding:5px 10px; background:#334155; color:#fff; border:none; border-radius:4px; cursor:pointer;">◀ Ant</button> <button id="btn-next" style="padding:5px 10px; background:#334155; color:#fff; border:none; border-radius:4px; cursor:pointer;">Sig ▶</button>`;
            footerPage.append(lblInfo, pageControls);
            leftCol.appendChild(footerPage);

            // 🔥 AJUSTE VERTICAL: 35% Consola de Logs 🔥
            const statusLog = document.createElement('div');
            statusLog.id = 'crm-status-log';
            Object.assign(statusLog.style, { flex: '3.5', marginTop: '10px', padding: '10px', fontSize: '12px', color: '#10b981', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '6px', overflowY: 'auto', border: '1px solid rgba(16,185,129,0.3)', minHeight: '0' });
            statusLog.innerHTML = "Listo para iniciar...";
            leftCol.appendChild(statusLog);

            function logMsg(msg, color="#10b981") { statusLog.innerHTML = `<span style="color:${color}">${msg}</span><br>` + statusLog.innerHTML; }

            // 🔥 LÓGICA PARA EXTRAER INFO Y ABRIR PESTAÑA LIMPIA DE UN CLIENTE EN SEGUNDO PLANO 🔥
            window.abrirClienteUnico = async function(c) {
                try {
                    let detalle = {};
                    if (c.taskId && c.orderId) {
                        try {
                            const r = await fetch(`${window.appState.baseUrl}/api/manage/urge/task/getTaskInfo/${c.taskId}/${c.orderId}?v=${Date.now()}`, { headers: { 'Authentication': window.appState.token }});
                            const d = await r.json(); detalle = d.data || {};
                        } catch(err){}
                    }
                    const params = new URLSearchParams({
                        taskId: c.taskId || '', orderId: c.orderId || '', repayId: c.repayId || detalle.repayId || '', repayType: c.repayType || '2',
                        principal: c.principal || detalle.principal || '', repayTime: c.repayTime || detalle.repayTime || '', overdueFee: c.overdueFee || '', repaidAmount: c.repaidAmount || '0',
                        overdueDay: c.overdueDay || '', repayAmount: c.repayAmount || '', phone: c.phone || detalle.phone || '', userName: c.userName || c.name || '',
                        productName: c.productName || '', userId: c.userId || '', stageName: c.stageName || 'M1', appCode: c.appCode || '', totalAmount: c.totalAmount || '', level: c.level || ''
                    });
                    const url = `${window.appState.baseUrl}/#/detail3?${params.toString()}`;
                    const a = document.createElement('a'); a.href = url; a.target = '_blank';
                    const isMac = navigator.userAgent.toUpperCase().indexOf('MAC OS') >= 0;
                    a.dispatchEvent(new MouseEvent('click', { ctrlKey: !isMac, metaKey: isMac, bubbles: true, cancelable: true })); // 🔥 Hack Segundo Plano 🔥
                } catch(e) { console.error("Error abriendo cliente:", e); }
            };

            function renderTable() {
                // 🔥 CALCULO DE FECHAS SEGÚN ZONA HORARIA 🔥
                let tz = 'America/La_Paz';
                if (window.appState.baseUrl.includes('co-crm')) tz = 'America/Bogota';
                else if (window.appState.baseUrl.includes('mx-')) tz = 'America/Mexico_City';
                else if (window.appState.baseUrl.includes('cl-crm')) tz = 'America/Santiago';
                else if (window.appState.baseUrl.includes('pe-crm')) tz = 'America/Lima';
                else if (window.appState.baseUrl.includes('creddireto')) tz = 'America/Sao_Paulo';
                else if (window.appState.baseUrl.includes('rayodinero')) tz = 'America/Argentina/Buenos_Aires';

                const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
                const hoy = new Date(); const ayer = new Date(hoy); ayer.setDate(ayer.getDate() - 1);
                const hoyStr = formatter.format(hoy); const ayerStr = formatter.format(ayer);

                let dataToShow = [], total = window.appState.filteredData.length;
                if (window.appState.pageSize === 'ALL') {
                    dataToShow = window.appState.filteredData; lblInfo.innerText = `Mostrando TODOS los ${total} registros.`; pageControls.style.display = 'none';
                } else {
                    const start = (window.appState.currentPage - 1) * window.appState.pageSize;
                    dataToShow = window.appState.filteredData.slice(start, start + window.appState.pageSize);
                    lblInfo.innerText = `Mostrando ${start + 1} - ${Math.min(start + window.appState.pageSize, total)} de ${total}`;
                    pageControls.style.display = 'block';
                    document.getElementById('btn-prev').disabled = window.appState.currentPage === 1;
                    document.getElementById('btn-next').disabled = window.appState.currentPage >= Math.ceil(total / window.appState.pageSize);
                }
                const currentIds = {}; dataToShow.forEach(c => currentIds[c.userId] = (currentIds[c.userId] || 0) + 1);
                
                const btnEjec = document.getElementById('btn-ejecutar-masivo');
                if (btnEjec && !window.appState.isExecuting && !window.appState.isPaused) btnEjec.innerHTML = `[> SEGUIMIENTO MASIVO (${dataToShow.length})]`;
                const btnAbrirMasivo = document.getElementById('btn-abrir-masivo');
                if (btnAbrirMasivo && !window.appState.isExecuting && !window.appState.isPaused) btnAbrirMasivo.innerHTML = `[> ABRIR CLIENTES (${dataToShow.length})]`;

                // 🔥 ENCABEZADO STICKY (SIEMPRE VISIBLE AL BAJAR SCROLL) 🔥
                table.innerHTML = `<thead style="position: sticky; top: 0; z-index: 10; background: rgba(10, 15, 30, 0.95); box-shadow: 0 2px 10px rgba(0,0,0,0.8); backdrop-filter: blur(5px);">
                <tr style="border-bottom:1px solid rgba(57,255,20,0.3);">
                    <th style="padding:6px; color:#e2e8f0;">ID</th><th style="padding:6px; color:#e2e8f0;">Cobrador</th><th style="padding:6px; color:#e2e8f0;">Etapa</th><th style="padding:6px; color:#e2e8f0;">Cliente</th>
                    <th style="padding:6px; color:#e2e8f0;">Teléfono</th><th style="padding:6px; color:#e2e8f0;">App</th><th style="padding:6px;color:#fbbf24;">Producto</th><th style="padding:6px; color:#e2e8f0;">Atraso</th>
                    <th style="padding:6px; color:#e2e8f0;">Pago?</th><th style="padding:6px; color:#e2e8f0;">Fecha de Conexión</th><th style="padding:6px;text-align:center; color:#e2e8f0;">Acción</th>
                </tr></thead><tbody>` +
                    dataToShow.map(c => {
                        const openDate = c.openTime ? c.openTime.split(' ')[0] : '-';
                        let dateStyle = 'color:#e2e8f0;'; 
                        if (openDate === hoyStr) dateStyle = 'color: #39ff14; font-weight: bold; text-shadow: 0 0 5px rgba(57,255,20,0.6);'; 
                        else if (openDate === ayerStr) dateStyle = 'color: #ff6700; font-weight: bold; text-shadow: 0 0 5px rgba(255,103,0,0.6);'; 
                        
                        const appColor = window.getAppColor ? window.getAppColor(c.appName) : '#9ca3af';

                        return `<tr style="${currentIds[c.userId] > 1 ? 'background:rgba(239,68,68,0.15)' : 'border-bottom:1px solid rgba(255,255,255,0.05)'}">
                            <td style="padding:4px;color:${currentIds[c.userId] > 1 ? '#fca5a5' : '#93c5fd'}"><span class="copy-id" data-id="${c.userId}" style="cursor:pointer;" title="Doble clic para copiar">${c.userId}</span></td>
                            <td style="padding:4px;">${c.urgeUserName||'N/A'}</td><td style="padding:4px;">${c.stageName||'N/A'}</td>
                            <td style="padding:4px;">${c.userName||'N/A'}</td><td style="padding:4px;">${c.phone||'N/A'}</td>
                            <td style="padding:4px;color:${appColor};font-weight:bold;">${c.appName||'N/A'}</td><td style="padding:4px;color:#fbbf24;">${c.productName||'N/A'}</td><td style="padding:4px;">${c.overdueDay!==undefined?c.overdueDay:'-'}</td>
                            <td style="padding:4px;">${c.isRepay===true?'Si':'No'}</td>
                            <td style="padding:4px; ${dateStyle}">${openDate}</td>
                            <td style="padding:4px;text-align:center;">
                                <button class="btn-abrir-fila" data-uid="${c.userId}" data-tid="${c.taskId}" style="background:#3b82f6; color:#fff; border:none; border-radius:4px; padding:3px 8px; font-size:10px; cursor:pointer;">Abrir</button>
                            </td>
                        </tr>`;
                    }).join('') + `</tbody>`;
            }

            document.body.addEventListener('click', async function(e) {
                if(e.target && e.target.id == 'btn-prev') { if(window.appState.currentPage > 1) { window.appState.currentPage--; renderTable(); } }
                if(e.target && e.target.id == 'btn-next') { if(window.appState.currentPage < Math.ceil(window.appState.filteredData.length / window.appState.pageSize)) { window.appState.currentPage++; renderTable(); } }
                
                // 🔥 ABRIR INDIVIDUAL EN SEGUNDO PLANO 🔥
                if(e.target && e.target.classList.contains('btn-abrir-fila')) {
                    const uid = e.target.getAttribute('data-uid'); const tid = e.target.getAttribute('data-tid');
                    const c = window.appState.filteredData.find(x => String(x.userId) === String(uid) && String(x.taskId) === String(tid));
                    if (c) {
                        e.target.innerText = "⏳"; e.target.style.backgroundColor = "#fbbf24";
                        await window.abrirClienteUnico(c);
                        setTimeout(() => { e.target.innerText = "Abrir"; e.target.style.backgroundColor = "#3b82f6"; }, 1000);
                    }
                }
            });
            const rightCol = document.createElement('div');
            Object.assign(rightCol.style, { width: '220px', display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', overflowY: 'auto' });

            // 🔥 MINI PANELES (AHORA CON SOPORTE DE COLORES DINÁMICOS) 🔥
            const createMiniPanel = (title, dataObj, defaultColor, isAppPanel = false) => {
                const wrap = document.createElement('div'); Object.assign(wrap.style, { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px', border: `1px solid ${defaultColor}40` });
                
                const listHtml = Object.entries(dataObj).sort((a,b)=>b[1]-a[1]).map(([k,v]) => {
                    const itemColor = isAppPanel && window.getAppColor ? window.getAppColor(k) : '#e2e8f0';
                    return `<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px dotted rgba(255,255,255,0.1);"><span style="color:${itemColor};font-weight:${isAppPanel?'bold':'normal'};">${k}</span><span style="color:#fbbf24;font-weight:bold;">${v}</span></div>`;
                }).join('');

                wrap.innerHTML = `<div style="color:${defaultColor};font-size:11px;font-weight:bold;margin-bottom:8px;text-transform:uppercase;border-bottom:1px solid ${defaultColor}40;padding-bottom:4px;">${title}</div><div style="max-height:150px;overflow-y:auto;font-size:11px;">${listHtml}</div>`;
                return wrap;
            };

            const appsSummary = {}; window.appState.rawData.forEach(c => { const app = c.appName || c.productName || 'N/A'; appsSummary[app] = (appsSummary[app] || 0) + 1; });
            rightCol.appendChild(createMiniPanel("Apps (General)", appsSummary, '#0ea5e9', true)); // Pasa "true" para activar colores

            // 🔥 Sin restricción de etapa para verificar la vista
            const overdueSummary = {}; window.appState.rawData.forEach(c => { if(c.overdueDay !== undefined) overdueSummary[`${c.overdueDay} días`] = (overdueSummary[`${c.overdueDay} días`] || 0) + 1; });
            rightCol.appendChild(createMiniPanel("Días Atraso", overdueSummary, '#d946ef'));

            // 🔥 NUEVO PANEL: IDs Repetidos
            const countsIds = {}; window.appState.rawData.forEach(c => countsIds[c.userId] = (countsIds[c.userId] || 0) + 1);
            const duplicates = Object.entries(countsIds).filter(([k,v]) => v > 1).reduce((obj, [k,v]) => { obj[k] = v; return obj; }, {});
            
            const dupWrap = document.createElement('div'); 
            Object.assign(dupWrap.style, { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px', border: `1px solid #ef444440` });
            
            if (Object.keys(duplicates).length > 0) {
                dupWrap.innerHTML = `<div style="color:#ef4444;font-size:11px;font-weight:bold;margin-bottom:8px;text-transform:uppercase;border-bottom:1px solid #ef444440;padding-bottom:4px;">IDs Repetidos</div><div style="max-height:150px;overflow-y:auto;font-size:11px;">` + Object.entries(duplicates).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px dotted rgba(255,255,255,0.1);"><span class="copy-id" data-id="${k}" style="cursor:pointer;" title="Doble clic para copiar">${k}</span><span style="color:#ef4444;font-weight:bold;">${v} préstamos</span></div>`).join('') + `</div>`;
            } else {
                dupWrap.innerHTML = `<div style="color:#10b981;font-size:11px;font-weight:bold;margin-bottom:4px;text-transform:uppercase;border-bottom:1px solid #10b98140;padding-bottom:4px;">Sin Duplicados</div><div style="font-size:11px; color:#9ca3af;">Total clientes: <strong style="color:#fff">${window.appState.rawData.length}</strong>.<br>No hay IDs repetidos en la cartera.</div>`;
            }
            rightCol.appendChild(dupWrap);

            // 🔥 NUEVO PANEL: Clientes Pagados (Usando el Fetch de UrgeTaskPage) 🔥
            const paidWrap = document.createElement('div');
            Object.assign(paidWrap.style, { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px', border: `1px solid #10b98140` });

            if (window.appState.paidData.length > 0) {
                let listHtml = window.appState.paidData.map(p => {
                    const tipo = p.closeType == 1 ? 'Total' : (p.closeType == 2 ? 'Prórroga' : 'Otro');
                    const color = p.closeType == 1 ? '#39ff14' : '#f59e0b';
                    return `<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px dotted rgba(255,255,255,0.1);">
                        <span class="copy-id" data-id="${p.userId}" style="cursor:pointer;" title="Doble clic para copiar">${p.userId}</span>
                        <span style="color:${color};font-weight:bold;">${tipo}</span>
                    </div>`;
                }).join('');

                paidWrap.innerHTML = `<div style="color:#39ff14;font-size:11px;font-weight:bold;margin-bottom:8px;text-transform:uppercase;border-bottom:1px solid rgba(57,255,20,0.3);padding-bottom:4px;">Últimos Pagos</div><div style="max-height:150px;overflow-y:auto;font-size:11px;">${listHtml}</div>`;
            } else {
                paidWrap.innerHTML = `<div style="color:#10b981;font-size:11px;font-weight:bold;margin-bottom:4px;text-transform:uppercase;border-bottom:1px solid #10b98140;padding-bottom:4px;">Últimos Pagos</div><div style="font-size:11px; color:#9ca3af;">No hay pagos recientes.</div>`;
            }
            rightCol.appendChild(paidWrap);

            bodyContainer.append(leftCol, rightCol); panel.appendChild(bodyContainer); document.body.appendChild(panel); renderTable();

            async function runMassFollowUp(mensajeClave) {
                if(window.appState.isExecuting) return alert("Proceso en ejecución.");
                let targetData = window.appState.pageSize === 'ALL' ? window.appState.filteredData : window.appState.filteredData.slice((window.appState.currentPage - 1) * window.appState.pageSize, window.appState.currentPage * window.appState.pageSize);
                if(targetData.length === 0) return alert("No hay clientes en la vista actual.");
                
                // Usamos el nuevo modal hacker
                const confirmado = await mostrarConfirmacionHacker(`¿Ejecutar masivo a <b>${targetData.length}</b> clientes visibles?<br><span style="color:#39ff14; font-weight:bold; margin-top:8px; display:block;">Mensaje: "${mensajeClave}"</span>`);
                if(!confirmado) return;

                // ⚙️ Configuración Inicial de UI y Estado
                window.appState.isExecuting = true;
                window.appState.shouldStop = false;
                window.appState.isPaused = false;
                
                document.getElementById('btn-ejecutar-masivo').style.display = 'none';
                document.getElementById('btn-pausar-masivo').style.display = 'block';
                document.getElementById('btn-reiniciar-masivo').style.display = 'block';

                const VELOCIDAD_MS = 100; 
                
                // 🔥 CORRECCIÓN EXACTA DE ZONA HORARIA POR PAÍS 🔥
                let tz = 'America/La_Paz'; // Zona por defecto
                if (window.appState.baseUrl.includes('co-crm')) tz = 'America/Bogota';
                else if (window.appState.baseUrl.includes('mx-')) tz = 'America/Mexico_City';
                else if (window.appState.baseUrl.includes('cl-crm')) tz = 'America/Santiago';
                else if (window.appState.baseUrl.includes('pe-crm')) tz = 'America/Lima';
                else if (window.appState.baseUrl.includes('creddireto')) tz = 'America/Sao_Paulo';
                else if (window.appState.baseUrl.includes('rayodinero')) tz = 'America/Argentina/Buenos_Aires';

                // Convierte la fecha actual al formato YYYY-MM-DD usando la hora exacta del servidor
                const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
                const hoyLocalCRM = formatter.format(new Date()); 
                
                const processedIds = new Set(); 
                let successCount = 0, skipCount = 0, errorCount = 0;
                
                logMsg(`🚀 Iniciando para ${targetData.length} clientes...`, '#fbbf24');
                logMsg(`🌍 Huso Horario: ${tz} (Hoy: ${hoyLocalCRM})`, '#9ca3af'); // Para que veas qué hora está leyendo

                for (let i = 0; i < targetData.length; i++) {
                    // ⏸️ 1. Control de STOP y PAUSA
                    if (window.appState.shouldStop) { logMsg(`⏹️ PROCESO DETENIDO.`, '#ef4444'); break; }
                    while (window.appState.isPaused) {
                        await new Promise(r => setTimeout(r, 300));
                        if (window.appState.shouldStop) break; 
                    }
                    if (window.appState.shouldStop) break;

                    const c = targetData[i];
                    
                    // 🛡️ 2. Chequeo de duplicados en esta misma lista
                    if (!c.userId || processedIds.has(c.userId)) { skipCount++; continue; }
                    processedIds.add(c.userId);
                    
                    let sentToday = false;
                    
                    // 🛡️ 3. CHEQUEO DEL HISTORIAL EN EL CRM (Precisión de País)
                    let foundExactDate = "";
                    try {
                        const hResp = await fetch(`${window.appState.baseUrl}/api/manage/urge/task/getFollowPage?v=${Date.now()}`, { 
                            method: 'POST', 
                            headers: { 'Authentication': window.appState.token, 'Content-Type': 'application/json' }, 
                            body: JSON.stringify({ taskId: c.taskId, orderId: c.orderId, current: 1, size: 100 }) 
                        });
                        const hData = await hResp.json();
                        if(hData.code === 401 || hData.code === 403) { alert("Token expirado."); location.reload(); return; }
                        
                        const registroPrevio = (hData.data?.records || []).find(r => {
                            const fechaHistorial = r.createTime || r.followTime || r.updateTime || "";
                            const notaHistorial = (r.note || r.remark || r.content || "").toLowerCase();
                            return fechaHistorial.includes(hoyLocalCRM) && notaHistorial.includes(mensajeClave.toLowerCase());
                        });

                        if (registroPrevio) {
                            sentToday = true;
                            foundExactDate = registroPrevio.createTime || registroPrevio.followTime || registroPrevio.updateTime || "Desconocida";
                        }
                    } catch (e) {
                        console.log("Error consultando historial", e);
                    }

                    const appColor = window.getAppColor ? window.getAppColor(c.appName) : '#9ca3af';
                    const coloredAppProd = `<span style="color:${appColor}">[${c.appName || 'N/A'} - ${c.productName || 'N/A'}]</span>`;

                    if (sentToday) { 
                        // 🔥 OMITIDO AMARILLO RESALTADO 🔥
                        logMsg(`[-] <span style="color:#fbbf24; font-weight:900; text-shadow:0 0 5px rgba(251,191,36,0.6);">OMITIDO [${i+1}/${targetData.length}]:</span> ${c.userName} ${coloredAppProd} | Registrado: ${foundExactDate}`, '#9ca3af'); 
                        skipCount++; 
                        continue; 
                    }

                    // 📨 4. ENVÍO DEL SEGUIMIENTO
                    try {
                        const sResp = await fetch(`${window.appState.baseUrl}/api/manage/urge/task/addFollow?v=${Date.now()}`, { 
                            method: 'POST', 
                            headers: { 'Authentication': window.appState.token, 'Content-Type': 'application/json' }, 
                            body: JSON.stringify({ phone: c.phone, taskId: c.taskId, followTarget: "0", followResult: "3", ptpTime: null, note: mensajeClave, score: null }) 
                        });
                        const sData = await sResp.json();
                        if (sData.code === 200 || sData.success) { 
                            const exactNow = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()).replace(',', '');
                            logMsg(`[+] [${i+1}/${targetData.length}] OK: ${c.userName} ${coloredAppProd} | Envío: "${mensajeClave}" | ${exactNow}`, '#39ff14'); 
                            successCount++; 
                        } else { 
                            logMsg(`[x] [${i+1}/${targetData.length}] Falló: ${c.userName} ${coloredAppProd}`, '#ef4444'); 
                            errorCount++; 
                        }
                    } catch (e) { 
                        logMsg(`[x] [${i+1}/${targetData.length}] Error red: ${c.userName}`, '#ef4444'); 
                        errorCount++; 
                    }
                    
                    await new Promise(r => setTimeout(r, VELOCIDAD_MS));
                }

                // 🔥 LOG FINAL SÚPER RESALTADO EN MASIVO 🔥
                logMsg(`<div style="background:#e2e8f0; color:#0f172a; padding:8px 12px; border-radius:6px; font-weight:900; font-size:14px; text-transform:uppercase; border:3px solid #0ea5e9; text-shadow:none; margin-top:8px; box-shadow:0 0 15px rgba(14,165,233,0.7); text-align:center;">
                    > FIN: ${successCount} ENVIADOS | ${skipCount} OMITIDOS | ${errorCount} ERRORES
                </div>`, '#0ea5e9');
                
                // 🔄 Reset de UI al finalizar
                window.appState.isExecuting = false; 
                document.getElementById('btn-pausar-masivo').style.display = 'none';
                document.getElementById('btn-reiniciar-masivo').style.display = 'none';
                
                const btnEjec = document.getElementById('btn-ejecutar-masivo');
                btnEjec.innerHTML = "[> SEGUIMIENTO MASIVO]";
                btnEjec.style.display = 'block';
                btnEjec.style.backgroundColor = 'rgba(0,0,0,0.6)';
                btnEjec.style.color = '#39ff14';
            }
        }

        // --- INYECCIÓN DEL PANEL ---

        function injectPanel() {
            if (document.getElementById('panel-mixto-crm')) return;
            if (!window.location.hash.toLowerCase().includes('pedding_list')) return;

            const wrapper = document.createElement('div');
            wrapper.id = 'panel-mixto-crm';
            Object.assign(wrapper.style, {
                position: 'fixed', left: '0', top: '0', zIndex: '2147483641',
                display: 'flex', flexDirection: 'column', 
                alignItems: 'flex-start',
                pointerEvents: 'none', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            });

            const menuContent = document.createElement('div');
            Object.assign(menuContent.style, {
                pointerEvents: 'auto',
                backgroundColor: 'rgba(10, 15, 30, 0.75)', 
                backdropFilter: 'blur(20px)', webkitBackdropFilter: 'blur(20px)',
                padding: '12px', borderRadius: '14px', 
                display: 'none', flexDirection: 'column', 
                gap: '6px', width: '260px', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
                position: 'relative', 
                marginTop: '10px', marginLeft: '10px', 
                transformOrigin: 'top left'
            });

            const hidePanel = () => {
                menuContent.style.display = 'none';
                toggleBtn.style.display = 'flex';
            };

            const minimizeBtn = document.createElement('div');
            minimizeBtn.innerHTML = '×'; minimizeBtn.title = "Ocultar";
            Object.assign(minimizeBtn.style, {
                position: 'absolute', top: '8px', right: '8px',
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '16px', fontWeight: 'bold',
                transition: 'all 0.2s ease', border: '1px solid rgba(255,255,255,0.1)'
            });
            minimizeBtn.onmouseenter = () => { minimizeBtn.style.background='rgba(255,255,255,0.25)'; minimizeBtn.style.color='#fff'; minimizeBtn.style.transform='scale(1.1)'; };
            minimizeBtn.onmouseleave = () => { minimizeBtn.style.background='rgba(255,255,255,0.1)'; minimizeBtn.style.color='rgba(255,255,255,0.8)'; minimizeBtn.style.transform='scale(1)'; };
            
            minimizeBtn.onclick = hidePanel;

            const headerContent = document.createElement('div');
            headerContent.innerHTML = `
                <div style="text-align:center; margin-bottom: 2px;">
                    <div style="color:#ffffff; font-size:14px; font-weight:800; letter-spacing:0.5px; text-transform:uppercase;">
                        ${currentCrm.country.toUpperCase()}
                    </div>
                    <div style="font-size:11px; color:#9ca3af;">
                        Prefijo: <span style="font-weight:700; color:#fbbf24;">${currentCrm.prefix}</span>
                    </div>
                    <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); margin: 8px 0;"></div>
                </div>
            `;
            menuContent.append(minimizeBtn, headerContent);

            const createBtn = (text, color, onClick) => {
                const btn = document.createElement('button');
                btn.innerText = text; 
                btn.onclick = () => {
                    hidePanel();
                    onClick();
                };
                Object.assign(btn.style, {
                    padding: '7px 5px', width: '100%', fontSize: '12px',
                    borderRadius: '6px', cursor: 'pointer', fontWeight: '700', 
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                });
                applyDynamicHover(btn, color);
                return btn;
            };

            // --- INICIO PANEL ADMINISTRATIVO ---
            window.appState = {
                token: null, baseUrl: currentCrm.domains ? currentCrm.domains[0] : "https://mx-crm.certislink.com",
                rawData: [], filteredData: [], paidData: [], currentPage: 1, pageSize: 50, stageGeneral: null, isExecuting: false
            };

            const btnAdmin = document.createElement('button');
            btnAdmin.innerHTML = "📊 PANEL ADMINISTRATIVO<br><span style='font-size:9px; font-weight:normal'>Actualización en Vivo</span>";
            Object.assign(btnAdmin.style, {
                width: '100%', padding: '9px', borderRadius: '6px', cursor: 'pointer', 
                fontWeight: '800', fontSize: '12px', marginBottom: '5px', transition: 'all 0.2s', textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#e2e8f0', border: '1px solid #8b5cf6'
            });
            btnAdmin.onmouseenter = () => { btnAdmin.style.backgroundColor = '#8b5cf6'; btnAdmin.style.color = '#fff'; };
            btnAdmin.onmouseleave = () => { btnAdmin.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; btnAdmin.style.color = '#e2e8f0'; };
            
            btnAdmin.onclick = async () => {
                btnAdmin.innerText = "Actualizando Datos...";
                // 🔥 Ahora el botón siempre descarga todo de nuevo, sin memoria F5 🔥
                const success = await fetchDataAPI();
                btnAdmin.innerHTML = "📊 PANEL ADMINISTRATIVO<br><span style='font-size:9px; font-weight:normal'>Actualización en Vivo</span>";
                if(success) buildAdminPanel();
            };
            menuContent.appendChild(btnAdmin);

            const btnOpenAll = document.createElement('button');
            btnOpenAll.innerText = '⚡ ABRIR TODO ⚡';
            btnOpenAll.onclick = () => {
                hidePanel();
                openAll();
            };
            Object.assign(btnOpenAll.style, {
                width: '100%', padding: '7px', borderRadius: '6px', cursor: 'pointer', 
                fontWeight: '800', fontSize: '12px', marginBottom: '5px', transition: 'all 0.2s'
            });
            applyDynamicHover(btnOpenAll, '#10b981');
            menuContent.appendChild(btnOpenAll);

            const inputStyle = {
                width: '100%', padding: '6px',
                borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', textAlign: 'center', fontSize: '12px',
                marginBottom: '5px', boxSizing: 'border-box', outline: 'none'
            };
            
            const inputFilter = document.createElement('input');
            inputFilter.type = 'text'; inputFilter.id = 'input-filtro'; inputFilter.placeholder = 'Registro de Seguimiento';
            Object.assign(inputFilter.style, inputStyle);

            const dateGrid = document.createElement('div');
            Object.assign(dateGrid.style, { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '2px' });
            
            const date1 = document.createElement('input'); date1.type = 'text'; date1.id = 'input-fecha-1'; date1.placeholder = 'AA-MM-DD';
            Object.assign(date1.style, inputStyle); date1.style.marginBottom = '0';
            
            const date2 = document.createElement('input'); date2.type = 'text'; date2.id = 'input-fecha-2'; date2.placeholder = 'AA-MM-DD';
            Object.assign(date2.style, inputStyle); date2.style.marginBottom = '0';

            dateGrid.append(date1, date2);
            menuContent.append(inputFilter, dateGrid);

            const btnFilter = createBtn('🔍 FILTRAR Y ABRIR', '#f59e0b', filterAndOpen);
            menuContent.appendChild(btnFilter);

            const toggleBtn = document.createElement('div');
            Object.assign(toggleBtn.style, {
                width: '45px', height: '45px', backgroundColor: 'rgba(10, 15, 30, 0.95)', color: 'white',
                borderRadius: '0 0 24px 0', 
                display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start',
                paddingLeft: '10px', paddingTop: '10px', boxSizing: 'border-box',
                cursor: 'pointer', fontSize: '22px', fontWeight: 'bold', transition: 'all 0.3s',
                borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '4px 4px 15px rgba(0,0,0,0.3)', pointerEvents: 'auto', backdropFilter: 'blur(10px)'
            });
            toggleBtn.innerHTML = '⚡'; 

            toggleBtn.onmouseenter = () => { toggleBtn.style.width='50px'; toggleBtn.style.height='50px'; toggleBtn.style.color='#fbbf24'; toggleBtn.style.borderColor='#fbbf24'; };
            toggleBtn.onmouseleave = () => { toggleBtn.style.width='45px'; toggleBtn.style.height='45px'; toggleBtn.style.color='white'; toggleBtn.style.borderColor='rgba(255,255,255,0.2)'; };

            toggleBtn.onclick = () => {
                toggleBtn.style.display = 'none'; menuContent.style.display = 'flex';
                menuContent.style.opacity = '0'; menuContent.style.transform = 'scale(0.9) translateY(-10px)';
                setTimeout(() => {
                    menuContent.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    menuContent.style.opacity = '1'; menuContent.style.transform = 'scale(1) translateY(0)';
                }, 10);
            };

            wrapper.append(toggleBtn, menuContent);
            document.body.appendChild(wrapper);
        }

        intervalId = setInterval(() => {
            if (window.location.hash.toLowerCase().includes('pedding_list')) injectPanel();
            else document.getElementById('panel-mixto-crm')?.remove();
        }, 1500);
    }

    if (document.body) init();
    else window.addEventListener('load', init);

    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) { lastUrl = location.href; init(); }
    }).observe(document, { subtree: true, childList: true });

})();

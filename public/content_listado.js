(function() {
    'use strict';

    // Variable global para el intervalo de chequeo
    let intervalId = null;

    // 1. CONFIGURACIÓN DE DOMINIOS Y PAÍSES
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

        const currentUrl = window.location.href;
        const currentCrm = CONFIG_CRMS.find(c => c.domains.some(domain => currentUrl.includes(domain))) || {
            country: 'CRM', prefix: 'GLOBAL'
        };

        const isVarious = currentUrl.includes('variousplan.com');
        const defaultSelDate = isVarious ? '.el-table_1_column_13' : '.el-table_1_column_12';
        const defaultSelAction = isVarious ? '.el-table_1_column_23' : '.el-table_1_column_22';
        const defaultSelRegistry = isVarious ? '.el-table_1_column_20' : '.el-table_1_column_19';
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

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

            if (isMac) {
                // 🍎 MODO SEGURO MAC: Pausa real para no ahogar Brave
                const abrirSeguro = async () => {
                    for (let i = 0; i < buttons.length; i++) {
                        buttons[i].dispatchEvent(new MouseEvent('click', { view: window, bubbles: true, cancelable: true, ctrlKey: false, metaKey: true }));
                        await new Promise(resolve => setTimeout(resolve, 450));
                    }
                };
                abrirSeguro();
            } else {
                // 🪟 MODO VELOCIDAD DE LA LUZ WINDOWS: Dispara todo de golpe (Tu método original)
                buttons.forEach((btn, index) => {
                    setTimeout(() => {
                        btn.dispatchEvent(new MouseEvent('click', { view: window, bubbles: true, cancelable: true, ctrlKey: true, metaKey: false }));
                    }, index * 150); // Lo bajé a 150ms para que sea aún más rápido que antes
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
                // Le quitamos los espacios en blanco al inicio y al final por si acaso
                const textReg = cellReg ? cellReg.innerText.trim().toLowerCase() : '';
                
                // 🔥 NUEVA LÓGICA DE BÚSQUEDA EXACTA 🔥
                let matchReg = false;
                if (!filterText) {
                    matchReg = true; // Si no escribiste filtro, pasa de largo
                } else if (filterText === 'sin seguimiento') {
                    matchReg = textReg === ''; // Si pones "sin seguimiento", busca los vacíos
                } else {
                    // 🔥 AQUÍ ESTÁ LA MAGIA: Cambiamos .includes() por ===
                    // Esto obliga a que el texto de la celda sea EXACTAMENTE igual a lo que escribiste.
                    // Si escribes "tgm", no abrirá "sin tgm".
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
            const selectorDate = getSelectorDate(); // 🔥 Traemos el selector de fecha para poder leerlas

            // 1. Agrupar por Usuario (Tu lógica original)
            rows.forEach(row => {
                const cellUser = row.querySelector(selectorUser) || row.querySelectorAll('td')[2];
                const userId = cellUser ? cellUser.innerText.trim() : '';
                if (userId) {
                    counts[userId] = (counts[userId] || 0) + 1;
                    if (!groupedRows[userId]) groupedRows[userId] = [];
                    groupedRows[userId].push(row);
                }
            });

            // 🔥 NUEVA LÓGICA: Función para comparar fechas de Mayor a Menor (Descendente)
            const sortByDateDesc = (rowA, rowB) => {
                const cellA = rowA.querySelector(selectorDate);
                const cellB = rowB.querySelector(selectorDate);
                const dateA = cellA ? cellA.innerText.trim().toLowerCase() : '';
                const dateB = cellB ? cellB.innerText.trim().toLowerCase() : '';
                // localeCompare invirtiendo A y B nos da un orden de Mayor a Menor
                return dateB.localeCompare(dateA); 
            };

            let duplicateGroups = []; 
            let uniques = [];

            // 2. Separar duplicados de únicos y ordenarlos internamente
            Object.keys(groupedRows).forEach(userId => {
                let userRows = groupedRows[userId];
                
                // Ordenamos las filas de este cliente específico por fecha
                userRows.sort(sortByDateDesc);

                if (counts[userId] > 1) {
                    duplicateGroups.push(userRows); // Guardamos el grupo entero
                } else {
                    uniques.push(userRows[0]);
                }
            });

            // 3. Ordenar los grupos de duplicados entre sí (basado en la fecha más reciente del grupo)
            duplicateGroups.sort((groupA, groupB) => sortByDateDesc(groupA[0], groupB[0]));
            
            // 4. Ordenar los clientes únicos entre sí
            uniques.sort(sortByDateDesc);

            // 5. Aplanar el arreglo de grupos duplicados para que quede como una lista normal
            let duplicates = duplicateGroups.flat();

            // Unimos todo: Duplicados ordenados primero, luego únicos ordenados
            const finalOrder = [...duplicates, ...uniques];
            const selectorAction = getSelectorAction();
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

            // 🧠 1. CALCULAMOS LOS DATOS REALES
            const totalClientesReales = Object.keys(groupedRows).length;
            const totalPestanas = finalOrder.length;
            
            // Guardamos para que el Perro Guardián lo sepa
            localStorage.setItem('CRM_TOTAL_CLIENTES_REALES', totalClientesReales);
            localStorage.setItem('CRM_TOTAL_PESTANAS', totalPestanas);

            // 🎨 2. CREADOR DE LA NOTIFICACIÓN HTML ESTÉTICA (DISCRETA SUPERIOR)
            const mostrarAlertaEstetica = () => {
                if (document.getElementById('crm-alerta-fin')) return; 
                
                // La tarjeta flotante (eliminamos el fondo oscuro de pantalla completa)
                const modal = document.createElement('div');
                modal.id = 'crm-alerta-fin';
                Object.assign(modal.style, {
                    position: 'fixed', top: '20px', left: '50%',
                    transform: 'translate(-50%, -20px) scale(0.9)', // Ligeramente arriba para animar
                    opacity: '0', backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(255, 255, 255, 0.15)', padding: '12px 20px', 
                    borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', gap: '15px',
                    zIndex: '2147483647', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    color: '#fff', minWidth: '280px', width: 'max-content',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    backdropFilter: 'blur(10px)'
                });

                // Contenido horizontal compacto
                modal.innerHTML = `
                    <div style="font-size: 24px; text-shadow: 0 0 15px rgba(16, 185, 129, 0.5);">✅</div>
                    <div style="display: flex; flex-direction: column; flex-grow: 1; text-align: left;">
                        <span style="font-size: 13px; color: #10b981; font-weight: 800; letter-spacing: 0.5px;">APERTURA FINALIZADA</span>
                        <span style="font-size: 12px; color: #e2e8f0; margin-top: 2px;">
                            <strong style="color: #fbbf24; font-size: 13px;">${totalPestanas}</strong> pestañas abiertas.
                        </span>
                        <span style="font-size: 11px; color: #9ca3af;">
                            (${totalClientesReales} clientes únicos)
                        </span>
                    </div>
                `;

                // Botón OK pequeño y rápido
                const btn = document.createElement('button');
                btn.innerText = 'OK';
                Object.assign(btn.style, {
                    backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 16px',
                    borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                    fontSize: '12px', transition: 'all 0.2s', marginLeft: '5px'
                });
                
                btn.onmouseover = () => { btn.style.backgroundColor = '#059669'; btn.style.transform = 'translateY(-1px)'; };
                btn.onmouseout = () => { btn.style.backgroundColor = '#10b981'; btn.style.transform = 'translateY(0)'; };
                btn.onmousedown = () => { btn.style.transform = 'scale(0.95)'; };
                
                // Acción de cerrar con animación
                btn.onclick = () => {
                    modal.style.transform = 'translate(-50%, -20px) scale(0.9)';
                    modal.style.opacity = '0';
                    setTimeout(() => modal.remove(), 300);
                };

                modal.appendChild(btn);
                document.body.appendChild(modal);

                // Disparar animación de entrada (cae desde arriba al centro)
                requestAnimationFrame(() => {
                    modal.style.transform = 'translate(-50%, 0) scale(1)';
                    modal.style.opacity = '1';
                });
            };
            if (isMac) {
                // 🍎 MODO SEGURO MAC
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
                    // 🚀 Mostramos alerta al terminar el bucle en Mac
                    mostrarAlertaEstetica();
                };
                abrirPestañasSeguro();
            } else {
                // 🪟 MODO VELOCIDAD DE LA LUZ WINDOWS
                finalOrder.forEach((row, index) => {
                    setTimeout(() => {
                        const cellAction = row.querySelector(selectorAction + ' span') || 
                                           Array.from(row.querySelectorAll('span, button')).find(el => el.innerText.includes('Seguimiento'));
                        if (cellAction) {
                            cellAction.dispatchEvent(new MouseEvent('click', { view: window, bubbles: true, cancelable: true, ctrlKey: true, metaKey: false }));
                        }
                        
                        // 🚀 Mostramos alerta cuando procese el último elemento en Windows
                        if (index === finalOrder.length - 1) {
                            setTimeout(mostrarAlertaEstetica, 400); 
                        }
                    }, index * 150);
                });
            }
        };
        // --- INYECCIÓN DEL PANEL ---

        function injectPanel() {
            if (document.getElementById('panel-mixto-crm')) return;
            if (!window.location.hash.toLowerCase().includes('pedding_list')) return;

            const wrapper = document.createElement('div');
            wrapper.id = 'panel-mixto-crm';
            Object.assign(wrapper.style, {
                position: 'fixed', left: '0', top: '0', zIndex: '2147483647',
                display: 'flex', flexDirection: 'column', 
                alignItems: 'flex-start',
                pointerEvents: 'none', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            });

            // Contenedor del Menú
            const menuContent = document.createElement('div');
            Object.assign(menuContent.style, {
                pointerEvents: 'auto',
                backgroundColor: 'rgba(10, 15, 30, 0.75)', 
                backdropFilter: 'blur(20px)', webkitBackdropFilter: 'blur(20px)',
                
                // Espaciado Compacto
                padding: '12px', 
                borderRadius: '14px', 
                display: 'none', flexDirection: 'column', 
                gap: '6px', 
                width: '260px', 
                
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
                position: 'relative', 
                
                marginTop: '10px', marginLeft: '10px', 
                transformOrigin: 'top left'
            });

            // --- LÓGICA PARA OCULTAR PANEL (NUEVO) ---
            const hidePanel = () => {
                menuContent.style.display = 'none';
                toggleBtn.style.display = 'flex';
            };

            // Botón de Minimizar
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
            
            // Acción cerrar
            minimizeBtn.onclick = hidePanel;

            // Encabezado Compacto
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

            // Helper para botones COMPACTOS (MODIFICADO para ocultar panel)
            const createBtn = (text, color, onClick) => {
                const btn = document.createElement('button');
                btn.innerText = text; 
                
                // 🔥 AQUÍ SE CIERRA EL PANEL AL HACER CLIC
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

            // Grilla Arriba/Abajo
            const grid = document.createElement('div');
            Object.assign(grid.style, { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '2px' });
            grid.append(
                createBtn('↑ Abajo-Arriba', '#8b5cf6', () => clickVisibleButtons(true)),
                createBtn('↓ Arriba-Abajo', '#3b82f6', () => clickVisibleButtons(false))
            );
            menuContent.appendChild(grid);

            // Botón Abrir Todo Compacto (MODIFICADO)
            const btnOpenAll = document.createElement('button');
            btnOpenAll.innerText = '⚡ ABRIR TODO ⚡';
            
            // 🔥 AQUÍ SE CIERRA EL PANEL AL HACER CLIC
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

            // Inputs Compactos
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

            // Botón Ejecutar Filtro (Ya usa createBtn modificado)
            const btnFilter = createBtn('🔍 FILTRAR Y ABRIR', '#f59e0b', filterAndOpen);
            menuContent.appendChild(btnFilter);

            // Botón Toggle
            const toggleBtn = document.createElement('div');
            Object.assign(toggleBtn.style, {
                width: '45px', height: '45px', backgroundColor: 'rgba(10, 15, 30, 0.95)', color: 'white',
                borderRadius: '0 0 24px 0', // Redondeado abajo-derecha
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

        // Bucle de verificación
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
(function() {
    'use strict';

    // ==========================================
    // 1. CONFIGURACIÓN
    // ==========================================
    const DOMAIN_CONFIG = [
        { prefix: '+57', country: 'Colombia', domains: ['https://co-crm.certislink.com'], digits: 10 },
        { prefix: '+52', country: 'México (Cashimex)', domains: ['https://mx-crm.certislink.com'], digits: 10 },
        { prefix: '+52', country: 'México (Various)', domains: ['https://mx-ins-crm.variousplan.com'], digits: 10 },
        { prefix: '+56', country: 'Chile', domains: ['https://cl-crm.certislink.com'], digits: 9 },
        { prefix: '+51', country: 'Perú', domains: ['https://pe-crm.certislink.com'], digits: 9 },
        { prefix: '+55', country: 'Brasil', domains: ['https://crm.creddireto.com'], digits: 11 },
        { prefix: '+54', country: 'Argentina', domains: ['https://crm.rayodinero.com'], digits: 10 }
    ];

    // ==========================================
    // 🌐 EL ENRUTADOR DIRECTO (URL RESPETADA)
    // ==========================================
    const CEREBRO_URL = 'https://script.google.com/macros/s/AKfycbxsyFiCV1bhHvfPFXCANqN9Ce4ap-DtABPgqdZ_5H74NMwa_1tk1Y8FNzvfUvUkjBiLbQ/exec';
    const API_URL = CEREBRO_URL; 

    const RUTAS_DETAIL = DOMAIN_CONFIG.flatMap(c => c.domains.map(d => d + '/#/detail'));
    const RUTAS_PENDING = DOMAIN_CONFIG.flatMap(c => c.domains.map(d => d + '/#/loaned_management/pedding_list'));

    let enviando = false;
    let keepAliveInterval = null;

    // --- ESTILOS CSS GLOBALES (EFECTO NEÓN + SWITCH) ---
    const inyectarEstilos = () => {
        if (document.getElementById('estilos-rafaga')) return;
        const style = document.createElement('style');
        style.id = 'estilos-rafaga';
        style.innerHTML = `
            #tabla-container-rafaga::-webkit-scrollbar { height: 10px; width: 10px; }
            #tabla-container-rafaga::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.7); border-radius: 8px; margin: 4px; }
            #tabla-container-rafaga::-webkit-scrollbar-thumb { background: #475569; border-radius: 8px; border: 2px solid rgba(15, 23, 42, 1); }
            #tabla-container-rafaga::-webkit-scrollbar-thumb:hover { background: #64748b; }
            .fila-rafaga:hover { background-color: rgba(51, 65, 85, 0.7); transition: background-color 0.2s; }
            
            .btn-rafaga { 
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                font-weight: bold; padding: 6px 14px; border-radius: 6px; border: none; 
                cursor: pointer; display: flex; align-items: center; gap: 6px; 
            }
            .btn-rafaga:active { transform: scale(0.95) !important; }
            .btn-rafaga:disabled { opacity: 0.6; cursor: wait; transform: none !important; box-shadow: none !important; }

            .btn-red { background: #ef4444; color: white; }
            .btn-red:hover:not(:disabled) { background: #f87171; box-shadow: 0 0 12px #ef4444, 0 0 20px #ef4444; transform: translateY(-2px); }

            .btn-orange { background: #f59e0b; color: white; }
            .btn-orange:hover:not(:disabled) { background: #fbbf24; box-shadow: 0 0 12px #f59e0b, 0 0 20px #f59e0b; transform: translateY(-2px); }

            .btn-purple { background: #8b5cf6; color: white; }
            .btn-purple:hover:not(:disabled) { background: #a78bfa; box-shadow: 0 0 12px #8b5cf6, 0 0 20px #8b5cf6; transform: translateY(-2px); }

            .btn-blue { background: #3b82f6; color: white; }
            .btn-blue:hover:not(:disabled) { background: #60a5fa; box-shadow: 0 0 12px #3b82f6, 0 0 20px #3b82f6; transform: translateY(-2px); }

            .btn-green { background: #34d399; color: black; }
            .btn-green:hover:not(:disabled) { background: #6ee7b7; box-shadow: 0 0 12px #34d399, 0 0 20px #34d399; transform: translateY(-2px); }

            /* 🔥 ESTILOS PARA EL SWITCH MORA / SIN MORA */
            .switch-mora { position: relative; display: inline-block; width: 34px; height: 18px; margin-right: 6px; }
            .switch-mora input { opacity: 0; width: 0; height: 0; }
            .slider-mora { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #475569; transition: .4s; border-radius: 34px; }
            .slider-mora:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
            input:checked + .slider-mora { background-color: #ef4444; box-shadow: 0 0 8px #ef4444; }
            input:checked + .slider-mora:before { transform: translateX(16px); }
            .label-mora { font-size: 11px; font-weight: 800; cursor: pointer; user-select: none; transition: 0.3s; letter-spacing: 0.5px; }
        `;
        document.head.appendChild(style);
    };

    // --- UTILS ---
    const isContextValid = () => {
        try { return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id; } 
        catch (e) { return false; }
    };

    function safeSendMessage(message) {
        return new Promise((resolve) => {
            if (!isContextValid()) return resolve({ success: false, error: 'Context invalidated' });
            try { chrome.runtime.sendMessage(message, (r) => resolve(r || {})); } 
            catch (e) { resolve({ success: false }); }
        });
    }

    const obtenerValor = (label) => {
        const el = [...document.querySelectorAll('div.mb-10')].find(div => div.innerText.includes(label));
        if (!el) return '';
        const clone = el.cloneNode(true);
        clone.querySelectorAll('button').forEach(b => b.remove());
        const t = clone.innerText.trim();
        return t.includes(':') ? t.substring(t.indexOf(':') + 1).trim() : '';
    };

    const getCountryInfo = () => {
        const href = window.location.href;
        for (const c of DOMAIN_CONFIG) {
            for (const d of c.domains) {
                if (href.startsWith(d)) return { prefix: c.prefix, name: c.country, digits: c.digits };
            }
        }
        return { prefix: '', name: 'Desconocido', digits: 10 };
    };

    const getIdPlan = () => {
        const isVarious = window.location.href.includes('variousplan.com');
        const val = obtenerValor(isVarious ? 'ID de orden' : 'ID Plan de pago');
        return isVarious ? val : (val ? 'p' + val : '');
    };

    function cazarDatosRapido() {
        return new Promise(resolve => {
            let intentos = 0;
            const intervalo = setInterval(() => {
                if (obtenerValor('Nombre') && obtenerValor('Teléfono')) {
                    clearInterval(intervalo); resolve(true);
                }
                if (++intentos > 60) { clearInterval(intervalo); resolve(false); }
            }, 50); 
        });
    }

    // --- UI (AVISOS) ---
    const mostrarAviso = (texto, color = '#60a5fa', tipo = 'info', tiempo = 2000) => {
        if (!document.body) return;
        document.querySelectorAll('.addon-aviso-temp').forEach(e => e.remove());
        const div = document.createElement('div');
        div.className = 'addon-aviso-temp';
        let icono = tipo === 'success' ? '✅' : tipo === 'error' ? '⛔' : tipo === 'warning' ? '⚠️' : 'ℹ️';
        if(tipo==='success') color='#34d399'; if(tipo==='error') color='#f87171'; if(tipo==='warning') color='#fbbf24';
        
        div.innerHTML = `<span style="font-size:15px; margin-right:8px;">${icono}</span><span style="font-weight:600; font-size:13px;">${texto}</span>`;
        Object.assign(div.style, {
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', padding: '10px 20px', 
            backgroundColor: 'rgba(15, 23, 42, 0.95)', color: '#fff', borderRadius: '30px', 
            zIndex: 2147483647, borderLeft: `3px solid ${color}`, backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        });
        document.body.appendChild(div);
        setTimeout(() => div.remove(), tiempo); 
    };

    const actualizarIndicador = () => {
        let el = document.getElementById('indicador-rafaga');
        const activo = localStorage.getItem('MODO_RAFAGA') === 'true';
        const esValida = RUTAS_DETAIL.some(r => location.href.includes('/detail')) || RUTAS_PENDING.some(r => location.href.startsWith(r));

        if (activo && esValida) {
            if (!el) {
                el = document.createElement('div');
                el.id = 'indicador-rafaga';
                Object.assign(el.style, {
                    position: 'fixed', top: '0', left: '50%', transform: 'translateX(-50%)', padding: '6px 24px', 
                    zIndex: 100005, borderRadius: '0 0 16px 16px', fontWeight: '800', fontSize: '12px', 
                    boxShadow: '0 5px 20px rgba(0,0,0,0.4)', color: 'white', backdropFilter: 'blur(5px)', textTransform: 'uppercase'
                });
                document.body.appendChild(el);
            }
            if (document.hidden) { el.innerText = '🚀 2do PLANO ACTIVO'; el.style.backgroundColor = 'rgba(127, 140, 141, 0.9)'; } 
            else { el.innerText = '⚡ MODO RÁFAGA ⚡'; el.style.backgroundColor = 'rgba(225, 29, 72, 0.9)'; }
        } else if (el) el.remove();
    };

    // ==========================================
    // 📊 BASE DE DATOS Y FILTROS MÚLTIPLES
    // ==========================================
    const guardarEnLote = (datos) => {
        let lote = JSON.parse(localStorage.getItem('LOTE_RAFAGA') || '[]');
        const indexExistente = lote.findIndex(cliente => cliente.idPlan === datos.idPlan);

        if (indexExistente === -1) {
            lote.push(datos);
            mostrarAviso(`📦 Capturado: ${datos.idPlan}`, '#3b82f6', 'info', 800);
        } else {
            lote[indexExistente] = datos;
            mostrarAviso(`🔄 Actualizado: ${datos.idPlan}`, '#8b5cf6', 'info', 800);
        }

        const loteUnico = lote.filter((cliente, index, self) => index === self.findIndex((c) => c.idPlan === cliente.idPlan));
        localStorage.setItem('LOTE_RAFAGA', JSON.stringify(loteUnico)); 
        actualizarTablaLotes();
    };

    const togglePanelVisibility = (forzarEstado = null) => {
        let isVisible = localStorage.getItem('PANEL_RAFAGA_VISIBLE') === 'true';
        if (forzarEstado !== null) isVisible = forzarEstado;
        else isVisible = !isVisible;
        localStorage.setItem('PANEL_RAFAGA_VISIBLE', isVisible);
        const panel = document.getElementById('panel-excel-rafaga');
        if (panel) panel.style.display = isVisible ? 'flex' : 'none';
    };

    const obtenerLoteFiltrado = () => {
        let lote = JSON.parse(localStorage.getItem('LOTE_RAFAGA') || '[]');
        
        const filtroApp = document.getElementById('filtro-app-rafaga')?.value || 'TODAS';
        const filtroDias = document.getElementById('filtro-dias-rafaga')?.value || 'TODOS';
        const ordenApp = document.getElementById('orden-app-rafaga')?.value || 'DEFAULT';
        const ordenDias = document.getElementById('orden-dias-rafaga')?.value || 'DEFAULT';

        let filtrado = lote.filter(c => {
            const matchApp = filtroApp === 'TODAS' || c.app === filtroApp;
            const diasLimpio = c.diasMora ? c.diasMora.toString().trim() : '';
            const matchDias = filtroDias === 'TODOS' || diasLimpio === filtroDias;
            return matchApp && matchDias;
        });

        filtrado.sort((a, b) => {
            let resApp = 0;
            if (ordenApp === 'ASC') resApp = (a.app || '').localeCompare(b.app || '');
            else if (ordenApp === 'DESC') resApp = (b.app || '').localeCompare(a.app || '');

            let resDias = 0;
            if (ordenDias === 'ASC') resDias = (parseInt(a.diasMora) || 0) - (parseInt(b.diasMora) || 0);
            else if (ordenDias === 'DESC') resDias = (parseInt(b.diasMora) || 0) - (parseInt(a.diasMora) || 0);

            if (resApp !== 0) return resApp; 
            return resDias; 
        });

        return filtrado;
    };

    const renderizarPanelLotes = () => {
        inyectarEstilos();
        let panel = document.getElementById('panel-excel-rafaga');
        
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'panel-excel-rafaga';
            
            Object.assign(panel.style, {
                position: 'fixed', top: '10vh', left: '50%', transform: 'translateX(-50%)', 
                width: 'max-content', maxWidth: '96vw', height: 'auto', maxHeight: '80vh', 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', color: '#fff', borderRadius: '12px', 
                zIndex: 2147483647, backdropFilter: 'blur(10px)', boxShadow: '0 15px 40px rgba(0,0,0,0.6)', 
                display: 'none', flexDirection: 'column', border: '1px solid #334155', 
                fontFamily: 'system-ui, -apple-system, sans-serif'
            });

            const header = document.createElement('div');
            Object.assign(header.style, {
                padding: '12px 20px', borderBottom: '1px solid #334155', display: 'flex', 
                justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '15px',
                cursor: 'grab', backgroundColor: 'rgba(30, 41, 59, 0.95)', borderRadius: '12px 12px 0 0', userSelect: 'none'
            });
            header.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px; padding-right: 30px;">
                    <span>📋 Base de datos</span>
                    <span style="font-size:11px; font-weight:normal; color:#94a3b8; background:#0f172a; padding:2px 6px; border-radius:4px;">Ctrl+Shift+Z</span>
                </div>
                <button id="btn-cerrar-panel" style="background:none; border:none; color:#f87171; cursor:pointer; font-size:18px; line-height:1;">✖</button>
            `;
            
            let isDragging = false, offsetX, offsetY;
            header.onmousedown = (e) => {
                if (e.target.id === 'btn-cerrar-panel') return;
                isDragging = true; header.style.cursor = 'grabbing';
                const rect = panel.getBoundingClientRect(); 
                offsetX = e.clientX - rect.left; 
                offsetY = e.clientY - rect.top;
                
                panel.style.transform = 'none'; 
                panel.style.left = rect.left + 'px';
                panel.style.top = rect.top + 'px';
            };
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                panel.style.left = (e.clientX - offsetX) + 'px'; panel.style.top = (e.clientY - offsetY) + 'px';
            });
            document.addEventListener('mouseup', () => { isDragging = false; header.style.cursor = 'grab'; });

            const toolbar = document.createElement('div');
            Object.assign(toolbar.style, {
                padding: '8px 20px', borderBottom: '1px solid #334155', backgroundColor: 'rgba(15, 23, 42, 0.8)',
                display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap'
            });

            toolbar.innerHTML = `
                <div id="box-filtro-app" style="display:flex; gap:5px; align-items:center;">
                    <label style="font-size: 12px; color: #94a3b8; font-weight: bold;">🔍 App:</label>
                    <select id="filtro-app-rafaga" style="background: #1e293b; color: white; border: 1px solid #475569; border-radius: 4px; padding: 4px 8px; font-size: 12px; outline: none; cursor: pointer; min-width: 80px;">
                        <option value="TODAS">Todas</option>
                    </select>
                </div>
                <div id="box-orden-app" style="display:flex; gap:5px; align-items:center;">
                    <label style="font-size: 12px; color: #94a3b8; font-weight: bold;">🔠 Ord. App:</label>
                    <select id="orden-app-rafaga" style="background: #1e293b; color: white; border: 1px solid #475569; border-radius: 4px; padding: 4px 8px; font-size: 12px; outline: none; cursor: pointer;">
                        <option value="DEFAULT">-</option>
                        <option value="ASC">A - Z</option>
                        <option value="DESC">Z - A</option>
                    </select>
                </div>

                <div id="separador-dias" style="width: 1px; height: 20px; background: #475569; margin: 0 5px;"></div> 
                
                <div id="box-filtro-dias" style="display:flex; gap:5px; align-items:center;">
                    <label style="font-size: 12px; color: #94a3b8; font-weight: bold;">📆 Días:</label>
                    <select id="filtro-dias-rafaga" style="background: #1e293b; color: white; border: 1px solid #475569; border-radius: 4px; padding: 4px 8px; font-size: 12px; outline: none; cursor: pointer; min-width: 70px;">
                        <option value="TODOS">Todos</option>
                    </select>
                </div>
                <div id="box-orden-dias" style="display:flex; gap:5px; align-items:center;">
                    <label style="font-size: 12px; color: #94a3b8; font-weight: bold;">🔢 Ord. Días:</label>
                    <select id="orden-dias-rafaga" style="background: #1e293b; color: white; border: 1px solid #475569; border-radius: 4px; padding: 4px 8px; font-size: 12px; outline: none; cursor: pointer;">
                        <option value="DEFAULT">-</option>
                        <option value="ASC">Menor a Mayor</option>
                        <option value="DESC">Mayor a Menor</option>
                    </select>
                </div>
                
                <div style="width: 1px; height: 20px; background: #475569; margin: 0 5px;"></div> 
                
                <div style="display:flex; align-items:center; background: rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);">
                    <label class="switch-mora" title="Cambia qué datos se extraen de la ficha">
                        <input type="checkbox" id="check-modo-mora">
                        <span class="slider-mora"></span>
                    </label>
                    <span class="label-mora" id="text-modo-mora">SIN MORA</span>
                </div>
            `;
            
            const tableContainer = document.createElement('div');
            tableContainer.id = 'tabla-container-rafaga';
            Object.assign(tableContainer.style, { padding: '0', overflow: 'auto', flexGrow: '1', minHeight: '100px', fontSize: '13px' });

            const footer = document.createElement('div');
            Object.assign(footer.style, {
                padding: '12px 20px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between',
                backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '0 0 12px 12px', flexWrap: 'wrap', gap: '10px'
            });
            
            footer.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <button id="btn-limpiar-lote" class="btn-rafaga btn-red">🗑️</button>
                    <button id="btn-descargar-contactos" class="btn-rafaga btn-orange">👥</button>
                </div>
                <div style="display:flex; gap:10px;">
                    <button id="btn-copiar-correos" class="btn-rafaga btn-purple">📧</button>
                    <button id="btn-copiar-lote" class="btn-rafaga btn-blue">Copy Datos</button>
                    <button id="btn-enviar-lote" class="btn-rafaga btn-green">Enviar</button>
                </div>
            `;

            panel.appendChild(header); panel.appendChild(toolbar); panel.appendChild(tableContainer); panel.appendChild(footer);
            document.body.appendChild(panel);

            document.getElementById('btn-cerrar-panel').onclick = () => togglePanelVisibility(false);
            document.getElementById('filtro-app-rafaga').onchange = () => actualizarTablaLotes();
            document.getElementById('filtro-dias-rafaga').onchange = () => actualizarTablaLotes();
            document.getElementById('orden-app-rafaga').onchange = () => actualizarTablaLotes();
            document.getElementById('orden-dias-rafaga').onchange = () => actualizarTablaLotes();

            // 🔥 LOGICA DEL SWITCH MORA (MOSTRAR/OCULTAR FILTROS) 🔥
            const checkMora = document.getElementById('check-modo-mora');
            const textMora = document.getElementById('text-modo-mora');
            
            const isMoraActive = localStorage.getItem('RAFAGA_MODO_MORA') === 'true';
            
            // Función para alternar la visibilidad de los filtros
            const toggleFiltrosUI = (active) => {
                const displayType = active ? 'flex' : 'none';
                document.getElementById('box-filtro-dias').style.display = displayType;
                document.getElementById('box-orden-dias').style.display = displayType;
                document.getElementById('separador-dias').style.display = active ? 'block' : 'none';
            };

            // Cargar estado inicial
            checkMora.checked = isMoraActive;
            textMora.innerText = isMoraActive ? 'CON MORA' : 'SIN MORA';
            textMora.style.color = isMoraActive ? '#ef4444' : '#94a3b8';
            toggleFiltrosUI(isMoraActive); // Aplicamos visualmente

            checkMora.onchange = (e) => {
                const checked = e.target.checked;
                localStorage.setItem('RAFAGA_MODO_MORA', checked);
                
                textMora.innerText = checked ? 'CON MORA' : 'SIN MORA';
                textMora.style.color = checked ? '#ef4444' : '#94a3b8';
                
                toggleFiltrosUI(checked); // Ocultar/Mostrar cajas de Días
                actualizarTablaLotes();   // Redibujar la tabla
            };

            document.getElementById('btn-limpiar-lote').onclick = () => {
                if(confirm('¿Estás seguro de eliminar todos los datos capturados?')) {
                    localStorage.setItem('LOTE_RAFAGA', '[]');
                    actualizarTablaLotes();
                }
            };

            document.getElementById('btn-descargar-contactos').onclick = () => {
                let lote = obtenerLoteFiltrado();
                if (lote.length === 0) return mostrarAviso('No hay contactos para descargar', '#fbbf24', 'warning');
                
                const prefijo = prompt("Ingrese un prefijo para los nombres (Ej: CUENTA 1).\nSi no desea prefijo, deje esto en blanco:", "");
                if (prefijo === null) return; 
                
                let csvContent = "\uFEFFFirst Name,Middle Name,Last Name,Phonetic First Name,Phonetic Middle Name,Phonetic Last Name,Name Prefix,Name Suffix,Nickname,File As,Organization Name,Organization Title,Organization Department,Birthday,Notes,Photo,Labels,E-mail 1 - Label,E-mail 1 - Value,Phone 1 - Label,Phone 1 - Value\n"; 
                
                lote.forEach(c => {
                    let nom = c.nombre ? c.nombre.trim() : '';
                    if (prefijo !== "") nom = `${prefijo} ${nom}`; 
                    nom = nom.replace(/"/g, '""'); 
                    
                    let tel = c.telefono ? c.telefono.replace('+', '').trim() : ''; 
                    let correo = c.correo ? c.correo.trim() : '';
                    csvContent += `"${nom}","","","","","","","","","","","","","","","","","","${correo}","","${tel}"\n`;
                });
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Contactos_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                mostrarAviso('CSV de Contactos descargado 📥', '#f59e0b', 'success');
            };

            document.getElementById('btn-copiar-lote').onclick = () => {
                let lote = obtenerLoteFiltrado();
                if (lote.length === 0) return mostrarAviso('No hay datos para copiar', '#fbbf24', 'warning');
                
                const isMoraActive = localStorage.getItem('RAFAGA_MODO_MORA') === 'true';

                let texto = lote.map(c => {
                    let telLimpio = c.telefono ? c.telefono.replace('+', '') : '';
                    let linea = `${c.idPlan}\t${telLimpio}\t${c.nombre}\t${c.app}\t${c.correo}\t${c.producto}\t${c.monto}\t${c.importeReinv}`;
                    // Si está en modo CON MORA, añade las 3 columnas extra
                    if (isMoraActive) {
                        linea += `\t${c.diasMora || ''}\t${c.cargoMora || ''}\t${c.montoPago || ''}`;
                    }
                    return linea;
                }).join('\n');
                
                navigator.clipboard.writeText(texto).then(() => mostrarAviso(`¡${lote.length} clientes copiados! (Listos para Sheets)`, '#34d399', 'success'));
            };

            document.getElementById('btn-copiar-correos').onclick = () => {
                let lote = obtenerLoteFiltrado(); 
                let correos = lote.map(c => c.correo).filter(c => c && c.trim() !== ''); 
                if (correos.length === 0) return mostrarAviso('No hay correos en la selección actual', '#fbbf24', 'warning');
                navigator.clipboard.writeText(correos.join('\n')).then(() => mostrarAviso(`¡${correos.length} correos copiados al portapapeles!`, '#8b5cf6', 'success'));
            };

            document.getElementById('btn-enviar-lote').onclick = async () => {
                let lote = obtenerLoteFiltrado(); 
                if (lote.length === 0) return mostrarAviso('La base está vacía', '#fbbf24', 'warning');
                
                const btn = document.getElementById('btn-enviar-lote');
                const txtOriginal = btn.innerText;
                btn.innerText = '🚀 Procesando...';
                btn.disabled = true;

                const loteSinMas = lote.map(c => ({
                    ...c,
                    telefono: c.telefono ? c.telefono.replace('+', '') : '' 
                }));

                const payload = {
                    token: 'SST_V12_CORP_SECURE_2026_X9',
                    action: 'rafaga',
                    vendedor: localStorage.getItem('usuarioLogueado'),
                    lote: loteSinMas 
                };

                const response = await safeSendMessage({ 
                    action: 'proxy_fetch', 
                    url: API_URL, 
                    options: { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify(payload) 
                    } 
                });

                btn.innerText = txtOriginal;
                btn.disabled = false;

                if (response && response.success) {
                    mostrarAviso(`¡${lote.length} datos enviados exitosamente! 🚀`, '#34d399', 'success');
                } else {
                    mostrarAviso('Error al contactar con el Cerebro ❌', '#ef4444', 'error');
                }
            };
        }
        
        panel.style.display = localStorage.getItem('PANEL_RAFAGA_VISIBLE') === 'true' ? 'flex' : 'none';
        actualizarTablaLotes();
    };

    const actualizarTablaLotes = () => {
        const container = document.getElementById('tabla-container-rafaga');
        const selectApp = document.getElementById('filtro-app-rafaga');
        const selectDias = document.getElementById('filtro-dias-rafaga');
        if (!container) return;

        let loteTotal = JSON.parse(localStorage.getItem('LOTE_RAFAGA') || '[]');
        
        if (selectApp && loteTotal.length > 0) {
            const appActual = selectApp.value;
            const appsUnicas = [...new Set(loteTotal.map(c => c.app).filter(a => a))].sort();
            let optionsHtml = `<option value="TODAS">Todas</option>`;
            appsUnicas.forEach(app => {
                optionsHtml += `<option value="${app}" ${app === appActual ? 'selected' : ''}>${app}</option>`;
            });
            selectApp.innerHTML = optionsHtml;
        }

        if (selectDias && loteTotal.length > 0) {
            const diaActual = selectDias.value;
            const diasUnicos = [...new Set(loteTotal.map(c => c.diasMora ? c.diasMora.toString().trim() : '').filter(d => d !== ''))];
            diasUnicos.sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
            
            let optionsDiasHtml = `<option value="TODOS">Todos</option>`;
            diasUnicos.forEach(dia => {
                optionsDiasHtml += `<option value="${dia}" ${dia === diaActual ? 'selected' : ''}>${dia}</option>`;
            });
            selectDias.innerHTML = optionsDiasHtml;
        }

        let loteFiltrado = obtenerLoteFiltrado();

        if (loteFiltrado.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:40px; color:#64748b; font-size:14px; min-width: 600px;">No hay datos en la Base o coincidiendo con el filtro.</div>';
            const btnEnviar = document.getElementById('btn-enviar-lote');
            if(btnEnviar) btnEnviar.innerText = `Enviar`;
            return;
        }

        // 🔥 OBTENER ESTADO DEL SWITCH PARA LA TABLA
        const isMoraActive = localStorage.getItem('RAFAGA_MODO_MORA') === 'true';

        let html = `
            <table style="width: max-content; min-width: 100%; text-align:left; border-collapse: collapse; white-space: nowrap;">
                <thead style="position: sticky; top: 0; background-color: rgba(30, 41, 59, 1); z-index: 10;">
                    <tr style="border-bottom: 2px solid #475569; color: #94a3b8;">
                        <th style="padding:10px 15px;">ID Plan</th>
                        <th style="padding:10px 15px;">Teléfono</th>
                        <th style="padding:10px 15px;">Nombre</th>
                        <th style="padding:10px 15px;">App</th>
                        <th style="padding:10px 15px;">Correo</th>
                        <th style="padding:10px 15px;">Producto</th>
                        <th style="padding:10px 15px;">Monto</th>
                        <th style="padding:10px 15px;">Reinv</th>
                        ${isMoraActive ? `
                        <th style="padding:10px 15px;">Días Mora</th>
                        <th style="padding:10px 15px;">Cargo Mora</th>
                        <th style="padding:10px 15px;">Monto Pago</th>
                        ` : ''}
                    </tr>
                </thead>
                <tbody>
        `;

        loteFiltrado.forEach(c => {
            html += `
                <tr class="fila-rafaga" style="border-bottom: 1px solid #334155;">
                    <td style="padding:8px 15px; color:#60a5fa; font-weight:500;">${c.idPlan}</td>
                    <td style="padding:8px 15px; color:#e2e8f0;">${c.telefono}</td>
                    <td style="padding:8px 15px;">${c.nombre}</td>
                    <td style="padding:8px 15px; color:#cbd5e1; font-weight:bold;">${c.app}</td>
                    <td style="padding:8px 15px; color:#93c5fd;">${c.correo}</td>
                    <td style="padding:8px 15px; color:#cbd5e1;">${c.producto}</td>
                    <td style="padding:8px 15px; color:#34d399; font-weight:bold;">${c.monto}</td>
                    <td style="padding:8px 15px; color:#f87171;">${c.importeReinv}</td>
                    ${isMoraActive ? `
                    <td style="padding:8px 15px; color:#fbbf24;">${c.diasMora || '-'}</td>
                    <td style="padding:8px 15px; color:#f87171;">${c.cargoMora || '-'}</td>
                    <td style="padding:8px 15px; color:#34d399; font-weight:bold;">${c.montoPago || '-'}</td>
                    ` : ''}
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
        
        const btnEnviar = document.getElementById('btn-enviar-lote');
        if(btnEnviar) btnEnviar.innerText = `Enviar (${loteFiltrado.length})`;
    };

    // --- LÓGICA CORE: EXTRACCIÓN CONDICIONAL ---
    const procesarEnvio = async (esManual = false) => {
        const idPlan = getIdPlan();
        const rawNombre = obtenerValor('Nombre');
        const rawTel = obtenerValor('Teléfono');
        if (!idPlan || !rawNombre || !rawTel) return false;

        // 🔥 OBTENER ESTADO DEL SWITCH PARA LA EXTRACCIÓN
        const isMoraActive = localStorage.getItem('RAFAGA_MODO_MORA') === 'true';

        const datos = {
            'token': 'SST_V12_CORP_SECURE_2026_X9', 'action': 'rafaga',
            'vendedor': localStorage.getItem('usuarioLogueado'), 'idPlan': idPlan, 
            'telefono': getCountryInfo().prefix + rawTel, 'nombre': rawNombre, 
            'app': document.querySelector('span.el-tooltip')?.innerText.trim() || '',
            'correo': obtenerValor('Correo electrónico'), 'producto': obtenerValor('Nombre del producto'),
            'monto': obtenerValor('Pago completo de la factura'), 'importeReinv': obtenerValor('Importe de la factura de reinversión')
        };

        // Si está en MODO MORA, extrae los 3 campos adicionales
        if (isMoraActive) {
            datos.diasMora = obtenerValor('Días de mora'); 
            datos.cargoMora = obtenerValor('Cargo por mora'); 
            datos.montoPago = obtenerValor('Monto de pago');
        }

        guardarEnLote(datos);

        if (!esManual) {
            setTimeout(() => safeSendMessage({ action: 'cerrar_pestana' }), 50);
            return true;
        }
        return true;
    };

    const loopRafaga = async () => {
        try {
            if (localStorage.getItem('MODO_RAFAGA') !== 'true' || !isContextValid() || document.hidden || enviando) return;
            if (!localStorage.getItem('usuarioLogueado') || !RUTAS_DETAIL.some(r => location.href.includes('/detail'))) return;

            enviando = true; actualizarIndicador();
            const hayDatos = await cazarDatosRapido(); 
            if (hayDatos && isContextValid()) await procesarEnvio(false); 
            else enviando = false; 
        } catch (e) { enviando = false; }
    };

    const renderizarBotonManual = () => {
        if (!isContextValid() || !localStorage.getItem('usuarioLogueado')) return;
        document.querySelectorAll('.addon-btn, #indicador-rafaga').forEach(e => e.remove());

        if (RUTAS_DETAIL.some(r => location.href.includes('/detail'))) {
            setTimeout(() => { if (!document.hidden && localStorage.getItem('MODO_RAFAGA') === 'true') loopRafaga(); }, 100);

            const btn = document.createElement('button');
            btn.className = 'addon-btn'; 
            btn.innerText = 'Save Data'; 
            Object.assign(btn.style, {
                position: 'fixed', left: '5px', bottom: '5px', zIndex: '10000', height: '33px', padding: '0 15px', 
                borderRadius: '20px', backgroundColor: '#39ff14', color: '#000', cursor: 'pointer', 
                fontSize: '13px', fontWeight: 'bold', border: '1px solid #39ff14', 
                boxShadow: '0 4px 10px rgba(57, 255, 20, 0.4)', 
                transition: 'all 0.3s ease' 
            });
            
            btn.onmouseenter = () => { 
                if(btn.disabled) return; 
                btn.style.transform = 'translateY(-2px) scale(1.05)'; 
                btn.style.backgroundColor = '#000'; 
                btn.style.color = '#39ff14'; 
                btn.style.boxShadow = '0 0 15px rgba(57,255,20,0.8), 0 0 30px rgba(57,255,20,0.6)'; 
            };
            btn.onmouseleave = () => { 
                if(btn.disabled) return; 
                btn.style.transform = 'translateY(0) scale(1)'; 
                btn.style.backgroundColor = '#39ff14'; 
                btn.style.color = '#000'; 
                btn.style.boxShadow = '0 4px 10px rgba(57,255,20,0.4)'; 
            };
            btn.onmousedown = () => { if(!btn.disabled) btn.style.transform = 'scale(0.95)'; };
            btn.onmouseup = () => { if(!btn.disabled) btn.style.transform = 'translateY(-2px) scale(1.05)'; };

            btn.onclick = async () => {
                btn.disabled = true; 
                btn.innerText = 'Saving...'; 
                btn.style.transform = 'translateY(0) scale(1)'; 
                btn.style.backgroundColor = '#39ff14'; 
                btn.style.color = '#000'; 
                btn.style.boxShadow = '0 4px 10px rgba(57,255,20,0.4)';

                const exito = await procesarEnvio(true);
                if (exito) {
                    btn.innerText = 'Saved ✅';
                    setTimeout(() => { 
                        btn.disabled=false; 
                        btn.innerText='Save Data'; 
                    }, 2000);
                }
            };
            document.body.appendChild(btn);
        }
        actualizarIndicador();
    };

    // --- EVENTOS ---
    window.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifierKey = isMac ? e.metaKey : e.ctrlKey;

        if (modifierKey && e.shiftKey && e.code === 'KeyZ') {
            e.preventDefault();
            togglePanelVisibility(); 
        }
        if (modifierKey && e.shiftKey && e.code === 'KeyX') {
            e.preventDefault();
            const estadoActual = localStorage.getItem('MODO_RAFAGA') === 'true';
            localStorage.setItem('MODO_RAFAGA', !estadoActual);
            
            if (!estadoActual) { mostrarAviso('⚡ MODO RÁFAGA ACTIVADO', null, 'success'); enviando = false; if (!document.hidden) loopRafaga(); } 
            else mostrarAviso('🛑 MODO RÁFAGA DESACTIVADO', null, 'warning');
            actualizarIndicador();
        }
    });

    document.addEventListener('visibilitychange', () => {
        actualizarIndicador();
        if (!document.hidden && localStorage.getItem('MODO_RAFAGA') === 'true') { enviando = false; setTimeout(loopRafaga, 200); }
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'LOTE_RAFAGA') actualizarTablaLotes(); 
        if (e.key === 'PANEL_RAFAGA_VISIBLE') {
            const panel = document.getElementById('panel-excel-rafaga');
            if (panel) panel.style.display = e.newValue === 'true' ? 'flex' : 'none';
        }
        if (e.key === 'usuarioLogueado' && e.newValue) {
            renderizarBotonManual(); renderizarPanelLotes();
        }
        // 🔥 NUEVO: Sincronización en tiempo real del Switch "Mora / Sin Mora" entre pestañas 🔥
        if (e.key === 'RAFAGA_MODO_MORA') {
            const checked = e.newValue === 'true';
            const checkMora = document.getElementById('check-modo-mora');
            const textMora = document.getElementById('text-modo-mora');
            
            if (checkMora && textMora) {
                // Sincronizar UI del switch
                checkMora.checked = checked;
                textMora.innerText = checked ? 'CON MORA' : 'SIN MORA';
                textMora.style.color = checked ? '#ef4444' : '#94a3b8';
                
                // Ocultar o mostrar los filtros de Días
                const displayType = checked ? 'flex' : 'none';
                const boxDias = document.getElementById('box-filtro-dias');
                const boxOrdDias = document.getElementById('box-orden-dias');
                const sepDias = document.getElementById('separador-dias');
                
                if (boxDias) boxDias.style.display = displayType;
                if (boxOrdDias) boxOrdDias.style.display = displayType;
                if (sepDias) sepDias.style.display = checked ? 'block' : 'none';
                
                // Redibujar la tabla en las otras pestañas
                actualizarTablaLotes();
            }
        }
    });

    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            
            // 🔥 AUTOMATIZACIÓN DEL SWITCH SEGÚN URL 🔥
            const isDetail2 = location.href.includes('/detail2');
            const isDetail3 = location.href.includes('/detail3');
            
            if (isDetail2 || isDetail3) {
                const nuevoEstado = isDetail3 ? 'true' : 'false';
                localStorage.setItem('RAFAGA_MODO_MORA', nuevoEstado);
                
                // Disparamos un evento "fantasma" para que tu UI se actualice sola
                window.dispatchEvent(new StorageEvent('storage', { 
                    key: 'RAFAGA_MODO_MORA', 
                    newValue: nuevoEstado 
                }));
            }

            if (localStorage.getItem('usuarioLogueado')) { enviando = false; renderizarBotonManual(); }
        }
    }).observe(document, { subtree: true, childList: true });
    let lastUrl = location.href;

    if (keepAliveInterval) clearInterval(keepAliveInterval);
    keepAliveInterval = setInterval(() => { if (localStorage.getItem('MODO_RAFAGA') === 'true') Math.sin(Date.now()); }, 4000);

    // INICIO
    (async () => {
        if (localStorage.getItem('PANEL_RAFAGA_VISIBLE') === null) {
            localStorage.setItem('PANEL_RAFAGA_VISIBLE', 'true');
        }
        
        // 🔥 Configurar estado inicial forzado por la URL 🔥
        let estadoInicialMora = 'false'; 
        if (window.location.href.includes('/detail3')) {
            estadoInicialMora = 'true';
        } else if (window.location.href.includes('/detail2')) {
            estadoInicialMora = 'false';
        } else if (localStorage.getItem('RAFAGA_MODO_MORA') !== null) {
            estadoInicialMora = localStorage.getItem('RAFAGA_MODO_MORA');
        }
        
        localStorage.setItem('RAFAGA_MODO_MORA', estadoInicialMora);

        if (localStorage.getItem('usuarioLogueado')) {
            renderizarBotonManual();
            renderizarPanelLotes();
        }
    })();

})();

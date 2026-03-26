(function() {
    'use strict';

    // ==========================================
    // 1. CONFIGURACIÓN (6 PAÍSES)
    // ==========================================
    const DOMAIN_CONFIG = [
        { prefix: '+57', country: 'Colombia', domains: ['co-crm.certislink.com'], digits: 10 },
        { prefix: '+52', country: 'México (Cashimex)', domains: ['mx-crm.certislink.com'], digits: 10 },
        { prefix: '+52', country: 'México (Various)', domains: ['variousplan.com'], digits: 10 },
        { prefix: '+56', country: 'Chile', domains: ['cl-crm.certislink.com'], digits: 9 },
        { prefix: '+51', country: 'Perú', domains: ['pe-crm.certislink.com'], digits: 9 },
        { prefix: '+55', country: 'Brasil', domains: ['crm.creddireto.com'], digits: 11 },
        { prefix: '+54', country: 'Argentina', domains: ['crm.rayodinero.com'], digits: 10 }
    ];

    // 🔥 DOMINIOS PERMITIDOS PARA CORREOS 🔥
    const DOMINIOS_PERMITIDOS = [
        "@gmail.com", "@hotmail.com", "@icloud.com", 
        "@yahoo.com", "@live.com", "@outlook.com"
    ];

    // --- ESTILOS CSS GLOBALES ---
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
            
            .btn-rafaga { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-weight: bold; padding: 6px 14px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; }
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
            .btn-yellow { background: #eab308; color: black; }
            .btn-yellow:hover:not(:disabled) { background: #facc15; box-shadow: 0 0 12px #eab308, 0 0 20px #eab308; transform: translateY(-2px); }
            
            /* 🔥 BOTONES DE FILTRO MÚLTIPLE 🔥 */
            .btn-rafaga-toggle { background: #1e293b; color: #cbd5e1; border: 1px solid #475569; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight:bold; cursor: pointer; transition: 0.2s; outline:none; }
            .btn-rafaga-toggle:hover { background: #334155; }
            .btn-rafaga-toggle.active { background: #8b5cf6; color: white; border-color: #a78bfa; box-shadow: 0 0 8px rgba(139,92,246,0.6); }

            /* 🔥 BOTONES NEÓN PARA FILTRO AVANZADO 🔥 */
            .btn-neon-si, .btn-neon-no { background: #1e293b; color: #64748b; border: 1px solid #475569; opacity: 0.6; transition: 0.3s; }
            .btn-neon-si:hover, .btn-neon-no:hover { opacity: 0.9; background: #334155; color: #cbd5e1; }
            .btn-neon-si.active { opacity: 1; color: #39ff14 !important; border-color: #39ff14 !important; background: rgba(57, 255, 20, 0.15) !important; box-shadow: 0 0 10px rgba(57, 255, 20, 0.6) !important; text-shadow: 0 0 5px rgba(57, 255, 20, 0.8) !important; }
            .btn-neon-no.active { opacity: 1; color: #ff073a !important; border-color: #ff073a !important; background: rgba(255, 7, 58, 0.15) !important; box-shadow: 0 0 10px rgba(255, 7, 58, 0.6) !important; text-shadow: 0 0 5px rgba(255, 7, 58, 0.8) !important; }

            .switch-mora { position: relative; display: inline-block; width: 34px; height: 18px; margin-right: 6px; }
            .switch-mora input { opacity: 0; width: 0; height: 0; }
            .slider-mora { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #475569; transition: .4s; border-radius: 34px; }
            .slider-mora:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
            input:checked + .slider-mora { background-color: #ef4444; box-shadow: 0 0 8px #ef4444; }
            input:checked + .slider-mora:before { transform: translateX(16px); }
            .label-mora { font-size: 11px; font-weight: 800; cursor: pointer; user-select: none; transition: 0.3s; letter-spacing: 0.5px; }
            
            /* 🔥 NUEVOS ESTILOS PARA EDICIÓN DE CORREOS 🔥 */
            .correo-celda { cursor: pointer; padding: 3px 6px; border-radius: 4px; transition: 0.2s; display: inline-block; min-width: 60px; font-weight: bold; }
            .correo-alerta { background-color: #f97316 !important; color: white !important; box-shadow: 0 0 5px rgba(249,115,22,0.5); }
            .correo-valido { color: #93c5fd; }
            .correo-editando { 
                user-select: text !important; 
                -webkit-user-select: text !important; 
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                background-color: white !important; 
                color: black !important; 
                outline: 2px solid #3b82f6; 
                box-shadow: 0 0 10px rgba(59,130,246,0.8); 
                cursor: text; 
            }
            
            /* 🔥 ESTILOS PARA TOOLTIP DE PREVISUALIZACIÓN 🔥 */
            #rafaga-tooltip {
                position: fixed;
                pointer-events: none;
                z-index: 2147483647;
                background: rgba(15, 23, 42, 0.95);
                border: 1px solid #8b5cf6;
                border-radius: 8px;
                padding: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(139, 92, 246, 0.4);
                backdrop-filter: blur(10px);
                display: none;
                max-width: 320px;
                color: #cbd5e1;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 12px;
                word-wrap: break-word;
            }
            #rafaga-tooltip img {
                max-width: 280px;
                max-height: 280px;
                border-radius: 6px;
                display: block;
                margin-bottom: 6px;
                border: 1px solid #475569;
                background: #0f172a;
            }
            .celda-hover-info {
                text-decoration: underline dashed #a78bfa;
                text-underline-offset: 4px;
                transition: color 0.2s;
            }
            .celda-hover-info:hover {
                color: #d8b4fe !important;
            }
        `;
        document.head.appendChild(style);
    };

    // --- UTILS ---
    const obtenerValor = (label) => {
        const el = [...document.querySelectorAll('div.mb-10')].find(div => (div.textContent || "").includes(label));
        if (!el) return '';
        const clone = el.cloneNode(true);
        clone.querySelectorAll('button').forEach(b => b.remove());
        const t = (clone.textContent || "").trim();
        return t.includes(':') ? t.substring(t.indexOf(':') + 1).trim() : '';
    };

    const getCountryInfo = () => {
        const href = window.location.href;
        for (const c of DOMAIN_CONFIG) {
            for (const d of c.domains) {
                if (href.includes(d)) return { prefix: c.prefix, name: c.country, digits: c.digits };
            }
        }
        return { prefix: '', name: 'Desconocido', digits: 10 };
    };

    const getFechasRelativas = () => {
        const hoy = new Date();
        const formato = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        return { strHoy: formato(hoy), strAyer: formato(ayer) };
    };

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
            zIndex: 2147483645, borderLeft: `3px solid ${color}`, backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        });
        document.body.appendChild(div);
        setTimeout(() => div.remove(), tiempo); 
    };

    const mostrarConfirmacionHTML = (titulo, mensaje, textoConfirmar = 'Aceptar', colorConfirmar = '#3b82f6') => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            Object.assign(overlay.style, {
                position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
                backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: '2147483645',
                display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)',
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

    const blindarElemento = (el) => {
        if (!el) return;
        ['mousedown', 'mouseup', 'click', 'keydown', 'keyup', 'keypress'].forEach(evt => {
            el.addEventListener(evt, (e) => e.stopPropagation());
        });
    };


    // ==========================================
    // 🚀 MOTOR DE EXTRACCIÓN MASIVA VÍA API 
    // ==========================================
    const obtenerTokenAutomatico = () => {
        try {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith('Admin-Token=')) return decodeURIComponent(cookie.substring('Admin-Token='.length));
            }
            return null;
        } catch (e) { return null; }
    };

    const restaurarBotones = () => {
        const btnExtraer = document.getElementById('btn-extraer-todo');
        if (btnExtraer) { btnExtraer.innerText = '⚡Extraer Todo⚡'; btnExtraer.disabled = false; }
    };

    // 🔥 API AGENTE UNICO: SIN MODAL MANAGER 🔥
    async function iniciarExtraccionAPI() {
        if (window.location.href.includes('/login')) {
            return mostrarAviso('Inicia sesión en el CRM primero.', '#ef4444', 'error');
        }

        const inputToken = document.getElementById('input-token-api');
        if (!inputToken) return;

        const tokenRaw = inputToken.value.trim();
        if (!tokenRaw) return mostrarAviso('⚠️ Por favor, pega el Token primero', '#fbbf24', 'warning');
        
        const token = decodeURIComponent(tokenRaw);
        const baseUrl = window.location.origin; 
        const countryInfo = getCountryInfo(); 
        const isVariousPlan = baseUrl.includes('variousplan.com');
        
        const btnExtraer = document.getElementById('btn-extraer-todo');

        if (btnExtraer) btnExtraer.disabled = true;

        if (btnExtraer) btnExtraer.innerText = '⏳ Analizando Base...';

        const pageSize = 5000;
        const maxPagesPerRun = 20;
        let todosLosRegistrosBrutos = [];
        
        const etapasAbuscar = [-1, 0, 1, 2, 3, 4, 5, 6, 7]; 

        mostrarAviso(`Buscando cuentas en ${countryInfo.name}...`, '#3b82f6', 'info');

        try {
            for (const sId of etapasAbuscar) {
                let page = 1;
                let totalPages = 1;

                while (true) {
                    try {
                        const listUrl = `${baseUrl}/api/manage/urge/task/waitUrgeTaskPage?v=${Date.now()}`;
                        const respList = await fetch(listUrl, {
                            method: 'POST',
                            headers: { 'Authentication': token, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                            body: JSON.stringify({ stageId: sId, current: page, size: pageSize })
                        });

                        if (!respList.ok) break; 
                        
                        const jsonList = await respList.json();
                        
                        if (jsonList.code === 401 || jsonList.code === 403) throw new Error("TokenExpirado");
                        if (jsonList.code !== 200 && jsonList.code !== 20000 && jsonList.code !== 0) break;

                        const registros = jsonList?.data?.records || jsonList?.records || [];
                        if (registros.length === 0) break; 
                        if (jsonList?.data?.pages) totalPages = jsonList.data.pages;

                        todosLosRegistrosBrutos.push(...registros);

                        page++;
                        if (page > maxPagesPerRun || page > totalPages) break;
                        await new Promise(r => setTimeout(r, 100)); 
                    } catch (e) {
                        if (e.message === "TokenExpirado") throw e; 
                        break; 
                    }
                }
            }

            if(todosLosRegistrosBrutos.length === 0) {
                mostrarAviso('La lista global está vacía o el Token expiró', '#fbbf24', 'warning');
                restaurarBotones();
                return;
            }

            // DESCARTANDO DUPLICADOS EN LA BASE CRUDA
            let unicosMap = new Map();
            todosLosRegistrosBrutos.forEach(c => {
                let idPlanBruto = isVariousPlan ? (c.borrowId || c.orderId || "") : (c.repayId || c.orderId || "");
                const idPlanStr = String(idPlanBruto);
                const idPlan = isVariousPlan ? idPlanStr : (idPlanStr.includes('p') ? idPlanStr : 'p' + idPlanStr);
                if (idPlan && !unicosMap.has(idPlan)) unicosMap.set(idPlan, c);
            });
            let registrosAProcesar = Array.from(unicosMap.values());
            
            if(registrosAProcesar.length === 0) {
                mostrarAviso('Ningún cliente válido encontrado', '#fbbf24', 'warning');
                restaurarBotones();
                return;
            }

            // 🔥 INICIA EXTRACCIÓN TURBO (CHUNKS) 🔥
            if (btnExtraer) btnExtraer.innerText = `⏳ Procesando 0 / ${registrosAProcesar.length}...`;
            let procesadosExitosos = 0;
            const maxDetailCallsPerRun = 6000; 
            let detailCalls = 0;
            
            let todosLosNuevosDatos = []; 
            const TAMANO_PAQUETE = 15; 

            for (let i = 0; i < registrosAProcesar.length; i += TAMANO_PAQUETE) {
                const paquete = registrosAProcesar.slice(i, i + TAMANO_PAQUETE);
                
                const promesasPaquete = paquete.map(async (c) => {
                    let correo = c.email || "";
                    let telefono = String(c.phone || "");
                    let extension = c.extensionAmount || c.totalExtensionAmount || "";
                    let cargoMora = c.overdueFee || c.penaltyAmount || ""; 
                    let montoPago = c.principal || ""; 
                    let linkDescarga = c.downloadLink || "";
                    let dniUrl = c.idNoUrl || "";
                    let selfUrl = c.livingNessUrl || ""; 

                    if (c.taskId && c.orderId && detailCalls < maxDetailCallsPerRun) {
                        detailCalls++;
                        try {
                            const detUrl = `${baseUrl}/api/manage/urge/task/getTaskInfo/${c.taskId}/${c.orderId}?v=${Date.now()}`;
                            const respDet = await fetch(detUrl, {
                                method: 'GET',
                                headers: { 'Authentication': token, 'Accept': 'application/json' }
                            });
                            
                            if (respDet.ok) {
                                const detJson = await respDet.json();
                                if (detJson.data) {
                                    correo = correo || detJson.data.email || "";
                                    telefono = String(telefono || detJson.data.phone || detJson.data.phonePrefix || "");
                                    
                                    if (isVariousPlan) {
                                        const planList = detJson.data.planList || [];
                                        if (planList.length > 0) {
                                            const planDetail = planList[0];
                                            cargoMora = String(planDetail.overdueFee || planDetail.overdueAmount || cargoMora);
                                            montoPago = String(planDetail.repayContractAmount || planDetail.principal || montoPago);
                                        }
                                    } else {
                                         extension = extension || detJson.data.totalExtensionAmount || "";
                                         cargoMora = String(detJson.data.overdueFee || detJson.data.penaltyAmount || cargoMora);
                                         montoPago = String(detJson.data.principal || montoPago);
                                    }
                                    linkDescarga = detJson.data.downloadLink || linkDescarga;
                                    dniUrl = detJson.data.idNoUrl || dniUrl;
                                    selfUrl = detJson.data.livingNessUrl || selfUrl;
                                }
                            }
                        } catch(e) {}
                    }

                    let idPlanBruto = isVariousPlan ? (c.borrowId || c.orderId || "") : (c.repayId || c.orderId || "");
                    const idPlanStr = String(idPlanBruto);
                    const idPlan = isVariousPlan ? idPlanStr : (idPlanStr.includes('p') ? idPlanStr : 'p' + idPlanStr);

                    const prefixClean = countryInfo.prefix.replace('+', '');
                    const telLimpio = telefono.replace(/[^0-9]/g, '');
                    const telefonoFinal = telLimpio.length >= countryInfo.digits ? (prefixClean + telLimpio.slice(-countryInfo.digits)) : (prefixClean + telLimpio);

                    return {
                        idPlan: idPlan, telefono: telefonoFinal, nombre: c.userName || c.name || "",
                        app: c.appName || "", correo: correo, producto: c.productName || "",
                        monto: String(c.repayAmount || c.totalAmount || ""), importeReinv: String(extension),
                        diasMora: String(c.overdueDay || ""), cargoMora: cargoMora, montoPago: montoPago,
                        fechaConexion: c.openTime ? String(c.openTime).split(' ')[0] : '',
                        isRepay: c.isRepay, cuenta: c.urgeUserName || "Sin Asignar",
                        linkDescarga: linkDescarga, dniUrl: dniUrl, selfUrl: selfUrl
                    };
                });

                const resultadosDelPaquete = await Promise.all(promesasPaquete);
                todosLosNuevosDatos.push(...resultadosDelPaquete);
                
                procesadosExitosos += resultadosDelPaquete.length;
                if (btnExtraer) btnExtraer.innerText = `⏳ Procesando ${procesadosExitosos} / ${registrosAProcesar.length}...`;

                await new Promise(r => setTimeout(r, 200)); 
            }

            const reporte = guardarMultiplesEnLote(todosLosNuevosDatos);
            
            if (reporte.agregados > 0 && reporte.actualizados > 0) {
                mostrarAviso(`✅ Listos: ${reporte.agregados} nuevos | 🔄 ${reporte.actualizados} actualizados`, '#34d399', 'success', 3500);
            } else if (reporte.agregados > 0) {
                mostrarAviso(`✅ Éxito: ${reporte.agregados} clientes totalmente nuevos guardados.`, '#34d399', 'success', 3500);
            } else if (reporte.actualizados > 0) {
                mostrarAviso(`🔄 Base refrescada: ${reporte.actualizados} clientes actualizados.`, '#3b82f6', 'info', 3500);
            } else {
                mostrarAviso(`✅ Escaneo terminado. No hubo cambios.`, '#94a3b8', 'info', 2500);
            }

        } catch (error) {
            console.error("🔥 Error en Motor de Extracción API:", error);
            mostrarAviso('❌ Error de conexión o Token inválido.', '#ef4444', 'error');
        } finally {
            restaurarBotones();
        }
    }

    // ==========================================
    // 📊 BASE DE DATOS Y FILTROS MÚLTIPLES
    // ==========================================
    const guardarMultiplesEnLote = (arrayNuevosDatos) => {
        let lote = JSON.parse(localStorage.getItem('LOTE_RAFAGA') || '[]');
        
        let contAgregados = 0;
        let contActualizados = 0;
        
        arrayNuevosDatos.forEach(datos => {
            const indexExistente = lote.findIndex(cliente => cliente.idPlan === datos.idPlan);
            
            if (indexExistente === -1) {
                lote.push(datos);
                contAgregados++;
            } else {
                let correoLocal = lote[indexExistente].correo;
                if (correoLocal && correoLocal.trim() !== '') {
                    datos.correo = correoLocal; 
                }
                
                lote[indexExistente] = datos; 
                contActualizados++;
            }
        });
        
        localStorage.setItem('LOTE_RAFAGA', JSON.stringify(lote)); 
        actualizarPanelFiltroPlus(); 
        actualizarTablaLotes(); 
        
        return { agregados: contAgregados, actualizados: contActualizados };
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
        let loteRaw = JSON.parse(localStorage.getItem('LOTE_RAFAGA') || '[]');
        
        let unicosMap = new Map();
        loteRaw.forEach(c => {
            if (!unicosMap.has(c.idPlan)) unicosMap.set(c.idPlan, c);
        });
        let loteUnicos = Array.from(unicosMap.values());
        
        const botonesApp = document.querySelectorAll('.btn-app-plus.active');
        const appsSeleccionadas = Array.from(botonesApp).map(b => b.dataset.val);

        const botonesFecha = document.querySelectorAll('.btn-fecha-plus.active');
        const fechasSeleccionadas = Array.from(botonesFecha).map(b => b.dataset.val);

        const botonesMora = document.querySelectorAll('.btn-mora-plus.active');
        const morasSeleccionadas = Array.from(botonesMora).map(b => b.dataset.val);

        const botonesRepay = document.querySelectorAll('.btn-repay-plus.active');
        const repaySeleccionadas = Array.from(botonesRepay).map(b => b.dataset.val);

        let filtrado = loteUnicos.filter(c => {
            let matchApp = appsSeleccionadas.length === 0 || appsSeleccionadas.includes(c.app);
            if (!matchApp) return false; 
            
            let esRepay = String(c.isRepay).toLowerCase() === 'true';
            let txtRepay = esRepay ? 'Si' : 'No';
            const dMora = c.diasMora ? String(c.diasMora).trim() : '';

            const tieneFechas = fechasSeleccionadas.length > 0;
            const tieneMoras = morasSeleccionadas.length > 0;
            const tieneRepay = repaySeleccionadas.length > 0;

            if (!tieneFechas && !tieneMoras && !tieneRepay) return true; 

            const coincideFecha = tieneFechas && fechasSeleccionadas.includes(c.fechaConexion);
            const coincideMora = tieneMoras && morasSeleccionadas.includes(dMora);
            const coincideRepay = tieneRepay && repaySeleccionadas.includes(txtRepay);

            return coincideFecha || coincideMora || coincideRepay; 
        });
        filtrado.sort((a, b) => (parseInt(a.diasMora) || 0) - (parseInt(b.diasMora) || 0));
        return filtrado;
    };

    const actualizarPanelFiltroPlus = () => {
        let loteRaw = JSON.parse(localStorage.getItem('LOTE_RAFAGA') || '[]');
        let unicosMap = new Map();
        loteRaw.forEach(c => { if (!unicosMap.has(c.idPlan)) unicosMap.set(c.idPlan, c); });
        let lote = Array.from(unicosMap.values());

        const activeApps = Array.from(document.querySelectorAll('.btn-app-plus.active')).map(b => b.dataset.val);
        const activeFechas = Array.from(document.querySelectorAll('.btn-fecha-plus.active')).map(b => b.dataset.val);
        const activeMoras = Array.from(document.querySelectorAll('.btn-mora-plus.active')).map(b => b.dataset.val);
        const activeRepay = Array.from(document.querySelectorAll('.btn-repay-plus.active')).map(b => b.dataset.val);

        const appsUnicas = [...new Set(lote.map(c => c.app).filter(Boolean))].sort();
        const fechasUnicas = [...new Set(lote.map(c => c.fechaConexion).filter(Boolean))].sort().reverse();
        const morasUnicas = [...new Set(lote.map(c => c.diasMora ? String(c.diasMora).trim() : '').filter(Boolean))].sort((a,b)=>parseInt(a)-parseInt(b));

        const contApps = document.getElementById('plus-apps-container');
        if (contApps) {
            contApps.innerHTML = appsUnicas.map(a => {
                let isActive = activeApps.includes(a) ? 'active' : '';
                return `<button type="button" class="btn-rafaga-toggle btn-app-plus ${isActive}" data-val="${a}">${a}</button>`;
            }).join('');
        }

        const contFechas = document.getElementById('plus-fechas-container');
        if (contFechas) {
            contFechas.innerHTML = fechasUnicas.map(f => {
                let fCorta = f.length > 5 ? f.substring(5) : f;
                let isActive = activeFechas.includes(f) ? 'active' : '';
                return `<button type="button" class="btn-rafaga-toggle btn-fecha-plus ${isActive}" data-val="${f}">${fCorta}</button>`;
            }).join('');
        }

        const contMoras = document.getElementById('plus-moras-container');
        if (contMoras) {
            contMoras.innerHTML = morasUnicas.map(m => {
                let isActive = activeMoras.includes(m) ? 'active' : '';
                return `<button type="button" class="btn-rafaga-toggle btn-mora-plus ${isActive}" data-val="${m}">Día ${m}</button>`;
            }).join('');
        }

        const contRepay = document.getElementById('plus-repay-container');
        if (contRepay) {
            let hasSi = lote.some(c => String(c.isRepay).toLowerCase() === 'true');
            let hasNo = lote.some(c => String(c.isRepay).toLowerCase() !== 'true');
            let htmlRepay = '';
            
            if (hasSi) {
                let isActive = activeRepay.includes('Si') ? 'active' : '';
                htmlRepay += `<button type="button" class="btn-rafaga-toggle btn-repay-plus btn-neon-si ${isActive}" data-val="Si">Clientes: Si</button>`;
            }
            if (hasNo) {
                let isActive = activeRepay.includes('No') ? 'active' : '';
                htmlRepay += `<button type="button" class="btn-rafaga-toggle btn-repay-plus btn-neon-no ${isActive}" data-val="No">Clientes: No</button>`;
            }
            contRepay.innerHTML = htmlRepay;
        }

        document.querySelectorAll('.btn-rafaga-toggle').forEach(btn => {
            btn.onclick = function() {
                this.classList.toggle('active');
                actualizarTablaLotes();
            };
        });
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
                zIndex: 2147483645, backdropFilter: 'blur(10px)', boxShadow: '0 15px 40px rgba(0,0,0,0.6)', 
                display: 'none', flexDirection: 'column', border: '1px solid #334155', 
                fontFamily: 'system-ui, -apple-system, sans-serif',
                
                userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none'
            });

            blindarElemento(panel);

            const header = document.createElement('div');
            Object.assign(header.style, {
                padding: '12px 20px', borderBottom: '1px solid #334155', display: 'flex', 
                justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '15px',
                cursor: 'grab', backgroundColor: 'rgba(30, 41, 59, 0.95)', borderRadius: '12px 12px 0 0'
            });
            
            const tokenDetectado = obtenerTokenAutomatico() || "";
            let clicsTitulo = 0;

            const isMacUI = navigator.userAgent.toUpperCase().indexOf('MAC OS') >= 0 || (navigator.userAgentData && navigator.userAgentData.platform === 'macOS');
            const atajoTexto = isMacUI ? '⌘+Shift+Z' : 'Ctrl+Shift+Z';

            header.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px; padding-right: 30px; width: 100%;">
                    <span id="titulo-panel" style="cursor:pointer; white-space:nowrap; user-select:none;">📋 Base de datos</span>
                    <div style="position:relative; flex-grow:1; max-content; max-width: 400px;">
                        <input type="text" id="input-token-api" value="${tokenDetectado}" readonly 
                               style="width: 100%; background: #1e293b; color: #34d399; border: 1px solid #334155; border-radius: 4px; padding: 4px 8px; font-size: 10px; outline: none; font-family: monospace; cursor: default; user-select: none;">
                        <div id="escudo-token" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:10; cursor:default;"></div>
                    </div>
                    <span style="font-size:11px; font-weight:normal; color:#94a3b8; background:#0f172a; padding:2px 6px; border-radius:4px; user-select:none;">${atajoTexto}</span>
                </div>
                <button type="button" id="btn-cerrar-panel" style="background:none; border:none; color:#f87171; cursor:pointer; font-size:18px; line-height:1;">✖</button>
            `;

            setTimeout(() => {
                const titulo = document.getElementById('titulo-panel');
                const inputToken = document.getElementById('input-token-api');
                const escudo = document.getElementById('escudo-token');

                if (titulo && inputToken) {
                    const bloquear = (e) => { e.preventDefault(); return false; };
                    inputToken.oncopy = bloquear; inputToken.oncut = bloquear; inputToken.oncontextmenu = bloquear;
                    inputToken.onkeydown = (e) => {
                        if ((e.ctrlKey || e.metaKey) && (e.keyCode === 67 || e.keyCode === 65 || e.keyCode === 88)) {
                            e.preventDefault(); return false;
                        }
                    };
                    titulo.onclick = () => {
                        clicsTitulo++;
                        if (clicsTitulo === 5) {
                            const pass = prompt("🔐 Acceso de Administrador para editar Token:");
                            if (pass === "1234") {
                                inputToken.readOnly = false;
                                inputToken.style.background = "#0f172a";
                                inputToken.style.border = "1px solid #34d399";
                                inputToken.style.cursor = "text";
                                inputToken.style.userSelect = "text";
                                if(escudo) escudo.style.display = "none"; 
                                mostrarAviso("🔓 Edición permitida", "#34d399", "success");
                            } else {
                                if (pass !== null) mostrarAviso("❌ Contraseña incorrecta", "#ef4444", "error");
                                clicsTitulo = 0;
                            }
                        }
                    };
                }
            }, 100);
            
            let isDragging = false, offsetX, offsetY;
            
            header.onmousedown = (e) => {
                if (e.target.id === 'btn-cerrar-panel' || e.target.id === 'input-token-api') return;
                e.preventDefault(); 
                isDragging = true; 
                header.style.cursor = 'grabbing';
                
                const rect = panel.getBoundingClientRect(); 
                
                panel.style.transform = 'none'; 
                panel.style.left = rect.left + 'px';
                panel.style.top = rect.top + 'px';

                offsetX = e.clientX - rect.left; 
                offsetY = e.clientY - rect.top;
            };
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                panel.style.left = (e.clientX - offsetX) + 'px'; 
                panel.style.top = (e.clientY - offsetY) + 'px';
            }, true);
            
            document.addEventListener('mouseup', () => { 
                isDragging = false; 
                header.style.cursor = 'grab'; 
            }, true);

            const toolbar = document.createElement('div');
            Object.assign(toolbar.style, {
                padding: '8px 20px', borderBottom: '1px solid #334155', backgroundColor: 'rgba(15, 23, 42, 0.8)',
                display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', position: 'relative' 
            });

            toolbar.innerHTML = `
                <button type="button" id="btn-mas-filtro" style="background: #8b5cf6; color: white; border: 1px solid #7c3aed; border-radius: 4px; padding: 6px 12px; font-size: 13px; font-weight: bold; cursor: pointer; outline: none; box-shadow: 0 0 10px rgba(139, 92, 246, 0.5); transition: 0.3s;">
                    ✨ + Filtros Avanzados
                </button>
                
                <div style="width: 1px; height: 20px; background: #475569; margin: 0 5px;"></div> 
                
                <div style="display:flex; align-items:center; background: rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);">
                    <label class="switch-mora" title="Muestra columnas extra (Link, DNI, Self)">
                        <input type="checkbox" id="check-modo-etc">
                        <span class="slider-mora"></span>
                    </label>
                    <span class="label-mora" id="text-modo-etc" style="margin-right:8px;">SIN ETC</span>
                    
                    <div style="width: 1px; height: 14px; background: #475569; margin: 0 8px;"></div>

                    <label class="switch-mora" title="Cambia qué datos se extraen de la ficha">
                        <input type="checkbox" id="check-modo-mora">
                        <span class="slider-mora"></span>
                    </label>
                    <span class="label-mora" id="text-modo-mora" style="margin-right:8px;">SIN MORA</span>
                    
                    <div style="width: 1px; height: 14px; background: #475569; margin: 0 8px;"></div>
                    <span title="Cuenta / Agente de los datos mostrados" style="font-size: 11px; font-weight: bold; color: #93c5fd; display: flex; align-items: center; gap: 4px; white-space: normal; word-break: break-word;">
                        👤 <span id="label-cuentas-extraidas">Vacío</span>
                    </span>
                </div>

                <div id="panel-filtro-plus" style="position: absolute; top: 100%; left: 20px; background: rgba(15, 23, 42, 0.98); border: 1px solid #8b5cf6; border-radius: 8px; padding: 15px; z-index: 3000; display: none; flex-direction: column; gap: 15px; min-width: 300px; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
                    <div style="display:flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #475569; padding-bottom: 8px;">
                        <span style="font-weight: bold; color: #a78bfa; font-size: 14px;">🎛️ Filtros Múltiples (Sin Duplicados)</span>
                        <span id="btn-cerrar-plus" style="cursor:pointer; color: #f87171; font-size: 16px;">✖</span>
                    </div>
                    
                    <div>
                        <label style="font-size: 12px; color: #cbd5e1; font-weight:bold; display:block; margin-bottom:5px;">📱 Aplicación (Múltiple):</label>
                        <div id="plus-apps-container" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
                    </div>

                    <div>
                        <label style="font-size: 12px; color: #cbd5e1; font-weight:bold; display:block; margin-bottom:5px;">📆 Fechas de Conexión (Múltiple):</label>
                        <div id="plus-fechas-container" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
                    </div>

                    <div>
                        <label style="font-size: 12px; color: #cbd5e1; font-weight:bold; display:block; margin-bottom:5px;">⚠️ Días de Mora (Múltiple):</label>
                        <div id="plus-moras-container" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
                    </div>

                    <div>
                        <label style="font-size: 12px; color: #cbd5e1; font-weight:bold; display:block; margin-bottom:5px;">💰 Estado (Múltiple):</label>
                        <div id="plus-repay-container" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                const btnMasFiltro = document.getElementById('btn-mas-filtro');
                const panelPlus = document.getElementById('panel-filtro-plus');
                
                if(btnMasFiltro && panelPlus) {
                    btnMasFiltro.onclick = (e) => {
                        e.stopPropagation();
                        if(panelPlus.style.display === 'none') {
                            panelPlus.style.display = 'flex';
                            actualizarPanelFiltroPlus(); 
                        } else {
                            panelPlus.style.display = 'none';
                        }
                    };
                    document.getElementById('btn-cerrar-plus').onclick = (e) => {
                        e.stopPropagation();
                        panelPlus.style.display = 'none';
                    };
                }
            }, 100);

            const tableContainer = document.createElement('div');
            tableContainer.id = 'tabla-container-rafaga';
            Object.assign(tableContainer.style, { padding: '0', overflow: 'auto', flexGrow: '1', minHeight: '100px', fontSize: '13px' });

            // 🔥 Crear contenedor para previsualizaciones (Tooltip) 🔥
            let tooltip = document.getElementById('rafaga-tooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.id = 'rafaga-tooltip';
                document.body.appendChild(tooltip);
            }

            // Lógica de detección del mouse
            tableContainer.addEventListener('mouseover', (e) => {
                const target = e.target;
                if (target.classList.contains('rafaga-hover-img') || target.classList.contains('rafaga-hover-text')) {
                    const url = target.getAttribute('data-url');
                    if (!url) return;
                    
                    tooltip.style.display = 'block';
                    
                    if (target.classList.contains('rafaga-hover-img')) {
                        let nombreArchivo = url.split('/').pop().split('?')[0];
                        if (nombreArchivo.length > 30) nombreArchivo = nombreArchivo.substring(0, 30) + '...';
                        
                        tooltip.innerHTML = `
                            <img src="${url}" alt="Cargando imagen...">
                            <div style="text-align:center; color:#94a3b8; font-size:10px;">📄 ${nombreArchivo}</div>
                        `;
                    } else {
                        tooltip.innerHTML = `
                            <div style="color:#34d399; font-weight:bold; margin-bottom:6px; border-bottom:1px solid #334155; padding-bottom:4px;">🔗 ENLACE DE DESCARGA:</div>
                            <div style="word-break: break-all; color:#e2e8f0; line-height:1.4;">${url}</div>
                        `;
                    }
                }
            });

            tableContainer.addEventListener('mousemove', (e) => {
                if (tooltip.style.display === 'block') {
                    // Posicionar cerca del cursor (offset de 15px)
                    let x = e.clientX + 15;
                    let y = e.clientY + 15;
                    
                    // Evitar que se salga de la pantalla (Derecha / Abajo)
                    if (x + 320 > window.innerWidth) x = e.clientX - 335;
                    if (y + 350 > window.innerHeight) y = e.clientY - tooltip.offsetHeight - 15;

                    tooltip.style.left = x + 'px';
                    tooltip.style.top = y + 'px';
                }
            });

            tableContainer.addEventListener('mouseout', (e) => {
                if (e.target.classList.contains('rafaga-hover-img') || e.target.classList.contains('rafaga-hover-text')) {
                    tooltip.style.display = 'none';
                    tooltip.innerHTML = ''; // Limpiar RAM visual
                }
            });

            const footer = document.createElement('div');
            Object.assign(footer.style, {
                padding: '12px 20px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between',
                backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '0 0 12px 12px', flexWrap: 'wrap', gap: '10px'
            });
            
            // 🔥 REMOVIDO EL BOTÓN DE MODO MANAGER 🔥
            footer.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <button type="button" id="btn-limpiar-lote" class="btn-rafaga btn-red" title="Limpiar Base">🗑️</button>
                    <button type="button" id="btn-descargar-contactos" class="btn-rafaga btn-orange" title="Descargar CSV">👥</button>
                    
                    <button type="button" id="btn-extraer-todo" class="btn-rafaga btn-green">⚡Extraer Todo⚡</button>
                </div>
                <div style="display:flex; gap:10px;">
                    <button type="button" id="btn-copiar-correos" class="btn-rafaga btn-purple">📧 Correos</button>
                    <button type="button" id="btn-copiar-lote" class="btn-rafaga btn-blue">Copy Datos</button>
                </div>
            `;

            panel.appendChild(header); panel.appendChild(toolbar); panel.appendChild(tableContainer); panel.appendChild(footer);
            document.body.appendChild(panel);

            document.getElementById('btn-cerrar-panel').onclick = (e) => { 
                e.stopPropagation();
                togglePanelVisibility(false); 
            };

            const checkEtc = document.getElementById('check-modo-etc');
            const textEtc = document.getElementById('text-modo-etc');
            const isEtcActive = localStorage.getItem('RAFAGA_MODO_ETC') === 'true';

            checkEtc.checked = isEtcActive;
            textEtc.innerText = isEtcActive ? 'CON ETC' : 'SIN ETC';
            textEtc.style.color = isEtcActive ? '#8b5cf6' : '#94a3b8';

            checkEtc.onchange = (e) => {
                const checked = e.target.checked;
                localStorage.setItem('RAFAGA_MODO_ETC', checked);
                textEtc.innerText = checked ? 'CON ETC' : 'SIN ETC';
                textEtc.style.color = checked ? '#8b5cf6' : '#94a3b8';
                actualizarTablaLotes();
            };

            const checkMora = document.getElementById('check-modo-mora');
            const textMora = document.getElementById('text-modo-mora');
            const isMoraActive = localStorage.getItem('RAFAGA_MODO_MORA') === 'true';

            checkMora.checked = isMoraActive;
            textMora.innerText = isMoraActive ? 'CON MORA' : 'SIN MORA';
            textMora.style.color = isMoraActive ? '#ef4444' : '#94a3b8';

            checkMora.onchange = (e) => {
                const checked = e.target.checked;
                localStorage.setItem('RAFAGA_MODO_MORA', checked);
                textMora.innerText = checked ? 'CON MORA' : 'SIN MORA';
                textMora.style.color = checked ? '#ef4444' : '#94a3b8';
                actualizarTablaLotes();   
            };

            document.getElementById('btn-limpiar-lote').onclick = async (e) => {
                e.stopPropagation();
                const confirmado = await mostrarConfirmacionHTML(
                    '🗑️ Limpiar Base de Datos', 
                    '¿Estás seguro de eliminar <strong>todos los datos</strong> capturados?<br>Esta acción no se puede deshacer.',
                    'Sí, Eliminar todo',
                    '#ef4444' 
                );
                if(confirmado) {
                    localStorage.setItem('LOTE_RAFAGA', '[]');
                    actualizarPanelFiltroPlus();
                    actualizarTablaLotes();
                }
            };
            
            const btnExtraerTodo = document.getElementById('btn-extraer-todo');
            if (btnExtraerTodo) {
                btnExtraerTodo.onclick = async (e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    const confirmado = await mostrarConfirmacionHTML(
                        '⚠️ ADVERTENCIA DE SISTEMA',
                        '¿Estás seguro que estás en una <strong style="color:#34d399;">cuenta</strong> administrada por agente?',
                        'Sí, Continuar',
                        '#34d399' 
                    );
                    if(confirmado) {
                        iniciarExtraccionAPI(); 
                    }
                };
            }

            document.getElementById('btn-descargar-contactos').onclick = (e) => {
                e.stopPropagation();
                let lote = obtenerLoteFiltrado();
                if (lote.length === 0) return mostrarAviso('No hay contactos', '#fbbf24', 'warning');
                
                const prefijo = prompt("Ingrese un prefijo para los nombres (Ej: CUENTA 1).\nSi no desea prefijo, deje en blanco:", "");
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
                const a = document.createElement('a'); a.href = url;
                a.download = `Contactos_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                mostrarAviso('CSV descargado 📥', '#f59e0b', 'success');
            };

            document.getElementById('btn-copiar-lote').onclick = (e) => {
                e.stopPropagation();
                let lote = obtenerLoteFiltrado();
                if (lote.length === 0) return mostrarAviso('No hay datos', '#fbbf24', 'warning');
                
                const isMoraActive = localStorage.getItem('RAFAGA_MODO_MORA') === 'true';
                const isEtcActive = localStorage.getItem('RAFAGA_MODO_ETC') === 'true';
                let filas = lote.map(c => {
                    let telLimpio = c.telefono ? String(c.telefono).replace('+', '') : '';
                    let dataFila = [ c.idPlan, telLimpio, c.nombre, c.app, c.correo, c.producto, c.monto, c.importeReinv ];
                    if (isMoraActive) {
                        dataFila.push(c.diasMora || '0', c.cargoMora || '0', c.montoPago || '0');
                    }
                    if (isEtcActive) {
                        // Transformamos DNI y SELF en etiquetas <img> si existen
                        let imgDni = c.dniUrl ? `<img src="${c.dniUrl}" style="max-width:200px;border:1px solid #ccc;" />` : '';
                        let imgSelf = c.selfUrl ? `<img src="${c.selfUrl}" style="max-width:200px;border:1px solid #ccc;" />` : '';
                        
                        dataFila.push(c.linkDescarga || '', imgDni, imgSelf);
                    }
                    dataFila.push(c.fechaConexion || ''); 
                    return dataFila.join('\t');
                });

                navigator.clipboard.writeText(filas.join('\n')).then(() => {
                    mostrarAviso(`¡${lote.length} clientes únicos copiados!`, '#34d399', 'success');
                });
            };

            document.getElementById('btn-copiar-correos').onclick = (e) => {
                e.stopPropagation();
                let lote = obtenerLoteFiltrado(); 
                let correos = lote.map(c => c.correo).filter(c => c && c.trim() !== ''); 
                if (correos.length === 0) return mostrarAviso('No hay correos', '#fbbf24', 'warning');
                navigator.clipboard.writeText(correos.join('\n')).then(() => mostrarAviso(`¡${correos.length} correos copiados!`, '#8b5cf6', 'success'));
            };
        }
        
        panel.style.display = localStorage.getItem('PANEL_RAFAGA_VISIBLE') === 'true' ? 'flex' : 'none';
        actualizarPanelFiltroPlus();
        actualizarTablaLotes();
    };

    const actualizarTablaLotes = () => {
        const container = document.getElementById('tabla-container-rafaga');
        if (!container) return;

        let loteFiltrado = obtenerLoteFiltrado();

        const labelCuentas = document.getElementById('label-cuentas-extraidas');
        if (labelCuentas) {
            let cuentasUnicas = [...new Set(loteFiltrado.map(c => c.cuenta || 'Sin Asignar'))].filter(c => c !== 'Sin Asignar');
            let txtCuentas = cuentasUnicas.length > 0 ? cuentasUnicas.join(', ') : 'Vacío';
            labelCuentas.innerText = txtCuentas;
            labelCuentas.parentElement.title = "Agentes: " + txtCuentas;
        }

        if (loteFiltrado.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:40px; color:#64748b; font-size:14px; min-width: 600px;">No hay datos en la Base o coincidiendo con el filtro.</div>';
            const btnCopy = document.getElementById('btn-copiar-lote');
            if(btnCopy) btnCopy.innerText = `Copy Datos`;
            return;
        }

        const isMoraActive = localStorage.getItem('RAFAGA_MODO_MORA') === 'true';
        const isEtcActive = localStorage.getItem('RAFAGA_MODO_ETC') === 'true';
        const { strHoy, strAyer } = getFechasRelativas();

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
                        <th style="padding:10px 15px;">Días</th>
                        <th style="padding:10px 15px;">Cargo</th>
                        <th style="padding:10px 15px;">Contrato</th>
                        ` : ''}
                        ${isEtcActive ? `
                        <th style="padding:10px 15px; color:#c084fc;">LINK</th>
                        <th style="padding:10px 15px; color:#c084fc;">DNI</th>
                        <th style="padding:10px 15px; color:#c084fc;">SELF</th>
                        ` : ''}
                    </tr>
                </thead>
                <tbody>
        `;

        const cInfo = getCountryInfo();
        const prefLen = cInfo.prefix.replace('+', '').length;

        loteFiltrado.forEach(c => {
            let colorFecha = '#64748b'; 
            
            // 🔥 Variables compactas exclusivas para visualización
            let telVisible = (c.telefono || '').length > prefLen ? c.telefono.substring(prefLen) : c.telefono;
            let nomVisible = (c.nombre || '').length > 22 ? c.nombre.substring(0, 22) + '...' : c.nombre; 
            if (c.fechaConexion === strHoy) colorFecha = '#34d399'; 
            else if (c.fechaConexion === strAyer) colorFecha = '#fb923c'; 

            let correoLimpio = (c.correo || '').toLowerCase().trim();
            let esCorreoValido = DOMINIOS_PERMITIDOS.some(d => correoLimpio.endsWith(d));
            let claseCorreo = esCorreoValido ? 'correo-valido' : 'correo-alerta';
            let txtCorreo = c.correo && c.correo.trim() !== '' ? c.correo : 'Sin_Correo';

            let esRepay = String(c.isRepay).toLowerCase() === 'true';
            let txtRepay = esRepay ? 'Si' : 'No';
            let colorNeon = esRepay ? '#39ff14' : '#ff073a'; 
            let bgNeon = esRepay ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 7, 58, 0.1)';
            
            let etiquetaRepay = `
                <div style="margin-top: 4px; user-select: none; pointer-events: none;">
                    <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${bgNeon}; color: ${colorNeon}; border: 1px solid ${colorNeon}; box-shadow: 0 0 6px rgba(${esRepay ? '57,255,20' : '255,7,58'}, 0.5); letter-spacing: 0.5px; user-select: none; -webkit-user-select: none; -moz-user-select: none;">
                        ${txtRepay}
                    </span>
                </div>
            `;

            html += `
                <tr class="fila-rafaga" style="border-bottom: 1px solid #334155;">
                    <td class="idplan-celda" style="padding:8px 15px; color:#60a5fa; font-weight:bold; cursor:pointer;" title="Doble clic para copiar ID">${c.idPlan}</td>
                    <td style="padding:8px 15px; color:#e2e8f0; cursor:help;" title="${c.telefono}">${telVisible}</td>
                    <td style="padding:8px 15px; line-height: 1.2; cursor:help;" title="${c.nombre}">
                        <div>${nomVisible}</div>
                        ${c.fechaConexion ? `<div style="font-size: 10.5px; color: ${colorFecha}; margin-top: 2px; font-weight: 600;">🕒 ${c.fechaConexion}</div>` : ''}
                    </td>
                    <td style="padding:8px 15px; color:#cbd5e1; font-weight:bold;">${c.app}</td>
                    
                    <td style="padding:8px 15px;">
                        <span class="correo-celda ${claseCorreo}" data-idplan="${c.idPlan}" title="Doble Clic para editar">${txtCorreo}</span>
                    </td>

                    <td style="padding:8px 15px; color:#cbd5e1; line-height: 1.2;">
                        <div>${c.producto}</div>
                        ${etiquetaRepay}
                    </td>
                    <td style="padding:8px 15px; color:#34d399; font-weight:bold;">${c.monto}</td>
                    <td style="padding:8px 15px; color:#f87171;">${c.importeReinv}</td>
                    ${isMoraActive ? `
                    <td style="padding:8px 15px; color:#fbbf24;">${c.diasMora || '-'}</td>
                    <td style="padding:8px 15px; color:#f87171;">${c.cargoMora || '-'}</td>
                    <td style="padding:8px 15px; color:#34d399; font-weight:bold;">${c.montoPago || '-'}</td>
                    ` : ''}
                    ${isEtcActive ? `
                    <td class="link-celda" style="padding:8px 15px; color:#c084fc; cursor:pointer;" title="Doble clic para copiar Link">
                        <span class="${c.linkDescarga ? 'celda-hover-info rafaga-hover-text' : ''}" data-url="${c.linkDescarga || ''}">${c.linkDescarga ? String(c.linkDescarga).substring(0,4) : '-'}</span>
                    </td>
                    <td style="padding:8px 15px; color:#c084fc; cursor:help;">
                        <span class="${c.dniUrl ? 'celda-hover-info rafaga-hover-img' : ''}" data-url="${c.dniUrl || ''}">${c.dniUrl ? String(c.dniUrl).substring(0,4) : '-'}</span>
                    </td>
                    <td style="padding:8px 15px; color:#c084fc; cursor:help;">
                        <span class="${c.selfUrl ? 'celda-hover-info rafaga-hover-img' : ''}" data-url="${c.selfUrl || ''}">${c.selfUrl ? String(c.selfUrl).substring(0,4) : '-'}</span>
                    </td>
                    ` : ''}
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
        
        const btnCopy = document.getElementById('btn-copiar-lote');
        if(btnCopy) btnCopy.innerText = `Copy Datos (${loteFiltrado.length})`;

        // 🔥 Evento: Doble clic para copiar ID Plan al portapapeles 🔥
        container.querySelectorAll('.idplan-celda').forEach(celda => {
            celda.addEventListener('dblclick', function(e) {
                e.stopPropagation();
                const textoCopia = this.innerText.trim();
                navigator.clipboard.writeText(textoCopia).then(() => {
                    mostrarAviso(`🆔 ID ${textoCopia} copiado!`, '#60a5fa', 'info', 1500);
                }).catch(err => console.error("Error al copiar: ", err));
            });
        });

        // 🔥 Evento: Doble clic para copiar LINK al portapapeles 🔥
        container.querySelectorAll('.link-celda').forEach(celda => {
            celda.addEventListener('dblclick', function(e) {
                e.stopPropagation();
                const spanDato = this.querySelector('span');
                if (!spanDato) return;
                
                const urlCompleta = spanDato.getAttribute('data-url');
                if (urlCompleta && urlCompleta.trim() !== '') {
                    navigator.clipboard.writeText(urlCompleta).then(() => {
                        mostrarAviso(`🔗 Link copiado al portapapeles!`, '#c084fc', 'success', 1500);
                    }).catch(err => console.error("Error al copiar link: ", err));
                }
            });
        });

        container.querySelectorAll('.correo-celda').forEach(celda => {
            celda.addEventListener('dblclick', function(e) {
                e.stopPropagation();
                this.contentEditable = "true";
                this.classList.add("correo-editando");
                
                if (this.innerText.trim() === 'Sin_Correo') this.innerText = '';
                
                this.focus();
                document.execCommand('selectAll', false, null);
            });

            const finalizarEdicion = (e) => {
                if (e.type === 'blur' || (e.type === 'keydown' && e.key === 'Enter')) {
                    if (e.key === 'Enter') e.preventDefault();
                    
                    celda.contentEditable = "false";
                    celda.classList.remove("correo-editando");
                    
                    let nuevoCorreo = celda.innerText.trim();
                    if (nuevoCorreo === 'Sin_Correo') nuevoCorreo = '';

                    const esValido = DOMINIOS_PERMITIDOS.some(d => nuevoCorreo.toLowerCase().endsWith(d));
                    
                    if (!nuevoCorreo) {
                        celda.innerText = 'Sin_Correo';
                        celda.className = 'correo-celda correo-alerta';
                    } else {
                        celda.className = `correo-celda ${esValido ? 'correo-valido' : 'correo-alerta'}`;
                    }

                    const idPlan = celda.getAttribute('data-idplan');
                    let loteRaw = JSON.parse(localStorage.getItem('LOTE_RAFAGA') || '[]');
                    const index = loteRaw.findIndex(item => item.idPlan === idPlan);
                    
                    if (index !== -1 && loteRaw[index].correo !== nuevoCorreo) {
                        loteRaw[index].correo = nuevoCorreo; 
                        localStorage.setItem('LOTE_RAFAGA', JSON.stringify(loteRaw));
                    }
                }
            };

            celda.addEventListener('blur', finalizarEdicion);
            celda.addEventListener('keydown', finalizarEdicion);
        });
    }; 

    window.addEventListener('keydown', (e) => {
        const isMac = navigator.userAgent.toUpperCase().indexOf('MAC OS') >= 0 || (navigator.userAgentData && navigator.userAgentData.platform === 'macOS');
        const modifierKey = isMac ? e.metaKey : e.ctrlKey;
        if (modifierKey && e.shiftKey && e.code === 'KeyZ') {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); 
            togglePanelVisibility(); 
        }
    }, true); 

    window.addEventListener('storage', (e) => {
        if (e.key === 'LOTE_RAFAGA') {
            actualizarPanelFiltroPlus();
            actualizarTablaLotes(); 
        }
        if (e.key === 'PANEL_RAFAGA_VISIBLE') {
            const panel = document.getElementById('panel-excel-rafaga');
            if (panel) panel.style.display = e.newValue === 'true' ? 'flex' : 'none';
        }
    });

    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            const isDetail2 = location.href.includes('/detail2');
            const isDetail3 = location.href.includes('/detail3');
            
            if (isDetail2 || isDetail3) {
                const nuevoEstado = isDetail3 ? 'true' : 'false';
                localStorage.setItem('RAFAGA_MODO_MORA', nuevoEstado);
                
                const checkMora = document.getElementById('check-modo-mora');
                const textMora = document.getElementById('text-modo-mora');
                if (checkMora && textMora) {
                    checkMora.checked = (nuevoEstado === 'true');
                    textMora.innerText = checkMora.checked ? 'CON MORA' : 'SIN MORA';
                    textMora.style.color = checkMora.checked ? '#ef4444' : '#94a3b8';
                    actualizarTablaLotes();
                }
            }
        }
    }).observe(document, { subtree: true, childList: true });
    let lastUrl = location.href;

    (async () => {
        // 🔥 MODIFICADO: Ahora el panel inicia OCULTO ('false') por defecto la primera vez
        if (localStorage.getItem('PANEL_RAFAGA_VISIBLE') === null) localStorage.setItem('PANEL_RAFAGA_VISIBLE', 'false');
        if (localStorage.getItem('RAFAGA_MODO_ETC') === null) localStorage.setItem('RAFAGA_MODO_ETC', 'true');
        
        let estadoInicialMora = 'false'; 
        if (window.location.href.includes('/detail3')) estadoInicialMora = 'true';
        else if (window.location.href.includes('/detail2')) estadoInicialMora = 'false';
        else if (localStorage.getItem('RAFAGA_MODO_MORA') !== null) estadoInicialMora = localStorage.getItem('RAFAGA_MODO_MORA');
        
        localStorage.setItem('RAFAGA_MODO_MORA', estadoInicialMora);
        renderizarPanelLotes();
    })();

})();

(function() {
    'use strict';
    // 🔥 FIX OBLIGATORIO: Evitar ejecución en iframes
    if (window.self !== window.top) return;

    // =============================================================================
    // ------------------- MÓDULO 1: HERRAMIENTAS (TOOLS) ------------------------
    // =============================================================================
    
    // 1. CONFIGURACIÓN TOOLS
    const DOMAIN_CONFIG = [
        { prefix: "+57", country: "Colombia", domains: ["https://co-crm.certislink.com"], digits: 10 },
        { prefix: "+52", country: "México (Cashimex)", domains: ["https://mx-crm.certislink.com"], digits: 10 },
        { prefix: "+52", country: "México (Various)", domains: ["https://mx-ins-crm.variousplan.com"], digits: 10 },
        { prefix: "+56", country: "Chile", domains: ["https://cl-crm.certislink.com"], digits: 9 },
        { prefix: "+51", country: "Perú", domains: ["https://pe-crm.certislink.com"], digits: 9 },
        { prefix: "+55", country: "Brasil", domains: ["https://crm.creddireto.com"], digits: 11 },
        { prefix: "+54", country: "Argentina", domains: ["https://crm.rayodinero.com"], digits: 10 }
    ];

    const REFERENCE_LABELS = [
        "Hermano/Hermana", "Padre/Madre", "Cónyuge", "Hijo/Hija", 
        "Amigo", "Colega", "Otros", "Referencia"
    ];
    
    const RUTAS_PERMITIDAS = ["/detail2", "/detail3"];
    
    const Z_UI_LAYER = "2147483643"; 
    const Z_TOAST = "2147483643";

    // 2. ESTILOS Y UTILIDADES UI (TOOLS)
    const applyDynamicHover = (btn, targetColor) => {
        const baseStyle = {
            backgroundColor: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1', transform: 'scale(1)', boxShadow: 'none'
        };
        const hoverStyle = {
            backgroundColor: targetColor, border: `1px solid ${targetColor}`,
            color: '#ffffff', transform: 'translateY(-1px)', boxShadow: `0 2px 10px ${targetColor}60`
        };
        Object.assign(btn.style, baseStyle);
        btn.onmouseenter = () => Object.assign(btn.style, hoverStyle);
        btn.onmouseleave = () => Object.assign(btn.style, baseStyle);
        btn.onmousedown = () => btn.style.transform = 'scale(0.96)';
        btn.onmouseup = () => btn.style.transform = 'translateY(-1px)';
    };

    const applyGlassPillStyle = (btn, hoverColor = '#38bdf8') => {
        Object.assign(btn.style, {
            width: 'auto', height: '33px', padding: '0 15px', borderRadius: '20px',
            backgroundColor: 'rgba(10, 15, 30, 0.9)', color: 'white',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', 
            transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', marginBottom: '0' 
        });
        btn.onmouseenter = () => { btn.style.transform = 'translateY(-2px)'; btn.style.borderColor = hoverColor; btn.style.color = hoverColor; btn.style.boxShadow = `0 4px 15px ${hoverColor}40`; };
        btn.onmouseleave = () => { btn.style.transform = 'translateY(0)'; btn.style.borderColor = 'rgba(255,255,255,0.2)'; btn.style.color = 'white'; btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)'; };
        btn.onmousedown = () => btn.style.transform = 'scale(0.95)';
    };

    const WRAPPER_STYLE = { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: "2147483643", display: "flex", alignItems: "flex-start" };
    const MODAL_STYLE = { backgroundColor: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(20px)", padding: "25px", borderRadius: "16px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", width: "650px", height: "650px", minWidth: "350px", minHeight: "400px", display: "flex", flexDirection: "column", gap: "15px", border: "1px solid rgba(255, 255, 255, 0.15)", resize: "both", overflow: "hidden", color: "#f1f5f9" };
    const SIDEBAR_STYLE = { position: "absolute", right: "102%", top: "0", width: "180px", maxHeight: "100%", backgroundColor: "rgba(10, 15, 30, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", padding: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", overflowY: "auto", display: "none", fontSize: "11px", boxSizing: "border-box", color: "#cbd5e1", backdropFilter: "blur(10px)" };
    const COPY_ICON_STYLE = `cursor: pointer; font-size: 16px; border: none; background: transparent; padding: 0 4px; vertical-align: middle; line-height: 1; filter: none;`;

    // 3. UTILIDADES DE EXTRACCIÓN
    
    // 🔥 Lector exacto de la tabla oculta de Variousplan
    const obtenerValorTablaVarious = (nombreColumna) => {
        try {
            const pane = document.getElementById('pane-fourth');
            if (!pane) return '';
            const headerWrapper = pane.querySelector('.el-table__header-wrapper');
            if (!headerWrapper) return '';
            const headers = Array.from(headerWrapper.querySelectorAll('th .cell'));
            const index = headers.findIndex(h => (h.textContent || '').trim().toLowerCase().includes(nombreColumna.toLowerCase()));
            if (index === -1) return '';
            const bodyWrapper = pane.querySelector('.el-table__body-wrapper');
            if (!bodyWrapper) return '';
            const row = bodyWrapper.querySelector('tbody tr'); 
            if (!row) return '';
            const cells = Array.from(row.querySelectorAll('td .cell'));
            if (cells[index]) return (cells[index].textContent || '').trim();
            return '';
        } catch(e) { return ''; }
    };

    const getTextAfterLabel = (label) => {
        // 🔥 MAGIA: Usamos textContent en lugar de innerText
        const el = [...document.querySelectorAll("div.mb-10")].find(el => (el.textContent || "").includes(label));
        if (!el) return "";
        const clone = el.cloneNode(true);
        clone.querySelectorAll('button').forEach(b => b.remove());
        const textoFull = (clone.textContent || "").trim();
        return textoFull.includes(":") ? textoFull.substring(textoFull.indexOf(":") + 1).trim() : "";
    };

    function getCountryData() {
        const currentUrl = window.location.href;
        for (const config of DOMAIN_CONFIG) {
            for (const domainBase of config.domains) {
                if (currentUrl.startsWith(domainBase)) return { prefix: config.prefix, name: config.country, digits: config.digits };
            }
        }
        return { prefix: "", name: "Desconocido", digits: 10 };
    }

    function getIDCorrecto() {
        const isVarious = window.location.href.includes("variousplan.com");
        const etiquetaBusqueda = isVarious ? "ID de orden" : "ID Plan de pago";
        const valor = getTextAfterLabel(etiquetaBusqueda);
        return isVarious ? valor : 'p' + valor;
    }

    function mostrarAvisoTemporal(mensaje, duracionMs = 3000, tipo = "info") {
        const avisosViejos = document.querySelectorAll('.addon-aviso-temp');
        avisosViejos.forEach(a => a.remove());
        const aviso = document.createElement("div"); aviso.className = 'addon-aviso-temp';
        let icono = "ℹ️"; let colorBorde = "#60a5fa";
        if (tipo === "success" || mensaje.includes("✅")) { icono = "✅"; colorBorde = "#34d399"; }
        if (tipo === "error" || mensaje.includes("🗑️")) { icono = "⛔"; colorBorde = "#f87171"; }
        aviso.innerHTML = `<span style="font-size:15px; margin-right:8px; align-self: flex-start; margin-top: 1px;">${icono}</span><span style="font-weight:600; font-size:13px; letter-spacing:0.3px; white-space: pre-wrap; text-align: left; line-height: 1.3;">${mensaje}</span>`;
        Object.assign(aviso.style, {
            position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)",
            padding: "8px 16px", backgroundColor: "rgba(15, 23, 42, 0.9)", color: "#ffffff", borderRadius: "30px",
            zIndex: Z_TOAST, borderLeft: `3px solid ${colorBorde}`, display: "flex", alignItems: "center",
            maxWidth: "400px", backdropFilter: 'blur(5px)'
        });
        document.body.appendChild(aviso);
        setTimeout(() => aviso.remove(), duracionMs);
    }

    function fixSpacing(str) { if (!str) return ""; return str.trim().replace(/([a-z])([A-Z])/g, '$1 $2'); }
    function toTitleCase(str) { if (!str) return ""; return str.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }); }

function procesarTags(texto) {
        const countryInfo = getCountryData(); 
        const valNombre = fixSpacing(getTextAfterLabel("Nombre"));
        
        // --- INICIO LÓGICA LINK ---
        let valLink = "";
        let valApp = "";
        const divApp = Array.from(document.querySelectorAll("div.mb-10")).find(el => el.textContent.includes("APP:"));
        if (divApp) {
            const spanApp = divApp.querySelector("span.el-tooltip");
            if (spanApp) {
                valApp = fixSpacing(spanApp.innerText.trim());
                const tooltipId = spanApp.getAttribute("aria-describedby");
                if (tooltipId) {
                    const tooltipEl = document.getElementById(tooltipId);
                    if (tooltipEl) {
                        valLink = tooltipEl.textContent.trim().split(" ")[0]; 
                    }
                }
                if (!valLink && valApp) {
                     valLink = `bit.ly/${valApp.replace(/\s+/g, '')}`;
                }
            }
        }
        // --- FIN LÓGICA LINK ---

        const valProducto = fixSpacing(getTextAfterLabel("Nombre del producto"));
        const valDeuda = getTextAfterLabel("Pago completo de la factura");
        const valProrroga = getTextAfterLabel("Importe de la factura de reinversión");
        const valTelefono = countryInfo.prefix.replace('+','') + getTextAfterLabel("Teléfono");
        const valPlazoTotal = getTextAfterLabel("Total de plazos");
        
        // Detectamos si estamos en detail3 y en Variousplan
        const isDetail3 = window.location.href.includes("/detail3");
        const isVarious = window.location.href.includes("variousplan.com");

        // Iniciamos vacíos por defecto (para que en detail2 no ponga nada)
        let valDiasMora = "";
        let valCargoMora = "";
        let valMontoPago = "";

        // Si es detail3, recién ahí hacemos la búsqueda en el DOM
        if (isDetail3) {
            if (isVarious) {
                // Lee directamente desde la tabla
                valDiasMora = obtenerValorTablaVarious("Días de mora");
                valCargoMora = obtenerValorTablaVarious("Cargo por mora");
                valMontoPago = obtenerValorTablaVarious("Monto del Contrato");
            } else {
                // Modo normal para Cashimex, CredNotas, etc.
                valDiasMora = getTextAfterLabel("Días de mora");
                valCargoMora = getTextAfterLabel("Cargo por mora");
                valMontoPago = getTextAfterLabel("Monto de pago");
            }
        }

        // 🔥 LÓGICA UNIFICADA DE CACHÉ (VISUAL CHECK)
        let valDesembolso = "---";
        let valPlazoActual = "---";

        const elPlazoDom = document.getElementById('v-plazo');
        if (elPlazoDom && elPlazoDom.innerText !== '--') {
            valPlazoActual = elPlazoDom.innerText.trim();
        }

        const idParaCache = getIDCorrecto(); 
        if (idParaCache) {
            const cacheKey = 'VC_CACHE_' + idParaCache;
            const cachedRaw = localStorage.getItem(cacheKey);
            if (cachedRaw) {
                try {
                    const data = JSON.parse(cachedRaw);
                    if (data.fechaDesembolso && data.fechaDesembolso.length > 5 && !data.fechaDesembolso.includes("No")) {
                        valDesembolso = data.fechaDesembolso;
                    }
                    if (data.plazo && data.plazo !== "--") {
                        valPlazoActual = data.plazo;
                    }
                } catch(e) {}
            }
        }

        let textoProcesado = texto
            .replace(/{{NOMBRE}}/g, valNombre.toUpperCase()).replace(/{{nombre}}/g, valNombre.toLowerCase()).replace(/{{Nombre}}/g, toTitleCase(valNombre))        
            .replace(/{{APP}}/g, valApp.toUpperCase()).replace(/{{app}}/g, valApp.toLowerCase()).replace(/{{App}}/g, toTitleCase(valApp))
            .replace(/{{LINK}}/g, valLink)
            .replace(/{{PRODUCTO}}/g, valProducto.toUpperCase()).replace(/{{producto}}/g, valProducto.toLowerCase()).replace(/{{Producto}}/g, toTitleCase(valProducto))
            .replace(/{{DEUDA TOTAL}}/g, valDeuda).replace(/{{PRORROGA}}/g, valProrroga).replace(/{{TELEFONO}}/g, valTelefono)
            .replace(/{{PLAZO TOTAL}}/g, valPlazoTotal)
            .replace(/{{PLAZO ACTUAL}}/g, valPlazoActual)
            .replace(/{{DESEMBOLSO}}/g, valDesembolso)
            .replace(/{{DIAS MORA}}/g, valDiasMora)
            .replace(/{{CARGO MORA}}/g, valCargoMora)
            .replace(/{{MONTO CONTRATO}}/g, valMontoPago);

        // 🔥 MAGIA MATEMÁTICA: Etiquetas de porcentaje (EJ: {{-10%}} o {{+15%}}) SOLO EN DETAIL3
        if (isDetail3) {
            textoProcesado = textoProcesado.replace(/\{\{([+-]\d+(?:\.\d+)?)%\}\}/g, (match, porcentajeStr) => {
                const porcentaje = parseFloat(porcentajeStr);
                
                const numCargoMora = parseFloat(valCargoMora.replace(/[^0-9.-]+/g, "")) || 0;
                const numMontoPago = parseFloat(valMontoPago.replace(/[^0-9.-]+/g, "")) || 0;
                
                const multiplicador = 1 + (porcentaje / 100);
                const nuevoCargoMora = numCargoMora * multiplicador;
                
                const totalFinal = numMontoPago + nuevoCargoMora;
                
                return Math.round(totalFinal).toString();
            });
        }

        return textoProcesado;
    }
    // 4. LÓGICA DE PLANTILLAS
    function guardarBoton(nombre, contenido) {
        const botones = JSON.parse(localStorage.getItem('CUSTOM_BTNS_LIST') || "[]");
        botones.push({ id: Date.now(), nombre, contenido });
        localStorage.setItem('CUSTOM_BTNS_LIST', JSON.stringify(botones));
        renderizarBotonesCustom(); 
    }
    function actualizarBoton(id, nombre, contenido) {
        const botones = JSON.parse(localStorage.getItem('CUSTOM_BTNS_LIST') || "[]");
        const index = botones.findIndex(b => b.id === id);
        if(index !== -1) {
            botones[index].nombre = nombre; botones[index].contenido = contenido;
            localStorage.setItem('CUSTOM_BTNS_LIST', JSON.stringify(botones));
            renderizarBotonesCustom();
            mostrarAvisoTemporal("Plantilla actualizada ✅", 2000, "success");
        }
    }
    function eliminarBoton(id) {
        let botones = JSON.parse(localStorage.getItem('CUSTOM_BTNS_LIST') || "[]");
        botones = botones.filter(b => b.id !== id);
        localStorage.setItem('CUSTOM_BTNS_LIST', JSON.stringify(botones));
        renderizarBotonesCustom();
        mostrarAvisoTemporal("Botón eliminado 🗑️", 2000, "error");
    }

    function mostrarModalCreacion(botonEditar = null) {
        if(document.getElementById('modal-creador-btn')) return;
        const backdrop = document.createElement('div');
        Object.assign(backdrop.style, { position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', zIndex: '2147483643', backdropFilter: 'blur(5px)' });
        backdrop.id = 'modal-creador-btn';
        const wrapper = document.createElement('div');
        Object.assign(wrapper.style, WRAPPER_STYLE);
        const sidebar = document.createElement('div');
        sidebar.id = 'floating-tag-preview';
        Object.assign(sidebar.style, SIDEBAR_STYLE);
        wrapper.appendChild(sidebar);
        const modal = document.createElement('div');
        Object.assign(modal.style, MODAL_STYLE);
        wrapper.appendChild(modal);
        backdrop.appendChild(wrapper);
        document.body.appendChild(backdrop);
        
        const titulo = botonEditar ? "Editar Plantilla" : "Crear Nueva Plantilla";
        const valNombre = botonEditar ? botonEditar.nombre : "";
        const valContenido = botonEditar ? botonEditar.contenido : "";
        
        modal.innerHTML = `
            <h3 style="margin:0 0 10px 0; color:#fff; font-size: 18px; font-weight: 700; text-shadow: 0 0 10px rgba(255,255,255,0.1);">${titulo}</h3>
            <input type="text" id="new-btn-name" value="${valNombre}" placeholder="Ej: Wpp Saludo" style="padding:12px; border:1px solid rgba(255,255,255,0.2); border-radius:8px; font-size:14px; margin-bottom: 12px; width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.3); color: white; outline: none; transition: border 0.3s;">
            <div style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                <textarea id="new-btn-content" style="padding: 12px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; resize: none; font-family: 'Segoe UI', sans-serif; font-size: 13px; line-height: 1.5; width: 100%; height: 100%; box-sizing: border-box; flex: 1; background: rgba(0,0,0,0.3); color: white; outline: none; transition: border 0.3s;" placeholder="Hola {{Nombre}}...">${valContenido}</textarea>
            </div>
            <div style="font-size:11px; color:#cbd5e1; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; line-height: 1.5; margin-top:12px; border: 1px dashed rgba(255,255,255,0.1);">
                <strong style="color: #38bdf8;">Opciones:</strong> Escribe las variables entre llaves. Usa el botón "Guía" para ver valores reales.
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
                <div style="display:flex; gap:8px;">
                    <button id="btn-import" title="Subir archivo de Backup" style="padding:8px 12px; cursor:pointer; border:1px solid rgba(245, 158, 11, 0.3); background:rgba(245, 158, 11, 0.1); color:#f59e0b; border-radius:8px; font-weight:600; transition:all 0.2s; display:flex; align-items:center; gap:5px;">📥 Importar</button>
                    <button id="btn-export" title="Descargar archivo de Backup" style="padding:8px 12px; cursor:pointer; border:1px solid rgba(16, 185, 129, 0.3); background:rgba(16, 185, 129, 0.1); color:#10b981; border-radius:8px; font-weight:600; transition:all 0.2s; display:flex; align-items:center; gap:5px;">📤 Exportar</button>
                </div>
                
                <div style="display:flex; gap:10px;">
                    <button id="btn-guide" style="padding:8px 18px; cursor:pointer; border:1px solid rgba(56, 189, 248, 0.3); background:rgba(56, 189, 248, 0.1); color:#38bdf8; border-radius:8px; font-weight:600; transition:all 0.2s;">Guía</button>
                    <button id="btn-cancel" style="padding:8px 18px; cursor:pointer; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#e2e8f0; border-radius:8px; font-weight:600; transition:all 0.2s;">Cancelar</button>
                    <button id="btn-save" style="padding:8px 18px; cursor:pointer; border:none; background: linear-gradient(135deg, #38bdf8, #2563eb); color:white; border-radius:8px; font-weight:600; box-shadow: 0 4px 15px rgba(56, 189, 248, 0.4); transition:all 0.2s;">Guardar</button>
                </div>
            </div>
        `;
        
        // 🎨 EVENTOS VISUALES (Bordes en Inputs)
        const inputs = modal.querySelectorAll('input, textarea');
        inputs.forEach(el => { el.onfocus = () => el.style.borderColor = "#38bdf8"; el.onblur = () => el.style.borderColor = "rgba(255,255,255,0.2)"; });
        
        // 🚀 SISTEMA MAESTRO DE ANIMACIONES PARA LOS 5 BOTONES
        const animateBtn = (id, hoverBg, defaultBg, hasShadow = false) => {
            const btn = document.getElementById(id);
            if(!btn) return;
            btn.onmouseenter = () => { 
                btn.style.transform = "translateY(-2px)"; 
                btn.style.background = hoverBg;
                if(hasShadow) btn.style.boxShadow = "0 6px 20px rgba(56, 189, 248, 0.6)";
            };
            btn.onmouseleave = () => { 
                btn.style.transform = "translateY(0)"; 
                btn.style.background = defaultBg;
                if(hasShadow) btn.style.boxShadow = "0 4px 15px rgba(56, 189, 248, 0.4)";
            };
            btn.onmousedown = () => btn.style.transform = "scale(0.95)";
        };

        animateBtn('btn-save', 'linear-gradient(135deg, #38bdf8, #2563eb)', 'linear-gradient(135deg, #38bdf8, #2563eb)', true);
        animateBtn('btn-guide', 'rgba(56, 189, 248, 0.2)', 'rgba(56, 189, 248, 0.1)');
        animateBtn('btn-cancel', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)');
        animateBtn('btn-export', 'rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)');
        animateBtn('btn-import', 'rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.1)');

        // --- ⚡ LÓGICA DEL BOTÓN GUÍA ---
        document.getElementById('btn-guide').onclick = () => {
            const tagMap = [
                { tag: '{{NOMBRE}}', desc: 'Mayúscula' }, { tag: '{{Nombre}}', desc: 'Título' }, { tag: '{{nombre}}', desc: 'Minúscula' },
                { tag: '{{APP}}', desc: 'Mayúscula' }, { tag: '{{App}}', desc: 'Título' }, { tag: '{{app}}', desc: 'Minúscula' },
                { tag: '{{PRODUCTO}}', desc: 'Mayúscula' }, { tag: '{{Producto}}', desc: 'Título' }, { tag: '{{producto}}', desc: 'Minúscula' },
                { tag: '{{LINK}}', desc: 'Enlace Directo' }, { tag: '{{TELEFONO}}', desc: 'Con Prefijo' },
                { tag: '{{DEUDA TOTAL}}', desc: 'Monto Total' }, { tag: '{{PRORROGA}}', desc: 'Monto Renov.' },
                { tag: '{{PLAZO TOTAL}}', desc: 'Cantida de Días' }, { tag: '{{PLAZO ACTUAL}}', desc: 'Plazo Actual' },
                { tag: '{{DESEMBOLSO}}', desc: 'Fecha de Desembolso' }
            ];
            
            const isDetail3 = window.location.href.includes("/detail3");

            if (isDetail3) {
                tagMap.push(
                    { tag: '{{DIAS MORA}}', desc: 'Días de atraso' }, 
                    { tag: '{{CARGO MORA}}', desc: 'Penalidad' }, 
                    { tag: '{{MONTO CONTRATO}}', desc: 'Monto de pago' },
                    { isDynamic: true } // 🔥 NUEVO: Casilla dinámica integrada en la cuadrícula
                );
            }
            
            let gridHtml = tagMap.map(item => {
                // Si es el ítem especial interactivo, dibujamos la calculadora miniatura
                if (item.isDynamic) {
                    const initialTag = '{{-10%}}';
                    const initialPreview = procesarTags(initialTag);
                    return `
                    <div style="background:rgba(56,189,248,0.05); padding:8px 10px; border-radius:8px; border:1px solid rgba(56,189,248,0.4); display:flex; flex-direction:column; gap:4px; box-shadow: inset 0 0 10px rgba(56,189,248,0.05);">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap: 4px;">
                                <code id="dyn-pct-code" style="color:#fbbf24; font-family:monospace; font-size:11px; background:rgba(251,191,36,0.15); padding:2px 4px; border-radius:4px;">${initialTag}</code>
                                <button class="btn-copy-tag" id="dyn-pct-copy" data-tag="${initialTag}" title="Copiar etiqueta"
                                    style="border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#94a3b8; border-radius:12px; padding:1px 8px; font-size:9px; cursor:pointer; transition:all 0.2s; outline:none; font-weight:600;">
                                    Copiar
                                </button>
                            </div>
                            <span style="font-size:9px; color:#38bdf8; text-transform:uppercase; font-weight:bold;">Calc. Mora</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
                            <div style="display:flex; align-items:center; gap: 2px; background: rgba(0,0,0,0.4); padding: 2px 4px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15);">
                                 <button id="btn-pct-minus" style="background:rgba(239,68,68,0.2); color:#ef4444; border:none; border-radius:4px; cursor:pointer; width:18px; height:18px; font-size:14px; font-weight:bold; display:flex; align-items:center; justify-content:center; line-height:1; padding-bottom:2px;" onmouseover="this.style.background='rgba(239,68,68,0.4)'" onmouseout="this.style.background='rgba(239,68,68,0.2)'">-</button>
                                 <input type="number" id="input-pct-val" value="-10" step="1" min="-100" max="100" style="width: 30px; background: transparent; border: none; color: white; text-align: center; font-size: 12px; font-weight:bold; outline: none; -moz-appearance: textfield; padding:0;" title="Límite -100 a 100">
                                 <span style="font-size:10px; color:#94a3b8; font-weight:bold;">%</span>
                                 <button id="btn-pct-plus" style="background:rgba(34,197,94,0.2); color:#22c55e; border:none; border-radius:4px; cursor:pointer; width:18px; height:18px; font-size:14px; font-weight:bold; display:flex; align-items:center; justify-content:center; line-height:1; padding-bottom:1px;" onmouseover="this.style.background='rgba(34,197,94,0.4)'" onmouseout="this.style.background='rgba(34,197,94,0.2)'">+</button>
                            </div>
                            <span id="dyn-pct-preview" style="color:#e2e8f0; font-size:12px; font-weight:800;" title="${initialPreview}">
                                ${initialPreview}
                            </span>
                        </div>
                        <style> #input-pct-val::-webkit-inner-spin-button, #input-pct-val::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } </style>
                    </div>`;
                } 
                // Si es un ítem normal, lo dibuja como siempre
                else {
                    const val = procesarTags(item.tag);
                    return `
                    <div style="background:rgba(255,255,255,0.05); padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:4px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap: 6px;">
                                <code style="color:#fbbf24; font-family:monospace; font-size:11px; background:rgba(251,191,36,0.1); padding:2px 4px; border-radius:4px;">${item.tag}</code>
                                <button class="btn-copy-tag" data-tag="${item.tag}" title="Copiar etiqueta"
                                    style="border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#94a3b8; border-radius:12px; padding:1px 8px; font-size:9px; cursor:pointer; transition:all 0.2s; outline:none; font-weight:600;">
                                    Copiar
                                </button>
                            </div>
                            <span style="font-size:9px; color:#94a3b8; text-transform:uppercase;">${item.desc}</span>
                        </div>
                        <span style="color:#e2e8f0; font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${val}">
                            ${val || '<span style="color:rgba(255,255,255,0.2); font-style:italic;">(Vacío)</span>'}
                        </span>
                    </div>`;
                }
            }).join('');

            const guideContent = document.createElement('div');
            Object.assign(guideContent.style, {
                position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
                backgroundColor: 'rgba(15, 23, 42, 0.98)', zIndex: '10', padding: '20px',
                boxSizing: 'border-box', overflowY: 'auto', borderRadius: '16px',
                display: 'flex', flexDirection: 'column'
            });
            
            guideContent.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:10px; margin-bottom:15px;">
                    <div>
                        <h3 style="margin:0; color:#38bdf8; font-size:16px;">📚 Guía de Variables</h3>
                        <span style="font-size:11px; color:#94a3b8;">Vista previa con datos reales detectados.</span>
                    </div>
                    <button id="close-guide" style="background:none; border:none; color:#94a3b8; font-size:24px; cursor:pointer; padding:0 10px;">&times;</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-bottom: 20px;">
                    ${gridHtml}
                </div>
            `;
            
            modal.appendChild(guideContent);
            guideContent.querySelector('#close-guide').onclick = () => guideContent.remove();

            // 🔥 3. DAMOS VIDA A LA CALCULADORA 🔥
            if (isDetail3) {
                const inputPct = guideContent.querySelector('#input-pct-val');
                const btnMinus = guideContent.querySelector('#btn-pct-minus');
                const btnPlus = guideContent.querySelector('#btn-pct-plus');
                const codePct = guideContent.querySelector('#dyn-pct-code');
                const copyPct = guideContent.querySelector('#dyn-pct-copy');
                const previewPct = guideContent.querySelector('#dyn-pct-preview');

                const updateDynamicPercent = () => {
                    let val = parseInt(inputPct.value) || 0;
                    
                    // 🔥 LIMITAMOS ENTRE -100 y +100
                    if (val > 100) val = 100;
                    if (val < -100) val = -100;
                    inputPct.value = val; // Actualiza la casilla por si escribió "500"

                    const sign = val > 0 ? '+' : ''; // Le ponemos + si es mayor a 0
                    const tagStr = `{{${sign}${val}%}}`;
                    
                    codePct.innerText = tagStr;
                    copyPct.setAttribute('data-tag', tagStr);
                    
                    // Lo pasamos a la función original que procesa etiquetas
                    const calc = procesarTags(tagStr); 
                    previewPct.innerText = calc;
                    previewPct.title = calc;
                };

                // Sumar/Restar de 10 en 10
                btnMinus.onclick = () => { inputPct.value = (parseInt(inputPct.value) || 0) - 10; updateDynamicPercent(); };
                btnPlus.onclick = () => { inputPct.value = (parseInt(inputPct.value) || 0) + 10; updateDynamicPercent(); };
                
                inputPct.oninput = updateDynamicPercent;
            }

            // Eventos para todos los botones de "Copiar"
            guideContent.querySelectorAll('.btn-copy-tag').forEach(btn => {
                btn.onmouseenter = () => { btn.style.background = '#38bdf8'; btn.style.color = '#fff'; btn.style.borderColor = '#38bdf8'; };
                btn.onmouseleave = () => { 
                    if (btn.innerText !== 'Listo') {
                        btn.style.background = 'rgba(255,255,255,0.05)'; btn.style.color = '#94a3b8'; btn.style.borderColor = 'rgba(255,255,255,0.1)'; 
                    }
                };
                btn.onclick = () => {
                    const tag = btn.getAttribute('data-tag');
                    navigator.clipboard.writeText(tag).then(() => {
                        btn.innerText = 'Listo';
                        btn.style.background = '#10b981'; btn.style.color = '#fff'; btn.style.borderColor = '#10b981';
                        setTimeout(() => {
                            btn.innerText = 'Copiar';
                            btn.style.background = 'rgba(255,255,255,0.05)'; btn.style.color = '#94a3b8'; btn.style.borderColor = 'rgba(255,255,255,0.1)';
                        }, 1000);
                    });
                };
            });
        };

        // 🔥 LÓGICA EXPORTAR
        document.getElementById('btn-export').onclick = () => {
            const currentUrl = window.location.href;
            const currentConfig = DOMAIN_CONFIG.find(c => c.domains.some(d => currentUrl.includes(d)));
            let countryName = currentConfig ? currentConfig.country : 'GLOBAL';
            countryName = countryName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").replace(/_$/, "").toUpperCase();

            const data = localStorage.getItem('CUSTOM_BTNS_LIST') || "[]";
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Plantillas_SST_${countryName}_${new Date().toISOString().slice(0,10)}.json`; 
            a.click();
            URL.revokeObjectURL(url);
            mostrarAvisoTemporal(`Backup de ${countryName} descargado 📤`, 2500, "success");
        };

        // 🔥 LÓGICA IMPORTAR
        document.getElementById('btn-import').onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json, .txt';
            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = event => {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (Array.isArray(data)) {
                            localStorage.setItem('CUSTOM_BTNS_LIST', JSON.stringify(data));
                            renderizarBotonesCustom();
                            mostrarAvisoTemporal("Plantillas restauradas ✅", 2000, "success");
                            backdrop.remove(); 
                        } else alert("⚠️ El archivo no tiene el formato correcto de plantillas.");
                    } catch(err) { alert("❌ Error: Archivo corrupto o inválido."); }
                };
                reader.readAsText(file);
            };
            input.click(); 
        };

        // LÓGICA GUARDAR Y CANCELAR
        document.getElementById('btn-cancel').onclick = () => backdrop.remove();
        document.getElementById('btn-save').onclick = () => {
            const nombre = document.getElementById('new-btn-name').value.trim();
            const contenido = document.getElementById('new-btn-content').value;
            if(!nombre || !contenido) { alert("Llena ambos campos"); return; }
            if (botonEditar) { actualizarBoton(botonEditar.id, nombre, contenido); } else { guardarBoton(nombre, contenido); }
            backdrop.remove();
            if (!botonEditar) mostrarAvisoTemporal("¡Botón creado! ✅", 2000, "success");
        };

        const txtArea = document.getElementById('new-btn-content');
        const actualizarPreview = () => {
            const contenido = txtArea.value; const regex = /{{(.*?)}}/g; const matches = [...contenido.matchAll(regex)];
            if (matches.length === 0) { sidebar.style.display = 'none'; return; }
            sidebar.style.display = 'block'; 
            const tagsUnicos = [...new Set(matches.map(m => m[0]))];
            sidebar.innerHTML = tagsUnicos.map(tag => `<div style="margin-bottom:8px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:4px;"><strong style="color:#38bdf8;">${tag}</strong><br><span style="color:#e2e8f0; font-weight:500;">${procesarTags(tag)}</span></div>`).join("");
        };
        txtArea.addEventListener('input', actualizarPreview);
        if(valContenido) actualizarPreview();
    }

    function renderizarBotonesCustom() {
        const containerId = 'custom-btns-container';
        let container = document.getElementById(containerId);
        const currentUrl = window.location.href;
        const esRutaDetalle = RUTAS_PERMITIDAS.some(path => currentUrl.includes(path));

        if (!esRutaDetalle) { if (container) container.remove(); return; }
        if (!container) {
            container = document.createElement('div'); container.id = containerId;
            Object.assign(container.style, { position: 'fixed', bottom: '5px', right: '20px', zIndex: Z_UI_LAYER, display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-end', gap: '4px', pointerEvents: 'none' });
            document.body.appendChild(container);
        }
        container.innerHTML = ''; 
        const btnCrear = document.createElement("div"); btnCrear.innerText = "➕ Crear Plantilla";
        applyGlassPillStyle(btnCrear, '#38bdf8'); btnCrear.style.pointerEvents = 'auto'; btnCrear.onclick = () => mostrarModalCreacion(null);
        container.appendChild(btnCrear);
        const botonesGuardados = JSON.parse(localStorage.getItem('CUSTOM_BTNS_LIST') || "[]");
        botonesGuardados.forEach(b => {
            const row = document.createElement("div"); row.style.display = "flex"; row.style.alignItems = "center"; row.style.justifyContent = "flex-end"; row.style.gap = "2px"; row.style.pointerEvents = 'auto'; 
            const toolsPanel = document.createElement("div");
            Object.assign(toolsPanel.style, { display: "flex", alignItems: "center", backgroundColor: "rgba(10, 15, 30, 0.95)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "14px", height: "28px", backdropFilter: "blur(10px)", overflow: "hidden", marginRight: "2px" });
            const createToolBtn = (text, title, colorHover, onClick) => {
                const tb = document.createElement("button"); tb.innerText = text; tb.title = title;
                Object.assign(tb.style, { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px", fontWeight: "bold", width: "28px", height: "100%", padding: "0", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" });
                tb.onmouseenter = () => { tb.style.background = "rgba(255,255,255,0.1)"; tb.style.color = colorHover; };
                tb.onmouseleave = () => { tb.style.background = "transparent"; tb.style.color = "#94a3b8"; };
                tb.onclick = (e) => { e.stopPropagation(); onClick(e); };
                return tb;
            };
            const btnDel = createToolBtn("×", "Eliminar", "#ef4444", () => { if(confirm(`¿Borrar "${b.nombre}"?`)) eliminarBoton(b.id); });
            btnDel.style.borderRight = "1px solid rgba(255,255,255,0.1)";
            const btnEd = createToolBtn("✏️", "Editar", "#f59e0b", () => mostrarModalCreacion(b));
            btnEd.style.fontSize = "12px";
            toolsPanel.appendChild(btnDel); toolsPanel.appendChild(btnEd);
            const btnAction = document.createElement("div"); btnAction.innerText = b.nombre;
            applyGlassPillStyle(btnAction, '#a855f7');
            btnAction.onclick = () => { navigator.clipboard.writeText(procesarTags(b.contenido)).then(() => mostrarAvisoTemporal(`Copiado: ${b.nombre} ✅`)); };
            row.appendChild(toolsPanel); row.appendChild(btnAction); container.appendChild(row);
        });
    }

    // 5. NUEVO PANEL DE HERRAMIENTAS
    function injectToolsPanel() {
        if (document.getElementById('wrapper-tools-panel')) return;
        const countryInfo = getCountryData();
        const prefixClean = countryInfo.prefix.replace('+', '');
        const getAllReferences = () => {
            const refs = [];
            document.querySelectorAll('div.mb-10').forEach(div => {
                const text = div.textContent || ""; // 🔥 MAGIA AQUÍ TAMBIÉN
                const match = REFERENCE_LABELS.find(l => text.includes(l) && !text.includes("Teléfono") && !text.includes("Correo"));
                if (match) {
                    const cleanNum = text.split(':')[1]?.trim().replace(/[^0-9]/g, '');
                    if (cleanNum && cleanNum.length >= countryInfo.digits) {
                        const finalNum = prefixClean + cleanNum.slice(-countryInfo.digits);
                        refs.push({ label: match, number: finalNum });
                    }
                }
            });
            const uniqueRefs = []; const seen = new Set();
            for (const r of refs) { if (!seen.has(r.number)) { seen.add(r.number); uniqueRefs.push(r); } }
            return uniqueRefs;
        };
        const clientPhoneClean = getTextAfterLabel("Teléfono");
        const clientPhoneFinal = clientPhoneClean ? (prefixClean + clientPhoneClean) : null;
        const references = getAllReferences();

        const wrapper = document.createElement('div'); wrapper.id = 'wrapper-tools-panel';
        Object.assign(wrapper.style, { position: 'fixed', right: '0', top: '0', zIndex: Z_UI_LAYER, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pointerEvents: 'none', fontFamily: "'Segoe UI', sans-serif" });

        const panel = document.createElement('div'); panel.id = 'panel-tools-content';
        Object.assign(panel.style, { pointerEvents: 'auto', backgroundColor: 'rgba(10, 15, 30, 0.75)', backdropFilter: 'blur(20px)', webkitBackdropFilter: 'blur(20px)', padding: '10px', borderRadius: '12px', display: 'none', flexDirection: 'column', gap: '5px', width: '220px', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)', marginRight: '10px', marginTop: '10px', transformOrigin: 'top right' });

        const toggleBtn = document.createElement('div'); toggleBtn.id = 'btn-toggle-tools';
        Object.assign(toggleBtn.style, { width: '30px', height: '30px', backgroundColor: 'rgba(10, 15, 30, 0.95)', color: 'white', borderRadius: '0 0 0 20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', paddingRight: '7px', paddingTop: '1px', boxSizing: 'border-box', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', lineHeight: '1.2', transition: 'all 0.3s ease', borderLeft: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)', boxShadow: '-3px 3px 10px rgba(0,0,0,0.3)', pointerEvents: 'auto', backdropFilter: 'blur(10px)' });
        toggleBtn.innerHTML = '+';
        toggleBtn.onmouseenter = () => { toggleBtn.style.width = '35px'; toggleBtn.style.height = '35px'; toggleBtn.style.color = '#38bdf8'; toggleBtn.style.borderColor = '#38bdf8'; };
        toggleBtn.onmouseleave = () => { toggleBtn.style.width = '30px'; toggleBtn.style.height = '30px'; toggleBtn.style.color = 'white'; toggleBtn.style.borderColor = 'rgba(255,255,255,0.2)'; };

        const setPanelState = (isOpen) => { if (isOpen) { toggleBtn.style.display = 'none'; panel.style.display = 'flex'; panel.style.opacity = '1'; panel.style.transform = 'scale(1) translateX(0)'; } else { panel.style.display = 'none'; toggleBtn.style.display = 'flex'; } };
        const openPanel = () => { setPanelState(true); localStorage.setItem('TOOLS_PANEL_STATE', 'open'); };
        const closePanel = () => { setPanelState(false); localStorage.setItem('TOOLS_PANEL_STATE', 'closed'); };
        const globalState = localStorage.getItem('TOOLS_PANEL_STATE');
        if (globalState === 'open') { toggleBtn.style.display = 'none'; panel.style.display = 'flex'; } else { panel.style.display = 'none'; toggleBtn.style.display = 'flex'; }
        toggleBtn.onclick = openPanel;

        const minimizeInPanel = document.createElement('div'); minimizeInPanel.innerHTML = '×';
        Object.assign(minimizeInPanel.style, { position: 'absolute', top: '2px', left: '6px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '18px', fontWeight: 'bold' });
        minimizeInPanel.onclick = closePanel;
        minimizeInPanel.onmouseenter = () => minimizeInPanel.style.color = '#fff';
        minimizeInPanel.onmouseleave = () => minimizeInPanel.style.color = 'rgba(255,255,255,0.5)';

        const headerLabel = document.createElement('div');
        headerLabel.innerHTML = `<span style="font-size:12px; letter-spacing: 0.5px;">🛠️ HERRAMIENTAS</span>`;
        headerLabel.style.cssText = 'color: white; font-weight: 800; text-align: center; margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px; padding-left: 20px;';
        panel.append(minimizeInPanel, headerLabel);

        const createBtn = (text, icon, color, action) => {
            const btn = document.createElement('button'); btn.innerHTML = `<span style="margin-right:6px;">${icon}</span>${text}`;
            Object.assign(btn.style, { padding: '6px 5px', width: '100%', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', marginBottom: '4px' });
            applyDynamicHover(btn, color); btn.onclick = action; panel.appendChild(btn);
        };
        const createSectionTitle = (text) => {
            const div = document.createElement('div'); div.innerText = text;
            Object.assign(div.style, { fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', marginTop: '0px', marginBottom: '1px', textAlign: 'center', lineHeight: '0.5' });
            panel.appendChild(div);
        };
        const createDoubleBtnRow = (number) => {
            const row = document.createElement('div'); Object.assign(row.style, { display: 'flex', gap: '4px', width: '100%', marginBottom: '4px' });
            const createSubBtn = (text, bgHover, action) => {
                const btn = document.createElement('button'); btn.innerText = text;
                Object.assign(btn.style, { flex: 1, padding: '6px 0', fontSize: '11px', borderRadius: '6px', cursor: number ? 'pointer' : 'not-allowed', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: number ? '#e2e8f0' : '#475569', transition: 'all 0.2s' });
                if (number) {
                    btn.onmouseenter = () => { btn.style.backgroundColor = bgHover; btn.style.color = 'white'; btn.style.borderColor = bgHover; };
                    btn.onmouseleave = () => { btn.style.backgroundColor = 'rgba(255,255,255,0.05)'; btn.style.color = '#e2e8f0'; btn.style.borderColor = 'rgba(255,255,255,0.1)'; };
                    btn.onclick = action;
                }
                return btn;
            };
            row.append(createSubBtn('Copiar', '#3b82f6', () => { navigator.clipboard.writeText(number).then(() => mostrarAvisoTemporal(`Copiado: ${number} 📋`, 1500)); }), createSubBtn('TGM', '#22c55e', () => { window.location.href = `tg://resolve?phone=${number}`; }));
            panel.appendChild(row);
        };

        createBtn('Exportar', '📂', '#f59e0b', () => {
            let id = getIDCorrecto(); const prefixClean = countryInfo.prefix.replace('+', ''); 
            const refs = REFERENCE_LABELS.map(l => { if(l === "Teléfono" || l === "Correo electrónico") return ""; const v = getTextAfterLabel(l); return v ? `${l}\t${prefixClean}${v.replace(/[^0-9]/g, '').slice(-countryInfo.digits)}` : ""; }).filter(x => x);
            
            // 🔥 Exportación inteligente según detail2 o detail3
            const isDetail3 = window.location.href.includes("/detail3");
            const isVarious = window.location.href.includes("variousplan.com");
            const baseData = [
                id, getTextAfterLabel("Nombre"), (document.querySelector("span.el-tooltip")?.innerText || ""), 
                getTextAfterLabel("Nombre del producto"), getTextAfterLabel("Pago completo de la factura"), 
                getTextAfterLabel("Importe de la factura de reinversión")
            ];

            // Solo agregamos las columnas de mora si es detail3
            if (isDetail3) {
                if (isVarious) {
                    baseData.push(
                        obtenerValorTablaVarious("Días de mora"), 
                        obtenerValorTablaVarious("Cargo por mora"), 
                        obtenerValorTablaVarious("Monto del Contrato")
                    );
                } else {
                    baseData.push(
                        getTextAfterLabel("Días de mora"), 
                        getTextAfterLabel("Cargo por mora"), 
                        getTextAfterLabel("Monto de pago")
                    );
                }
            }

            // Agregamos correo, teléfono y referencias al final
            baseData.push(
                getTextAfterLabel("Correo electrónico"), 
                (prefixClean + getTextAfterLabel("Teléfono")), 
                ...refs
            );

            const txt = baseData.join("\t");
            
            navigator.clipboard.writeText(txt).then(() => mostrarAvisoTemporal(`Datos exportados ✅`));
        });
        createBtn('Correo', '📧', '#8b5cf6', () => { const c = getTextAfterLabel("Correo electrónico"); navigator.clipboard.writeText(c).then(() => mostrarAvisoTemporal(`Copiado: ${c} 📧`)); });
        createSectionTitle("TELÉFONO CLIENTE"); createDoubleBtnRow(clientPhoneFinal);
        if (references.length > 0) { createSectionTitle("TELÉFONO REFERENCIAS"); references.forEach(ref => { createDoubleBtnRow(ref.number); }); }

        wrapper.append(toggleBtn, panel); document.body.appendChild(wrapper);
    }
// 🔥 FUNCIÓN "BULLDOG": NO SUELTA HASTA QUE APARECE EL DATO
// 🔥 FUNCIÓN HÍBRIDA "BULLDOG": BUSCA, ESPERA Y COMPARTE INFORMACIÓN
    async function obtenerFechaDesembolsoScript() {
        // 1. OBTENER ID PARA LA LLAVE DE CACHÉ
        const currentId = getIDCorrecto(); 
        const cacheKey = currentId ? ('VC_CACHE_' + currentId) : null;

        // 2. VERIFICAR SI EL VISUAL CHECK YA GANÓ (LEER CACHÉ)
        try {
            if (cacheKey) {
                const cachedRaw = localStorage.getItem(cacheKey);
                if (cachedRaw) {
                    const data = JSON.parse(cachedRaw);
                    // Si ya existe la fecha, la tomamos prestada y terminamos (0ms)
                    if (data.fechaDesembolso && data.fechaDesembolso.length > 5 && !data.fechaDesembolso.includes("No")) {
                        console.log("⚡ Usando fecha ganada por Visual Check");
                        return data.fechaDesembolso;
                    }
                }
            }
        } catch (err) {}

        // 3. SI NO ESTÁ EN CACHÉ, NOS TOCA BUSCAR A NOSOTROS (MODAL)
        try {
            const botones = Array.from(document.querySelectorAll('button span'));
            const btnFundamento = botones.find(span => span.innerText.trim() === "Fundamento de desembolso");

            if (!btnFundamento) return "No disponible";

            btnFundamento.parentElement.click();

            // Espera agresiva (hasta 5 segundos)
            let intentos = 0;
            let datoFinal = null;

            while (intentos < 50) {
                const dialogs = document.querySelectorAll('.el-dialog__body');
                for (let dialog of dialogs) {
                    if (dialog.innerText.trim() === "") continue;
                    const labels = dialog.querySelectorAll('.item div:first-child');
                    for (let label of labels) {
                        if (label.innerText.includes("Hora de confirmación")) {
                            const valorDiv = label.nextElementSibling;
                            if (valorDiv && valorDiv.innerText.length > 5) {
                                datoFinal = valorDiv.innerText.trim().split(' ')[0];
                                break;
                            }
                        }
                    }
                    if (datoFinal) break;
                }
                if (datoFinal) break;
                await new Promise(r => setTimeout(r, 100));
                intentos++;
            }

            // Cerrar modal
            const btnApagaSpan = Array.from(document.querySelectorAll('.el-dialog__footer button span')).find(s => s.innerText.trim() === "Apaga");
            if (btnApagaSpan) btnApagaSpan.parentElement.click();
            
            await new Promise(r => setTimeout(r, 100));

            if (!datoFinal) return "No encontrada";

            // 4. 🔥 ¡AQUÍ ESTÁ EL TRUCO! GUARDAMOS EL DATO PARA QUE EL OTRO SCRIPT NO TRABAJE
            if (cacheKey) {
                // Leemos lo que haya (quizás user ID o plazo) y le agregamos la fecha
                const existingCache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
                existingCache.fechaDesembolso = datoFinal;
                existingCache.timestamp = Date.now();
                localStorage.setItem(cacheKey, JSON.stringify(existingCache));
                console.log("🏆 Botón Soporte ganó: Fecha guardada para Visual Check");
            }

            return datoFinal;

        } catch (e) {
            console.error("Error:", e);
            return "Error";
        }
    }
    // 6. MEJORAS NATIVAS

    function renderizarMejorasNativas() {
        const countryInfo = getCountryData(); const prefixClean = countryInfo.prefix.replace('+', ''); 
        document.querySelectorAll('div.mb-10').forEach(div => {
            const texto = (div.textContent || "").trim(); // 🔥 MAGIA
            const crearBotonEmoji = (textoACopiar, title = "Copiar") => {
                const btn = document.createElement('button'); btn.innerHTML = '📋'; btn.title = title; btn.style.cssText = COPY_ICON_STYLE;
                btn.onmouseenter = () => btn.style.transform = "scale(1.2)"; btn.onmouseleave = () => btn.style.transform = "scale(1)";
                btn.onclick = (e) => { e.stopPropagation(); navigator.clipboard.writeText(textoACopiar).then(() => mostrarAvisoTemporal(`Copiado: ${textoACopiar} 📋`, 1500)); };
                return btn;
            };
            if (texto.startsWith("Correo electrónico") && !div.classList.contains('js-copy-added')) {
                const mailClean = texto.split(":")[1]?.trim(); if (mailClean && mailClean.includes("@")) { div.classList.add('js-copy-added'); div.prepend(crearBotonEmoji(mailClean, "Copiar correo")); }
            }
        });
        const allSpans = Array.from(document.querySelectorAll('button span'));
        const callSpans = allSpans.filter(s => (s.textContent || "").trim().toLowerCase() === "llamar"); // 🔥 MAGIA
        callSpans.forEach(span => {
            const botonOriginal = span.closest('button'); if (!botonOriginal || botonOriginal.dataset.hijacked) return;
            const containerActual = botonOriginal.closest('div.mb-10'); const containerAnterior = containerActual ? containerActual.previousElementSibling : null;
            if (containerAnterior && containerAnterior.classList.contains('mb-10')) {
                const textoAnterior = containerAnterior.textContent || ""; // 🔥 MAGIA
                const soloNumeros = textoAnterior.split(":")[1]?.trim().replace(/[^0-9]/g, '');
                if (soloNumeros && soloNumeros.length >= countryInfo.digits) {
                    const numeroFinal = prefixClean + soloNumeros.slice(-countryInfo.digits);
                    botonOriginal.dataset.hijacked = "true"; span.innerText = "Copiar";
                    const nuevoBoton = botonOriginal.cloneNode(true);
                    nuevoBoton.onclick = (e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(numeroFinal).then(() => mostrarAvisoTemporal(`Copiado: ${numeroFinal} 📋`, 1500)); };
                    botonOriginal.parentNode.replaceChild(nuevoBoton, botonOriginal);
                }
            }
        });
        const waSpans = allSpans.filter(s => (s.textContent || "").trim() === "WA"); // 🔥 MAGIA
        waSpans.forEach(span => {
            const botonOriginal = span.closest('button'); if (!botonOriginal || botonOriginal.dataset.hijacked) return;
            const containerActual = botonOriginal.closest('div.mb-10'); const containerAnterior = containerActual ? containerActual.previousElementSibling : null;
            if (containerAnterior && containerAnterior.classList.contains('mb-10')) {
                const textoAnterior = containerAnterior.textContent || ""; // 🔥 MAGIA
                const soloNumeros = textoAnterior.split(":")[1]?.trim().replace(/[^0-9]/g, '');
                if (soloNumeros && soloNumeros.length >= countryInfo.digits) {
                    const numeroTG = prefixClean + soloNumeros.slice(-countryInfo.digits);
                    botonOriginal.dataset.hijacked = "true"; span.innerText = "TGM";
                    const nuevoBoton = botonOriginal.cloneNode(true); nuevoBoton.title = "Abrir en Telegram";
                    nuevoBoton.onclick = (e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `tg://resolve?phone=${numeroTG}`; };
                    botonOriginal.parentNode.replaceChild(nuevoBoton, botonOriginal);
                }
            }
        });
    }
function renderizarBotonSoporteNativo() {
        if (document.getElementById('btn-soporte-nativo')) return;
        
        const spans = Array.from(document.querySelectorAll("button span"));
        const targetSpan = spans.find(el => el.innerText.trim() === "Fundamento de desembolso");
        
        if (targetSpan) {
            const targetButton = targetSpan.closest("button"); 
            const parentDiv = targetButton ? targetButton.closest("div.mb-10") : null;
            
            if (parentDiv) {
                const nuevoContainer = document.createElement("div"); 
                nuevoContainer.className = "mb-10"; 
                
                const btn = document.createElement("button"); 
                btn.id = "btn-soporte-nativo"; 
                btn.type = "button"; 
                btn.className = "el-button el-button--primary el-button--medium"; 
                btn.style.marginTop = "5px"; 
                btn.innerHTML = `<span>Soporte</span>`;
                
                // Determinamos si es el dominio especial
                const isVarious = window.location.href.includes("variousplan.com");

                btn.onclick = async () => {
                    const countryInfo = getCountryData();
                    const appName = document.querySelector("span.el-tooltip")?.innerText || "N/A";
                    const nombre = getTextAfterLabel("Nombre");
                    const deuda = getTextAfterLabel("Pago completo de la factura");
                    const telefono = countryInfo.prefix + getTextAfterLabel("Teléfono");
                    let res = "";

                    // ---------------------------------------------------------
                    // 🅰️ CASO 1: VARIOUSPLAN.COM (Con Fecha + Formato Especial)
                    // ---------------------------------------------------------
                    if (isVarious) {
                        const originalText = btn.innerHTML;
                        btn.innerHTML = `<span>⏳ Fecha...</span>`;
                        btn.disabled = true;

                        try {
                            const fechaExt = await obtenerFechaDesembolsoScript();
                            res = `${nombre}\nAPP: ${appName}\nMonto actual: ${deuda} pesos.\nFecha de desembolso : ${fechaExt}\nTel: ${telefono}`;
                            
                            await navigator.clipboard.writeText(res);
                            // 🔥 MUESTRA TODO EL TEXTO
                            mostrarAvisoTemporal(`Copiado (Various): ✅\n\n${res}`, 4500, "success");

                        } catch (err) {
                            console.error(err);
                            mostrarAvisoTemporal("Error al procesar", 2000, "error");
                        } finally {
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        }
                    } 
                    // ---------------------------------------------------------
                    // 🅱️ CASO 2: RESTO DEL MUNDO (Formato Original)
                    // ---------------------------------------------------------
                    else {
                        const prorroga = getTextAfterLabel("Importe de la factura de reinversión");
                        const producto = getTextAfterLabel("Nombre del producto");

                        if (countryInfo.name === "Brasil") {
                            res = `${nombre}\nAplicativo: ${appName}\nProduto: ${producto}\nDivida total: R$ ${deuda}\nProrrogação: R$ ${prorroga}\nTel: ${telefono}`;
                        } else {
                            res = `${nombre}\nAPP: ${appName}\nProducto: ${producto}\nDeuda: ${deuda}\nPrórroga: ${prorroga}\nTel: ${telefono}`;
                        }

                        // 🔥 MUESTRA TODO EL TEXTO (COMO ESTABA ANTES)
                        navigator.clipboard.writeText(res).then(() => {
                            mostrarAvisoTemporal(`Copiado para Soporte:\n\n${res}`, 4500, "success");
                        });
                    }
                };
                
                nuevoContainer.appendChild(btn); 
                parentDiv.parentNode.insertBefore(nuevoContainer, parentDiv.nextSibling);
            }
        }
    }
    // =============================================================================
    // ------------------- MÓDULO 2: EDITOR VISUAL (DOM EDITOR) --------------------
    // =============================================================================
    
    // Encapsulado en un bloque para aislar variables y constantes
    {
        // 🔥 NUEVO: ID Único para esta pestaña específica del Editor
        const EDITOR_TAB_ID = 'editor_tab_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        // 🔥 NUEVO: Clave para controlar quién tiene el foco
        const ACTIVE_TAB_KEY = 'CRM_EDITOR_ACTIVE_TAB';

        const ALL_FIELDS = [
            "Fecha de pago", "Días de mora", "Cargo por mora", "Importe reembolsado",
            "Monto de descuento", "Montos de cupones disponibles",
            "Pago completo de la factura", "Importe de la factura de reinversión"
        ];
        const COMPACT_FIELDS = ["Pago completo de la factura", "Importe de la factura de reinversión"];
        const LOCKED_LABELS = ["Pago completo de la factura", "Importe de la factura de reinversión"];
        const NO_SYNC_VALUES = ["Pago completo de la factura", "Importe de la factura de reinversión"];
        
        const CALC_TRIGGER = "Cargo por mora";
        const CALC_TARGETS = ["Pago completo de la factura", "Importe de la factura de reinversión"];

        const BUTTON_TOP_POS = '275px'; 
        const SYNC_KEY = 'crm_dom_editor_cmd'; 
        const MEMORY_KEY = 'crm_editor_memory_values'; 
        
        let originalState = {}; 

        const EDITOR_STYLES = `
            #panel-dom-editor {
                position: fixed; top: 50%; left: 45px; transform: translateY(-50%) scale(0.95);
                z-index: 2147483643; opacity: 0; pointer-events: none;
                background-color: rgba(10, 15, 30, 0.75); 
                backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                padding: 12px; border-radius: 14px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
                width: 420px; display: flex; flex-direction: column; gap: 6px;
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                color: white; height: auto; max-height: 90vh; overflow-y: auto;
                transform-origin: center left; transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            #panel-dom-editor.active { opacity: 1; pointer-events: all; transform: translateY(-50%) scale(1); }
            .editor-field { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 6px 8px; display: flex; flex-direction: column; gap: 4px; }
            .editor-field.is-compact { flex-direction: row; align-items: center; padding: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); }
            .field-header { display: flex; justify-content: space-between; align-items: center; height: 14px; margin-bottom: 2px; }
            .field-title { font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
            .field-body { display: flex; align-items: center; gap: 6px; width: 100%; }
            .editor-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); color: #e2e8f0; padding: 0 8px; border-radius: 6px; font-size: 11px; outline: none; transition: border 0.2s, background 0.2s; font-family: 'Segoe UI', sans-serif; font-weight: 500; box-sizing: border-box; height: 26px; line-height: 26px; }
            .editor-input:focus { border-color: #38bdf8; background: rgba(0,0,0,0.5); color: white; }
            .editor-input:disabled { opacity: 0.6; border-style: dashed; color: #94a3b8; background: transparent; }
            .input-lbl { flex: 2; text-align: left; } .input-val { flex: 1; text-align: right; font-weight: 700; color: #fff; min-width: 80px; }
            .traffic-light { display: flex; gap: 4px; align-items: center; background: rgba(0,0,0,0.2); padding: 3px 6px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); height: 20px; flex-shrink: 0; }
            .color-dot { width: 10px; height: 10px; border-radius: 50%; cursor: pointer; transition: transform 0.2s; border: 1px solid rgba(255,255,255,0.3); opacity: 0.7; }
            .color-dot:hover { transform: scale(1.3); opacity: 1; border-color: white; }
            .bg-red { background-color: #ef4444; } .bg-green { background-color: #008000; } .bg-black { background-color: #000000; }
            .switch { position: relative; display: inline-block; width: 24px; height: 14px; flex-shrink: 0; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #475569; transition: .3s; border-radius: 34px; }
            .slider:before { position: absolute; content: ""; height: 10px; width: 10px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; }
            input:checked + .slider { background-color: #10b981; } input:checked + .slider:before { transform: translateX(10px); }
            .panel-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px; margin-bottom: 6px; }
            .panel-title { font-weight: 800; font-size: 13px; color: white; letter-spacing: 0.5px; text-transform: uppercase; }
            .header-actions { display: flex; gap: 8px; align-items: center; }
            .reset-btn { cursor: pointer; font-size: 14px; background: rgba(255,255,255,0.1); width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; border: none; color: #fff; }
            .reset-btn:hover { background: #3b82f6; }
            .close-btn { cursor: pointer; color: #94a3b8; font-weight: bold; font-size: 18px; line-height: 1; }
            .close-btn:hover { color: white; }
            #btn-open-editor { position: fixed; left: -42px; top: ${BUTTON_TOP_POS}; width: 55px; height: 45px; z-index: 2147483643; background-color: rgba(10, 15, 30, 0.95); color: rgba(255, 255, 255, 0.9); border: 1px solid rgba(255, 255, 255, 0.2); border-left: none; border-radius: 0 12px 12px 0; cursor: pointer; font-weight: bold; font-size: 20px; display: flex; align-items: center; justify-content: flex-end; padding-right: 12px; backdrop-filter: blur(10px); box-shadow: 2px 2px 10px rgba(0,0,0,0.3); transition: all 0.3s; }
            #btn-open-editor:hover { left: 0; justify-content: center; padding-right: 0; width: 60px; color: #fbbf24; border-color: #fbbf24; }
        `;
        const styleEl = document.createElement('style'); styleEl.innerText = EDITOR_STYLES; document.head.appendChild(styleEl);

        const findTargetElement = (keyword) => {
            const tagged = document.querySelector(`[data-crm-key="${keyword}"]`); if (tagged) return tagged;
            const elements = Array.from(document.querySelectorAll('.mb-10'));
            const found = elements.find(el => { const clone = el.cloneNode(true); clone.querySelectorAll('button').forEach(b => b.remove()); return clone.innerText.includes(keyword); });
            if (found) found.setAttribute('data-crm-key', keyword);
            return found;
        };
        const getCleanNumber = (str) => { if (!str) return 0; return parseFloat(str.replace(/[^0-9.]/g, '')) || 0; };
        const captureOriginalState = () => {
            if (Object.keys(originalState).length > 0) return;
            ALL_FIELDS.forEach(field => {
                const targetEl = findTargetElement(field);
                if (targetEl) {
                    const span = targetEl.querySelector('span:not([class*="el-"])') || targetEl.querySelector('span[style*="color"]');
                    let valText = "", labelText = "", fullHtml = targetEl.innerHTML; 
                    if (span) { valText = span.innerText.trim(); labelText = targetEl.firstChild.textContent.replace(':', '').trim(); } 
                    else { const fullText = targetEl.innerText; if (fullText.includes(':')) { const parts = fullText.split(':'); labelText = parts[0].trim(); valText = parts.slice(1).join(':').trim(); } else { labelText = fullText; } }
                    originalState[field] = { label: labelText, rawVal: valText, numVal: getCleanNumber(valText), fullHtml: fullHtml };
                }
            });
        };

        const saveToMemory = (keyword, type, value) => { let memory = JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}'); if (!memory[keyword]) memory[keyword] = {}; memory[keyword][type] = value; localStorage.setItem(MEMORY_KEY, JSON.stringify(memory)); };
        const updateDOM = (keyword, action, payload) => {
            const targetEl = findTargetElement(keyword); if (!targetEl) return;
            let span = targetEl.querySelector('span:not([class*="el-"])') || targetEl.querySelector('span[style*="color"]');
            if (!span && (action === 'updateColor' || action === 'updateValue')) { const textContent = targetEl.innerText; if(textContent.includes(':')) { const parts = textContent.split(':'); targetEl.innerHTML = parts[0] + ': '; span = document.createElement('span'); span.innerText = parts.slice(1).join(':'); targetEl.appendChild(span); } }
            switch (action) {
                case 'toggle': targetEl.style.display = payload ? '' : 'none'; const sw = document.getElementById(`switch-${keyword.replace(/\s/g, '')}`); if (sw) sw.checked = payload; break;
                case 'updateLabel': const currentVal = span ? span.innerText : (targetEl.innerText.split(':')[1] || ''); if (span) targetEl.firstChild.textContent = payload + ": "; else targetEl.innerText = payload + ": " + currentVal; const inpL = document.getElementById(`input-lbl-${keyword.replace(/\s/g, '')}`); if (inpL && document.activeElement !== inpL) inpL.value = payload; break;
                case 'updateValue': const currentLabel = span ? targetEl.firstChild.textContent.replace(':', '').trim() : targetEl.innerText.split(':')[0].trim(); if (span) span.innerText = " " + payload; else targetEl.innerText = currentLabel + ": " + payload; const inpV = document.getElementById(`input-val-${keyword.replace(/\s/g, '')}`); if (inpV && document.activeElement !== inpV) inpV.value = payload; break;
                case 'updateColor': if (span) span.style.color = payload; else targetEl.style.color = payload; break;
                case 'reset': if (originalState[keyword]) { targetEl.innerHTML = originalState[keyword].fullHtml; targetEl.style.display = ''; targetEl.style.color = ''; const iL = document.getElementById(`input-lbl-${keyword.replace(/\s/g, '')}`); if(iL) iL.value = originalState[keyword].label; const iV = document.getElementById(`input-val-${keyword.replace(/\s/g, '')}`); if(iV) iV.value = originalState[keyword].rawVal; const swR = document.getElementById(`switch-${keyword.replace(/\s/g, '')}`); if(swR) swR.checked = true; } break;
            }
        };
        const handleMoraCalculation = (newMoraVal) => { const moraNum = parseFloat(newMoraVal) || 0; CALC_TARGETS.forEach(targetKey => { if (originalState[targetKey]) { const baseAmount = originalState[targetKey].numVal; const newTotal = baseAmount + moraNum; updateDOM(targetKey, 'updateValue', newTotal); } }); };
        const applyMemoryValues = () => {
            const memory = JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}'); let globalMora = 0;
            if (memory[CALC_TRIGGER] && memory[CALC_TRIGGER].value) { globalMora = parseFloat(memory[CALC_TRIGGER].value) || 0; }
            Object.keys(memory).forEach(keyword => { if (memory[keyword].label) updateDOM(keyword, 'updateLabel', memory[keyword].label); if (memory[keyword].color) updateDOM(keyword, 'updateColor', memory[keyword].color); if (memory[keyword].toggle !== undefined) updateDOM(keyword, 'toggle', memory[keyword].toggle); if (memory[keyword].value !== undefined) { if (!NO_SYNC_VALUES.includes(keyword)) { updateDOM(keyword, 'updateValue', memory[keyword].value); } } });
            if (globalMora !== 0) handleMoraCalculation(globalMora);
        };
        const broadcastChange = (action, keyword, payload) => { if (action === 'updateValue') saveToMemory(keyword, 'value', payload); if (action === 'updateLabel') saveToMemory(keyword, 'label', payload); if (action === 'updateColor') saveToMemory(keyword, 'color', payload); if (action === 'toggle') saveToMemory(keyword, 'toggle', payload); if (action === 'updateValue' && NO_SYNC_VALUES.includes(keyword)) return; const data = { id: Date.now(), action, keyword, payload }; localStorage.setItem(SYNC_KEY, JSON.stringify(data)); };
        
        const createEditorRow = (keyword, targetEl) => {
            const row = document.createElement('div'); row.className = 'editor-field'; const safeId = keyword.replace(/\s/g, '');
            const isCompact = COMPACT_FIELDS.includes(keyword); if (isCompact) row.classList.add('is-compact');
            let currentLabelText = "", currentValueText = ""; if (originalState[keyword]) { currentLabelText = originalState[keyword].label; currentValueText = originalState[keyword].rawVal; }
            const switchLabel = document.createElement('label'); switchLabel.className = 'switch';
            const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = `switch-${safeId}`; checkbox.checked = targetEl.style.display !== 'none';
            checkbox.onchange = () => { updateDOM(keyword, 'toggle', checkbox.checked); broadcastChange('toggle', keyword, checkbox.checked); };
            const slider = document.createElement('span'); slider.className = 'slider'; switchLabel.append(checkbox, slider);
            if (!isCompact) { const header = document.createElement('div'); header.className = 'field-header'; const titleSpan = document.createElement('span'); titleSpan.className = 'field-title'; titleSpan.innerText = keyword; header.append(titleSpan, switchLabel); row.appendChild(header); }
            const inputsBody = document.createElement('div'); inputsBody.className = 'field-body';
            const inputLabel = document.createElement('input'); inputLabel.className = 'editor-input input-lbl'; inputLabel.id = `input-lbl-${safeId}`; inputLabel.value = currentLabelText; inputLabel.placeholder = "Etiqueta"; if (LOCKED_LABELS.includes(keyword)) { inputLabel.disabled = true; inputLabel.title = "Protegido"; } inputLabel.oninput = () => { updateDOM(keyword, 'updateLabel', inputLabel.value); broadcastChange('updateLabel', keyword, inputLabel.value); };
            const inputValue = document.createElement('input'); inputValue.className = 'editor-input input-val'; inputValue.id = `input-val-${safeId}`; inputValue.value = currentValueText; inputValue.placeholder = "0"; inputValue.oninput = () => { updateDOM(keyword, 'updateValue', inputValue.value); if (keyword === CALC_TRIGGER) { handleMoraCalculation(inputValue.value); broadcastChange('moraChanged', keyword, inputValue.value); } else { broadcastChange('updateValue', keyword, inputValue.value); } };
            const trafficLight = document.createElement('div'); trafficLight.className = 'traffic-light';
            const createDot = (color, cssClass) => { const dot = document.createElement('div'); dot.className = `color-dot ${cssClass}`; dot.onclick = () => { updateDOM(keyword, 'updateColor', color); broadcastChange('updateColor', keyword, color); }; return dot; };
            trafficLight.append(createDot('#ff0000', 'bg-red'), createDot('#008000', 'bg-green'), createDot('#000000', 'bg-black'));
            inputsBody.append(inputLabel, inputValue, trafficLight); if (isCompact) inputsBody.appendChild(switchLabel); row.appendChild(inputsBody); return row;
        };

        const togglePanelVisuals = (show) => { const panel = document.getElementById('panel-dom-editor'); const btn = document.getElementById('btn-open-editor'); if (!panel || !btn) return; if (show) { panel.style.display = 'flex'; btn.style.left = '-60px'; requestAnimationFrame(() => panel.classList.add('active')); } else { panel.classList.remove('active'); setTimeout(() => { if(!panel.classList.contains('active')) { panel.style.display = 'none'; btn.style.left = '-42px'; } }, 250); } };
        const initEditorPanel = () => {
            if (!window.location.href.includes('/detail')) return;
            if (document.getElementById('panel-dom-editor')) return;
            captureOriginalState();
            const btn = document.createElement('div'); btn.id = 'btn-open-editor'; btn.innerHTML = '✏️'; btn.title = "Editar Datos";
            const panel = document.createElement('div'); panel.id = 'panel-dom-editor';
            const pHeader = document.createElement('div'); pHeader.className = 'panel-header'; const titleText = document.createElement('span'); titleText.className = 'panel-title'; titleText.innerText = 'EDITOR VISUAL';
            const actionsDiv = document.createElement('div'); actionsDiv.className = 'header-actions';
            const resetBtn = document.createElement('button'); resetBtn.className = 'reset-btn'; resetBtn.innerHTML = '↺'; resetBtn.onclick = () => { if(confirm('¿Restablecer todo a valores originales?')) { localStorage.removeItem(MEMORY_KEY); ALL_FIELDS.forEach(f => updateDOM(f, 'reset', null)); broadcastChange('globalReset', 'ALL', null); } };
            const closeBtn = document.createElement('span'); closeBtn.className = 'close-btn'; closeBtn.innerHTML = '×'; 
            closeBtn.onclick = () => { togglePanelVisuals(false); }; // Cierre simple visual
            actionsDiv.append(resetBtn, closeBtn); pHeader.append(titleText, actionsDiv);
            const rowsContainer = document.createElement('div'); rowsContainer.style.cssText = "display:flex; flex-direction:column; gap:4px;";
            ALL_FIELDS.forEach(field => { const targetEl = findTargetElement(field); if (targetEl) rowsContainer.appendChild(createEditorRow(field, targetEl)); });
            if (rowsContainer.children.length === 0) { rowsContainer.innerHTML = `<div style="text-align:center; color:#94a3b8; font-size:11px; padding:15px;">Sin datos...</div>`; }
            panel.appendChild(pHeader); panel.appendChild(rowsContainer);
            
            // 🔥 MODIFICADO: Lógica de exclusividad al abrir
            btn.onclick = () => { 
                rowsContainer.innerHTML = ''; 
                ALL_FIELDS.forEach(field => { const targetEl = findTargetElement(field); if (targetEl) rowsContainer.appendChild(createEditorRow(field, targetEl)); }); 
                applyMemoryValues(); 
                
                // RECLAMAR EL FOCO
                localStorage.setItem(ACTIVE_TAB_KEY, EDITOR_TAB_ID);
                togglePanelVisuals(true); 
            };
            
            document.body.appendChild(btn); document.body.appendChild(panel);
            // Solo abrimos si nosotros tenemos el foco (poco probable en init, pero por si acaso)
            if (localStorage.getItem(ACTIVE_TAB_KEY) === EDITOR_TAB_ID) { btn.onclick(); } else { applyMemoryValues(); }
        };

        // Listeners del Editor
        window.addEventListener('storage', (e) => {
            if (e.key === SYNC_KEY && e.newValue) { const cmd = JSON.parse(e.newValue); if (Date.now() - cmd.id < 1000) { if (cmd.action === 'moraChanged') { handleMoraCalculation(cmd.payload); updateDOM(CALC_TRIGGER, 'updateValue', cmd.payload); } else if (cmd.action === 'globalReset') { localStorage.removeItem(MEMORY_KEY); ALL_FIELDS.forEach(f => updateDOM(f, 'reset', null)); } else { updateDOM(cmd.keyword, cmd.action, cmd.payload); } } }
            
            // 🔥 NUEVO: Lógica de Exclusión Mutua (Como Detalles)
            if (e.key === ACTIVE_TAB_KEY && e.newValue && e.newValue !== EDITOR_TAB_ID) {
                // Otra pestaña reclamó el foco, me cierro
                togglePanelVisuals(false);
            }
        });
        
        document.addEventListener('visibilitychange', () => { if (!document.hidden) { applyMemoryValues(); } });
        
        // Auto-arranque del Editor
        let editorLastUrl = location.href;
        setTimeout(() => { captureOriginalState(); initEditorPanel(); }, 2500);
        new MutationObserver(() => {
            if (location.href !== editorLastUrl) { 
                editorLastUrl = location.href; originalState = {};
                document.getElementById('panel-dom-editor')?.remove(); document.getElementById('btn-open-editor')?.remove();
                setTimeout(() => { captureOriginalState(); initEditorPanel(); }, 2500); 
            }
        }).observe(document, { subtree: true, childList: true });
    }

    // =============================================================================
    // ------------------- INICIALIZACIÓN GLOBAL (TOOLS) -------------------------
    // =============================================================================
    function limpiarTodo() {
        document.getElementById('wrapper-tools-panel')?.remove();
        const container = document.getElementById('custom-btns-container'); if (container) container.remove(); 
        const btnSoporte = document.getElementById('btn-soporte-nativo'); if (btnSoporte) { btnSoporte.closest('div.mb-10')?.remove(); }
    }

    function iniciarHerramientas() {
        if (!document.body) return;
        const currentUrl = window.location.href;
        const esDominioValido = DOMAIN_CONFIG.some(config => config.domains.some(domain => currentUrl.startsWith(domain)));
        const esRutaDetalle = RUTAS_PERMITIDAS.some(path => currentUrl.includes(path));

        if (esDominioValido && esRutaDetalle) {
            limpiarTodo();
            injectToolsPanel(); 
            renderizarBotonesCustom();
            renderizarBotonSoporteNativo();
            setTimeout(renderizarMejorasNativas, 500); 
            
            // 🔥 GUARDAMOS LA FOTOGRAFÍA: ¿Cuántos datos había cuando pintamos el panel?
            document.body.dataset.crmElementsCount = document.querySelectorAll('div.mb-10').length;
        } else {
            limpiarTodo();
        }
    }

    window.addEventListener('storage', (e) => { 
        if (e.key === 'CUSTOM_BTNS_LIST') { renderizarBotonesCustom(); }
        if (e.key === 'TOOLS_PANEL_STATE') {
            const panel = document.getElementById('panel-tools-content'); const toggle = document.getElementById('btn-toggle-tools');
            if(panel && toggle) { if (e.newValue === 'open') { toggle.style.display = 'none'; panel.style.display = 'flex'; panel.style.opacity = '1'; panel.style.transform = 'scale(1) translateX(0)'; } else { panel.style.display = 'none'; toggle.style.display = 'flex'; } }
        }
    });

    // =============================================================================
    // 🚀 INICIALIZACIÓN INTELIGENTE (FIX BLINDADO PARA 100+ PESTAÑAS)
    // =============================================================================
    
    let lastUrl = location.href; 
    let timeoutID;
    let intentoCarga = 0;
    
    function crmTieneDatosReales() {
        const valTelefono = getTextAfterLabel("Teléfono").replace(/[^0-9]/g, '');
        return valTelefono.length >= 8; 
    }

    // 🔥 NUEVA FUNCIÓN: Atrapa las referencias que cargan tarde por culpa del lag
    function revisarReferenciasRezagadas() {
        const panel = document.getElementById('panel-tools-content');
        if (!panel || !crmTieneDatosReales()) return;
        
        const panelRoto = panel.innerHTML.includes('not-allowed');
        const divsActuales = document.querySelectorAll('div.mb-10').length;
        const divsGuardados = parseInt(document.body.dataset.crmElementsCount || 0);
        
        if (panelRoto || divsActuales > divsGuardados) {
            console.log("⚡ Redibujando Panel (Se cargaron referencias nuevas)");
            iniciarHerramientas();
        }
    }

    function esperarDatosYArrancar() {
        if (crmTieneDatosReales()) {
            iniciarHerramientas();
            // Hacemos una segunda pasada 4 segundos después por si las referencias estaban cargando
            setTimeout(revisarReferenciasRezagadas, 4000);
        } else {
            if (intentoCarga < 120) { 
                intentoCarga++;
                setTimeout(esperarDatosYArrancar, 1000); 
            } else {
                iniciarHerramientas(); 
            }
        }
    }

    // 1. Arrancar el vigilante
    esperarDatosYArrancar();

    // 2. Observer (Vigila las pestañas dormidas en segundo plano)
    const observer = new MutationObserver(() => {
        if (location.href !== lastUrl) { 
            lastUrl = location.href; 
            intentoCarga = 0; 
            limpiarTodo(); 
            esperarDatosYArrancar(); 
        }
        
        clearTimeout(timeoutID); 
        // Aumentamos a 1500ms para darle respiro al navegador cuando hay muchas pestañas abiertas
        timeoutID = setTimeout(() => { 
            renderizarMejorasNativas(); 
            revisarReferenciasRezagadas();
        }, 1500);
    });
    
    observer.observe(document, { subtree: true, childList: true });

    // 3. 🔥 EL TRUCO FINAL: Cuando haces clic y "despiertas" la pestaña, fuerza una revisión rápida
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            // Le damos 400ms al navegador para procesar el HTML que estaba congelado
            setTimeout(revisarReferenciasRezagadas, 400);
        }
    });

})();

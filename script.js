// =================================================================================
// --- ARCHIVO ÚNICO: main.js (Versión Unificada) ---
// Este archivo contiene el código de todos los módulos combinados en un solo lugar.
// El orden ha sido ajustado para resolver las dependencias.
// =================================================================================
"use strict";

// =======================================================
// --- INICIO: Contenido de config.js ---
// =======================================================

// --- Elementos del DOM ---
const display = document.getElementById("display");
const salida = document.getElementById("salida");
const contenedor = document.getElementById("contenedor");
const teclado = document.getElementById("teclado");
const divVolver = document.getElementById("divvolver");
const botExp = document.getElementById("botexp");
const botNor = document.getElementById("botnor");
const header = document.getElementsByTagName("header")[0];

// --- Mensajes Centralizados ---
const errorMessages = {
    division1: "<p class='error'>El dividendo es cero, por lo tanto el resultado es cero.</p>",
    division2: "<p class='error'>El divisor es cero, no existe solución.</p>",
    division3: "<p class='error'>El dividendo y el divisor son cero, no existe solución.</p>",
    multiplicacion1: "<p class='error'>Multiplicar por cero da como resultado cero.</p>",
    multiplicacion2: "<p class='error'>El resultado es demasiado grande.</p>",
    raiz1: "<p class='error'>La raíz cuadrada de cero es cero.</p>",
    dFactorial1: "<p class='error'>No se puede descomponer el cero.</p>",
    invalidOperation: "<p class='error'>Operación inválida.</p>",
    invalidSqrtInput: "<p class='error'>Esta función solo acepta un número simple.</p>",
    integerSqrtRequired: "<p class='error'>La raíz cuadrada solo funciona con números enteros.</p>",
    negativeSqrt: "<p class='error'>No se puede calcular la raíz de un número negativo.</p>",
    nonExactSqrt: "<p class='error'>Este número no tiene una raíz cuadrada entera exacta.</p>",
    noDivisionCalculated: "<p class='error'>Primero realiza una división para usar esta función.</p>"
};

// =======================================================
// --- FIN: Contenido de config.js ---
// =======================================================


// =======================================================
// --- INICIO: Contenido de utils/dom-helpers.js ---
// =======================================================

const esperar = ms => new Promise(res => setTimeout(res, ms));

function crearCelda(classNames, content, styles) {
    const celda = document.createElement('div');
    celda.className = classNames;
    celda.textContent = content;
    
    celda.style.position = "absolute"; 
    
    // Aplicar estilos pasados primero
    Object.assign(celda.style, styles);

    // LÓGICA DE AJUSTE CLAVE PARA ALINEAR EL TEXTO VISUALMENTE CON EL TOP DEL DIV
    if (classNames.includes("output-grid__cell") && styles.top && styles.height && styles.fontSize) {
        const cellHeight = parseFloat(styles.height); 
        const fontSize = parseFloat(styles.fontSize); 
        
        const verticalCenteringOffset = (cellHeight - fontSize) / 2;
        
        const currentTop = parseFloat(celda.style.top); 
        celda.style.top = `${currentTop - verticalCenteringOffset}px`;
    }
    
    return celda;
}

function crearCeldaAnimada(classNames, content, styles, delay = 0) {
    const celda = crearCelda(classNames, content, styles); 
    celda.classList.add('animate-fade-in-scale');
    celda.style.animationDelay = `${delay}ms`;
    return celda;
}

function crearFlechaLlevada(left, top, width, height) {
    const svgNS = "http://www.w3.org/2000/svg";
    const s = document.createElementNS(svgNS, "svg");
    s.setAttribute("width", width);
    s.setAttribute("height", height);
    s.style.position = "absolute";
    s.style.left = `${left}px`;
    s.style.top = `${top}px`;
    s.style.overflow = "visible";

    const d = document.createElementNS(svgNS, "defs");
    const m = document.createElementNS(svgNS, "marker");
    const i = "arrowhead-" + Math.random().toString(36).substring(2, 9);
    m.setAttribute("id", i);
    m.setAttribute("viewBox", "0 0 10 10");
    m.setAttribute("refX", 8);
    m.setAttribute("refY", 5);
    m.setAttribute("markerWidth", 5);
    m.setAttribute("markerHeight", 5);
    m.setAttribute("orient", "auto-start-reverse");

    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    p.setAttribute("fill", "#ff5555");

    m.appendChild(p);
    d.appendChild(m);
    s.appendChild(d);

    const h = document.createElementNS(svgNS, "path");
    const x1 = width * 0.9, y1 = height, cx = width * 0.1, cy = height, x2 = width * 0.2, y2 = height * 0.15;
    h.setAttribute("d", `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
    h.setAttribute("stroke", "#ff5555");
    h.setAttribute("stroke-width", 2.5);
    h.setAttribute("stroke-linecap", "round");
    h.setAttribute("fill", "none");
    h.setAttribute("marker-end", `url(#${i})`);

    s.appendChild(h);

    const l = h.getTotalLength();
    h.style.strokeDasharray = l;
    h.style.strokeDashoffset = l;
    h.style.transition = "stroke-dashoffset .8s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
    requestAnimationFrame(() => {
        h.style.strokeDashoffset = "0";
    });

    return s;
}

function crearMensajeError(message) {
    const errorMessageElement = document.createElement('p');
    errorMessageElement.className = 'output-screen__error-message'; 
    errorMessageElement.innerHTML = message; 
    
    errorMessageElement.style.position = 'absolute'; 
    errorMessageElement.style.width = '100%';
    errorMessageElement.style.height = '100%';
    errorMessageElement.style.display = 'flex';
    errorMessageElement.style.justifyContent = 'center';
    errorMessageElement.style.alignItems = 'center';
    
    return errorMessageElement;
}

// =======================================================
// --- FIN: Contenido de utils/dom-helpers.js ---
// =======================================================


// =======================================================
// --- INICIO: Contenido de utils/layout-calculator.js ---
// =======================================================

const multiplicadorTamFuente = 0.7;

function calculateLayout(container, gridWidthInCells, gridHeightInRows) {
    const rect = container.getBoundingClientRect();
    const style = getComputedStyle(container);

    const paddingLeft = parseFloat(style.paddingLeft);
    const paddingRight = parseFloat(style.paddingRight);
    const paddingTop = parseFloat(style.paddingTop);
    const paddingBottom = parseFloat(style.paddingBottom);

    const availableWidth = rect.width - paddingLeft - paddingRight;
    const availableHeight = rect.height - paddingTop - paddingBottom;

    const tamCel = Math.floor(Math.min(availableWidth / gridWidthInCells, availableHeight / gridHeightInRows));
    const tamFuente = tamCel * multiplicadorTamFuente;

    const totalBlockWidth = gridWidthInCells * tamCel;
    const offsetHorizontal = (availableWidth - totalBlockWidth) / 2;

    return {
        tamCel,
        tamFuente,
        offsetHorizontal,
        paddingLeft,
        paddingTop
    };
}

// =======================================================
// --- FIN: Contenido de utils/layout-calculator.js ---
// =======================================================


// =======================================================
// --- INICIO: Contenido de utils/parsers.js ---
// =======================================================

function parsearNumeros(entradaStr, operador) {
    const numAr = entradaStr.split(operador);

    return numAr.map(numStr => {
        let limpio = numStr.replace(/^0+(?!\b|,)/, '');
        if (limpio === '') limpio = '0';
        if (limpio.startsWith(',')) limpio = '0' + limpio;

        const p = limpio.indexOf(",") + 1;
        const d = p > 0 ? limpio.length - p : 0;
        const v = limpio.replace(",", "");

        return [v || "0", d];
    });
}

// =======================================================
// --- FIN: Contenido de utils/parsers.js ---
// =======================================================


// =======================================================
// --- INICIO: Contenido de modules/addition.js ---
// =======================================================

async function suma(numerosAR) {
    salida.innerHTML = "";

    const partesOperandos = numerosAR.map(([valor, dec]) => {
        const valStr = valor.toString();
        const intPart = (dec === 0) ? valStr : ((valStr.length > dec) ? valStr.slice(0, valStr.length - dec) : '0');
        const decPart = (dec === 0) ? '' : valStr.slice(valStr.length - dec).padStart(dec, '0');
        return { intPart, decPart };
    });

    const maxIntLength = Math.max(...partesOperandos.map(p => p.intPart.length));
    const maxDecLength = Math.max(...partesOperandos.map(p => p.decPart.length));
    
    const displayWidth = maxIntLength + (maxDecLength > 0 ? 1 + maxDecLength : 0);
    const anchoGridEnCeldas = displayWidth + 1;
    const altoGridEnCeldas = numerosAR.length + 4;

    const operandosParaCalcular = partesOperandos.map(p =>
        p.intPart.padStart(maxIntLength, '0') + p.decPart.padEnd(maxDecLength, '0')
    );
    const longitudMaximaTotal = operandosParaCalcular[0].length;

    let total = 0n;
    operandosParaCalcular.forEach(n => total += BigInt(n));
    let resultadoRaw = total.toString();
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, anchoGridEnCeldas, altoGridEnCeldas);
    
    const fragmentEstatico = document.createDocumentFragment();
    let yPos = paddingTop + 2.5 * tamCel; 

    partesOperandos.forEach((p) => {
        const intPadded = p.intPart.padStart(maxIntLength, ' ');
        const decPadded = p.decPart.padEnd(maxDecLength, ' ');

        let displayStr;
        if (maxDecLength > 0) {
            displayStr = `${intPadded},${decPadded}`;
        } else {
            displayStr = intPadded;
        }
        
        for (let i = 0; i < displayStr.length; i++) {
            const char = displayStr[displayStr.length - 1 - i];
            
            if (char === ' ') continue;

            const col = anchoGridEnCeldas - 1 - i;
            const cellLeft = offsetHorizontal + col * tamCel + paddingLeft;
            const cellClass = (char === ',') ? "output-grid__cell--producto" : "output-grid__cell--dividendo";
            fragmentEstatico.appendChild(crearCelda(`output-grid__cell ${cellClass}`, char, { left: `${cellLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
        }
        yPos += tamCel;
    });

    const signCol = anchoGridEnCeldas - displayWidth - 1;
    const signLeft = offsetHorizontal + signCol * tamCel + paddingLeft;
    const signTop = yPos - tamCel;
    fragmentEstatico.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", "+", { left: `${signLeft}px`, top: `${signTop}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px`, textAlign: 'center' }));
    
    const lineLeft = offsetHorizontal + signCol * tamCel + paddingLeft;
    const lineWidth = (anchoGridEnCeldas - signCol) * tamCel;
    fragmentEstatico.appendChild(crearCelda("output-grid__line", "", { left: `${lineLeft}px`, top: `${yPos}px`, width: `${lineWidth}px`, height: `2px` }));
    salida.appendChild(fragmentEstatico);

    let carry = 0;
    const topPosSumaIntermedia = paddingTop + 0.1 * tamCel;
    const topPosLlevada = paddingTop + 1.1 * tamCel;
    const sumasIntermediasData = [];
    
    for (let i = longitudMaximaTotal - 1; i >= 0; i--) {
        let sumaColumna = carry;
        operandosParaCalcular.forEach(n => sumaColumna += parseInt(n[i] || '0'));
        
        const sumaStr = sumaColumna.toString();
        const newCarry = Math.floor(sumaColumna / 10);
        
        const digitsToTheRight = (longitudMaximaTotal - 1) - i;
        const hasCommaToTheRight = maxDecLength > 0 && digitsToTheRight >= maxDecLength;
        const visualCellsToTheRight = digitsToTheRight + (hasCommaToTheRight ? 1 : 0);
        const visualCol = anchoGridEnCeldas - 1 - visualCellsToTheRight;

        const xPosColumna = offsetHorizontal + visualCol * tamCel + paddingLeft;
        
        const centroDeColumna = xPosColumna + (tamCel / 2);
        const anchoCeldaTemp = tamCel * sumaStr.length * 0.7;
        const leftPosTemp = centroDeColumna - (anchoCeldaTemp / 2);
        const celdaTemp = crearCelda("output-grid__cell output-grid__cell--suma-intermedia", sumaStr, { left: `${leftPosTemp}px`, top: `${topPosSumaIntermedia}px`, width: `${anchoCeldaTemp}px`, height: `${tamCel}px`, fontSize: `${tamFuente * 0.8}px` });
        salida.appendChild(celdaTemp);
        await esperar(1500);
        celdaTemp.remove();
        sumasIntermediasData.push({ value: sumaStr, x: leftPosTemp, width: anchoCeldaTemp });

        if (newCarry > 0) {
            const carryDigitsToRight = digitsToTheRight + 1;
            const carryHasCommaToRight = maxDecLength > 0 && carryDigitsToRight >= maxDecLength;
            const carryVisualCellsToRight = carryDigitsToRight + (carryHasCommaToRight ? 1 : 0);
            const carryVisualCol = anchoGridEnCeldas - 1 - carryVisualCellsToRight;
            
            const leftBase = offsetHorizontal + carryVisualCol * tamCel + paddingLeft;
            const numeroLlevada = crearCelda("output-grid__cell output-grid__cell--resto", newCarry.toString(), { left: `${leftBase}px`, top: `${topPosLlevada}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente * 0.7}px`, textAlign: 'center' });
            const topFlecha = topPosLlevada + tamCel * 0.8;
            const altoFlecha = (paddingTop + 2.5 * tamCel) - topFlecha; 
            const anchoFlecha = tamCel * 0.8;
            const leftFlecha = leftBase + (tamCel * 1 - anchoFlecha); 
            const flecha = crearFlechaLlevada(leftFlecha, topFlecha, anchoFlecha, altoFlecha);
            salida.appendChild(numeroLlevada);
            salida.appendChild(flecha);
        }
        carry = newCarry;
        await esperar(500);
    }
    
    let resultadoDisplay = resultadoRaw;
    if (maxDecLength > 0) {
        let resPadded = resultadoRaw.padStart(maxDecLength + 1, '0');
        resultadoDisplay = resPadded.slice(0, resPadded.length - maxDecLength) + ',' + resPadded.slice(resPadded.length - maxDecLength);
    }
    
    const yPosResultado = yPos + tamCel * 0.2;
    for (let i = 0; i < resultadoDisplay.length; i++) {
        const char = resultadoDisplay[resultadoDisplay.length - 1 - i];
        const col = anchoGridEnCeldas - 1 - i;
        const cellLeft = offsetHorizontal + col * tamCel + paddingLeft;
        const cellClass = (char === ',') ? "output-grid__cell--producto" : "output-grid__cell--cociente";
        salida.appendChild(crearCelda(`output-grid__cell ${cellClass}`, char, { left: `${cellLeft}px`, top: `${yPosResultado}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    await esperar(100);
    sumasIntermediasData.forEach(data => {
        const celdaFinal = crearCelda("output-grid__cell output-grid__cell--suma-intermedia", data.value, { left: `${data.x}px`, top: `${topPosSumaIntermedia}px`, width: `${data.width}px`, height: `${tamCel}px`, fontSize: `${tamFuente * 0.8}px` });
        celdaFinal.style.opacity = '0';
        salida.appendChild(celdaFinal);
        setTimeout(() => {
            celdaFinal.style.transition = 'opacity 0.5s ease-in';
            celdaFinal.style.opacity = '1';
        }, 100);
    });
}

// =======================================================
// --- FIN: Contenido de modules/addition.js ---
// =======================================================


// =======================================================
// --- INICIO: Contenido de modules/subtraction.js ---
// =======================================================

let animationLoopId = null;

async function startBorrowLoopAnimation(elements) {
    if (animationLoopId) clearTimeout(animationLoopId);
    if (elements.length === 0) return;

    const loop = async () => {
        for (const element of elements) {
            if (element.tagName.toLowerCase() === 'svg') {
                const path = element.querySelector('path[d^="M"]');
                if (path) {
                    const length = path.getTotalLength();
                    path.style.transition = 'none';
                    path.style.strokeDashoffset = length;
                    path.offsetHeight;
                    path.style.transition = 'stroke-dashoffset .8s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
                    path.style.strokeDashoffset = '0';
                }
            } else {
                element.classList.add('pulse');
                setTimeout(() => element.classList.remove('pulse'), 500);
            }
            await esperar(200);
        }
        animationLoopId = setTimeout(loop, 3000);
    };
    loop();
}

function calculateBorrows(n1Str, n2Str) {
    const borrowChains = [];
    let n1Array = n1Str.split('').map(Number);
    let n2Array = n2Str.split('').map(Number);

    for (let i = n1Array.length - 1; i >= 0; i--) {
        if (n1Array[i] < n2Array[i]) {
            let chain = [];
            let j = i - 1;
            while (j >= 0 && n1Array[j] === 0) { j--; }

            if (j >= 0) {
                chain.push({ index: j, newValue: n1Array[j] - 1 });
                n1Array[j]--;
                for (let k = j + 1; k < i; k++) {
                    chain.push({ index: k, newValue: 9 });
                    n1Array[k] = 9;
                }
                chain.push({ index: i, newValue: n1Array[i] + 10 });
                n1Array[i] += 10;
                borrowChains.push(chain);
            }
        }
    }
    return borrowChains;
}

function crearTachadoAnimado(styles) {
    const line = document.createElement('div');
    line.className = 'output-grid__cross-out';
    Object.assign(line.style, {
        position: 'absolute', backgroundColor: '#e84d4d', height: '2px',
        transform: 'rotate(-25deg)', transformOrigin: 'left center',
        transition: 'width 0.3s ease-out', width: '0px', ...styles
    });
    requestAnimationFrame(() => { line.style.width = styles.width; });
    return line;
}

function formatWithComma(numStr, dec) {
    if (dec === 0) return numStr;
    const padded = numStr.padStart(dec + 1, '0');
    return `${padded.slice(0, -dec)},${padded.slice(-dec)}`;
}

async function resta(numerosAR) {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();
    if (animationLoopId) clearTimeout(animationLoopId);

    const [minuendoStrRaw, minuendoDec] = numerosAR[0];
    const [sustraendoStrRaw, sustraendoDec] = numerosAR[1];
    
    const maxDec = Math.max(minuendoDec, sustraendoDec);

    const minuendoPadded = minuendoStrRaw.padEnd(minuendoStrRaw.length + maxDec - minuendoDec, '0');
    const sustraendoPadded = sustraendoStrRaw.padEnd(sustraendoStrRaw.length + maxDec - sustraendoDec, '0');

    const maxLen = Math.max(minuendoPadded.length, sustraendoPadded.length);

    const n1 = minuendoPadded.padStart(maxLen, '0');
    const n2 = sustraendoPadded.padStart(maxLen, '0');

    const minuendoBigInt = BigInt(n1);
    const sustraendoBigInt = BigInt(n2);

    const isNegative = minuendoBigInt < sustraendoBigInt;
    const n1Anim = isNegative ? n2 : n1; 
    const n2Anim = isNegative ? n1 : n2; 
    const resultadoAbsStr = (isNegative ? sustraendoBigInt - minuendoBigInt : minuendoBigInt - sustraendoBigInt).toString();
    
    const n1Display = formatWithComma(n1Anim, maxDec);
    const n2Display = formatWithComma(n2Anim, maxDec);
    const maxDisplayLength = Math.max(n1Display.length, n2Display.length);
    
    const anchoGridInCeldas = maxDisplayLength + 1; 
    const altoGridInRows = 5;
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, anchoGridInCeldas, altoGridInRows);
    
    const yPosMinuendo = paddingTop + tamCel;
    const yPosSustraendo = yPosMinuendo + tamCel;

    for (let i = 0; i < n1Display.length; i++) {
        const char = n1Display[n1Display.length - 1 - i];
        const col = anchoGridInCeldas - 1 - i;
        const leftPos = offsetHorizontal + col * tamCel + paddingLeft;
        const cellClass = char === ',' ? 'output-grid__cell--producto' : 'output-grid__cell--dividendo';
        fragment.appendChild(crearCelda(cellClass, char, { left: `${leftPos}px`, top: `${yPosMinuendo}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px' }));
    }
    
    const signCol = anchoGridInCeldas - maxDisplayLength - 1;
    const signLeft = offsetHorizontal + signCol * tamCel + paddingLeft;
    fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", "-", { left: `${signLeft}px`, top: `${yPosSustraendo}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px' }));
    
    for (let i = 0; i < n2Display.length; i++) {
        const char = n2Display[n2Display.length - 1 - i];
        const col = anchoGridInCeldas - 1 - i;
        const leftPos = offsetHorizontal + col * tamCel + paddingLeft;
        const cellClass = char === ',' ? 'output-grid__cell--producto' : 'output-grid__cell--dividendo';
        fragment.appendChild(crearCelda(cellClass, char, { left: `${leftPos}px`, top: `${yPosSustraendo}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: tamFuente + 'px' }));
    }
    salida.appendChild(fragment);
    await esperar(500);

    const borrowChains = calculateBorrows(n1Anim, n2Anim);
    const borrowNumberCells = {};

    for (const chain of borrowChains) {
        for (const step of chain) {
            const digitsToRight = n1Anim.length - 1 - step.index;
            const hasCommaToRight = maxDec > 0 && digitsToRight >= maxDec;
            const visualCellsToRight = digitsToRight + (hasCommaToRight ? 1 : 0);
            const visualCol = anchoGridInCeldas - 1 - visualCellsToRight;

            const xPos = offsetHorizontal + visualCol * tamCel + paddingLeft;
            const yNewNum = yPosMinuendo - tamCel * 0.7;

            if (borrowNumberCells[step.index]) {
                salida.removeChild(borrowNumberCells[step.index]);
            }
            
            salida.appendChild(crearTachadoAnimado({ left: `${xPos}px`, top: `${yPosMinuendo + tamCel / 2}px`, width: `${tamCel}px` }));
            await esperar(300);

            const numStr = step.newValue.toString();
            const widthMultiplier = numStr.length > 1 ? 1.4 : 1;
            const leftOffset = numStr.length > 1 ? -tamCel * 0.2 : 0;
            
            const newNumber = crearCeldaAnimada("output-grid__cell output-grid__cell--resto", numStr, {
                left: `${xPos + leftOffset}px`, top: `${yNewNum}px`, width: `${tamCel * widthMultiplier}px`, height: `${tamCel}px`, fontSize: `${tamFuente * 0.7}px`
            }, 0);
            newNumber.classList.add('loop-anim-element');
            salida.appendChild(newNumber);
            borrowNumberCells[step.index] = newNumber;
            await esperar(300);
        }
        await esperar(500);
    }
    
    const yPosLinea = yPosSustraendo + tamCel;
    const lineLeft = offsetHorizontal + signCol * tamCel + paddingLeft;
    const totalBlockWidth = (anchoGridInCeldas - signCol) * tamCel;
    const linea = crearCelda("output-grid__line", "", { left: `${lineLeft}px`, top: `${yPosLinea}px`, width: `${totalBlockWidth}px`, height: `2px`});
    salida.appendChild(linea);
    await esperar(10);

    const yPosResultado = yPosLinea + tamCel * 0.2;
    const resultadoDisplay = formatWithComma(resultadoAbsStr, maxDec);
    const resultFontSize = `${tamFuente}px`; 
    
    if (isNegative) {
        const resultSignCol = anchoGridInCeldas - resultadoDisplay.length - 1;
        const resultSignLeft = offsetHorizontal + resultSignCol * tamCel + paddingLeft;
        salida.appendChild(crearCelda("output-grid__cell output-grid__cell--cociente", "-", {
            left: `${resultSignLeft}px`, top: `${yPosResultado}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: resultFontSize
        }));
    }
    
    for (let i = 0; i < resultadoDisplay.length; i++) {
        const char = resultadoDisplay[resultadoDisplay.length - 1 - i];
        const col = anchoGridInCeldas - 1 - i;
        const leftPos = offsetHorizontal + col * tamCel + paddingLeft;
        const cellClass = char === ',' ? 'output-grid__cell--producto' : 'output-grid__cell--cociente';
        salida.appendChild(crearCelda(cellClass, char, {
            left: `${leftPos}px`, top: `${yPosResultado}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: resultFontSize
        }));
    }
    
    const elementsToLoop = salida.querySelectorAll('.loop-anim-element');
    startBorrowLoopAnimation(elementsToLoop);
}

// =======================================================
// --- FIN: Contenido de modules/subtraction.js ---
// =======================================================


// =======================================================
// --- INICIO: Contenido de modules/multiplication.js ---
// =======================================================

function multiplica(numerosAR) {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const [num1, numDec1] = numerosAR[0];
    const [num2, numDec2] = numerosAR[1];

    if (num1 === "0" || num2 === "0") {
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.multiplicacion1}</p>`;
        return;
    }
    const resultadoS = (BigInt(num1) * BigInt(num2)).toString();
    if (resultadoS.length > 20) {
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.multiplicacion2}</p>`;
        return;
    }
    
    const totalDecimalesResultado = numDec1 + numDec2;
    let num1Display = num1; if (numDec1 > 0) num1Display = num1.slice(0, num1.length - numDec1) + ',' + num1.slice(num1.length - numDec1);
    let num2Display = num2; if (numDec2 > 0) num2Display = num2.slice(0, num2.length - numDec2) + ',' + num2.slice(num2.length - numDec2);
    
    let resultadoDisplay = resultadoS;
    if (totalDecimalesResultado > 0) {
        if (resultadoDisplay.length <= totalDecimalesResultado) resultadoDisplay = '0'.repeat(totalDecimalesResultado - resultadoDisplay.length + 1) + resultadoDisplay;
        resultadoDisplay = resultadoDisplay.slice(0, resultadoDisplay.length - totalDecimalesResultado) + ',' + resultadoDisplay.slice(resultadoDisplay.length - totalDecimalesResultado);
    }
    if (resultadoDisplay.includes(',')) resultadoDisplay = resultadoDisplay.replace(/0+$/, '').replace(/,$/, '');

    const longestPartialProductLength = num2.length > 1 ? [...num2].reduce((max, d) => Math.max(max, (BigInt(num1) * BigInt(d)).toString().length), 0) : 0;
    const anchuraEnCeldas = Math.max(num1Display.length, num2Display.length + 1, resultadoDisplay.length, longestPartialProductLength + num2.length - 1);
    const alturaEnCeldas = 3 + (num2.length > 1 ? num2.length + 1 : 0);
    
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, anchuraEnCeldas, alturaEnCeldas);
    
    let yPos = paddingTop;

    for (let i = 0; i < num1Display.length; i++) {
        const leftPos = offsetHorizontal + (anchuraEnCeldas - num1Display.length + i) * tamCel + paddingLeft;
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--dividendo", num1Display[i], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }
    yPos += tamCel;
    const signLeft = offsetHorizontal + (anchuraEnCeldas - num2Display.length - 1) * tamCel + paddingLeft;
    fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", "x", { left: `${signLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    for (let i = 0; i < num2Display.length; i++) {
        const leftPos = offsetHorizontal + (anchuraEnCeldas - num2Display.length + i) * tamCel + paddingLeft;
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--dividendo", num2Display[i], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    yPos += tamCel;
    const line1Left = offsetHorizontal + (anchuraEnCeldas - Math.max(num1Display.length, num2Display.length + 1)) * tamCel + paddingLeft;
    const line1Width = Math.max(num1Display.length, num2Display.length + 1) * tamCel;
    fragment.appendChild(crearCelda("output-grid__line", "", { left: `${line1Left}px`, top: `${yPos}px`, width: `${line1Width}px`, height: `2px` }));
    
    if (num2.length > 1) {
        yPos += tamCel * 0.2;
        for (let i = num2.length - 1; i >= 0; i--) {
            let resultadoFila = (BigInt(num1) * BigInt(num2[i])).toString();
            let colOffset = num2.length - 1 - i;
            
            if (i === 0) {
                const signPlusLeft = offsetHorizontal + (anchuraEnCeldas - resultadoFila.length - colOffset - 1) * tamCel + paddingLeft;
                fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", "+", { left: `${signPlusLeft}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
            }

            for (let j = 0; j < resultadoFila.length; j++) {
                const leftPos = offsetHorizontal + (anchuraEnCeldas - resultadoFila.length - colOffset + j) * tamCel + paddingLeft;
                fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", resultadoFila[j], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
            }
            yPos += tamCel;
        }
        const finalLineLeft = offsetHorizontal;
        const totalBlockWidth = anchuraEnCeldas * tamCel;
        fragment.appendChild(crearCelda("output-grid__line", "", { left: `${finalLineLeft}px`, top: `${yPos}px`, width: `${totalBlockWidth}px`, height: `2px` }));
    }
    
    yPos += tamCel * 0.2;
    for (let i = 0; i < resultadoDisplay.length; i++) {
        const leftPos = offsetHorizontal + (anchuraEnCeldas - resultadoDisplay.length + i) * tamCel + paddingLeft;
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--cociente", resultadoDisplay[i], { left: `${leftPos}px`, top: `${yPos}px`, width: `${tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    }

    salida.appendChild(fragment);
}

// =======================================================
// --- FIN: Contenido de modules/multiplication.js ---
// =======================================================


// =======================================================
// --- INICIO: Contenido de modules/division.js ---
// =======================================================

function calculateDisplaySteps(dividendoStr, divisorStr, decimalPlaces = 2) {
    const divisor = BigInt(divisorStr);
    
    const displaySteps = [];
    let currentRow = 0;

    displaySteps.push({ 
        text: dividendoStr, 
        row: currentRow, 
        colEnd: dividendoStr.length, 
        type: 'dividendo' 
    });
    currentRow++;

    let restoActual = 0n;
    let posicionEnDividendo = 0;
    let cocienteCompleto = "";
    let isDecimalPart = false;
    let decimalDigitsCalculated = 0;

    if (BigInt(dividendoStr) < divisor) {
        cocienteCompleto = "0.";
        let currentResto = BigInt(dividendoStr);

        for (let i = 0; i < decimalPlaces; i++) {
            currentResto = currentResto * 10n;
            const digitoCociente = currentResto / divisor;
            cocienteCompleto += digitoCociente.toString();
            const producto = digitoCociente * divisor;
            currentResto = currentResto - producto;
            
            displaySteps.push({ 
                text: producto.toString(), 
                row: currentRow, 
                colEnd: dividendoStr.length + 1 + i,
                type: 'producto' 
            });
            currentRow++;

            displaySteps.push({ 
                text: currentResto.toString(), 
                row: currentRow, 
                colEnd: dividendoStr.length + 1 + i,
                type: 'resto' 
            });
            currentRow++;

            if (currentResto === 0n) break;
        }
        
        return { 
            cociente: cocienteCompleto, 
            displaySteps, 
            totalRows: currentRow 
        };
    }

    while (posicionEnDividendo < dividendoStr.length || (restoActual > 0n && decimalDigitsCalculated < decimalPlaces)) {
        let currentDigit = null;

        if (posicionEnDividendo < dividendoStr.length) {
            restoActual = restoActual * 10n + BigInt(dividendoStr[posicionEnDividendo]);
            posicionEnDividendo++;
        } else if (restoActual > 0n && decimalDigitsCalculated < decimalPlaces) {
            if (!isDecimalPart) {
                cocienteCompleto += ".";
                isDecimalPart = true;
            }
            restoActual = restoActual * 10n;
            decimalDigitsCalculated++;
        } else {
            break;
        }
        
        let digitoCociente = 0n;
        if (restoActual >= divisor) {
            digitoCociente = restoActual / divisor;
        } else if (cocienteCompleto.length > 0 || isDecimalPart) {
            digitoCociente = 0n;
        } else {
            continue;
        }

        const producto = digitoCociente * divisor;
        const nuevoResto = restoActual - producto;

        cocienteCompleto += digitoCociente.toString();

        let currentColEnd;
        if (isDecimalPart) {
            currentColEnd = dividendoStr.length + 1 + decimalDigitsCalculated;
        } else {
            currentColEnd = posicionEnDividendo;
        }
        
        displaySteps.push({ 
            text: producto.toString(), 
            row: currentRow, 
            colEnd: currentColEnd, 
            type: 'producto' 
        });
        currentRow++;

        displaySteps.push({ 
            text: nuevoResto.toString(), 
            row: currentRow, 
            colEnd: currentColEnd, 
            type: 'resto' 
        });
        restoActual = nuevoResto;
        currentRow++;

        if (restoActual === 0n && posicionEnDividendo === dividendoStr.length && decimalDigitsCalculated >= decimalPlaces) {
            break;
        }
    }
    
    if (isDecimalPart) {
        if (cocienteCompleto.endsWith(".")) {
             cocienteCompleto = cocienteCompleto.slice(0, -1);
        }
        let parts = cocienteCompleto.split('.');
        if (parts.length === 2 && parts[1].length < decimalPlaces) {
            cocienteCompleto += '0'.repeat(decimalPlaces - parts[1].length);
        } else if (parts.length === 1 && decimalPlaces > 0) {
            cocienteCompleto += '.' + '0'.repeat(decimalPlaces);
        }
    }

    return { 
        cociente: cocienteCompleto, 
        displaySteps, 
        totalRows: currentRow 
    };
}

function calculateShortDivisionSteps(dividendoStr, divisorStr) {
    const divisor = BigInt(divisorStr);
    const cocienteCompleto = (BigInt(dividendoStr) / divisor).toString();
    
    const shortDisplaySteps = [];
    let currentRow = 0;

    shortDisplaySteps.push({ 
        text: dividendoStr, 
        row: currentRow, 
        colEnd: dividendoStr.length, 
        type: 'dividendo' 
    });
    currentRow++;

    let currentNumberToDivide = 0n;
    let posicionEnDividendo = 0;

    while (posicionEnDividendo < dividendoStr.length) {
        currentNumberToDivide = currentNumberToDivide * 10n + BigInt(dividendoStr[posicionEnDividendo]);
        posicionEnDividendo++;
        if (currentNumberToDivide >= divisor) break;
        if (posicionEnDividendo === dividendoStr.length && currentNumberToDivide < divisor && cocienteCompleto === "0") {
             break;
        }
    }
    
    if (BigInt(dividendoStr) < divisor) {
        shortDisplaySteps.push({ 
            text: dividendoStr, 
            row: currentRow, 
            colEnd: dividendoStr.length, 
            type: 'resto' 
        });
        currentRow++;
        return { 
            cociente: "0", 
            displaySteps: shortDisplaySteps, 
            totalRows: currentRow 
        };
    }

    for (let i = 0; i < cocienteCompleto.length; i++) {
        const digitoCociente = BigInt(cocienteCompleto[i]);
        const producto = digitoCociente * divisor;
        const remainderFromPreviousCalc = currentNumberToDivide - producto;

        let numberToShowAsResto;
        let colEndForResto;

        if (posicionEnDividendo < dividendoStr.length) {
            numberToShowAsResto = remainderFromPreviousCalc * 10n + BigInt(dividendoStr[posicionEnDividendo]);
            colEndForResto = posicionEnDividendo + 1; 
            posicionEnDividendo++;
        } else {
            numberToShowAsResto = remainderFromPreviousCalc;
            colEndForResto = posicionEnDividendo;
        }

        shortDisplaySteps.push({
            text: numberToShowAsResto.toString(),
            row: currentRow,
            colEnd: colEndForResto, 
            type: 'resto' 
        });
        currentRow++;
        
        currentNumberToDivide = numberToShowAsResto;
    }

    return { 
        cociente: cocienteCompleto, 
        displaySteps: shortDisplaySteps, 
        totalRows: currentRow 
    };
}

function drawHeader(fragment, { divisorStr, cociente, tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop, xBloqueDerecho, anchoIzquierdo, separatorWidth }) {
    const yPosTopRow = paddingTop;
    const yPosCociente = paddingTop + tamCel;

    for (let i = 0; i < divisorStr.length; i++) {
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--divisor", divisorStr[i], {
            left: `${xBloqueDerecho + i * tamCel}px`, 
            top: `${yPosTopRow}px`, 
            width: `${tamCel}px`, 
            height: `${tamCel}px`, 
            fontSize: `${tamFuente}px`
        }));
    }

    const xLineaVertical = offsetHorizontal + anchoIzquierdo * tamCel + (separatorWidth / 2) * tamCel + paddingLeft;
    const xEndOfRightBlock = xBloqueDerecho + Math.max(divisorStr.length, cociente.length) * tamCel; 
    const anchoLineasHorizontales = xEndOfRightBlock - xLineaVertical;

    fragment.appendChild(crearCelda("output-grid__line", "", {
        left: `${xLineaVertical}px`, 
        top: `${yPosTopRow}px`, 
        width: `2px`, 
        height: `${tamCel}px`
    }));
    
    fragment.appendChild(crearCelda("output-grid__line", "", {
        left: `${xLineaVertical}px`, 
        top: `${yPosCociente}px`, 
        width: `${anchoLineasHorizontales}px`, 
        height: `2px`
    }));

    for (let i = 0; i < cociente.length; i++) {
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--cociente", cociente[i], {
            left: `${xBloqueDerecho + i * tamCel}px`, 
            top: `${yPosCociente}px`, 
            width: `${tamCel}px`, 
            height: `${tamCel}px`, 
            fontSize: `${tamFuente}px`
        }));
    }
}

function renderFullDivisionSteps(fragment, displaySteps, { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop, signColumnOffset }, dividendoStr, cocienteStr) {
    const decimalPointIndexInCociente = cocienteStr.indexOf('.');
    
    displaySteps.forEach(step => {
        const yStart = paddingTop + step.row * tamCel;
        const clase = `output-grid__cell output-grid__cell--${step.type}`;

        if (step.type === 'dividendo') {
            const xStart = offsetHorizontal + 0 * tamCel + paddingLeft; 
            for (let i = 0; i < step.text.length; i++) {
                fragment.appendChild(crearCelda(clase, step.text[i], {
                    left: `${xStart + i * tamCel}px`, 
                    top: `${yStart}px`,
                    width: `${tamCel}px`, 
                    height: `${tamCel}px`, 
                    fontSize: `${tamFuente}px`
                }));
            }
        } else {
            let actualColEnd = step.colEnd;
            if (decimalPointIndexInCociente !== -1 && actualColEnd > dividendoStr.length) {
            }

            const colStart = actualColEnd - step.text.length + signColumnOffset;
            const xStart = offsetHorizontal + colStart * tamCel + paddingLeft;

            for (let i = 0; i < step.text.length; i++) {
                fragment.appendChild(crearCelda(clase, step.text[i], {
                    left: `${xStart + i * tamCel}px`, 
                    top: `${yStart}px`,
                    width: `${tamCel}px`, 
                    height: `${tamCel}px`, 
                    fontSize: `${tamFuente}px`
                }));
            }

            if (step.type === 'producto') {
                fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--producto", "-", {
                    left: `${xStart - tamCel}px`, 
                    top: `${yStart}px`,
                    width: `${tamCel}px`, 
                    height: `${tamCel}px`, 
                    fontSize: `${tamFuente}px`
                }));
                
                fragment.appendChild(crearCelda("output-grid__line", "", {
                    left: `${xStart}px`, 
                    top: `${yStart + tamCel}px`,
                    width: `${step.text.length * tamCel}px`, 
                    height: `2px`
                }));
            }
        }
    });
}

function renderShortDivisionSteps(fragment, displaySteps, { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop, signColumnOffset }) {
    displaySteps.forEach(step => {
        const yStart = paddingTop + step.row * tamCel;
        const clase = `output-grid__cell output-grid__cell--${step.type}`;

        const colStart = step.colEnd - step.text.length + signColumnOffset; 
        const xStart = offsetHorizontal + colStart * tamCel + paddingLeft;

        for (let i = 0; i < step.text.length; i++) {
            fragment.appendChild(crearCelda(clase, step.text[i], {
                left: `${xStart + i * tamCel}px`, 
                top: `${yStart}px`,
                width: `${tamCel}px`, 
                height: `${tamCel}px`, 
                fontSize: `${tamFuente}px`
            }));
        }
    });
}

function divide(numerosAR) {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const [dividendoStr, ] = numerosAR[0];
    const [divisorStr, ] = numerosAR[1];

    if (BigInt(divisorStr) === 0n) { 
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division2}</p>`; 
        return; 
    }
    if (BigInt(dividendoStr) === 0n) { 
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division1}</p>`; 
        return; 
    }

    const decimalPlacesToCalculate = 2;
    const { cociente, displaySteps, totalRows } = calculateDisplaySteps(dividendoStr, divisorStr, decimalPlacesToCalculate);
    
    const signColumnOffset = 1;
    const anchoIzquierdo = dividendoStr.length + signColumnOffset + decimalPlacesToCalculate + (decimalPlacesToCalculate > 0 ? 1 : 0); 
    const anchoDerecho = Math.max(divisorStr.length, cociente.length) + 1; 
    const separatorWidth = 2; 
    const totalCols = anchoIzquierdo + separatorWidth + anchoDerecho;
    
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, totalCols, totalRows);

    const xBloqueDerecho = offsetHorizontal + (anchoIzquierdo + separatorWidth) * tamCel + paddingLeft;

    drawHeader(fragment, { 
        divisorStr, cociente, tamCel, tamFuente, 
        offsetHorizontal, paddingLeft, paddingTop, xBloqueDerecho, 
        anchoIzquierdo, anchoDerecho, separatorWidth 
    });

    renderFullDivisionSteps(fragment, displaySteps, { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop, signColumnOffset }, dividendoStr, cociente);
    
    salida.appendChild(fragment);
}

function divideExt(numerosAR) {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const [dividendoStr, ] = numerosAR[0];
    const [divisorStr, ] = numerosAR[1];

    if (BigInt(divisorStr) === 0n) { 
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division2}</p>`; 
        return; 
    }
    if (BigInt(dividendoStr) === 0n) { 
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.division1}</p>`; 
        return; 
    }

    const { cociente, displaySteps, totalRows } = calculateShortDivisionSteps(dividendoStr, divisorStr);

    const signColumnOffset = 0;
    const anchoIzquierdo = dividendoStr.length; 
    const anchoDerecho = Math.max(divisorStr.length, cociente.length) + 1; 
    const separatorWidth = 2; 
    
    const actualTotalRowsForLayout = totalRows + 1;
    
    const totalCols = anchoIzquierdo + separatorWidth + anchoDerecho;
    
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, totalCols, actualTotalRowsForLayout);

    const xBloqueDerecho = offsetHorizontal + (anchoIzquierdo + separatorWidth) * tamCel + paddingLeft;

    drawHeader(fragment, { 
        divisorStr, cociente, tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop, 
        xBloqueDerecho, anchoIzquierdo, anchoDerecho, separatorWidth 
    });

    renderShortDivisionSteps(fragment, displaySteps, { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop, signColumnOffset });
    
    salida.appendChild(fragment);
}

// =======================================================
// --- FIN: Contenido de modules/division.js ---
// =======================================================


// =======================================================
// --- INICIO: Contenido de modules/prime-factors.js ---
// =======================================================

function desFacPri() {
    salida.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const entrada = display.innerHTML;

    if (isNaN(parseInt(entrada, 10)) || entrada.includes(',') || parseInt(entrada, 10) <= 0) {
        salida.innerHTML = `<p class="output-screen__error-message">${errorMessages.dFactorial1}</p>`;
        return;
    }
    
    let numIzda = parseInt(entrada, 10);
    const numIzdaArray = [];
    const numDchaArray = [];

    if (numIzda === 1) {
        numIzdaArray.push(1);
        numDchaArray.push(1);
    } else {
        let tempNum = numIzda;
        let i = 2;
        while (i * i <= tempNum) {
            if (tempNum % i === 0) {
                numIzdaArray.push(tempNum);
                numDchaArray.push(i);
                tempNum /= i;
            } else {
                i++;
            }
        }
        if (tempNum > 1 || numIzdaArray.length === 0) {
            numIzdaArray.push(tempNum);
            numDchaArray.push(tempNum);
        }
    }
    numIzdaArray.push(1);

    const maxDigitsIzda = Math.max(...numIzdaArray.map(n => n.toString().length));
    const maxDigitsDcha = Math.max(...numDchaArray.map(n => n.toString().length));
    const separatorWidth = 1;
    const totalCols = maxDigitsIzda + separatorWidth + maxDigitsDcha;
    const numRows = numIzdaArray.length;
    
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = calculateLayout(salida, totalCols, numRows);

    numIzdaArray.forEach((n, idx) => {
        let s = n.toString();
        const xPos = offsetHorizontal + (maxDigitsIzda - s.length) * tamCel + paddingLeft;
        const yPos = paddingTop + idx * tamCel;
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--dividendo", s, { left: `${xPos}px`, top: `${yPos}px`, width: `${s.length * tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    });

    const xLineaVertical = offsetHorizontal + maxDigitsIzda * tamCel + (separatorWidth * tamCel / 2) + paddingLeft;
    fragment.appendChild(crearCelda("output-grid__line", "", { left: `${xLineaVertical}px`, top: `${paddingTop}px`, width: `2px`, height: `${numRows * tamCel}px` }));
    
    numDchaArray.forEach((n, idx) => {
        let s = n.toString();
        const xPos = offsetHorizontal + (maxDigitsIzda + separatorWidth) * tamCel + paddingLeft;
        const yPos = paddingTop + idx * tamCel;
        fragment.appendChild(crearCelda("output-grid__cell output-grid__cell--divisor", s, { left: `${xPos}px`, top: `${yPos}px`, width: `${s.length * tamCel}px`, height: `${tamCel}px`, fontSize: `${tamFuente}px` }));
    });

    salida.appendChild(fragment);
}

// =======================================================
// --- FIN: Contenido de modules/prime-factors.js ---
// =======================================================


// =======================================================
// --- INICIO: Contenido de modules/square-root.js ---
// =======================================================

const ANIMATION_DELAYS = {
    STEP_TRANSITION: 800,
    OPERATION_REVEAL: 800,
    RESULT_SHOW: 500
};

const VISUAL_CONFIG = {
    RADICAL_WIDTH_RATIO: 0.7,
    DECIMAL_OFFSET_RATIO: 0.8,
    MARGIN_RATIO: 0.5,
    FONT_SIZE_RATIO: 0.8,
    MAX_DECIMAL_PLACES: 6,
    MAX_ITERATIONS: 20
};

const CSS_CLASSES = {
    DIVIDEND: "output-grid__cell output-grid__cell--dividendo",
    PRODUCT: "output-grid__cell output-grid__cell--producto", 
    QUOTIENT: "output-grid__cell output-grid__cell--cociente",
    REMAINDER: "output-grid__cell output-grid__cell--resto",
    LINE: "output-grid__line",
    ANIMATE: "animate-fade-in-scale",
    RADICAL: "output-grid__radical",
    DECIMAL_POINT: "decimal-point"
};

async function raizCuadrada() {
    const inputNumber = validateAndParseInput();
    if (inputNumber === null) return;
    
    await visualizeSquareRoot(inputNumber);
}

function validateAndParseInput() {
    salida.innerHTML = "";
    const entrada = display.innerHTML.replace(',', '.');

    if (/[+\-x/]/.test(entrada)) {
        salida.appendChild(crearMensajeError(errorMessages.invalidSqrtInput));
        return null;
    }

    const numero = parseFloat(entrada);
    if (isNaN(numero)) {
        salida.appendChild(crearMensajeError(errorMessages.invalidSqrtInput));
        return null;
    }

    if (numero < 0) {
        salida.appendChild(crearMensajeError(errorMessages.negativeSqrt));
        return null;
    }

    return numero;
}

async function visualizeSquareRoot(numero) {
    const container = setupContainer();
    const { groups, decimalPos } = groupDigits(numero);
    const steps = calculateSquareRootSteps(groups);
    
    const layout = calculateVisualizationLayout(container, groups, steps);
    const positions = drawStaticElements(container, groups, decimalPos, layout);
    
    await animateSquareRootSteps(container, steps, groups, decimalPos, layout, positions);
}

function setupContainer() {
    salida.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'square-root-container';
    Object.assign(container.style, {
        position: 'relative',
        width: '100%',
        minHeight: '300px',
        overflow: 'visible'
    });
    salida.appendChild(container);
    return container;
}

function calculateVisualizationLayout(container, groups, steps) {
    const maxDigitsInStep = Math.max(...steps.map(s => s.numberToSubtract?.length || 0));
    const totalDigits = groups.join('').length + (groups.length > 1 ? 1 : 0);
    
    const layoutWidth = Math.max(totalDigits, maxDigitsInStep) + groups.length + 3;
    const layoutHeight = steps.length * 2 + 4;
    
    const baseLayout = calculateLayout(container, layoutWidth, layoutHeight);
    const { tamCel, tamFuente, offsetHorizontal, paddingLeft, paddingTop } = baseLayout;
    
    return {
        ...baseLayout,
        yBase: paddingTop + (tamCel * 2),
        radicalSignWidth: tamCel * VISUAL_CONFIG.RADICAL_WIDTH_RATIO,
        numberBlockLeft: offsetHorizontal + (tamCel * VISUAL_CONFIG.RADICAL_WIDTH_RATIO) + paddingLeft,
        resultYPosition: paddingTop
    };
}

function drawStaticElements(container, groups, decimalPos, layout) {
    const { tamCel, tamFuente, yBase, radicalSignWidth, numberBlockLeft, offsetHorizontal, paddingLeft } = layout;
    
    const fullNumber = groups.join('');
    const decimalIndex = decimalPos * 2;
    const leftBlockCharCount = fullNumber.length + (decimalPos < groups.length ? 1 : 0);
    const barWidth = (leftBlockCharCount * tamCel) - radicalSignWidth;
    
    drawRadicalSign(container, offsetHorizontal + paddingLeft, yBase, radicalSignWidth, tamCel * 1.5, barWidth);
    
    const charPositions = drawNumbersWithDecimal(container, fullNumber, decimalIndex, {
        startX: numberBlockLeft,
        y: yBase,
        tamCel,
        tamFuente
    });
    
    return {
        charPositions,
        rootXStart: numberBlockLeft + (leftBlockCharCount * tamCel) + (tamCel * 0.5),
        leftBlockCharCount,
        decimalIndex
    };
}

function drawNumbersWithDecimal(container, fullNumber, decimalIndex, config) {
    const { startX, y, tamCel, tamFuente } = config;
    const charPositions = [];
    let currentX = startX;

    for (let i = 0; i < fullNumber.length; i++) {
        if (i === decimalIndex && decimalIndex < fullNumber.length) {
            const decimalCell = crearCelda(`${CSS_CLASSES.PRODUCT} ${CSS_CLASSES.DECIMAL_POINT}`, ".", {
                left: `${currentX - tamCel * 0.2}px`,
                top: `${y}px`,
                width: `${tamCel}px`,
                height: `${tamCel}px`,
                fontSize: `${tamFuente}px`
            });
            decimalCell.style.color = '#666';
            container.appendChild(decimalCell);
            charPositions.push(currentX);
            currentX += tamCel * VISUAL_CONFIG.DECIMAL_OFFSET_RATIO;
        }

        container.appendChild(crearCelda(CSS_CLASSES.DIVIDEND, fullNumber[i], {
            left: `${currentX}px`,
            top: `${y}px`,
            width: `${tamCel}px`,
            height: `${tamCel}px`,
            fontSize: `${tamFuente}px`
        }));
        charPositions.push(currentX);
        currentX += tamCel;
    }

    return charPositions;
}

async function animateSquareRootSteps(container, steps, groups, decimalPos, layout, positions) {
    const { tamCel, tamFuente, yBase, resultYPosition } = layout;
    const { charPositions, rootXStart, decimalIndex } = positions;
    
    let yPos = yBase + tamCel * 1.2;
    let remainderStr = '';
    let currentRoot = '';

    for (const [index, step] of steps.entries()) {
        await esperar(ANIMATION_DELAYS.STEP_TRANSITION);

        const stepData = prepareStepData(step, groups, remainderStr, index, charPositions, decimalIndex, tamCel);
        
        if (index > 0 || remainderStr) {
            drawWorkingNumber(container, stepData.currentWorkingNumber, stepData.xEndPos, yPos, tamCel, tamFuente);
        }

        const opCell = showOperationPlaceholder(container, step, rootXStart, yPos, tamFuente);
        
        await esperar(ANIMATION_DELAYS.OPERATION_REVEAL);
        
        yPos = drawSubtractionStep(container, step, stepData.xEndPos, yPos, stepData.currentWorkingNumber, tamCel, tamFuente);
        
        await esperar(ANIMATION_DELAYS.RESULT_SHOW);
        
        updateOperationDisplay(opCell, step);
        currentRoot += step.foundDigitX;
        
        drawRootDigit(container, step, index, decimalPos, rootXStart, resultYPosition, currentRoot, tamCel, tamFuente);
        
        remainderStr = step.newRemainder;
        drawRemainder(container, remainderStr, stepData.xEndPos, yPos, tamCel, tamFuente);
        
        yPos += tamCel * 0.8;
    }

    await esperar(ANIMATION_DELAYS.RESULT_SHOW);

    const finalResultElements = container.querySelectorAll('.output-grid__cell--cociente');
    
    finalResultElements.forEach(el => {
        el.style.transition = 'color 0.4s ease, font-weight 0.4s ease';
        el.style.color = '#ffc107';
        el.style.fontWeight = 'bold';
    });
}

function prepareStepData(step, groups, remainderStr, index, charPositions, decimalIndex, tamCel) {
    const currentGroup = groups[index] || '00';
    const currentWorkingNumber = (remainderStr + currentGroup).replace(/^0+/, '') || '0';
    
    const digitsBefore = groups.slice(0, index).join('').length;
    const adjustForDecimal = index > 0 && decimalIndex < (digitsBefore + currentGroup.length) ? 1 : 0;
    const groupEndIndexInChars = digitsBefore + adjustForDecimal + currentGroup.length - 1;
    
    const xEndPos = charPositions[Math.min(groupEndIndexInChars, charPositions.length - 1)] + tamCel;
    
    return {
        currentWorkingNumber,
        xEndPos
    };
}

function drawWorkingNumber(container, workingNumber, xEndPos, yPos, tamCel, tamFuente) {
    let xCurrent = xEndPos - (workingNumber.length * tamCel);
    
    for (const char of workingNumber) {
        container.appendChild(crearCelda(`${CSS_CLASSES.DIVIDEND} ${CSS_CLASSES.ANIMATE}`, char, {
            left: `${xCurrent}px`,
            top: `${yPos}px`,
            width: `${tamCel}px`,
            height: `${tamCel}px`,
            fontSize: `${tamFuente}px`
        }));
        xCurrent += tamCel;
    }
}

function showOperationPlaceholder(container, step, rootXStart, yPos, tamFuente) {
    const opTextPlaceholder = `${step.doubledRoot}_ × _`;
    const opCell = crearCelda("", opTextPlaceholder, {
        left: `${rootXStart}px`,
        top: `${yPos + tamFuente * 0.5}px`,
        fontSize: `${tamFuente * VISUAL_CONFIG.FONT_SIZE_RATIO}px`,
        position: 'absolute',
        whiteSpace: 'nowrap',
        color: '#ddd',
        transition: 'all 0.3s ease'
    });
    container.appendChild(opCell);
    return opCell;
}

function drawSubtractionStep(container, step, xEndPos, yPos, workingNumber, tamCel, tamFuente) {
    yPos += tamCel * 0.8;
    const numToSubtractStr = step.numberToSubtract || '0';
    let xSubtract = xEndPos - (numToSubtractStr.length * tamCel);
    
    for (const char of numToSubtractStr) {
        container.appendChild(crearCelda(`${CSS_CLASSES.PRODUCT} ${CSS_CLASSES.ANIMATE}`, char, {
            left: `${xSubtract}px`,
            top: `${yPos}px`,
            width: `${tamCel}px`,
            height: `${tamCel}px`,
            fontSize: `${tamFuente}px`
        }));
        xSubtract += tamCel;
    }
    
    const lineLeft = xEndPos - (Math.max(workingNumber.length, numToSubtractStr.length) * tamCel);
    const lineWidth = Math.max(workingNumber.length, numToSubtractStr.length) * tamCel;
    container.appendChild(crearCelda(CSS_CLASSES.LINE, "", {
        left: `${lineLeft}px`,
        top: `${yPos + tamCel}px`,
        width: `${lineWidth}px`,
        height: '2px',
        backgroundColor: '#333'
    }));
    
    return yPos + tamCel;
}

function updateOperationDisplay(opCell, step) {
    opCell.textContent = `${step.doubledRoot}${step.foundDigitX} × ${step.foundDigitX}`;
    opCell.style.color = '#6495ED';
    opCell.style.fontWeight = 'normal';
}

function drawRootDigit(container, step, index, decimalPos, rootXStart, yPos, currentRoot, tamCel, tamFuente) {
    container.querySelectorAll('.output-grid__cell--cociente').forEach(el => el.remove());
    
    let xCurrent = rootXStart;
    let needsDecimalPoint = decimalPos > 0;
    
    for (let i = 0; i < currentRoot.length; i++) {
        if (i === decimalPos && needsDecimalPoint) {
            const decimalCell = crearCelda(`${CSS_CLASSES.QUOTIENT} ${CSS_CLASSES.DECIMAL_POINT}`, ".", {
                left: `${xCurrent - tamCel * 0.2}px`,
                top: `${yPos}px`,
                width: `${tamCel}px`,
                height: `${tamCel}px`,
                fontSize: `${tamFuente}px`
            });
            decimalCell.style.color = '#666';
            container.appendChild(decimalCell);
            xCurrent += tamCel * VISUAL_CONFIG.DECIMAL_OFFSET_RATIO;
            needsDecimalPoint = false;
        }
        
        container.appendChild(crearCelda(`${CSS_CLASSES.QUOTIENT} ${i === index ? CSS_CLASSES.ANIMATE : ''}`, currentRoot[i], {
            left: `${xCurrent}px`,
            top: `${yPos}px`,
            width: `${tamCel}px`,
            height: `${tamCel}px`,
            fontSize: `${tamFuente}px`,
            color: i === index ? '#d00' : '#b0bec5'
        }));
        xCurrent += tamCel;
    }
}

function drawRemainder(container, remainderStr, xEndPos, yPos, tamCel, tamFuente) {
    remainderStr = remainderStr || '0';
    let xRemainder = xEndPos - (remainderStr.length * tamCel);
    
    for (const char of remainderStr) {
        container.appendChild(crearCelda(`${CSS_CLASSES.REMAINDER} ${CSS_CLASSES.ANIMATE}`, char, {
            left: `${xRemainder}px`,
            top: `${yPos}px`,
            width: `${tamCel}px`,
            height: `${tamCel}px`,
            fontSize: `${tamFuente}px`
        }));
        xRemainder += tamCel;
    }
}

function groupDigits(numero) {
    let strNum = numero.toString();
    let [intPart, decPart = ''] = strNum.split('.');
    
    if (intPart === '0' && decPart) intPart = '';
    
    if (intPart.length % 2 !== 0) intPart = '0' + intPart;
    
    if (decPart.length % 2 !== 0) decPart += '0';
    decPart = decPart.substring(0, VISUAL_CONFIG.MAX_DECIMAL_PLACES);
    
    while (decPart.length < VISUAL_CONFIG.MAX_DECIMAL_PLACES) {
        decPart += '00';
    }
    
    const intGroups = intPart.match(/.{1,2}/g) || [];
    const decGroups = decPart.match(/.{1,2}/g) || [];
    const decimalPos = intGroups.length;
    
    const groups = [...intGroups, ...decGroups];
    if (groups.length === 0) groups.push('00');
    
    return { groups, decimalPos };
}

function calculateSquareRootSteps(groups) {
    const steps = [];
    let rootSoFar = '';
    let remainder = 0n;
    
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const currentNumber = remainder * 100n + BigInt(group);
        const doubledRoot = BigInt(rootSoFar || '0') * 2n;
        
        let foundDigitX = 0;
        for (let x = 9; x >= 0; x--) {
            const tempNum = (doubledRoot * 10n + BigInt(x)) * BigInt(x);
            if (tempNum <= currentNumber) {
                foundDigitX = x;
                break;
            }
        }
        
        const numberToSubtract = (doubledRoot * 10n + BigInt(foundDigitX)) * BigInt(foundDigitX);
        const newRemainder = currentNumber - numberToSubtract;
        
        steps.push({
            doubledRoot: doubledRoot.toString(),
            foundDigitX: foundDigitX.toString(),
            numberToSubtract: numberToSubtract.toString(),
            newRemainder: newRemainder.toString()
        });
        
        rootSoFar += foundDigitX.toString();
        remainder = newRemainder;
        
        if (remainder === 0n && i >= groups.length / 2) {
             if (i >= (groups.length - decGroups.length) + 1 ) {
                 break;
            }
        }
    }
    
    return steps;
}

function drawRadicalSign(container, x, y, tickWidth, height, barWidth) {
    const radical = document.createElement('div');
    radical.className = CSS_CLASSES.RADICAL;
    Object.assign(radical.style, {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        height: `${height}px`,
        width: `${tickWidth + barWidth}px`,
        overflow: 'hidden'
    });

    const hLine = document.createElement('div');
    Object.assign(hLine.style, {
        position: 'absolute',
        backgroundColor: '#333',
        height: '2px',
        width: `${barWidth}px`,
        left: `${tickWidth * 0.7}px`,
        top: '0'
    });
    radical.appendChild(hLine);

    const vLine = document.createElement('div');
    Object.assign(vLine.style, {
        position: 'absolute',
        backgroundColor: '#333',
        width: '2px',
        height: `${height * 0.8}px`,
        left: `${tickWidth * 0.7}px`,
        top: '0'
    });
    radical.appendChild(vLine);

    const diagonal = document.createElement('div');
    Object.assign(diagonal.style, {
        position: 'absolute',
        backgroundColor: '#333',
        width: '2px',
        height: `${height * 0.4}px`,
        left: `${tickWidth * 0.3}px`,
        top: `${height * 0.2}px`,
        transform: 'rotate(-30deg)',
        transformOrigin: 'left bottom'
    });
    radical.appendChild(diagonal);

    container.appendChild(radical);
}

// =======================================================
// --- FIN: Contenido de modules/square-root.js ---
// =======================================================


// =======================================================
// --- INICIO: Contenido de history.js ---
// =======================================================

class HistoryManagerClass {
    constructor() {
        this.history = [];
        this.MAX_HISTORY_ITEMS = 10;
        this.HISTORY_STORAGE_KEY = 'calculatorHistory';
    }

    init() {
        this.loadHistory();
        HistoryPanel.renderHistory();
    }

    async add(item) {
        const duplicateIndex = this.history.findIndex(existingItem => existingItem.input === item.input);
        if (duplicateIndex !== -1) {
            alert('¡Oye! Ya has realizado esta operación antes. ¡Mira el historial!');
            if (!HistoryPanel.isOpen()) {
                HistoryPanel.open();
            }
            HistoryPanel.highlightItem(duplicateIndex);
            await reExecuteOperationFromHistory(this.history[duplicateIndex].input);
            return;
        }

        if (!item.result) {
            item.result = HistoryPanel.extractResultText(item.visualHtml);
        }

        this.history.unshift(item);
        if (this.history.length > this.MAX_HISTORY_ITEMS) {
            this.history.pop();
        }
        this.saveHistory();
        HistoryPanel.renderHistory();
        HistoryPanel.highlightLastItem();
    }

    getHistory() { return this.history; }

    clearAll() {
        this.history = [];
        this.saveHistory();
        HistoryPanel.renderHistory();
    }

    loadHistory() {
        const storedHistory = localStorage.getItem(this.HISTORY_STORAGE_KEY);
        this.history = storedHistory ? JSON.parse(storedHistory) : [];
    }

    saveHistory() {
        localStorage.setItem(this.HISTORY_STORAGE_KEY, JSON.stringify(this.history));
    }
}

class HistoryPanelClass {
    constructor() {
        this.panel = document.getElementById('history-panel');
        this.list = document.getElementById('history-list');
        this.toggleButton = document.getElementById('history-toggle-btn');
        this.clearButton = document.getElementById('clear-history-btn');
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.confirmAndClear = this.confirmAndClear.bind(this);
    }

    init() {
        this.addEventListeners();
        this.renderHistory();
    }

    addEventListeners() {
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }
        if (this.clearButton) {
            this.clearButton.addEventListener('click', this.confirmAndClear);
        }
    }

    confirmAndClear() {
        if (window.confirm('¿Estás seguro de que quieres borrar todo el historial?\n\nEsta acción no se puede deshacer.')) {
            HistoryManager.clearAll();
        }
    }

    renderHistory() {
        if (!this.list) return;
        this.list.innerHTML = '';
        HistoryManager.getHistory().forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'history-panel__item';
            li.dataset.index = index;
            li.innerHTML = `
                <span class="history-panel__input">${item.input}</span>
                <span class="history-panel__result">= ${item.result}</span>
            `;
            li.addEventListener('click', async () => {
                await reExecuteOperationFromHistory(item.input);
                this.close();
            });
            this.list.appendChild(li);
        });
    }

    extractResultText(htmlString) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;

        const isSquareRoot = tempDiv.querySelector('.output-grid__radical');
        if (isSquareRoot) {
            const resultCells = Array.from(tempDiv.querySelectorAll('.output-grid__cell--cociente'));
            
            if (resultCells.length === 0) {
                 const error = tempDiv.querySelector('.output-screen__error-message');
                 if (error) return error.textContent.trim();
                 return 'Resultado no disponible';
            }
            
            resultCells.sort((a, b) => (parseFloat(a.style.left) || 0) - (parseFloat(b.style.left) || 0));
            
            const rawResult = resultCells.map(cell => cell.textContent).join('');
            
            return rawResult.replace('.', ',');
        }

        const hasDivisorCells = tempDiv.querySelector('.output-grid__cell--divisor');
        const hasCocienteCells = tempDiv.querySelector('.output-grid__cell--cociente');
        
        if (hasDivisorCells && hasCocienteCells) {
            const cocienteCellsArr = Array.from(tempDiv.querySelectorAll('.output-grid__cell--cociente'));
            cocienteCellsArr.sort((a, b) => (parseFloat(a.style.left) || 0) - (parseFloat(b.style.left) || 0));
            const rawResult = cocienteCellsArr.map(cell => cell.textContent).join('');
            return rawResult.replace('.', ',');
        }
        
        if (hasDivisorCells && !hasCocienteCells) {
            const factorCells = Array.from(tempDiv.querySelectorAll('.output-grid__cell--divisor'));
            factorCells.sort((a, b) => (parseFloat(a.style.top) || 0) - (parseFloat(b.style.top) || 0));
            const factors = factorCells.map(cell => cell.textContent);
            if (factors.length === 1 && factors[0] === '1') {
                return '1';
            }
            return factors.join(' × ');
        }

        const candidateCells = tempDiv.querySelectorAll('.output-grid__cell--cociente, .output-grid__cell--producto');

        if (candidateCells.length === 0) {
            const error = tempDiv.querySelector('.output-screen__error-message');
            if (error) return error.textContent.trim();
            return 'Resultado no disponible'; 
        }

        const lines = new Map();
        candidateCells.forEach(cell => {
            const top = Math.round(parseFloat(cell.style.top) || 0);
            if (!lines.has(top)) {
                lines.set(top, []);
            }
            lines.get(top).push(cell);
        });

        if (lines.size === 0) return "Error al procesar resultado";

        const lowestLineY = Math.max(...lines.keys());
        const resultLineCells = lines.get(lowestLineY);

        resultLineCells.sort((a, b) => {
            const leftA = parseFloat(a.style.left) || 0;
            const leftB = parseFloat(b.style.left) || 0;
            return leftA - leftB;
        });

        return resultLineCells.map(cell => cell.textContent).join('');
    }

    handleOutsideClick(event) {
        if (this.isOpen() && !this.panel.contains(event.target) && !this.toggleButton.contains(event.target)) {
            this.close();
        }
    }

    isOpen() {
        return this.panel.classList.contains('history-panel--open');
    }

    open() {
        if (this.isOpen()) return;
        this.panel.classList.add('history-panel--open');
        setTimeout(() => document.addEventListener('click', this.handleOutsideClick), 0);
    }

    close() {
        if (!this.isOpen()) return;
        this.panel.classList.remove('history-panel--open');
        document.removeEventListener('click', this.handleOutsideClick);
    }

    toggle() {
        this.isOpen() ? this.close() : this.open();
    }

    highlightItem(index) {
        const itemToHighlight = this.list.querySelector(`.history-panel__item[data-index="${index}"]`);
        if (itemToHighlight) {
            itemToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
            itemToHighlight.classList.add('history-item-highlight');
            setTimeout(() => {
                itemToHighlight.classList.remove('history-item-highlight');
            }, 1500);
        }
    }

    highlightLastItem() {
        this.highlightItem(0);
    }
}

const HistoryManager = new HistoryManagerClass();
const HistoryPanel = new HistoryPanelClass();

// =======================================================
// --- FIN: Contenido de history.js ---
// =======================================================


// =======================================================
// --- INICIO: Contenido de main.js (Lógica Principal) ---
// =======================================================

// --- VARIABLES DE ESTADO ---
let w;
let divext = false;
let lastDivisionState = {
    operacionInput: '',
    numerosAR: null,
    tipo: ''
};

// --- INICIALIZACIÓN Y EVENTOS ---
function alCargar() {
    w = Math.min(window.innerHeight / 1.93, window.innerWidth / 1.5);
    contenedor.style.width = `${w}px`;
    contenedor.style.paddingTop = `${(w * 1.56) * 0.04}px`;
    display.style.fontSize = `${w * 0.085}px`;
    display.style.height = `${w * 0.11 * 1.11}px`;
    const cuerpoteclado = document.getElementById("cuerpoteclado");
    cuerpoteclado.style.width = `${0.95 * w}px`;
    cuerpoteclado.style.height = `${0.95 * w}px`;
    teclado.style.fontSize = `${0.1 * w}px`;
    const volver = document.getElementById("volver");
    volver.style.fontSize = `${0.15 * w}px`;
    volver.style.padding = `${0.05 * w}px ${0.03 * w}px`;
    botExp.style.fontSize = `${0.08 * w}px`;
    botExp.style.paddingTop = `${0.05 * w}px`;
    botNor.style.fontSize = `${0.08 * w}px`;
    botNor.style.paddingTop = `${0.05 * w}px`;
    contenedor.style.opacity = "1";
    display.innerHTML = '0';
    activadoBotones('0');
    HistoryManager.init();
    HistoryPanel.init();
    actualizarEstadoDivisionUI(false);
    setupEventListeners();
}

function setupEventListeners() {
    teclado.removeEventListener('click', handleButtonClick);
    divVolver.removeEventListener('click', handleButtonClick);
    document.removeEventListener('keydown', handleKeyboardInput);
    window.removeEventListener('resize', alCargar);
    teclado.addEventListener('click', handleButtonClick);
    divVolver.addEventListener('click', handleButtonClick);
    document.addEventListener('keydown', handleKeyboardInput);
    window.addEventListener('resize', alCargar);
}

// --- MANEJADORES DE ACCIONES ---
function handleButtonClick(event) {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    const value = button.dataset.value;
    const action = button.dataset.action;
    if (value) {
        escribir(value);
    } else if (action) {
        handleAction(action);
    }
}

function handleKeyboardInput(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }

    const key = event.key;
    if (/[0-9+\-*/=.,cC]/.test(key) || ['Enter', 'Backspace', 'Delete', 'Escape', 'x', 'X'].includes(key)) {
        event.preventDefault();
    }
    if (/[0-9]/.test(key)) escribir(key);
    else if (key === '+') escribir('+');
    else if (key === '-') escribir('-');
    else if (key === '*' || key === 'x' || key === 'X') escribir('x');
    else if (key === '/') escribir('/');
    else if (key === '.' || key === ',') escribir(',');
    else if (key === 'Enter' || key === '=') {
        const btnIgual = document.querySelector('[data-action="calculate"]');
        if (btnIgual && !btnIgual.disabled) calcular();
    } else if (key === 'Backspace') escribir('del');
    else if (key === 'Delete' || key === 'Escape') escribir('c');
}

async function reExecuteOperationFromHistory(historyInput) {
    bajarteclado();
    salida.innerHTML = "";

    let calculationSuccessful = false;
    
    const primosMatch = historyInput.match(/^factores\((\d+)\)$/);
    const raizMatch = historyInput.match(/^√\((.+)\)$/);
    
    try {
        if (primosMatch) {
            const numero = primosMatch[1];
            display.innerHTML = numero;
            await desFacPri(numero);
            calculationSuccessful = !salida.querySelector('.output-screen__error-message');
        } else if (raizMatch) {
            const numero = raizMatch[1];
            display.innerHTML = numero;
            await raizCuadrada(numero);
            calculationSuccessful = !salida.querySelector('.output-screen__error-message');
        } else {
            display.innerHTML = historyInput;
            await calcular(false);
            calculationSuccessful = !salida.querySelector('.output-screen__error-message');
        }
    } catch (error) {
        console.error("Error durante la re-ejecución:", error);
        salida.appendChild(crearMensajeError(errorMessages.genericError));
        calculationSuccessful = false;
    } finally {
        display.innerHTML = historyInput; 
        activadoBotones(display.innerHTML);
    }

    return calculationSuccessful;
}

async function handleAction(action) {
    switch (action) {
        case 'view-screen':
            bajarteclado();
            break;
        case 'calculate':
            await calcular(true); 
            break;
        case 'clear':
            escribir('c');
            break;
        case 'delete':
            escribir('del');
            break;
        case 'hide-screen':
            subirteclado();
            break;
        case 'divide-expanded':
        case 'divide-normal':
            divext = (action === 'divide-expanded');
            if (lastDivisionState.operacionInput) {
                await reExecuteOperationFromHistory(lastDivisionState.operacionInput);
            } else {
                actualizarEstadoDivisionUI(false);
            }
            break;

        case 'primos': {
            const numero = display.innerHTML;
            const inputParaHistorial = `factores(${numero})`;
            const success = await reExecuteOperationFromHistory(inputParaHistorial); 
            if (success) {
                HistoryManager.add({
                    input: inputParaHistorial,
                    visualHtml: salida.innerHTML
                });
            }
            break;
        }

        case 'raiz': {
            const numero = display.innerHTML;
            const inputParaHistorial = `√(${numero})`;
            const success = await reExecuteOperationFromHistory(inputParaHistorial); 
            if (success) {
                HistoryManager.add({
                    input: inputParaHistorial,
                    visualHtml: salida.innerHTML
                });
            }
            break;
        }

        default:
            console.warn(`Acción desconocida: ${action}`);
    }
}

// --- LÓGICA DE LA APLICACIÓN ---
function escribir(t) {
    const currentDisplay = display.innerHTML;
    const isOperator = ['+', '-', 'x', '/'].includes(t);
    const hasBinaryOperatorInExpression = /[+\-x/]/.test(currentDisplay.slice(currentDisplay.startsWith('-') ? 1 : 0).replace(/^[0-9,]+/, ''));

    if (t === "c") {
        display.innerHTML = "0";
    } else if (t === "del") {
        display.innerHTML = currentDisplay.slice(0, -1) || "0";
    }
    else if (isOperator) {
        const lastChar = currentDisplay.slice(-1);
        const lastCharIsOperator = ['+', '-', 'x', '/'].includes(lastChar);
        
        if (hasBinaryOperatorInExpression && !lastCharIsOperator) { 
            return;
        } else if (lastCharIsOperator) { 
            if (lastChar === t) return; 
            display.innerHTML = currentDisplay.slice(0, -1) + t;
        } else if (currentDisplay === "0") { 
            if (t === '-') {
                display.innerHTML = t; 
            } else {
                return; 
            }
        } else if (currentDisplay.endsWith(',')) {
            return; 
        } else { 
            display.innerHTML = currentDisplay + t;
        }
    }
    else {
        if (t === ',' && currentDisplay.endsWith(',')) return; 

        display.innerHTML = (currentDisplay === "0" && t !== ',') ? t : currentDisplay + t;
    }
    
    activadoBotones(display.innerHTML);
    actualizarEstadoDivisionUI(false); 
}

async function calcular(addToHistory = true) {
    const entrada = display.innerHTML;
    const operadorMatch = entrada.match(/[+\-x/]/);

    if (!operadorMatch || !/^-?[0-9,]+\s*[+\-x/]\s*-?[0-9,]+$/.test(entrada) || ['+', '-', 'x', '/'].includes(entrada.slice(-1)) || entrada.endsWith(',')) { 
        salida.innerHTML = '';
        salida.appendChild(crearMensajeError(errorMessages.invalidOperation));
        bajarteclado();
        actualizarEstadoDivisionUI(false);
        return; 
    }

    const operador = operadorMatch[0];
    const numerosAR = parsearNumeros(entrada, operador);
    
    bajarteclado();
    salida.innerHTML = "";

    switch (operador) {
        case "+": await suma(numerosAR); break;
        case "-": await resta(numerosAR); break;
        case "x": await multiplica(numerosAR); break;
        case "/":
            lastDivisionState = { operacionInput: entrada, numerosAR, tipo: 'division' };
            divext ? await divideExt(numerosAR) : await divide(numerosAR);
            break;
        default:
            salida.appendChild(crearMensajeError(errorMessages.invalidOperation));
    }
    
    const calculationError = salida.querySelector('.output-screen__error-message');
    actualizarEstadoDivisionUI(operador === '/' && !calculationError);

    if (addToHistory && !calculationError) {
        HistoryManager.add({ input: entrada, visualHtml: salida.innerHTML });
    }
    activadoBotones(display.innerHTML);
}

function subirteclado() {
    teclado.classList.remove('keyboard--hidden');
    salida.classList.remove('output-screen--visible');
    divVolver.classList.remove('bottom-nav--visible');
    activadoBotones(display.innerHTML); 
}

function bajarteclado() {
    teclado.classList.add('keyboard--hidden');
    salida.classList.add('output-screen--visible');
    divVolver.classList.add('bottom-nav--visible');
}

function actualizarEstadoDivisionUI(esDivisionValida) {
    if (esDivisionValida) {
        botExp.style.display = divext ? "none" : "inline-block";
        botNor.style.display = divext ? "inline-block" : "none";
    }
    else if (botExp && botNor) { 
        botExp.style.display = "none";
        botNor.style.display = "none";
        lastDivisionState = { operacionInput: '', numerosAR: null, tipo: '' }; 
    }
}

function activadoBotones(contDisplay) {
    const esSoloCero = contDisplay === '0';
    const hasBinaryOperatorInExpression = /[+\-x/]/.test(contDisplay.slice(contDisplay.startsWith('-') ? 1 : 0).replace(/^[0-9,]+/, ''));
    
    const partes = contDisplay.split(/[+\-x/]/);
    const ultimoNumero = partes[partes.length - 1];
    const terminaEnOperador = ['+', '-', 'x', '/'].includes(contDisplay.slice(-1));

    const demasiadosCaracteres = contDisplay.length >= 21;
    const ultimoNumeroDemasiadoLargo = ultimoNumero.length >= 15;
    const deshabilitarNumeros = demasiadosCaracteres || ultimoNumeroDemasiadoLargo;

    document.querySelectorAll('.keyboard__button--number').forEach(btn => {
        btn.disabled = deshabilitarNumeros;
    });

    document.querySelectorAll('[data-value="+"], [data-value="-"], [data-value="x"], [data-value="/"]').forEach(btn => {
        const isMinusButton = btn.dataset.value === '-';
        if (demasiadosCaracteres) {
            btn.disabled = true; 
        } else if (hasBinaryOperatorInExpression) {
            btn.disabled = true; 
        } else if (esSoloCero) {
            btn.disabled = true; 
        } else if (contDisplay.endsWith(',')) {
            btn.disabled = true; 
        } else {
            btn.disabled = false; 
        }
    });

    const puedeAnadirComa = !ultimoNumero.includes(',');
    const btnComa = document.querySelector('[data-value=","]');
    if (btnComa) btnComa.disabled = !puedeAnadirComa || deshabilitarNumeros;

    const esNumeroEnteroSimple = /^\d+$/.test(contDisplay) && !esSoloCero && !hasBinaryOperatorInExpression;
    document.querySelectorAll('[data-action="primos"], [data-action="raiz"]').forEach(btn => {
        btn.disabled = !esNumeroEnteroSimple;
    });

    const esCalculable = /^-?[0-9,]+\s*[+\-x/]\s*-?[0-9,]+$/.test(contDisplay);
    const btnIgual = document.querySelector('[data-action="calculate"]');
    if (btnIgual) btnIgual.disabled = !esCalculable;
}

document.addEventListener('DOMContentLoaded', alCargar);

// --- Código de animación del título ---
let baseTitle = "Calculadora Facundo 🧮";
let altTitle = "¡Regresa! 😢 🧮 ";
let scrollTitle = altTitle + " ";
let interval;
let pos = 0;
let timeout;

function startTitleAnimation() {
  clearInterval(interval);
  clearTimeout(timeout);
  pos = 0;

  interval = setInterval(() => {
    document.title = scrollTitle.substring(pos) + scrollTitle.substring(0, pos);
    pos = (pos + 1) % scrollTitle.length;
  }, 40); 
}

function stopTitleAnimation() {
  clearInterval(interval);
  clearTimeout(timeout);

  document.title = "Gracias por volver 😊";

  timeout = setTimeout(() => {
    document.title = baseTitle;
  }, 2000);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    startTitleAnimation();
  } else {
    stopTitleAnimation();
  }
});

// =======================================================
// --- FIN: Contenido de main.js (Lógica Principal) ---
// =======================================================












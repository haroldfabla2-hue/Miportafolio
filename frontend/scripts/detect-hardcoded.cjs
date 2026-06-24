/**
 * scripts/detect-hardcoded.cjs
 * 
 * Analizador estático de Árbol de Sintaxis Abstracta (AST) de Babel para React.
 * Identifica texto plano en componentes y atributos DOM previniendo la deuda de internacionalización.
 */

const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// Captura de rutas de archivo inyectadas por lint-staged
const files = process.argv.slice(2);
let hasErrors = false;

/**
 * Función de evaluación heurística:
 * Filtra el ruido sintáctico, ignorando cadenas que están vacías,
 * compuestas únicamente por números o signos de puntuación, ya que no requieren traducción en la mayoría de contextos.
 */
const isSuspiciousText = (text) => {
  if (typeof text !== 'string') return false;
  const cleanText = text.trim();
  if (cleanText.length === 0) return false;
  // Detecta si la cadena posee al menos una letra del alfabeto (inglés o español)
  return /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(cleanText);
};

files.forEach(file => {
  // Garantizar el procesamiento exclusivo de ficheros de React
  if (!file.endsWith('.tsx') && !file.endsWith('.jsx')) return;

  const code = fs.readFileSync(file, 'utf-8');
  let ast;

  try {
    // Generación del Árbol de Sintaxis Abstracta habilitando los plugins de JSX y Typescript
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
      tokens: false // Deshabilitado por razones de optimización de memoria
    });
  } catch (error) {
    console.error(`\n[Fatal] Error de análisis léxico de Babel en ${file}`);
    console.error(`Detalles: ${error.message}\n`);
    hasErrors = true;
    return;
  }

  traverse(ast, {
    // 1. Escaneo de nodos de texto directo en el marco JSX (ej: <div>Texto Duro</div>)
    JSXText(path) {
      if (isSuspiciousText(path.node.value)) {
        console.error(`\n[❌ i18n Violación de Arquitectura] Texto en bruto detectado en nodo JSX -> Archivo: ${file}`);
        console.error(`   > Línea ${path.node.loc.start.line}: "${path.node.value.trim()}"`);
        console.error(`   > Acción correctiva: Refactorice este nodo integrando la función {t('espacio.llave')}.`);
        hasErrors = true;
      }
    },
    // 2. Escaneo profundo de literales inyectados dentro de contenedores de expresión (ej: <div>{'Texto Duro'}</div>)
    JSXExpressionContainer(path) {
      const expression = path.node.expression;
      if (expression.type === 'StringLiteral' && isSuspiciousText(expression.value)) {
        console.error(`\n[❌ i18n Violación de Arquitectura] Literal de cadena detectado en contenedor JSX -> Archivo: ${file}`);
        console.error(`   > Línea ${expression.loc.start.line}: "{'${expression.value}'}"`);
        console.error(`   > Acción correctiva: Substituya el literal por una llamada explícita a t().`);
        hasErrors = true;
      }
    },
    // 3. Auditoría de atributos corporativos de HTML5 que requieren localización obligatoria
    JSXAttribute(path) {
      // Atributos clave orientados a accesibilidad, formularios y metadatos
      const targetAttributes = ['placeholder', 'alt', 'title', 'aria-label'];
      
      if (targetAttributes.includes(path.node.name.name)) {
        const valueNode = path.node.value;
        
        // Detección de cadenas pasadas directamente como propiedad: alt="Imagen descriptiva"
        if (valueNode && valueNode.type === 'StringLiteral' && isSuspiciousText(valueNode.value)) {
          console.error(`\n[❌ i18n Violación de Arquitectura] Atributo de presentación '${path.node.name.name}' estático -> Archivo: ${file}`);
          console.error(`   > Línea ${valueNode.loc.start.line}: "${valueNode.value}"`);
          console.error(`   > Acción correctiva: Refactorice el atributo utilizando interpolación: ${path.node.name.name}={t('llave')}`);
          hasErrors = true;
        }
      }
    }
  });
});

// Finalización y emisión del estado de ejecución para el sistema Git Hook
if (hasErrors) {
  console.error("\n=========================================================================================");
  console.error("  FALLO EN LA VALIDACIÓN: Se ha cancelado la propagación del commit para mantener el estándar de Cero Deuda Técnica.");
  console.error("=========================================================================================\n");
  process.exit(1); 
} else {
  console.log("✔️ Análisis de AST de Babel exitoso: No se detectaron cadenas no internacionalizadas.");
  process.exit(0);
}

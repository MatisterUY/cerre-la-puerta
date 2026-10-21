# Cómo subir el proyecto a GitHub (sin Codex)

Repositorio: https://github.com/MatisterUY/cerre-la-puerta

## Desde el celular: opción fácil (un archivo)

1. Descargá el archivo `index.html` entregado por ChatGPT (no el ZIP).
2. Abrí tu repositorio en GitHub con el navegador. Si no ves las opciones, activá **Sitio de escritorio**.
3. Elegí **Add file → Upload files**, seleccioná el `index.html` y confirmá con **Commit changes**.
4. En **Settings → Pages**, seleccioná **Deploy from a branch → main → / (root)** y guardá.

Esto publica la versión simple de un solo archivo. Funciona y guarda registros en el navegador, pero no incluye instalación PWA ni los tests del paquete completo.

## Versión de código abierto completa (recomendada)

1. Descomprimí `cerre-la-puerta-completo.zip` en una computadora.
2. Entrá al repositorio en GitHub, seleccioná **Add file → Upload files**.
3. Arrastrá TODO el contenido de la carpeta descomprimida, **incluidas las carpetas** `src`, `assets`, `scripts` y `tests`. No subas el ZIP sin descomprimir: GitHub no lo despliega.
4. Aceptá reemplazar `README.md` y `LICENSE` si GitHub lo solicita y pulsá **Commit changes**.
5. Activá GitHub Pages como se indica arriba.

## Seguridad y privacidad

Esta aplicación registra cuándo vos confirmaste que una puerta estaba cerrada. **No controla ni verifica cerraduras reales.** Los registros se guardan en este navegador, sin cuentas ni sincronización. No inventes usuarios, estrellas, contribuciones ni actividad para una postulación a un programa.

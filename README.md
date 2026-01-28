# Simulación de Tráfico 3D (Three.js + Vite)

Proyecto de una intersección 3D con autos, semáforos y lógica de tráfico básica, construido con Three.js y Vite.

## Requisitos
- Node.js 18 o superior
- npm (incluido con Node)

## Instalación
1. Clona el repositorio o descárgalo:
   ```bash
   git clone https://github.com/FilippiCR/info3_interseccion.git
   cd <carpeta-del-repo>
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```

## Ejecutar en modo desarrollo
```bash
npm run dev
```
Vite te mostrará una URL (por defecto http://localhost:5173); ábrela en el navegador.

## Construir para producción
```bash
npm run build
```
Los archivos listos quedan en `dist/`.


## Estructura breve
- `core/` escena principal y gestor de escena.
- `entities/` modelos (auto, semáforo, intersección).
- `logic/` lógica del tráfico (ciclos de semáforos, movimiento de coches).
- `public/` y `index.html` punto de entrada de Vite.

## Notas
- Si se muestran advertencias por tamaño de bundle, son informativas de Vite; el proyecto funciona igual.
- Probado con Node 18+. Si usas nvm: `nvm use 18`.

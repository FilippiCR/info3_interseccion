# Simulación de Tráfico 3D (Three.js + Vite)

Proyecto de una intersección 3D con autos, semáforos y lógica de tráfico básica, construido con Three.js y Vite.

## Requisitos
- Ninguno (solo un navegador moderno). Recomendado: extensión **Live Server** en VS Code.

## Uso (sin instalaciones)
1. Clona o descarga el repositorio:
   ```bash
   git clone https://github.com/FilippiCR/info3_interseccion.git
   cd info3_interseccion
   ```
2. Abre `index.html` en la raíz con Live Server (o cualquier servidor estático).
3. Listo: no se requiere `npm install`, `npm run dev` ni `npm run build`.


## Estructura breve
- `core/` escena principal y gestor de escena.
- `entities/` modelos (auto, semáforo, intersección).
- `logic/` lógica del tráfico (ciclos de semáforos, movimiento de coches).
- `public/` (opcional) y `index.html` como entrada directa.

## Notas
- Dependencias cargadas vía CDN (Three.js); no hay `node_modules`.
- `dist/` ya no se usa; abre siempre el `index.html` de la raíz.

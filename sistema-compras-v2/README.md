
# Sistema de Compras - LADP Logística (v2.0)

Sistema integral para la gestión de compras y órdenes de servicio, desarrollado con tecnologías modernas para asegurar rapidez, seguridad y escalabilidad.

## 🚀 Tecnologías Principales

*   **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4.
*   **Backend**: Supabase (Auth, Database, Storage, Realtime).
*   **Estado**: TanStack Query (React Query).
*   **Testing**: Vitest + React Testing Library.

## 📚 Documentación Técnica

Hemos creado una wiki interna detallada para desarrolladores. Consulta la carpeta `docs/` para más información:

*   [🏗️ Arquitectura del Sistema](docs/ARCHITECTURE.md)
*   [🗄️ Base de Datos y Seguridad](docs/DATABASE.md)
*   [🎨 Frontend y Componentes](docs/FRONTEND.md)
*   [⚡ Backend y Lógica Serverless](docs/BACKEND_API.md)

## 🛠️ Instalación y Uso

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/usuario/sistema-compras-v2.git
    cd sistema-compras-v2
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    Crea un archivo `.env` en la raíz con tus credenciales de Supabase:
    ```env
    VITE_SUPABASE_URL=tu_url_supabase
    VITE_SUPABASE_ANON_KEY=tu_anon_key_supabase
    ```

4.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```

## ✅ Testing

Para ejecutar la suite de pruebas automatizadas:
```bash
npm test
```

---
Desarrollado para **LADP Logística**.

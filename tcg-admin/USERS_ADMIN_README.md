# Administración de Usuarios - TCG Admin

## Nueva Funcionalidad Agregada

Se ha implementado una nueva pestaña de **Administración de Usuarios** que solo es visible para usuarios con rol **Admin**.

## Características

### 🔐 Control de Acceso
- Solo usuarios con rol "Admin" pueden acceder
- Redirección automática si no tienes permisos

### 👥 Gestión Completa de Usuarios
- **Crear usuarios**: Registro completo con email, contraseña y perfil
- **Editar usuarios**: Modificar información personal y roles
- **Eliminar usuarios**: Eliminación completa del sistema
- **Cambiar contraseñas**: Reset de contraseñas para cualquier usuario

### 🎯 Asignación de Roles
- Asignar roles existentes (Admin, Cliente, Usuario)
- Los roles se asignan por código UUID desde la tabla `roles`
- Validación automática de roles disponibles

### 📊 Estadísticas en Tiempo Real
- Total de usuarios en el sistema
- Distribución por roles
- Actualización automática después de operaciones

### 🔍 Filtros y Búsqueda
- Búsqueda por nombre, apellido o email
- Filtro por rol específico
- Interfaz responsive y moderna

## Configuración Requerida

### Variables de Entorno
Para que funcione correctamente, necesitas configurar en tu archivo `.env`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Service Role Key (REQUERIDO para operaciones admin)
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Obtener Service Role Key
1. Ve a tu proyecto de Supabase
2. Settings > API
3. Copia la "service_role" key (NO la anon key)

## Estructura de Base de Datos

La funcionalidad utiliza las siguientes tablas:

- `users`: Perfiles de usuario
- `roles`: Definición de roles disponibles
- `auth.users`: Usuarios de autenticación (manejado por Supabase)

## Seguridad

- **Service Role**: Se usa solo para operaciones administrativas
- **Validación de Roles**: Verificación en frontend y backend
- **Confirmaciones**: Diálogos de confirmación para acciones destructivas
- **Auditoría**: Logs de todas las operaciones administrativas

## Uso

### Acceder a la Administración
1. Inicia sesión como usuario Admin
2. Verás la nueva pestaña "Usuarios" en la navegación
3. Haz clic para acceder al panel de administración

### Crear un Nuevo Usuario
1. Haz clic en "Nuevo Usuario"
2. Completa el formulario (campos obligatorios marcados con *)
3. Selecciona el rol apropiado
4. Haz clic en "Crear"

### Editar Usuario Existente
1. Haz clic en el ícono de editar (lápiz) en la fila del usuario
2. Modifica los campos necesarios
3. Haz clic en "Actualizar"

### Cambiar Contraseña
1. Haz clic en el ícono del ojo en la fila del usuario
2. Ingresa la nueva contraseña
3. Haz clic en "Cambiar"

### Eliminar Usuario
1. Haz clic en el ícono de eliminar (basura) en la fila del usuario
2. Confirma la eliminación
3. El usuario será eliminado completamente del sistema

## Notas Importantes

- **Eliminación Permanente**: Al eliminar un usuario, se borra tanto el perfil como la cuenta de autenticación
- **Roles por Defecto**: Los usuarios nuevos deben tener un rol asignado
- **Contraseñas**: Mínimo 6 caracteres para nuevas contraseñas
- **Validación**: Todos los campos obligatorios se validan antes de enviar

## Archivos Modificados

- `src/services/adminUsers.ts` - Nuevo servicio para administración
- `src/pages/UsersAdmin.tsx` - Nueva página de administración
- `src/components/Navbar.tsx` - Agregada pestaña de usuarios
- `src/router.tsx` - Nueva ruta `/users`
- `src/lib/supabaseAdmin.ts` - Cliente admin para operaciones privilegiadas

## Compatibilidad

- ✅ React 18+
- ✅ TypeScript
- ✅ Supabase v2+
- ✅ Tailwind CSS
- ✅ Responsive design
- ✅ Accesibilidad básica

## Troubleshooting

### Error: "VITE_SUPABASE_SERVICE_ROLE_KEY no está configurada"
- Verifica que tengas la variable de entorno configurada
- Asegúrate de que sea la service role key, no la anon key

### Error: "No tienes permisos para acceder"
- Verifica que tu usuario tenga rol "Admin" en la base de datos
- Revisa que la sesión esté activa

### Error al crear usuario
- Verifica que el email no esté duplicado
- Asegúrate de que todos los campos obligatorios estén completos
- Revisa los logs de la consola para más detalles

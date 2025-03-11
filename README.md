# LaVaca 🐮
Una aplicación de ahorro comunitario que permite a grupos de amigos alcanzar metas financieras juntos.

## 🎯 Descripción
LaVaca es una plataforma que facilita el ahorro colaborativo entre grupos de personas. Ya sea que estés planeando un viaje a la playa, una fiesta de cumpleaños o cualquier meta financiera compartida, LaVaca te ayuda a:
- Establecer metas de ahorro grupales
- Hacer seguimiento de los aportes de cada participante
- Visualizar el progreso hacia el objetivo
- Gestionar fechas límite de pago
- Mantener a todos los participantes motivados y comprometidos
- Invitar amigos a unirse a tus "vacas" de ahorro

## 🚀 Estado del Proyecto
En desarrollo activo. Características implementadas:
- Sistema de autenticación completo (Login/Registro/Verificación)
- Dashboard interactivo con visualización de vacas
- Creación y gestión de vacas (metas de ahorro grupales)

## 🔄 En Progreso
- Registro de transacciones y aportes
- Sistema de participantes por vaca
- Sistema de invitaciones a nuevos participantes
- Búsqueda de usuarios para invitar
- Gestión de invitaciones (aceptar/rechazar)
- Sistema de notificaciones para invitaciones pendientes

## 🛠 Tecnologías
- React + Vite
- Supabase (Base de datos y Autenticación)
- CSS para estilos personalizados
- Context API para manejo de estado
- React Router para navegación
- FontAwesome para iconografía

## 📋 Próximas Características
- Recordatorios automáticos de pago
- Exportación de reportes de aportes
- Visualización avanzada de estadísticas
- Modo oscuro/claro
- Integración con métodos de pago populares
- Aplicación móvil (React Native)

## 🔧 Instalación
```bash
# Clonar el repositorio
git clone [URL del repositorio]

# Instalar dependencias
cd LaVacaReact
npm install

# Configurar variables de entorno
# Crear archivo .env.local con credenciales de Supabase

# Iniciar el servidor de desarrollo
npm run dev
```

## 📱 Interfaz de Usuario
La aplicación cuenta con:
- Página de inicio con registro/login
- Dashboard principal con visualización de vacas activas
- Página detallada para cada vaca
- Formularios para crear vacas y registrar aportes
- Sistema de navegación intuitivo

## 📚 Estructura de Base de Datos
El proyecto utiliza Supabase con las siguientes tablas principales:
- **profiles**: Datos de los usuarios registrados
- **vacas**: Proyectos de ahorro creados por los usuarios
- **participants**: Relación entre usuarios y vacas
- **transactions**: Registro de aportes económicos
- **invitations**: Sistema de invitaciones pendientes

## 💡 ¿Por qué LaVaca?
LaVaca surge de la necesidad de facilitar el ahorro grupal de manera organizada y transparente. Muchas veces, coordinar ahorros entre amigos puede ser complicado y poco estructurado. Esta aplicación proporciona una solución centralizada para:
- Evitar malentendidos sobre los aportes realizados
- Mantener un registro claro del progreso
- Facilitar la comunicación entre los participantes
- Establecer compromisos claros de ahorro

## 👥 Contribución
¡Las contribuciones son bienvenidas! Si deseas contribuir:
1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto
Email: andreshm253@gmail.com

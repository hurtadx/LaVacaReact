import apiService from './apiService'
import { enrichUserData } from './authService'

const isValidUUID = id => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

export const getCurrentUser = async () => {
  try {
    const response = await apiService.get('/api/auth/me')
    if (!response.user) return { data: null, error: null }
    const enrichedUser = await enrichUserData(response.user)
    return { data: enrichedUser, error: null }
  } catch (error) {
    if (error.status === 401) return { data: null, error: 'No autenticado' }
    return { data: null, error: error.message || 'Error al obtener usuario' }
  }
}

export const searchUsers = async searchTerm => {
  try {
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 3) return { data: [], error: 'El término de búsqueda debe tener al menos 3 caracteres' }
    const cleanSearchTerm = searchTerm.trim()
    const response = await apiService.get(`/api/search/users?q=${encodeURIComponent(cleanSearchTerm)}&limit=10`)
    const usersArray = Array.isArray(response) ? response : (response.users || [])
    const safeUserData = usersArray.map(user => ({
      id: user.id,
      username: user.username || user.email?.split('@')[0] || 'Usuario',
      email: user.email,
      avatarUrl: user.avatarUrl || user.avatar_url || null
    }))
    return { data: safeUserData, error: null }
  } catch (error) {
    if (error.status === 400) return { data: [], error: 'Término de búsqueda inválido' }
    return { data: [], error: error.message || 'Error al buscar usuarios' }
  }
}

export const updateUserProfile = async userData => {
  try {
    if (!userData || typeof userData !== 'object') return { data: null, error: 'Datos de usuario inválidos' }
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) return { data: null, error: 'Email inválido' }
    if (userData.username && userData.username.trim().length < 3) return { data: null, error: 'El nombre de usuario debe tener al menos 3 caracteres' }
    const cleanUserData = { ...userData }
    if (cleanUserData.username) cleanUserData.username = cleanUserData.username.trim()
    if (cleanUserData.email) cleanUserData.email = cleanUserData.email.trim().toLowerCase()
    const response = await apiService.put('/api/profiles/me', cleanUserData)
    const enrichedUser = await enrichUserData(response.user || response)
    return { data: enrichedUser, error: null }
  } catch (error) {
    if (error.status === 400) return { data: null, error: 'Datos de perfil inválidos' }
    if (error.status === 409) return { data: null, error: 'El email o nombre de usuario ya están en uso' }
    return { data: null, error: error.message || 'Error al actualizar perfil' }
  }
}

export const getUserProfile = async userId => {
  try {
    if (!userId || !isValidUUID(userId)) return { data: null, error: 'ID de usuario inválido (UUID requerido)' }
    const response = await apiService.get(`/api/profiles/${userId}`)
    return { data: response.profile || response, error: null }
  } catch (error) {
    if (error.status === 404) return { data: null, error: 'Usuario no encontrado' }
    if (error.status === 403) return { data: null, error: 'No tienes permisos para ver este perfil' }
    return { data: null, error: error.message || 'Error al obtener perfil' }
  }
}

export const getUserProfiles = async userIds => {
  try {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) return { data: [], error: null }
    for (const userId of userIds) if (!isValidUUID(userId)) return { data: [], error: `ID de usuario inválido: ${userId}` }
    const response = await apiService.post('/api/profiles/batch', { userIds })
    return { data: response.profiles || [], error: null }
  } catch (error) {
    if (error.status === 400) return { data: [], error: 'Lista de IDs de usuario inválida' }
    return { data: [], error: error.message || 'Error al obtener perfiles' }
  }
}

export const uploadAvatar = async file => {
  try {
    if (!file) return { data: null, error: 'Se requiere un archivo' }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) return { data: null, error: 'Tipo de archivo no válido. Solo se permiten JPEG, PNG, GIF y WebP' }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) return { data: null, error: 'El archivo es demasiado grande. Máximo 5MB' }
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await apiService.upload('/api/profiles/me/avatar', formData)
    const enrichedUser = await enrichUserData(response.user || response)
    return { data: enrichedUser, error: null }
  } catch (error) {
    if (error.status === 400) return { data: null, error: 'Archivo de avatar inválido' }
    if (error.status === 413) return { data: null, error: 'El archivo es demasiado grande' }
    return { data: null, error: error.message || 'Error al subir avatar' }
  }
}

export const deleteAvatar = async () => {
  try {
    const response = await apiService.delete('/api/profiles/me/avatar')
    const enrichedUser = await enrichUserData(response.user || response)
    return { data: enrichedUser, error: null }
  } catch (error) {
    if (error.status === 404) return { data: null, error: 'No hay avatar para eliminar' }
    return { data: null, error: error.message || 'Error al eliminar avatar' }
  }
}

export const getUserStats = async (userId = null) => {
  try {
    if (userId && !isValidUUID(userId)) return { data: null, error: 'ID de usuario inválido (UUID requerido)' }
    const endpoint = userId ? `/api/users/${userId}/stats` : '/api/users/me/stats'
    const response = await apiService.get(endpoint)
    return { data: response.stats || response, error: null }
  } catch (error) {
    if (error.status === 404) return { data: null, error: 'Usuario no encontrado' }
    if (error.status === 403) return { data: null, error: 'No tienes permisos para ver estas estadísticas' }
    return { data: null, error: error.message || 'Error al obtener estadísticas' }
  }
}

export const getUserTransactions = async (userId = null, options = {}) => {
  try {
    if (userId && !isValidUUID(userId)) return { data: [], error: 'ID de usuario inválido (UUID requerido)' }
    const endpoint = userId ? `/api/users/${userId}/transactions` : '/api/users/me/transactions'
    const queryParams = new URLSearchParams()
    if (options.page) queryParams.append('page', options.page)
    if (options.limit) queryParams.append('limit', options.limit)
    if (options.startDate) queryParams.append('startDate', options.startDate)
    if (options.endDate) queryParams.append('endDate', options.endDate)
    if (options.vacaId) queryParams.append('vacaId', options.vacaId)
    if (options.type) queryParams.append('type', options.type)
    const queryString = queryParams.toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    const response = await apiService.get(url)
    return { data: response.transactions || [], error: null }
  } catch (error) {
    if (error.status === 404) return { data: [], error: 'Usuario no encontrado' }
    if (error.status === 403) return { data: [], error: 'No tienes permisos para ver estas transacciones' }
    return { data: [], error: error.message || 'Error al obtener transacciones' }
  }
}

export const getUserVacas = async (userId = null) => {
  try {
    if (userId && !isValidUUID(userId)) return { data: [], error: 'ID de usuario inválido (UUID requerido)' }
    const endpoint = userId ? `/api/users/${userId}/vacas` : '/api/users/me/vacas'
    const response = await apiService.get(endpoint)
    return { data: response.vacas || [], error: null }
  } catch (error) {
    if (error.status === 404) return { data: [], error: null }
    if (error.status === 403) return { data: [], error: 'No tienes permisos para ver estas vacas' }
    return { data: [], error: error.message || 'Error al obtener vacas' }
  }
}

export const getUserInvitations = async (userId = null) => {
  try {
    if (userId && !isValidUUID(userId)) return { data: [], error: 'ID de usuario inválido (UUID requerido)' }
    const endpoint = userId ? `/api/users/${userId}/invitations` : '/api/users/me/invitations'
    const response = await apiService.get(endpoint)
    return { data: response.invitations || [], error: null }
  } catch (error) {
    if (error.status === 404) return { data: [], error: null }
    if (error.status === 403) return { data: [], error: 'No tienes permisos para ver estas invitaciones' }
    return { data: [], error: error.message || 'Error al obtener invitaciones' }
  }
}

export const updateUserPreferences = async preferences => {
  try {
    if (!preferences || typeof preferences !== 'object') return { data: null, error: 'Preferencias inválidas' }
    const response = await apiService.put('/api/users/me/preferences', preferences)
    return { data: response.preferences || response, error: null }
  } catch (error) {
    if (error.status === 400) return { data: null, error: 'Datos de preferencias inválidos' }
    return { data: null, error: error.message || 'Error al actualizar preferencias' }
  }
}

export const getUserPreferences = async () => {
  try {
    const response = await apiService.get('/api/users/me/preferences')
    return { data: response.preferences || response, error: null }
  } catch (error) {
    if (error.status === 404) return { data: { notifications: true, emailAlerts: false, theme: 'light', language: 'es' }, error: null }
    return { data: null, error: error.message || 'Error al obtener preferencias' }
  }
}

export const deleteUserAccount = async password => {
  try {
    if (!password || typeof password !== 'string' || password.trim().length === 0) return { data: null, error: 'Se requiere la contraseña para confirmar la eliminación' }
    const response = await apiService.delete('/api/users/me', { password: password.trim() })
    return { data: response.result || response, error: null }
  } catch (error) {
    if (error.status === 400) return { data: null, error: 'Contraseña incorrecta' }
    if (error.status === 403) return { data: null, error: 'No tienes permisos para eliminar esta cuenta' }
    return { data: null, error: error.message || 'Error al eliminar cuenta' }
  }
}

export const exportUserData = async () => {
  try {
    const response = await apiService.get('/api/users/me/export')
    return { data: response.data || response, error: null }
  } catch (error) {
    if (error.status === 403) return { data: null, error: 'No tienes permisos para exportar datos' }
    return { data: null, error: error.message || 'Error al exportar datos' }
  }
}

export { onAuthStateChange } from './authService'

// session-manager.js - Gestor de sesión para todas las páginas

class SessionManager {
  constructor() {
    this.user = null;
    this.init();
  }

  // Inicializar el gestor de sesión
  init() {
    this.loadUserFromSession();
    this.checkSessionValidity();
    this.updateUserInterface();
  }

  // Cargar usuario desde sessionStorage
  loadUserFromSession() {
    const userData = sessionStorage.getItem("usuario");
    if (userData) {
      try {
        this.user = JSON.parse(userData);
        console.log("Usuario cargado desde sesión:", this.user);
      } catch (error) {
        console.error("Error al parsear datos de usuario:", error);
        this.clearSession();
      }
    }
  }

  // Verificar si la sesión es válida
  checkSessionValidity() {
    // Si no hay usuario en sesión, redirigir al login (excepto si ya estamos en login)
    if (!this.user && !window.location.pathname.includes('login.html')) {
      console.log("No hay sesión activa, redirigiendo al login");
      window.location.href = 'login.html';
      return false;
    }

    // Verificar que el usuario tenga los datos necesarios
    if (this.user && (!this.user.id_user || !this.user.name)) {
      console.warn("Datos de usuario incompletos, limpiando sesión");
      this.clearSession();
      return false;
    }

    return true;
  }

  // Actualizar la interfaz de usuario con los datos de la sesión
  updateUserInterface() {
    if (!this.user) return;

    // Actualizar el nombre del usuario en el header
    this.updateUserName();
    
    // Ocultar la imagen de perfil por defecto ya que no hay fotos implementadas
    this.hideProfileImage();
  }

  // Actualizar el nombre del usuario en el header
  updateUserName() {
    const userNameElement = document.querySelector('.user-box span');
    if (userNameElement && this.user.name) {
      userNameElement.textContent = this.user.name;
      console.log("Nombre de usuario actualizado:", this.user.name);
    }
  }

  // Ocultar/modificar la imagen de perfil
  hideProfileImage() {
    const profileImg = document.querySelector('.user-box img');
    if (profileImg) {
      // Usar una imagen por defecto o un avatar genérico
      profileImg.style.display = 'none';
      
      // Opcional: Agregar iniciales del usuario como alternativa
      this.addUserInitials();
    }
  }

  // Agregar iniciales del usuario como alternativa a la foto
  addUserInitials() {
    const userBox = document.querySelector('.user-box');
    const existingInitials = userBox.querySelector('.user-initials');
    
    // No crear si ya existe
    if (existingInitials || !this.user.name) return;

    const initials = this.getUserInitials(this.user.name);
    const initialsElement = document.createElement('div');
    initialsElement.className = 'user-initials';
    initialsElement.textContent = initials;
    initialsElement.style.cssText = `
      width: 35px;
      height: 35px;
      background-color: #007bff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      margin-right: 8px;
    `;
    
    // Insertar antes del nombre
    const userName = userBox.querySelector('span');
    userBox.insertBefore(initialsElement, userName);
  }

  // Obtener las iniciales del nombre del usuario
  getUserInitials(name) {
    if (!name) return 'U';
    
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    } else {
      return names[0][0].toUpperCase();
    }
  }

  // Obtener información del usuario actual
  getCurrentUser() {
    return this.user;
  }

  // Verificar si hay una sesión activa
  isLoggedIn() {
    return this.user !== null;
  }

  // Obtener datos actualizados del usuario desde la API
  async refreshUserData() {
    if (!this.user || !this.user.id_user) return false;

    try {
      const response = await fetch(`https://healtyapi.bsite.net/api/users/${this.user.id_user}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedUser = await response.json();
      
      // Actualizar los datos en memoria y en sessionStorage
      this.user = updatedUser;
      sessionStorage.setItem("usuario", JSON.stringify(updatedUser));
      
      // Actualizar la interfaz
      this.updateUserInterface();
      
      console.log("Datos de usuario actualizados:", updatedUser);
      return true;
      
    } catch (error) {
      console.error("Error al actualizar datos del usuario:", error);
      return false;
    }
  }

  // Limpiar la sesión
  clearSession() {
    this.user = null;
    sessionStorage.removeItem("usuario");
    
    // También limpiar credenciales recordadas si es necesario
    // localStorage.removeItem("rememberedEmail");
    // localStorage.removeItem("rememberedPassword");
    // localStorage.removeItem("rememberMe");
  }

  // Cerrar sesión
  logout() {
    console.log("Cerrando sesión del usuario:", this.user?.name);
    this.clearSession();
    
    // Redirigir al login
    window.location.href = 'login.html';
  }

  // Verificar permisos de rol
  hasRole(roleId) {
    return this.user && this.user.RoleInfo && this.user.RoleInfo.id_rol === roleId;
  }

  // Verificar si es administrador
  isAdmin() {
    return this.hasRole(1); // Asumiendo que rol 1 es admin
  }

  // Verificar si es alumno
  isStudent() {
    return this.hasRole(3); // Rol 3 es alumno según tu código
  }
}

// Función global para cerrar sesión (compatible con tu código actual)
function handleLogout() {
  if (window.sessionManager) {
    window.sessionManager.logout();
  } else {
    // Fallback si no está inicializado
    sessionStorage.removeItem("usuario");
    window.location.href = 'login.html';
  }
}

// Inicializar el gestor de sesión cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  // Solo inicializar si no estamos en la página de login
  if (!window.location.pathname.includes('login.html')) {
    window.sessionManager = new SessionManager();
    
    // Hacer disponible globalmente para debugging
    window.getCurrentUser = () => window.sessionManager.getCurrentUser();
    window.refreshUserData = () => window.sessionManager.refreshUserData();
  }
});

// Funciones de utilidad globales
window.isLoggedIn = function() {
  return window.sessionManager ? window.sessionManager.isLoggedIn() : false;
};

window.getCurrentUserName = function() {
  const user = window.sessionManager ? window.sessionManager.getCurrentUser() : null;
  return user ? user.name : null;
};

// Exportar para uso en módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionManager;
}
function isMobile() {
    const userAgent = navigator.userAgent.toLowerCase();
    // Comprobar si el dispositivo es un teléfono móvil o tablet
    return /iphone|ipod|android|blackberry|windows phone|mobile|tablet/i.test(userAgent);
}

if (isMobile()) {
    window.location.href = "mobile.html";
}

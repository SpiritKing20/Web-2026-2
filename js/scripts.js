document.addEventListener('DOMContentLoaded', () => {
    const themeCheckbox = document.getElementById('theme-checkbox');
    const sessionInfo = document.getElementById('session-info');

    // 1. LOCALSTORAGE: Cargar estado guardado
    const savedTheme = localStorage.getItem('themePreference');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeCheckbox.checked = true;
    }

    // 2. SESSIONSTORAGE: Contador de cambios en la sesión
    let toggleCount = parseInt(sessionStorage.getItem('themeToggleCount')) || 0;
    sessionInfo.textContent = `Sesión activa: ${toggleCount} cambio(s) de tema realizados.`;

    // 3. EVENTO DE CAMBIO
    themeCheckbox.addEventListener('change', () => {
        const isDark = themeCheckbox.checked;

        if (isDark) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('themePreference', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('themePreference', 'light');
        }

        // Actualizar sessionStorage
        toggleCount++;
        sessionStorage.setItem('themeToggleCount', toggleCount);
        sessionInfo.textContent = `Sesión activa: ${toggleCount} cambio(s) de tema realizados.`;
    });
});
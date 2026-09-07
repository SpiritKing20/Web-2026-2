document.addEventListener('DOMContentLoaded', () => {
    const themeCheckbox = document.getElementById('theme-checkbox');
    const sessionInfo = document.getElementById('session-info');
    const financeApp = document.getElementById('finance-app');
    const setupView = document.getElementById('setup-view');
    const dashboardView = document.getElementById('dashboard-view');
    const setupForm = document.getElementById('setup-form');
    const expenseForm = document.getElementById('expense-form');
    const financeStorageKey = 'personalFinanceData';
    let financeData = JSON.parse(localStorage.getItem(financeStorageKey)) || null;

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

    const formatCurrency = (value) => new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(value);

    const saveFinanceData = () => localStorage.setItem(financeStorageKey, JSON.stringify(financeData));

    const renderDashboard = () => {
        const dailyTotal = financeData.dailyExpenses.reduce((total, expense) => total + expense.amount, 0);
        const committed = financeData.fixedExpenses + financeData.sharedExpenses;
        const balance = financeData.income - committed - dailyTotal;
        document.getElementById('summary-income').textContent = formatCurrency(financeData.income);
        document.getElementById('summary-committed').textContent = formatCurrency(committed);
        document.getElementById('summary-daily').textContent = formatCurrency(dailyTotal);
        document.getElementById('summary-balance').textContent = formatCurrency(balance);
        document.getElementById('summary-balance').classList.toggle('negative-value', balance < 0);
        document.getElementById('expense-count').textContent = financeData.dailyExpenses.length;
        const expenseList = document.getElementById('expense-list');
        expenseList.innerHTML = financeData.dailyExpenses.length ? financeData.dailyExpenses.map((expense) => `
            <div class="expense-item"><span><strong>${expense.name}</strong><small>${expense.date}</small></span><strong>${formatCurrency(expense.amount)}</strong></div>
        `).join('') : '<p class="empty-state">Todavía no hay gastos registrados.</p>';
    };

    const showFinance = () => {
        financeApp.classList.remove('d-none');
        document.getElementById('modules').classList.add('finance-open');
        setupView.classList.toggle('d-none', Boolean(financeData));
        dashboardView.classList.toggle('d-none', !financeData);
        if (financeData) renderDashboard();
        financeApp.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    document.getElementById('open-finance').addEventListener('click', showFinance);
    document.getElementById('close-finance').addEventListener('click', () => {
        financeApp.classList.add('d-none');
        document.getElementById('modules').classList.remove('finance-open');
    });

    setupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        financeData = {
            income: Number(document.getElementById('monthly-income').value),
            fixedExpenses: Number(document.getElementById('fixed-expenses').value),
            sharedExpenses: Number(document.getElementById('shared-expenses').value),
            dailyExpenses: []
        };
        saveFinanceData();
        showFinance();
    });

    expenseForm.addEventListener('submit', (event) => {
        event.preventDefault();
        financeData.dailyExpenses.unshift({
            name: document.getElementById('expense-name').value.trim(),
            amount: Number(document.getElementById('expense-amount').value),
            date: new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' }).format(new Date())
        });
        saveFinanceData();
        expenseForm.reset();
        renderDashboard();
    });

    document.getElementById('reset-finance').addEventListener('click', () => {
        if (!window.confirm('¿Quieres borrar la configuración y todos los gastos guardados?')) return;
        localStorage.removeItem(financeStorageKey);
        financeData = null;
        setupForm.reset();
        showFinance();
    });

});
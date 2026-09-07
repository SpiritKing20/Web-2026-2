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

    const renderExpenseChart = () => {
        const canvas = document.getElementById('expense-chart');
        const wrapper = canvas.parentElement;
        const width = wrapper.clientWidth;
        const height = 260;
        const pixelRatio = window.devicePixelRatio || 1;
        const context = canvas.getContext('2d');
        const expenses = [...financeData.dailyExpenses].reverse();
        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;
        canvas.style.height = `${height}px`;
        context.scale(pixelRatio, pixelRatio);
        context.clearRect(0, 0, width, height);
        context.font = '12px system-ui, sans-serif';
        context.fillStyle = document.body.classList.contains('dark-mode') ? '#aab4c2' : '#687386';
        if (!expenses.length) {
            context.textAlign = 'center';
            context.fillText('Registra un gasto para ver la gráfica.', width / 2, height / 2);
            return;
        }
        const padding = { top: 20, right: 18, bottom: 48, left: 58 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        const maxAmount = Math.max(...expenses.map((expense) => expense.amount), 1);
        const barGap = Math.max(8, chartWidth / expenses.length * .18);
        const barWidth = Math.max(18, chartWidth / expenses.length - barGap);
        const color = document.body.classList.contains('dark-mode') ? '#6ea8fe' : '#0d6efd';
        context.strokeStyle = document.body.classList.contains('dark-mode') ? '#3b4654' : '#e3e8ef';
        context.fillStyle = document.body.classList.contains('dark-mode') ? '#aab4c2' : '#687386';
        context.textAlign = 'right';
        for (let step = 0; step <= 2; step += 1) {
            const y = padding.top + chartHeight - chartHeight * step / 2;
            context.beginPath();
            context.moveTo(padding.left, y);
            context.lineTo(width - padding.right, y);
            context.stroke();
            context.fillText(formatCurrency(maxAmount * step / 2).replace(' ', ' '), padding.left - 8, y + 4);
        }
        expenses.forEach((expense, index) => {
            const x = padding.left + index * (chartWidth / expenses.length) + barGap / 2;
            const barHeight = chartHeight * expense.amount / maxAmount;
            const y = padding.top + chartHeight - barHeight;
            context.fillStyle = color;
            context.beginPath();
            context.roundRect(x, y, barWidth, barHeight, 5);
            context.fill();
            context.fillStyle = document.body.classList.contains('dark-mode') ? '#aab4c2' : '#687386';
            context.textAlign = 'center';
            context.fillText(expense.name.slice(0, 12), x + barWidth / 2, height - 24);
        });
    };

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
        renderExpenseChart();
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

    window.addEventListener('resize', () => {
        if (financeData && !dashboardView.classList.contains('d-none')) renderExpenseChart();
    });
});
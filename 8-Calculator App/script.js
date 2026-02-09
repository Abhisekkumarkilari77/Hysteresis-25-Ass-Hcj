/* =====================================================
   CALCULATOR APP - JAVASCRIPT
   Event Handling, State Management, Calculation Logic
   ===================================================== */

// ========== CALCULATOR STATE OBJECT ==========
const calculator = {
    // Display values
    currentOperand: '0',
    previousOperand: '',
    operation: null,
    
    // Memory and history
    memory: 0,
    history: [],
    
    // Flag to check if we should replace current operand on next digit
    shouldResetDisplay: false
};

// ========== DOM ELEMENTS CACHE ==========
const DOM = {
    // Display elements
    currentOperand: document.getElementById('currentOperand'),
    previousOperand: document.getElementById('previousOperand'),
    
    // Button elements
    numberButtons: document.querySelectorAll('.btn-number'),
    operatorButtons: document.querySelectorAll('.btn-operator'),
    decimalBtn: document.getElementById('decimalBtn'),
    equalsBtn: document.getElementById('equalsBtn'),
    acBtn: document.getElementById('acBtn'),
    delBtn: document.getElementById('delBtn'),
    percentBtn: document.getElementById('percentBtn'),
    
    // Memory buttons
    memoryClearBtn: document.getElementById('memoryClearBtn'),
    memoryRecallBtn: document.getElementById('memoryRecallBtn'),
    memoryAddBtn: document.getElementById('memoryAddBtn'),
    memorySubtractBtn: document.getElementById('memorySubtractBtn'),
    memoryIndicator: document.getElementById('memoryIndicator'),
    
    // History elements
    historyBtn: document.getElementById('historyBtn'),
    historyModal: document.getElementById('historyModal'),
    historyList: document.getElementById('historyList'),
    closeHistoryBtn: document.getElementById('closeHistoryBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    
    // Theme toggle
    themeToggle: document.getElementById('themeToggle')
};

// ========== INITIALIZATION ==========

/**
 * Initialize calculator on page load
 * Set up event listeners for all buttons
 * Load theme and memory from localStorage
 */
function initializeCalculator() {
    // Load persisted data from localStorage
    loadTheme();
    loadHistory();
    loadMemory();
    
    // Attach event listeners
    attachEventListeners();
    
    // Update display
    updateDisplay();
    updateMemoryIndicator();
}

/**
 * Attach all event listeners to buttons and inputs
 */
function attachEventListeners() {
    // Number buttons
    DOM.numberButtons.forEach(btn => {
        btn.addEventListener('click', () => handleNumberInput(btn.textContent));
    });
    
    // Decimal button
    DOM.decimalBtn.addEventListener('click', () => handleDecimal());
    
    // Operator buttons
    DOM.operatorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const operation = btn.textContent;
            handleOperation(operation);
        });
    });
    
    // Equals button
    DOM.equalsBtn.addEventListener('click', () => handleEquals());
    
    // Clear and Delete buttons
    DOM.acBtn.addEventListener('click', () => handleClear());
    DOM.delBtn.addEventListener('click', () => handleDelete());
    DOM.percentBtn.addEventListener('click', () => handlePercent());
    
    // Memory buttons
    DOM.memoryClearBtn.addEventListener('click', () => handleMemoryClear());
    DOM.memoryRecallBtn.addEventListener('click', () => handleMemoryRecall());
    DOM.memoryAddBtn.addEventListener('click', () => handleMemoryAdd());
    DOM.memorySubtractBtn.addEventListener('click', () => handleMemorySubtract());
    
    // History buttons
    DOM.historyBtn.addEventListener('click', () => openHistory());
    DOM.closeHistoryBtn.addEventListener('click', () => closeHistory());
    DOM.clearHistoryBtn.addEventListener('click', () => clearHistory());
    DOM.historyModal.addEventListener('click', (e) => {
        if (e.target === DOM.historyModal) closeHistory();
    });
    
    // Theme toggle
    DOM.themeToggle.addEventListener('click', () => toggleTheme());
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyboardInput);
}

// ========== INPUT HANDLERS ==========

/**
 * Handle number button clicks
 * @param {string} number - The digit pressed (0-9)
 */
function handleNumberInput(number) {
    // If display should be reset, replace current operand
    if (calculator.shouldResetDisplay) {
        calculator.currentOperand = number;
        calculator.shouldResetDisplay = false;
    } else {
        // Prevent leading zeros (0001 becomes 1), but allow 0.xxx
        if (calculator.currentOperand === '0' && number !== '.') {
            calculator.currentOperand = number;
        } else {
            // Prevent massive numbers - limit to 16 digits
            if (calculator.currentOperand.replace(/[^0-9]/g, '').length < 16) {
                calculator.currentOperand += number;
            }
        }
    }
    updateDisplay();
}

/**
 * Handle decimal point input
 * Prevent multiple decimals in one number
 */
function handleDecimal() {
    // Reset display if needed (operation just pressed)
    if (calculator.shouldResetDisplay) {
        calculator.currentOperand = '0';
        calculator.shouldResetDisplay = false;
    }
    
    // Only add decimal if not already present
    if (!calculator.currentOperand.includes('.')) {
        calculator.currentOperand += '.';
    }
    updateDisplay();
}

/**
 * Handle operator button clicks
 * Allow chained operations (12 + 7 - 5 × 2)
 * @param {string} operation - The operator: +, −, ×, ÷, %
 */
function handleOperation(operation) {
    // Convert display symbols to standard operators for calculation
    const operatorMap = {
        '×': '*',
        '÷': '/',
        '−': '-',
        '+': '+'
    };
    
    const currentValue = parseFloat(calculator.currentOperand);
    
    // If there's already an operation and current operand, calculate first
    if (calculator.previousOperand && calculator.operation && !calculator.shouldResetDisplay) {
        const result = calculateExpression(
            parseFloat(calculator.previousOperand),
            currentValue,
            operatorMap[calculator.operation]
        );
        calculator.currentOperand = formatNumber(result);
    }
    
    // Set up for next operation
    calculator.previousOperand = calculator.currentOperand;
    calculator.operation = operation;
    calculator.shouldResetDisplay = true;
    updateDisplay();
}

/**
 * Handle equals button - calculate final result
 */
function handleEquals() {
    // If no operation is pending, do nothing
    if (!calculator.operation || !calculator.previousOperand) {
        return;
    }
    
    const operatorMap = {
        '×': '*',
        '÷': '/',
        '−': '-',
        '+': '+'
    };
    
    const prev = parseFloat(calculator.previousOperand);
    const current = parseFloat(calculator.currentOperand);
    const result = calculateExpression(prev, current, operatorMap[calculator.operation]);
    
    // Check for division by zero
    if (!isFinite(result)) {
        calculator.currentOperand = 'Error';
        calculator.previousOperand = '';
        calculator.operation = null;
        updateDisplay();
        return;
    }
    
    // Save to history before updating display
    addToHistory(calculator.previousOperand, calculator.operation, calculator.currentOperand, result);
    
    // Update state
    calculator.currentOperand = formatNumber(result);
    calculator.previousOperand = '';
    calculator.operation = null;
    calculator.shouldResetDisplay = true;
    
    updateDisplay();
}

/**
 * Handle AC (All Clear) button
 */
function handleClear() {
    calculator.currentOperand = '0';
    calculator.previousOperand = '';
    calculator.operation = null;
    calculator.shouldResetDisplay = false;
    updateDisplay();
}

/**
 * Handle DEL (Delete) button - remove last digit
 */
function handleDelete() {
    // Only delete if we have something to delete
    if (calculator.currentOperand.length > 1) {
        calculator.currentOperand = calculator.currentOperand.slice(0, -1);
    } else {
        calculator.currentOperand = '0';
    }
    updateDisplay();
}

/**
 * Handle percentage calculation
 * For example: 100 + 20% calculates as 100 + (100 * 0.20) = 120
 */
function handlePercent() {
    if (calculator.operation && calculator.previousOperand) {
        const prev = parseFloat(calculator.previousOperand);
        const current = parseFloat(calculator.currentOperand);
        const percentValue = (prev * current) / 100;
        calculator.currentOperand = formatNumber(percentValue);
        updateDisplay();
    } else if (!calculator.operation) {
        // If no operation, percentage converts current value to its percent form
        const current = parseFloat(calculator.currentOperand);
        const percentValue = current / 100;
        calculator.currentOperand = formatNumber(percentValue);
        updateDisplay();
    }
}

// ========== MEMORY FUNCTIONS ==========

/**
 * Clear memory (MC button)
 */
function handleMemoryClear() {
    calculator.memory = 0;
    saveMemory();
    updateMemoryIndicator();
}

/**
 * Recall memory (MR button)
 */
function handleMemoryRecall() {
    if (calculator.shouldResetDisplay) {
        calculator.currentOperand = formatNumber(calculator.memory);
        calculator.shouldResetDisplay = false;
    } else {
        calculator.currentOperand = formatNumber(calculator.memory);
    }
    updateDisplay();
}

/**
 * Add current value to memory (M+ button)
 */
function handleMemoryAdd() {
    calculator.memory += parseFloat(calculator.currentOperand);
    saveMemory();
    updateMemoryIndicator();
}

/**
 * Subtract current value from memory (M− button)
 */
function handleMemorySubtract() {
    calculator.memory -= parseFloat(calculator.currentOperand);
    saveMemory();
    updateMemoryIndicator();
}

/**
 * Update the memory indicator on UI
 */
function updateMemoryIndicator() {
    if (calculator.memory !== 0) {
        DOM.memoryIndicator.textContent = `M: ${formatNumber(calculator.memory)}`;
        DOM.memoryIndicator.style.opacity = '1';
    } else {
        DOM.memoryIndicator.textContent = '';
        DOM.memoryIndicator.style.opacity = '0';
    }
}

// ========== CALCULATION ENGINE ==========

/**
 * Calculate basic arithmetic operation
 * @param {number} prev - Previous operand
 * @param {number} current - Current operand
 * @param {string} operation - Operator: +, -, *, /
 * @returns {number} Result of operation
 */
function calculateExpression(prev, current, operation) {
    // Validate inputs
    if (isNaN(prev) || isNaN(current)) {
        return NaN;
    }
    
    switch (operation) {
        case '+':
            return prev + current;
        case '-':
            return prev - current;
        case '*':
            return prev * current;
        case '/':
            // Division by zero handling
            if (current === 0) {
                return Infinity; // Will be caught and displayed as error
            }
            return prev / current;
        default:
            return NaN;
    }
}

/**
 * Format numbers for display
 * - Handle large numbers gracefully
 * - Limit decimal places
 * - Prevent scientific notation for display
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
    // Handle special cases
    if (num === Infinity) {
        return 'Error';
    }
    if (isNaN(num)) {
        return '0';
    }
    
    // Convert to string to check decimal places
    const numStr = num.toString();
    
    // Limit to reasonable decimal places
    if (numStr.includes('.')) {
        const decimalPlaces = numStr.split('.')[1].length;
        if (decimalPlaces > 10) {
            return parseFloat(num.toFixed(10)).toString();
        }
    }
    
    return numStr;
}

// ========== DISPLAY UPDATE ==========

/**
 * Update the calculator display based on current state
 */
function updateDisplay() {
    // Update current operand display
    DOM.currentOperand.textContent = calculator.currentOperand;
    
    // Update previous operand + operation display
    if (calculator.operation) {
        DOM.previousOperand.textContent = calculator.previousOperand + ' ' + calculator.operation;
    } else {
        DOM.previousOperand.textContent = '';
    }
}

// ========== KEYBOARD SUPPORT ==========

/**
 * Handle keyboard input
 * Supports: 0-9, operators, Enter (equals), Backspace (delete), Escape (clear)
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardInput(event) {
    // Get the key pressed
    const key = event.key;
    
    // Number keys (0-9)
    if (key >= '0' && key <= '9') {
        event.preventDefault();
        handleNumberInput(key);
        // Visual feedback - highlight number button
        highlightButton(key);
    }
    
    // Decimal point
    else if (key === '.') {
        event.preventDefault();
        handleDecimal();
        highlightButton('.');
    }
    
    // Operators
    else if (key === '+') {
        event.preventDefault();
        handleOperation('+');
        highlightButton('+');
    }
    else if (key === '-') {
        event.preventDefault();
        handleOperation('−');
        highlightButton('−');
    }
    else if (key === '*') {
        event.preventDefault();
        handleOperation('×');
        highlightButton('×');
    }
    else if (key === '/') {
        event.preventDefault();
        handleOperation('÷');
        highlightButton('÷');
    }
    
    // Equals
    else if (key === 'Enter') {
        event.preventDefault();
        handleEquals();
        highlightButton('=');
    }
    
    // Delete/Backspace
    else if (key === 'Backspace') {
        event.preventDefault();
        handleDelete();
        highlightButton('DEL');
    }
    
    // Clear
    else if (key === 'Escape') {
        event.preventDefault();
        handleClear();
        highlightButton('AC');
    }
}

/**
 * Visual feedback for keyboard presses
 * @param {string} key - Key or button identifier
 */
function highlightButton(key) {
    // Find the button element
    let button;
    
    if (key >= '0' && key <= '9') {
        button = Array.from(DOM.numberButtons).find(btn => btn.textContent === key);
    } else if (key === '.') {
        button = DOM.decimalBtn;
    } else if (key === '+') {
        button = DOM.operatorButtons[3];
    } else if (key === '−') {
        button = DOM.operatorButtons[2];
    } else if (key === '×') {
        button = DOM.operatorButtons[1];
    } else if (key === '÷') {
        button = DOM.operatorButtons[0];
    } else if (key === '=') {
        button = DOM.equalsBtn;
    } else if (key === 'DEL') {
        button = DOM.delBtn;
    } else if (key === 'AC') {
        button = DOM.acBtn;
    }
    
    // Add visual feedback
    if (button) {
        button.style.opacity = '0.7';
        setTimeout(() => {
            button.style.opacity = '1';
        }, 100);
    }
}

// ========== HISTORY MANAGEMENT ==========

/**
 * Add calculation to history
 * @param {string} prev - Previous operand
 * @param {string} op - Operation
 * @param {string} current - Current operand
 * @param {number} result - Result
 */
function addToHistory(prev, op, current, result) {
    const entry = {
        expression: prev + ' ' + op + ' ' + current,
        result: formatNumber(result),
        timestamp: new Date().toLocaleTimeString()
    };
    
    calculator.history.unshift(entry); // Add to beginning
    
    // Keep only last 50 entries
    if (calculator.history.length > 50) {
        calculator.history.pop();
    }
    
    saveHistory();
}

/**
 * Open history modal
 */
function openHistory() {
    DOM.historyModal.classList.add('show');
    renderHistoryList();
}

/**
 * Close history modal
 */
function closeHistory() {
    DOM.historyModal.classList.remove('show');
}

/**
 * Render history list in modal
 */
function renderHistoryList() {
    if (calculator.history.length === 0) {
        DOM.historyList.innerHTML = '<p class="empty-message">No calculations yet</p>';
        return;
    }
    
    const historyHTML = calculator.history
        .map((entry, index) => `
            <div class="history-item" onclick="useHistoryItem(${index})">
                <div class="history-expression">${entry.expression}</div>
                <div class="history-result">= ${entry.result}</div>
                <small style="opacity: 0.6;">${entry.timestamp}</small>
            </div>
        `)
        .join('');
    
    DOM.historyList.innerHTML = historyHTML;
}

/**
 * Use a calculation from history
 * @param {number} index - Index in history array
 */
function useHistoryItem(index) {
    const entry = calculator.history[index];
    calculator.currentOperand = entry.result;
    calculator.previousOperand = '';
    calculator.operation = null;
    calculator.shouldResetDisplay = true;
    updateDisplay();
    closeHistory();
}

/**
 * Clear entire history
 */
function clearHistory() {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
        calculator.history = [];
        saveHistory();
        renderHistoryList();
    }
}

// ========== THEME MANAGEMENT ==========

/**
 * Toggle between light and dark theme
 * Save preference to localStorage
 */
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('calculatorTheme', isDarkMode ? 'dark' : 'light');
    
    // Update theme toggle button content
    DOM.themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

/**
 * Load theme preference from localStorage
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('calculatorTheme');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        DOM.themeToggle.textContent = '☀️';
    } else {
        DOM.themeToggle.textContent = '🌙';
    }
}

// ========== LOCAL STORAGE PERSISTENCE ==========

/**
 * Save history to localStorage
 */
function saveHistory() {
    localStorage.setItem('calculatorHistory', JSON.stringify(calculator.history));
}

/**
 * Load history from localStorage
 */
function loadHistory() {
    const saved = localStorage.getItem('calculatorHistory');
    if (saved) {
        try {
            calculator.history = JSON.parse(saved);
        } catch (e) {
            calculator.history = [];
        }
    }
}

/**
 * Save memory value to localStorage
 */
function saveMemory() {
    localStorage.setItem('calculatorMemory', calculator.memory.toString());
}

/**
 * Load memory value from localStorage
 */
function loadMemory() {
    const saved = localStorage.getItem('calculatorMemory');
    if (saved) {
        calculator.memory = parseFloat(saved);
    }
}

// ========== START APPLICATION ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeCalculator();
});

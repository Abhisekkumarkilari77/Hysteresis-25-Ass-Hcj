const display = document.getElementById("display");
const keys = document.querySelector(".keys");

const state = {
  current: "0",
  previous: null,
  operator: null,
  overwrite: false
};

function updateDisplay() {
  display.textContent = state.current;
}

function inputNumber(value) {
  if (state.overwrite) {
    state.current = value === "." ? "0." : value;
    state.overwrite = false;
    return;
  }

  if (value === ".") {
    if (!state.current.includes(".")) {
      state.current += ".";
    }
    return;
  }

  if (state.current === "0") {
    state.current = value;
  } else {
    state.current += value;
  }
}

function clearAll() {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  state.overwrite = false;
}

function deleteOne() {
  if (state.overwrite) {
    state.current = "0";
    state.overwrite = false;
    return;
  }

  state.current = state.current.length > 1 ? state.current.slice(0, -1) : "0";
}

function calculate() {
  if (state.previous === null || state.operator === null) {
    return;
  }

  const a = Number(state.previous);
  const b = Number(state.current);
  let result;

  switch (state.operator) {
    case "+":
      result = a + b;
      break;
    case "-":
      result = a - b;
      break;
    case "*":
      result = a * b;
      break;
    case "/":
      result = b === 0 ? NaN : a / b;
      break;
    case "%":
      result = a % b;
      break;
    default:
      return;
  }

  state.current = Number.isFinite(result) ? String(result) : "Error";
  state.previous = null;
  state.operator = null;
  state.overwrite = true;
}

function setOperator(op) {
  if (state.current === "Error") {
    clearAll();
  }

  if (state.previous !== null && !state.overwrite) {
    calculate();
  }

  state.previous = state.current;
  state.operator = op;
  state.overwrite = true;
}

function handleAction(action) {
  if (action === "clear") clearAll();
  if (action === "delete") deleteOne();
  if (action === "equals") calculate();
}

keys.addEventListener("click", (event) => {
  const key = event.target.closest("button");
  if (!key) return;

  const number = key.dataset.number;
  const operator = key.dataset.operator;
  const action = key.dataset.action;

  if (number !== undefined) {
    inputNumber(number);
  } else if (operator) {
    setOperator(operator);
  } else if (action) {
    handleAction(action);
  }

  updateDisplay();
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if ((key >= "0" && key <= "9") || key === ".") {
    inputNumber(key);
  } else if (["+", "-", "*", "/", "%"].includes(key)) {
    setOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    deleteOne();
  } else if (key === "Escape") {
    clearAll();
  } else {
    return;
  }

  updateDisplay();
});

updateDisplay();

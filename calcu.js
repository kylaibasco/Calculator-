
const display = document.getElementById("text1");
const previousDisplay = document.getElementById("previousDisplay");

const scientificPanel = document.getElementById("scientificPanel");
const basicKeypad = document.getElementById("basicKeypad");

const historyPanel = document.getElementById("historyPanel");
const converterPanel = document.getElementById("converterPanel");

const historyList = document.getElementById("historyList");

const displayArea = document.getElementById("displayArea");
const calculatorContent = document.getElementById("calculatorContent");

let history = [];
let currentView = "calculator";
let scientificMode = false;

function settings() {
    document.body.classList.add("dark-mode");

    document.getElementById("fst").style.display = "none";
    document.getElementById("dm1").style.display = "block";
}

function dm() {
    document.body.classList.remove("dark-mode");

    document.getElementById("fst").style.display = "block";
    document.getElementById("dm1").style.display = "none";
}

function event1(value) {
    if (display.value === "Invalid Input") {
        clear_screen();
    }

    display.value += value;
}

function scientific(value) {
    if (display.value === "Invalid Input") {
        clear_screen();
    }

    display.value += value;
}

function clear_screen() {
    display.value = "";
    previousDisplay.textContent = "";
}

function backspace() {
    if (currentView !== "calculator") {
        showCalculator();
        return;
    }

    if (display.value === "Invalid Input") {
        clear_screen();
        return;
    }

    display.value = display.value.slice(0, -1);
}

function toggleSign() {
    if (!display.value) return;

    if (display.value.startsWith("-")) {
        display.value = display.value.slice(1);
    } else {
        display.value = "-" + display.value;
    }
}

function toggleScientific() {
    if (currentView !== "calculator") {
        showCalculator();
    }

    scientificMode = !scientificMode;

    scientificPanel.classList.toggle("show", scientificMode);

    document.getElementById("scientificIcon")
        .classList.toggle("active", scientificMode);
}

function square() {
    if (!display.value) return;

    display.value += "**2";
}

function sr() {
    if (!display.value) {
        display.value = "sqrt(";
    } else {
        display.value = "sqrt(" + display.value + ")";
    }
}

function cr() {
    if (!display.value) {
        display.value = "cbrt(";
    } else {
        display.value = "cbrt(" + display.value + ")";
    }
}

function event2() {
    try {
        let expression = display.value;

        if (!expression.trim()) return;

        let originalExpression = expression;

        expression = expression.replace(/π/g, "pi");
        expression = expression.replace(/\^/g, "**");

        expression = expression.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );

        expression = expression.replace(/\bpi\b/g, "Math.PI");
        expression = expression.replace(/\be\b/g, "Math.E");

        const functions = [
            "sqrt", "cbrt", "sin", "cos", "tan",
            "asin", "acos", "atan", "log", "ln",
            "abs", "exp"
        ];

        functions.forEach(name => {
            const regex = new RegExp("\\b" + name + "\\(", "g");

            expression = expression.replace(
                regex,
                "Math." + (name === "ln" ? "log" : name) + "("
            );
        });

        expression = expression.replace(
            /Math\.(sin|cos|tan)\(/g,
            "Math.$1(Math.PI/180*("
        );

        expression = expression.replace(
            /Math\.(asin|acos|atan)\(/g,
            "(180/Math.PI*Math.$1("
        );

        expression = expression.replace(
            /(\d+(?:\.\d+)?)!/g,
            "factorial($1)"
        );

        const result = Function(
            "factorial",
            '"use strict"; return (' + expression + ')'
        )(factorial);

        if (!Number.isFinite(result)) {
            throw new Error("Invalid calculation");
        }

        previousDisplay.textContent = originalExpression + " =";

        display.value = Number(result.toPrecision(12)).toString();

        addHistory(originalExpression, display.value);

    } catch (error) {
        display.value = "Invalid Input";

        setTimeout(() => {
            if (display.value === "Invalid Input") {
                display.value = "";
            }
        }, 1500);
    }
}

function factorial(number) {
    if (!Number.isInteger(number) || number < 0 || number > 170) {
        throw new Error("Invalid factorial");
    }

    let result = 1;

    for (let i = 2; i <= number; i++) {
        result *= i;
    }

    return result;
}

function toggleHistory() {
    currentView = "history";

    historyPanel.classList.add("show");
    converterPanel.classList.remove("show");

    displayArea.classList.add("hidden");
    calculatorContent.classList.add("hidden");

    document.getElementById("historyIcon").classList.add("active");
    document.getElementById("converterIcon").classList.remove("active");

    scientificPanel.classList.remove("show");

    scientificMode = false;

    document.getElementById("scientificIcon").classList.remove("active");
}

function addHistory(expression, result) {
    history.unshift({
        expression: expression,
        result: result
    });

    updateHistory();
}

function updateHistory() {
    historyList.innerHTML = "";

    if (history.length === 0) {
        historyList.innerHTML =
            '<p class="empty-message">No history yet.</p>';

        return;
    }

    history.forEach(item => {
        const div = document.createElement("div");

        div.className = "history-item";

        const expression = document.createElement("div");

        expression.className = "history-expression";
        expression.textContent = item.expression;

        const result = document.createElement("div");

        result.className = "history-result";
        result.textContent = "= " + item.result;

        div.appendChild(expression);
        div.appendChild(result);

        div.onclick = function() {
            showCalculator();

            display.value = item.result;

            previousDisplay.textContent = item.expression + " =";
        };

        historyList.appendChild(div);
    });
}

function clearHistory() {
    history = [];

    updateHistory();
}

const units = {
    Length: {
        Meter: 1,
        Kilometer: 1000,
        Centimeter: 0.01,
        Millimeter: 0.001,
        Mile: 1609.344,
        Yard: 0.9144,
        Foot: 0.3048,
        Inch: 0.0254
    },

    Area: {
        "Square Meter": 1,
        "Square Kilometer": 1000000,
        "Square Centimeter": 0.0001,
        Hectare: 10000,
        Acre: 4046.856
    },

    Volume: {
        Liter: 1,
        Milliliter: 0.001,
        "Cubic Meter": 1000,
        Gallon: 3.78541,
        Cup: 0.236588
    },

    Mass: {
        Kilogram: 1,
        Gram: 0.001,
        Milligram: 0.000001,
        Pound: 0.453592,
        Ounce: 0.0283495,
        Ton: 1000
    },

    Data: {
        Byte: 1,
        Kilobyte: 1024,
        Megabyte: 1048576,
        Gigabyte: 1073741824,
        Terabyte: 1099511627776
    },

    Speed: {
        "Meter/Second": 1,
        "Kilometer/Hour": 0.277778,
        "Mile/Hour": 0.44704,
        Knot: 0.514444
    },

    Time: {
        Second: 1,
        Minute: 60,
        Hour: 3600,
        Day: 86400,
        Week: 604800
    },

    Temperature: {
        Celsius: "C",
        Fahrenheit: "F",
        Kelvin: "K"
    }
};

function loadUnits() {
    const category = document.getElementById("unitCategory").value;

    const from = document.getElementById("fromUnit");
    const to = document.getElementById("toUnit");

    from.innerHTML = "";
    to.innerHTML = "";

    Object.keys(units[category]).forEach(unit => {
        from.add(new Option(unit, unit));
        to.add(new Option(unit, unit));
    });

    if (category === "Length") {
        to.value = "Kilometer";
    }

    convertUnits();
}

function convertUnits() {
    const category = document.getElementById("unitCategory").value;

    const value = parseFloat(
        document.getElementById("fromValue").value
    );

    const from = document.getElementById("fromUnit").value;
    const to = document.getElementById("toUnit").value;

    const output = document.getElementById("toValue");

    if (!Number.isFinite(value)) {
        output.value = "";
        return;
    }

    let result;

    if (category === "Temperature") {
        let celsius;

        if (from === "Celsius") {
            celsius = value;
        } else if (from === "Fahrenheit") {
            celsius = (value - 32) * 5 / 9;
        } else {
            celsius = value - 273.15;
        }

        if (to === "Celsius") {
            result = celsius;
        } else if (to === "Fahrenheit") {
            result = (celsius * 9 / 5) + 32;
        } else {
            result = celsius + 273.15;
        }

    } else {
        const baseValue = value * units[category][from];

        result = baseValue / units[category][to];
    }

    output.value = Number(result.toPrecision(10)).toString();
}

function swapUnits() {
    const from = document.getElementById("fromUnit");
    const to = document.getElementById("toUnit");

    const temporary = from.value;

    from.value = to.value;
    to.value = temporary;

    const fromValue = document.getElementById("fromValue");
    const toValue = document.getElementById("toValue");

    fromValue.value = toValue.value;

    convertUnits();
}

function toggleConverter() {
    currentView = "converter";

    converterPanel.classList.add("show");
    historyPanel.classList.remove("show");

    displayArea.classList.add("hidden");
    calculatorContent.classList.add("hidden");

    document.getElementById("converterIcon").classList.add("active");
    document.getElementById("historyIcon").classList.remove("active");

    scientificPanel.classList.remove("show");

    scientificMode = false;

    document.getElementById("scientificIcon").classList.remove("active");
}

function showCalculator() {
    currentView = "calculator";

    historyPanel.classList.remove("show");
    converterPanel.classList.remove("show");

    displayArea.classList.remove("hidden");
    calculatorContent.classList.remove("hidden");

    document.getElementById("historyIcon").classList.remove("active");
    document.getElementById("converterIcon").classList.remove("active");

    basicKeypad.style.display = "grid";
}

loadUnits();
updateHistory();

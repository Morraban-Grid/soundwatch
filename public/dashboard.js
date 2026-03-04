const socket = io();

const bar = document.getElementById("bar");
const valueText = document.getElementById("value");
const statusText = document.getElementById("status");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

let history = [];
let timeHistory = [];
let startTime = Date.now();

socket.on("audioData", (db) => {

    valueText.innerText = db.toFixed(2) + " dB";

    // Convertir dB negativos a altura positiva
    let normalized = db + 100; 
    if (normalized < 0) normalized = 0;

    let height = normalized * 3;
    if (height > 350) height = 350;
    bar.style.height = height + "px";

    // Estados
    if (db < -50) {
        bar.style.background = "limegreen";
        statusText.innerText = "Silencio";
    }
    else if (db < -20) {
        bar.style.background = "orange";
        statusText.innerText = "Moderado";
    }
    else {
        bar.style.background = "red";
        statusText.innerText = "Alto";
    }

    let currentTime = (Date.now() - startTime) / 1000;

    history.push(db);
    timeHistory.push(currentTime);

    if (history.length > 200) {
        history.shift();
        timeHistory.shift();
    }

    drawChart();
});

function drawChart() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ejes
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, canvas.height - 30);
    ctx.lineTo(canvas.width - 10, canvas.height - 30);
    ctx.stroke();

    // Gráfica
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;

    for (let i = 0; i < history.length; i++) {

        let x = 40 + (i / 200) * (canvas.width - 60);

        let y = canvas.height - 30 - ((history[i] + 100) * 2);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.stroke();
}
const socket = io();
const startBtn = document.getElementById("startBtn");
const levelText = document.getElementById("level");

startBtn.onclick = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 256;
        microphone.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        // 🔥 Medición interna rápida
        function getCurrentDB() {
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }

            let average = sum / dataArray.length;
            let db = 20 * Math.log10(average / 255);
            if (!isFinite(db)) db = -90;

            return db;
        }

        // 🔥 Mostrar nivel en tiempo real en el celular
        function updateLocalDisplay() {
            const db = getCurrentDB();
            levelText.textContent = "Nivel: " + db.toFixed(2) + " dB";
            requestAnimationFrame(updateLocalDisplay);
        }

        updateLocalDisplay();

        // 🔥 ENVIAR SOLO 1 VEZ POR SEGUNDO
        setInterval(() => {
            const db = getCurrentDB();
            socket.emit("audioData", { db: db });
        }, 1000);

    } catch (err) {
        alert("Permiso de micrófono DENEGADO o error.");
        console.error(err);
    }
};
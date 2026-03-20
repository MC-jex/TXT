<script>
let lines = [];
let currentLine = 0;

/* =========================
   VELOCIDAD GLOBAL
========================= */
function getSpeed() {
    const val = parseInt(document.getElementById("speed").value) || 5;

    return {
        word: 400 - (val * 30),
        line: 2000 - (val * 120)
    };
}

/* =========================
   INICIO
========================= */
function start() {
    const text = document.getElementById("input").value;
    lines = text.split("\n");

    const container = document.getElementById("lyrics");
    container.innerHTML = "";

    lines.forEach(line => {
        const div = document.createElement("div");
        div.className = "line";

        const words = line.split(" ");
        words.forEach(word => {
            const span = document.createElement("span");
            span.className = "word";
            span.innerText = word + " ";
            div.appendChild(span);
        });

        container.appendChild(div);
    });

    applyStyles();

    currentLine = 0;
    playLine();
}

/* =========================
   ESTILOS
========================= */
function applyStyles() {
    const font = document.getElementById("fontSelect").value;
    const activeColor = document.getElementById("activeColor").value;
    const inactiveColor = document.getElementById("inactiveColor").value;
    const bgColor = document.getElementById("bgColor").value;

    document.body.style.fontFamily = font;

    document.getElementById("display").style.background =
        `linear-gradient(${bgColor}, #999)`;

    document.querySelectorAll(".line").forEach(line => {
        line.style.color = inactiveColor;
    });

    document.querySelectorAll(".active").forEach(line => {
        line.style.color = activeColor;
    });
}

/* =========================
   ANIMACIÓN LÍNEAS
========================= */
function playLine() {
    const allLines = document.querySelectorAll(".line");

    if (currentLine > 0) {
        allLines[currentLine - 1].classList.remove("active");
    }

    if (currentLine < allLines.length) {
        const line = allLines[currentLine];
        line.classList.add("active");

        applyStyles();

        line.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        animateWords(line, () => {
            currentLine++;
            playLine();
        });
    }
}

/* =========================
   ANIMACIÓN PALABRAS
========================= */
function animateWords(line, callback) {
    const words = line.querySelectorAll(".word");
    let i = 0;

    const speed = getSpeed();

    function nextWord() {
        if (i > 0) words[i - 1].classList.remove("active-word");

        if (i < words.length) {
            words[i].classList.add("active-word");
            i++;
            setTimeout(nextWord, speed.word);
        } else {
            setTimeout(callback, speed.line / 2);
        }
    }

    nextWord();
}

/* =========================
   EXPORTAR VIDEO (FIX)
========================= */
async function exportVideo() {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let stream = canvas.captureStream(30);
    let recorder;

    try {
        recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
    } catch {
        recorder = new MediaRecorder(stream);
    }

    let chunks = [];

    recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "lyrics-video.webm";
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            URL.revokeObjectURL(url);
            a.remove();
        }, 1000);
    };

    recorder.start();

    let i = 0;
    const speed = getSpeed();

    const bgColor = document.getElementById("bgColor").value;
    const activeColor = document.getElementById("activeColor").value;
    const font = document.getElementById("fontSelect").value;

    function draw() {
        if (i >= lines.length) {
            recorder.stop();
            return;
        }

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = activeColor;
        ctx.font = "bold 48px " + font;
        ctx.textAlign = "center";

        wrapText(ctx, lines[i], canvas.width / 2, canvas.height / 2, 600, 60);

        i++;

        setTimeout(draw, speed.line);
    }

    draw();
}

/* =========================
   TEXTO MULTILÍNEA
========================= */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let linesArr = [];

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + " ";
        let testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth && n > 0) {
            linesArr.push(line);
            line = words[n] + " ";
        } else {
            line = testLine;
        }
    }

    linesArr.push(line);

    for (let i = 0; i < linesArr.length; i++) {
        ctx.fillText(linesArr[i], x, y + (i * lineHeight));
    }
}
</script>

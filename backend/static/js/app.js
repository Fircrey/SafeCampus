/* =============================================
   SISTEMA DE DETECCION DE ARMAS - CLIENT APP
   Universidad Jorge Tadeo Lozano
   ============================================= */
(function () {
    "use strict";

    // ------------------------------------
    // DOM CACHE
    // ------------------------------------
    var $ = function (id) { return document.getElementById(id); };

    var dom = {
        clock:          $("clock"),
        statusDot:      $("statusDot"),
        statusText:     $("statusText"),
        alertBanner:    $("alertBanner"),
        alertText:      $("alertText"),
        videoFeed:      $("videoFeed"),
        videoPlaceholder: $("videoPlaceholder"),
        videoTimestamp: $("videoTimestamp"),
        recDot:         $("recDot"),
        recText:        $("recText"),
        btnStart:       $("btnStart"),
        btnStartText:   $("btnStartText"),
        btnStop:        $("btnStop"),
        btnStopText:    $("btnStopText"),
        btnClear:       $("btnClear"),
        btnMute:        $("btnMute"),
        btnMuteText:    $("btnMuteText"),
        iconSoundOn:    $("iconSoundOn"),
        iconSoundOff:   $("iconSoundOff"),
        statTotal:      $("statTotal"),
        statGuns:       $("statGuns"),
        statKnives:     $("statKnives"),
        statConfidence: $("statConfidence"),
        logList:        $("logList"),
        logEmpty:       $("logEmpty"),
    };

    var cctvOverlays = document.querySelectorAll(".cctv-overlay");

    // ------------------------------------
    // STATE
    // ------------------------------------
    var isRunning = false;
    var alertTimeout = null;
    var audioCtx = null;
    var isMuted = false;

    // ------------------------------------
    // SOCKETIO
    // ------------------------------------
    var socket = io();

    socket.on("connect", function () {
        console.log("[WS] Conectado al servidor");
    });

    socket.on("disconnect", function () {
        console.log("[WS] Desconectado del servidor");
    });

    socket.on("status_change", function (data) {
        if (data.status === "online") {
            setOnline();
        } else {
            setOffline();
        }
    });

    socket.on("stats_update", function (data) {
        updateStatsUI(data);
    });

    socket.on("new_detection", function (data) {
        addLogItem(data);
        fetchStats();
    });

    socket.on("alert", function (data) {
        showAlert(data);
        playAlertSound();
    });

    socket.on("alert_clear", function () {
        dom.alertBanner.classList.remove("active");
        if (alertTimeout) clearTimeout(alertTimeout);
    });

    // ------------------------------------
    // CLOCK
    // ------------------------------------
    function updateClock() {
        var now = new Date();
        var h = String(now.getHours()).padStart(2, "0");
        var m = String(now.getMinutes()).padStart(2, "0");
        var s = String(now.getSeconds()).padStart(2, "0");
        var timeStr = h + ":" + m + ":" + s;
        dom.clock.textContent = timeStr;
        if (isRunning) {
            dom.videoTimestamp.textContent = timeStr;
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ------------------------------------
    // STATUS MANAGEMENT
    // ------------------------------------
    function setOnline() {
        isRunning = true;
        dom.statusDot.className = "status-dot online";
        dom.statusText.textContent = "ONLINE";
        dom.btnStart.disabled = true;
        dom.btnStop.disabled = false;
        dom.btnStartText.textContent = "INICIAR";

        // Show video feed
        dom.videoFeed.src = "/video_feed?" + Date.now();
        dom.videoFeed.classList.add("active");
        dom.videoPlaceholder.classList.add("hidden");

        // Show CCTV overlays
        cctvOverlays.forEach(function (el) { el.classList.add("visible"); });
    }

    function setOffline() {
        isRunning = false;
        dom.statusDot.className = "status-dot offline";
        dom.statusText.textContent = "OFFLINE";
        dom.btnStart.disabled = false;
        dom.btnStop.disabled = true;
        dom.btnStopText.textContent = "DETENER";

        // Hide video feed
        dom.videoFeed.classList.remove("active");
        dom.videoFeed.removeAttribute("src");
        dom.videoPlaceholder.classList.remove("hidden");
        dom.videoTimestamp.textContent = "--:--:--";

        // Hide CCTV overlays
        cctvOverlays.forEach(function (el) { el.classList.remove("visible"); });
    }

    // ------------------------------------
    // STATS
    // ------------------------------------
    function updateStatsUI(stats) {
        dom.statTotal.textContent = stats.total_detections;
        dom.statGuns.textContent = stats.guns;
        dom.statKnives.textContent = stats.knives;
        dom.statConfidence.textContent = (stats.average_confidence * 100).toFixed(1) + "%";
    }

    function fetchStats() {
        fetch("/api/stats")
            .then(function (r) { return r.json(); })
            .then(updateStatsUI)
            .catch(function () {});
    }

    // ------------------------------------
    // DETECTION LOG
    // ------------------------------------
    var MAX_LOG_ITEMS = 50;

    function getClassType(className) {
        var lower = className.toLowerCase();
        if (lower === "gun" || lower === "arma" || lower === "pistola") return "gun";
        if (lower === "knife" || lower === "cuchillo") return "knife";
        return "other";
    }

    function addLogItem(detection) {
        // Hide empty state
        if (dom.logEmpty) {
            dom.logEmpty.style.display = "none";
        }

        var classType = getClassType(detection["class"]);

        var item = document.createElement("div");
        item.className = "log-item";
        item.innerHTML =
            '<div class="log-item-left">' +
                '<span class="log-item-class ' + classType + '">' + detection["class"].toUpperCase() + '</span>' +
                '<span class="log-item-time">' + detection.timestamp + '</span>' +
            '</div>' +
            '<span class="log-item-conf">' + (detection.confidence * 100).toFixed(1) + '%</span>';

        // Insert at top
        dom.logList.insertBefore(item, dom.logList.firstChild === dom.logEmpty ? dom.logEmpty : dom.logList.firstChild);

        // Cap DOM items to prevent memory leaks
        var items = dom.logList.querySelectorAll(".log-item");
        while (items.length > MAX_LOG_ITEMS) {
            dom.logList.removeChild(items[items.length - 1]);
            items = dom.logList.querySelectorAll(".log-item");
        }
    }

    function clearLog() {
        var items = dom.logList.querySelectorAll(".log-item");
        items.forEach(function (el) { el.remove(); });
        if (dom.logEmpty) {
            dom.logEmpty.style.display = "";
        }
    }

    // ------------------------------------
    // ALERT
    // ------------------------------------
    function showAlert(data) {
        var type = data.type === "gun" ? "PISTOLA" : "CUCHILLO";
        var pct = (data.confidence * 100).toFixed(0);
        dom.alertText.textContent = "ALERTA: " + type + " DETECTADA - " + pct + "% confianza";
        dom.alertBanner.classList.add("active");

        // Auto-dismiss after 5 seconds
        if (alertTimeout) clearTimeout(alertTimeout);
        alertTimeout = setTimeout(function () {
            dom.alertBanner.classList.remove("active");
        }, 5000);
    }

    // ------------------------------------
    // ALERT SOUND (Web Audio API)
    // ------------------------------------
    function playAlertSound() {
        if (isMuted) return;
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }

            var oscillator = audioCtx.createOscillator();
            var gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = "square";
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(660, audioCtx.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            // Autoplay policy may block - silently ignore
        }
    }

    // ------------------------------------
    // BUTTON HANDLERS
    // ------------------------------------
    dom.btnStart.addEventListener("click", function () {
        dom.btnStart.disabled = true;
        dom.btnStartText.textContent = "INICIANDO...";

        fetch("/api/start", { method: "POST" })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (data.success) {
                    setOnline();
                } else {
                    dom.btnStart.disabled = false;
                    dom.btnStartText.textContent = "INICIAR";
                    console.error("[API] " + data.message);
                }
            })
            .catch(function (err) {
                dom.btnStart.disabled = false;
                dom.btnStartText.textContent = "INICIAR";
                console.error("[API] Error:", err);
            });
    });

    dom.btnStop.addEventListener("click", function () {
        dom.btnStop.disabled = true;
        dom.btnStopText.textContent = "DETENIENDO...";

        fetch("/api/stop", { method: "POST" })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (data.success) {
                    setOffline();
                } else {
                    dom.btnStop.disabled = false;
                    dom.btnStopText.textContent = "DETENER";
                    console.error("[API] " + data.message);
                }
            })
            .catch(function (err) {
                dom.btnStop.disabled = false;
                dom.btnStopText.textContent = "DETENER";
                console.error("[API] Error:", err);
            });
    });

    dom.btnClear.addEventListener("click", function () {
        if (!confirm("Limpiar todo el historial de detecciones?")) return;

        fetch("/api/clear-history", { method: "POST" })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (data.success) {
                    clearLog();
                    fetchStats();
                }
            })
            .catch(function (err) {
                console.error("[API] Error:", err);
            });
    });

    // ------------------------------------
    // MUTE TOGGLE
    // ------------------------------------
    dom.btnMute.addEventListener("click", function () {
        isMuted = !isMuted;
        dom.iconSoundOn.style.display = isMuted ? "none" : "";
        dom.iconSoundOff.style.display = isMuted ? "" : "none";
        dom.btnMuteText.textContent = isMuted ? "MUTE" : "SONIDO";
        dom.btnMute.classList.toggle("muted", isMuted);
    });

    // ------------------------------------
    // INITIAL LOAD
    // ------------------------------------
    fetchStats();

    // Load existing history
    fetch("/api/history")
        .then(function (r) { return r.json(); })
        .then(function (history) {
            if (history.length > 0) {
                // Add in reverse order so newest appears on top
                history.forEach(function (detection) {
                    addLogItem(detection);
                });
            }
        })
        .catch(function () {});

})();

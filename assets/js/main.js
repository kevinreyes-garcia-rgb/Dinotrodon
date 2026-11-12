/**
 * Lógica principal, menú de tuerca con botones Español / English / Cambiar idioma
 * y pantalla de carga de carrera Azul vs Roja.
 * Dimetrodon "La Cabra" - Creado por Kirito
 */
document.addEventListener('DOMContentLoaded', () => {
    let currentLang = localStorage.getItem('dimetrodon_lang') || 'es';
    if (!window.TRANSLATIONS || !window.TRANSLATIONS[currentLang]) {
        currentLang = 'es';
    }

    let lightsOn = true;
    let raceMode = 'quarter';
    let racing = false;
    let isTranslating = false;
    let raceStatusKey = 'sim_idle';
    let nitroStatusKey = 'tel_nitro_standby';

    const t = (key, langOverride = currentLang) => {
        const dict = window.TRANSLATIONS && window.TRANSLATIONS[langOverride];
        return (dict && dict[key]) ? dict[key] : key;
    };

    // Traducir toda la página al instante
    function applyLanguage(lang) {
        if (!window.TRANSLATIONS || !window.TRANSLATIONS[lang]) return;
        currentLang = lang;
        localStorage.setItem('dimetrodon_lang', lang);
        document.documentElement.lang = lang;

        // Actualizar título de pestaña
        document.title = t('page_title', lang);

        // Textos planos
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (window.TRANSLATIONS[lang][key]) {
                el.textContent = window.TRANSLATIONS[lang][key];
            }
        });

        // Textos con HTML interno
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (window.TRANSLATIONS[lang][key]) {
                el.innerHTML = window.TRANSLATIONS[lang][key];
            }
        });

        // Actualizar botones de selección de idioma dentro de la tuerca
        const btnEs = document.getElementById('btn-lang-es');
        const btnEn = document.getElementById('btn-lang-en');
        if (btnEs && btnEn) {
            btnEs.classList.toggle('active', lang === 'es');
            btnEn.classList.toggle('active', lang === 'en');
        }

        // Actualizar textos dinámicos de controles
        const audioLabel = document.getElementById('audio-label');
        if (audioLabel) {
            audioLabel.textContent = window.soundFX.enabled ? t('sound_on', lang) : t('sound_off', lang);
        }

        const btnLights = document.getElementById('btn-lights');
        if (btnLights) {
            btnLights.textContent = lightsOn ? t('lights_on', lang) : t('lights_off', lang);
        }

        const raceResult = document.getElementById('race-result');
        if (raceResult) {
            raceResult.textContent = t(raceStatusKey, lang);
        }

        const telNitro = document.getElementById('tel-nitro');
        if (telNitro) {
            telNitro.textContent = t(nitroStatusKey, lang);
        }
    }

    // Pantalla de Carga de Carrera Azul (Dimetrodon) vs Roja (T-Rex) + Traducción
    function switchLanguageWithRaceLoader(targetLang) {
        if (targetLang === currentLang || isTranslating) return;
        isTranslating = true;

        const loader = document.getElementById('lang-loader');
        const loaderBadge = document.getElementById('loader-badge');
        const loaderTitle = document.getElementById('loader-title');
        const loaderSub = document.getElementById('loader-sub');
        const loaderRacer1 = document.getElementById('loader-racer1');
        const loaderRacer2 = document.getElementById('loader-racer2');
        const loaderStatus = document.getElementById('loader-status');

        const fillBlue = document.getElementById('loader-fill-blue');
        const fillRed = document.getElementById('loader-fill-red');
        const pctBlue = document.getElementById('loader-pct-blue');
        const pctRed = document.getElementById('loader-pct-red');

        loaderBadge.textContent = t('loader_badge', targetLang);
        loaderTitle.textContent = t('loader_title', targetLang);
        loaderSub.textContent = t('loader_sub', targetLang);
        loaderRacer1.textContent = t('loader_racer1', targetLang);
        loaderRacer2.textContent = t('loader_racer2', targetLang);
        loaderStatus.textContent = t('loader_status_start', targetLang);

        fillBlue.style.width = '0%';
        fillRed.style.width = '0%';
        pctBlue.textContent = '0%';
        pctRed.textContent = '0%';

        loader.classList.add('active');
        loader.setAttribute('aria-hidden', 'false');

        window.soundFX.playRaceLoaderSound(1.65);

        let pBlue = 0;
        let pRed = 0;
        let translatedApplied = false;

        const raceInterval = setInterval(() => {
            pBlue += pBlue < 60 ? 5.2 : 3.6;
            pRed += pRed < 40 ? 3.5 : 5.4;

            const clampedBlue = Math.min(Math.round(pBlue), 100);
            const clampedRed = Math.min(Math.round(pRed), 100);

            fillBlue.style.width = clampedBlue + '%';
            pctBlue.textContent = clampedBlue + '%';

            fillRed.style.width = clampedRed + '%';
            pctRed.textContent = clampedRed + '%';

            if ((clampedBlue >= 50 || clampedRed >= 50) && !translatedApplied) {
                translatedApplied = true;
                loaderStatus.textContent = t('loader_status_mid', targetLang);
                applyLanguage(targetLang);
            }

            if (clampedBlue >= 100 && clampedRed >= 100) {
                clearInterval(raceInterval);
                loaderStatus.textContent = t('loader_status_done', targetLang);
                window.soundFX.playFinishChime();

                setTimeout(() => {
                    loader.classList.remove('active');
                    loader.setAttribute('aria-hidden', 'true');
                    isTranslating = false;
                }, 380);
            }
        }, 45);
    }

    // Control de la Tuerca y los botones de Idioma
    const gearBtn = document.getElementById('gear-btn');
    const settingsDropdown = document.getElementById('settings-dropdown');
    const btnChangeLanguage = document.getElementById('btn-change-language');
    const btnLangEs = document.getElementById('btn-lang-es');
    const btnLangEn = document.getElementById('btn-lang-en');
    const settingsWrapper = document.getElementById('settings-wrapper');

    function closeDropdown() {
        settingsDropdown.classList.remove('open');
        gearBtn.classList.remove('open');
        gearBtn.setAttribute('aria-expanded', 'false');
    }

    gearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = settingsDropdown.classList.toggle('open');
        gearBtn.classList.toggle('open', isOpen);
        gearBtn.setAttribute('aria-expanded', String(isOpen));
        window.soundFX.playClick();
    });

    document.addEventListener('click', (e) => {
        if (!settingsWrapper.contains(e.target)) {
            closeDropdown();
        }
    });

    btnLangEs.addEventListener('click', () => {
        closeDropdown();
        if (currentLang !== 'es') {
            switchLanguageWithRaceLoader('es');
        }
    });

    btnLangEn.addEventListener('click', () => {
        closeDropdown();
        if (currentLang !== 'en') {
            switchLanguageWithRaceLoader('en');
        }
    });

    btnChangeLanguage.addEventListener('click', () => {
        closeDropdown();
        const nextLang = currentLang === 'es' ? 'en' : 'es';
        switchLanguageWithRaceLoader(nextLang);
    });

    // 1. Control de Audio Global
    const audioBtn = document.getElementById('audio-toggle');
    const audioLabel = document.getElementById('audio-label');

    audioBtn.addEventListener('click', () => {
        const isOn = window.soundFX.toggle();
        audioBtn.classList.toggle('active', isOn);
        audioLabel.textContent = isOn ? t('sound_on') : t('sound_off');
    });

    document.querySelectorAll('.sound-hover').forEach(el => {
        el.addEventListener('mouseenter', () => window.soundFX.playClick());
    });

    // 2. Menú móvil
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('open'));
    });

    // 3. Animación de contadores numéricos en Hero
    const counters = document.querySelectorAll('.stat-value');
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);
        const duration = 1500;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentVal = progress * target;
            counter.textContent = currentVal.toFixed(decimals);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toFixed(decimals);
            }
        }
        requestAnimationFrame(updateCounter);
    });

    // 4. Control de Faros Oculares y Bocina Mandibular
    const heroFrame = document.getElementById('hero-frame');
    const btnLights = document.getElementById('btn-lights');
    const btnRoar = document.getElementById('btn-roar');

    btnLights.addEventListener('click', () => {
        lightsOn = !lightsOn;
        heroFrame.classList.toggle('lights-off', !lightsOn);
        btnLights.textContent = lightsOn ? t('lights_on') : t('lights_off');
        window.soundFX.playClick();
    });

    btnRoar.addEventListener('click', () => {
        if (!window.soundFX.enabled) {
            audioBtn.click();
        }
        window.soundFX.playRoar();
    });

    // 5. Simulador de Carrera: Dimetrodon vs T-Rex Supra
    const btnQuarter = document.getElementById('btn-mode-quarter');
    const btnTopSpeed = document.getElementById('btn-mode-topspeed');
    const btnStartRace = document.getElementById('btn-start-race');
    const barDimetrodon = document.getElementById('bar-dimetrodon');
    const barTrex = document.getElementById('bar-trex');
    const raceResult = document.getElementById('race-result');

    btnQuarter.addEventListener('click', () => {
        if (racing) return;
        raceMode = 'quarter';
        btnQuarter.classList.add('active');
        btnTopSpeed.classList.remove('active');
        barDimetrodon.style.width = '0%';
        barTrex.style.width = '0%';
        raceStatusKey = 'sim_ready_quarter';
        raceResult.textContent = t(raceStatusKey);
        window.soundFX.playClick();
    });

    btnTopSpeed.addEventListener('click', () => {
        if (racing) return;
        raceMode = 'topspeed';
        btnTopSpeed.classList.add('active');
        btnQuarter.classList.remove('active');
        barDimetrodon.style.width = '0%';
        barTrex.style.width = '0%';
        raceStatusKey = 'sim_ready_top';
        raceResult.textContent = t(raceStatusKey);
        window.soundFX.playClick();
    });

    btnStartRace.addEventListener('click', () => {
        if (racing) return;
        racing = true;
        window.soundFX.playEngineMode('rev');
        raceStatusKey = 'sim_running';
        raceResult.textContent = t(raceStatusKey);

        let pDim = 0;
        let pTrex = 0;

        const interval = setInterval(() => {
            if (raceMode === 'quarter') {
                pDim += 4.6;
                pTrex += 3.7;
            } else {
                pDim += pDim < 45 ? 4.4 : 2.5;
                pTrex += pTrex < 35 ? 3.1 : 4.8;
            }

            barDimetrodon.style.width = Math.min(pDim, 100) + '%';
            barTrex.style.width = Math.min(pTrex, 100) + '%';

            if (pDim >= 100 || pTrex >= 100) {
                clearInterval(interval);
                racing = false;
                window.soundFX.stopEngine();

                if (raceMode === 'quarter') {
                    raceStatusKey = 'sim_win_dim';
                } else {
                    raceStatusKey = 'sim_win_trex';
                }
                raceResult.textContent = t(raceStatusKey);
            }
        }, 60);
    });

    // 6. Banco de Pruebas del Motor Tsla 3D6
    const engineImg = document.getElementById('engine-img');
    const exhaustFlames = document.getElementById('exhaust-flames');
    const telHp = document.getElementById('tel-hp');
    const telRpm = document.getElementById('tel-rpm');
    const telBoost = document.getElementById('tel-boost');
    const telNitro = document.getElementById('tel-nitro');
    const rpmFill = document.getElementById('rpm-fill');
    const rpmPercent = document.getElementById('rpm-percent');

    const btnIdle = document.getElementById('btn-idle');
    const btnRev = document.getElementById('btn-rev');
    const btnNitro = document.getElementById('btn-nitro');

    btnIdle.addEventListener('click', () => {
        engineImg.classList.remove('vibrating');
        exhaustFlames.classList.remove('active');
        telHp.textContent = '295 HP';
        telRpm.textContent = '1,200 RPM';
        telBoost.textContent = '0.4 BAR';
        nitroStatusKey = 'tel_nitro_standby';
        telNitro.textContent = t(nitroStatusKey);
        rpmFill.style.width = '18%';
        rpmPercent.textContent = '18%';
        window.soundFX.playEngineMode('idle');
    });

    btnRev.addEventListener('click', () => {
        engineImg.classList.add('vibrating');
        exhaustFlames.classList.remove('active');
        telHp.textContent = '302 HP';
        telRpm.textContent = '6,800 RPM';
        telBoost.textContent = '1.8 BAR';
        nitroStatusKey = 'tel_nitro_ready';
        telNitro.textContent = t(nitroStatusKey);
        rpmFill.style.width = '72%';
        rpmPercent.textContent = '72%';
        window.soundFX.playEngineMode('rev');
    });

    btnNitro.addEventListener('click', () => {
        if (!window.soundFX.enabled) {
            audioBtn.click();
        }
        engineImg.classList.add('vibrating');
        exhaustFlames.classList.add('active');
        telHp.textContent = '302+ HP (OVERBOOST)';
        telRpm.textContent = '9,500 RPM';
        telBoost.textContent = '2.6 BAR BI-TURBO';
        nitroStatusKey = 'tel_nitro_active';
        telNitro.textContent = t(nitroStatusKey);
        rpmFill.style.width = '100%';
        rpmPercent.textContent = '100%';
        window.soundFX.playEngineMode('nitro');
    });

    // 7. Animación de aparición al hacer scroll
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach(el => observer.observe(el));

    // Inicializar idioma guardado o Español por defecto
    applyLanguage(currentLang);
});

setTimeout(() => {
  let frecuencias = [
    { frecuencia: 32, vol: 0 },
    { frecuencia: 63, vol: 0 },
    { frecuencia: 125, vol: -4.5 },
    { frecuencia: 250, vol: -5.68 },
    { frecuencia: 500, vol: -5.81 },
    { frecuencia: 1000, vol: -6.31 },
    { frecuencia: 2000, vol: -9.03 },
    { frecuencia: 4000, vol: -8.25 },
    { frecuencia: 8000, vol: -6.16 },
    { frecuencia: 16000, vol: -2.52 },
  ];

  const audioELement = window.audioPlayer;
  let url = audioELement.src;
  audioELement.src = "";
  audioELement.crossOrigin = "anonymous";
  audioELement.src = url;
  // creamos la variable para guardar cada banda del ecualizador
  window.bands = [];

  audioELement.addEventListener("play", () => {
    const Context = window.webkitAudioContext
      ? window.webkitAudioContext
      : window.AudioContext;
    ctx = new Context();
    const mediaElement = ctx.createMediaElementSource(audioELement);

    frecuencias.forEach((item, index) => {
      window.bands[index] = ctx.createBiquadFilter();
      window.bands[index].type = "peaking"; // 5 || 'peaking'
      window.bands[index].frequency.value = item.frecuencia;
      window.bands[index].Q.value = 1.4;
      window.bands[index].gain.value = item.vol;
    });

    // filtro pasa bajo
    lowPassFilter = ctx.createBiquadFilter();
    lowPassFilter.frequency.value = 126;

    // filtro pasa alto
    hightPassFilter = ctx.createBiquadFilter();
    hightPassFilter.type = "highpass";
    hightPassFilter.frequency.value = 115;

    // ganacia por canal
    gainLow = ctx.createGain();
    window.gainLow.gain.value = 1;

    gainHight = ctx.createGain();
    window.gainHight.gain.value = 1;
    // separar los canales
    let splitter = ctx.createChannelSplitter(2);

    // unir los canales
    let merger = ctx.createChannelMerger(2);

    gainLow.connect(lowPassFilter);
    gainHight.connect(hightPassFilter);

    for (i = 1; i < 10; i++) {
      window.bands[i - 1].connect(window.bands[i]);
    }

    mediaElement.connect(window.bands[0]);
    // asignando los filtros a cada canal
    window.bands[9].connect(splitter);

    splitter.connect(gainLow, 0);
    splitter.connect(gainHight, 1);

    lowPassFilter.connect(merger, 0, 0);
    hightPassFilter.connect(merger, 0, 1);

    merger.connect(ctx.destination);
  });
}, 1000);

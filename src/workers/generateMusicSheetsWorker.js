self.onmessage = function (e) {
  const { interval } = e.data;

  function generateRandomYear() {
    const mean = 1985;
    const stdDev = 20;
    const maxYear = 2025;
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num * stdDev + mean;
    return Math.min(Math.round(num), maxYear);
  }

  function generateMusicSheet(id) {
    const title = `Song ${id}`;
    const composer = `Composer ${String.fromCharCode(65 + (id % 26))}`;
    const genres = ["Rock", "Pop", "Classical"];
    const instruments = ["Guitar", "Piano", "Drums"];
    const year = generateRandomYear();
    return {
      id,
      title,
      composer,
      genres: [genres[Math.floor(Math.random() * genres.length)]],
      year,
      instruments: [
        instruments[Math.floor(Math.random() * instruments.length)],
      ],
      key: "C",
      filetype: "PDF",
      link: `/sheets/song${id}.pdf`,
    };
  }

  let id = 1;
  setInterval(() => {
    const musicSheet = generateMusicSheet(id++);
    postMessage(musicSheet);
  }, interval);
};

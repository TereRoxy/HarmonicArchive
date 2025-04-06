const { faker } = require('@faker-js/faker'); // Use require instead of import

function generateMusicSheet(id) {
    const title = faker.music.songName();
    const composer = faker.person.fullName(); // Note: updated from name.fullName()
    const genres = ["Rock", "Pop", "Classical"];
    const instruments = ["Guitar", "Piano", "Drums"];
    const year = faker.date.between({ from: "1900-01-01", to: "2025-12-31" }).getFullYear();
    const musicalKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
    const filetype = "PDF";
    const link = `pdfs/song${id%7+1}.pdf`;

    return {
      id,
      title,
      composer,
      genres: [faker.helpers.arrayElement(genres)],
      year,
      instruments: [faker.helpers.arrayElement(instruments)],
      key: faker.helpers.arrayElement(musicalKeys),
      filetype,
      link,
    };
  }
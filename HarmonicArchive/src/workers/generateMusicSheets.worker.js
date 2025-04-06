import { faker } from "@faker-js/faker";

console.log("Worker initialized");

let apiUrl = "http://localhost:5000"; // Default URL for local development

self.onmessage = function (e) {
  const { interval, apiUrl: receivedApiUrl } = e.data; // Destructure the received data
  apiUrl = receivedApiUrl; // Store the apiUrl for use in other functions

  async function createMusicSheetOnServer(musicSheet) {
    try {
      const response = await fetch(`${apiUrl}/api/sheets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(musicSheet),
      });

      if (!response.ok) {
        throw new Error(`Failed to create music sheet: ${response.statusText}`);
      }

      const createdSheet = await response.json();
      console.log("Created music sheet on server:", createdSheet);
    } catch (error) {
      console.error("Error creating music sheet on server:", error);
    }
  }

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

  let id = 1;
  const intervalId = setInterval(async () => {
    const musicSheet = generateMusicSheet(id++);
    console.log("Generated music sheet:", musicSheet);

    // Send the generated music sheet to the server
    await createMusicSheetOnServer(musicSheet);

    // Optionally, post the generated sheet back to the main thread
    postMessage(musicSheet);
  }, interval);

  // Add cleanup handler
  self.onclose = () => {
    clearInterval(intervalId);
    console.log('Worker cleanup');
  };
};
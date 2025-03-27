import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Dashboard from "../src/components/Dashboard.vue";
import { state } from "../src/sharedstate";
import { musicSheets } from "../src/sharedstate";

// Mock the shared state
vi.mock("../src/sharedstate", () => ({
  state: {
    musicSheets: [
      {
        id: 1,
        title: "Song 1",
        composer: "Composer A",
        genres: ["Rock"],
        year: 2000,
        instruments: ["Guitar"],
        key: "C",
        filetype: "PDF",
        link: "/sheets/song1.pdf",
      },
      {
        id: 2,
        title: "Song 2",
        composer: "Composer B",
        genres: ["Pop"],
        year: 2005,
        instruments: ["Piano"],
        key: "D",
        filetype: "PDF",
        link: "/sheets/song2.pdf",
      },
      {
        id: 3,
        title: "Song 3",
        composer: "Composer C",
        genres: ["Classical"],
        year: 2010,
        instruments: ["Drums"],
        key: "F",
        filetype: "PDF",
        link: "/sheets/song3.pdf",
      },
    ],
  },
}));

// Proper mock for pdf-viewer-vue
vi.mock("pdf-viewer-vue", () => ({
  default: {
    template: "<div class='mocked-pdf-viewer'></div>",
    props: ["source"],
  },
}));

describe("Dashboard.vue", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Dashboard, {
      global: {
        stubs: {
          "pdf-viewer": true,
          "router-link": true, // Stub router-link
        },
      },
    });
  });
  it("filters by genre", async () => {
    await wrapper.setData({ selectedGenres: ["Rock"] });
    expect(wrapper.vm.filteredItems).toEqual([
      {
        id: 1,
        title: "Song 1",
        composer: "Composer A",
        genres: ["Rock"],
        year: 2000,
        instruments: ["Guitar"],
        key: "C",
        filetype: "PDF",
        link: "/sheets/song1.pdf",
      },
    ]);
  });

  it("filters by instrument", async () => {
    await wrapper.setData({ selectedInstruments: ["Piano"] });
    expect(wrapper.vm.filteredItems).toEqual([
      {
        id: 2,
        title: "Song 2",
        composer: "Composer B",
        genres: ["Pop"],
        year: 2005,
        instruments: ["Piano"],
        key: "D",
        filetype: "PDF",
        link: "/sheets/song2.pdf",
      },
    ]);
  });

  it("filters by search query", async () => {
    await wrapper.setData({ searchQuery: "Composer C" });
    expect(wrapper.vm.filteredItems).toEqual([
      {
        id: 3,
        title: "Song 3",
        composer: "Composer C",
        genres: ["Classical"],
        year: 2010,
        instruments: ["Drums"],
        key: "F",
        filetype: "PDF",
        link: "/sheets/song3.pdf",
      },
    ]);
  });

  it("filters by multiple criteria", async () => {
    await wrapper.setData({
      selectedGenres: ["Pop"],
      selectedInstruments: ["Piano"],
      searchQuery: "Composer B",
    });
    expect(wrapper.vm.filteredItems).toEqual([
      {
        id: 2,
        title: "Song 2",
        composer: "Composer B",
        genres: ["Pop"],
        year: 2005,
        instruments: ["Piano"],
        key: "D",
        filetype: "PDF",
        link: "/sheets/song2.pdf",
      },
    ]);
  });

  it("sorts by title in ascending order", async () => {
    await wrapper.vm.setSort("title");
    await wrapper.vm.setSort("title");
    expect(wrapper.vm.filteredItems).toEqual([
      {
        id: 1,
        title: "Song 1",
        composer: "Composer A",
        genres: ["Rock"],
        year: 2000,
        instruments: ["Guitar"],
        key: "C",
        filetype: "PDF",
        link: "/sheets/song1.pdf",
      },
      {
        id: 2,
        title: "Song 2",
        composer: "Composer B",
        genres: ["Pop"],
        year: 2005,
        instruments: ["Piano"],
        key: "D",
        filetype: "PDF",
        link: "/sheets/song2.pdf",
      },
      {
        id: 3,
        title: "Song 3",
        composer: "Composer C",
        genres: ["Classical"],
        year: 2010,
        instruments: ["Drums"],
        key: "F",
        filetype: "PDF",
        link: "/sheets/song3.pdf",
      },
    ]);
  });
});

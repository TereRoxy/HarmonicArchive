import { mount } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { reactive } from "vue";
import UploadMusicScore from "../src/components/UploadMusicScore.vue";
import ViewMusicScore from "../src/components/ViewMusicScore.vue";
import { state } from "../src/sharedstate";

// Mock the shared state with reactive
vi.mock("../src/sharedstate", () => {
  return {
    state: reactive({
      musicSheets: [
        {
          id: 1,
          title: "Song 1",
          composer: "Composer A",
          genres: ["Rock"],
          year: 2000,
          instruments: ["Guitar"],
          key: "C",
          link: "/sheets/song1.pdf",
        },
      ],
      selectedMusicSheet: null,
    }),
  };
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "mocked-url");

// Mock window.alert
global.alert = vi.fn();

// Mock window.confirm
global.confirm = vi.fn(() => true);

// Proper mock for pdf-viewer-vue
vi.mock("pdf-viewer-vue", () => ({
  default: {
    template: "<div class='mocked-pdf-viewer'></div>",
    props: ["source"],
  },
}));

describe("CRUD Operations", () => {
  describe("UploadMusicScore.vue", () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(UploadMusicScore, {
        global: {
          mocks: {
            $router: {
              go: vi.fn(),
            },
          },
        },
      });
    });

    it("uploads a new music sheet when form is valid", async () => {
      const file = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });
      wrapper.vm.selectedFile = file;

      await wrapper.setData({
        formData: {
          title: "New Song",
          composer: "New Composer",
          year: "2023",
          key: "G",
          genre: "Jazz, Blues",
          instruments: "Piano, Saxophone",
        },
      });

      await wrapper.find("form").trigger("submit.prevent");

      expect(state.musicSheets).toContainEqual({
        id: expect.any(Number),
        title: "New Song",
        composer: "New Composer",
        year: 2023,
        key: "G",
        genres: ["Jazz", "Blues"],
        instruments: ["Piano", "Saxophone"],
        file: "mocked-url",
      });

      expect(wrapper.vm.$router.go).toHaveBeenCalledWith(-1);
    });

    it("does not upload when form is invalid", async () => {
      const initialLength = state.musicSheets.length;

      await wrapper.setData({
        formData: {
          title: "",
          composer: "New Composer",
          year: "2023",
          key: "G",
          genre: "Jazz",
          instruments: "Piano",
        },
      });

      await wrapper.find("form").trigger("submit.prevent");

      expect(state.musicSheets).toHaveLength(initialLength);
    });

    it("does not upload when no file is selected", async () => {
      const initialLength = state.musicSheets.length;

      wrapper.vm.selectedFile = null;
      await wrapper.setData({
        formData: {
          title: "New Song",
          composer: "New Composer",
          year: "2023",
          key: "G",
          genre: "Jazz",
          instruments: "Piano",
        },
      });

      await wrapper.find("form").trigger("submit.prevent");

      expect(state.musicSheets).toHaveLength(initialLength);
    });
  });

  describe("ViewMusicScore.vue", () => {
    let wrapper;

    beforeEach(async () => {
      state.selectedMusicSheet = {
        id: 1,
        title: "Song 1",
        composer: "Composer A",
        genres: ["Rock"],
        year: 2000,
        instruments: ["Guitar"],
        key: "C",
        link: "/sheets/song1.pdf",
      };

      wrapper = mount(ViewMusicScore, {
        global: {
          mocks: {
            $router: {
              push: vi.fn(),
            },
          },
        },
      });

      await wrapper.vm.$nextTick();
    });

    it("displays the selected music sheet details", () => {
      expect(wrapper.find(".music-score-title").text()).toBe(
        "Composer A - Song 1"
      );
      expect(wrapper.find(".music-score-year").text()).toBe("Year: 2000");
      expect(wrapper.find(".key-tag").text()).toBe("C");
    });

    it("edits a music sheet when form is valid", async () => {
      await wrapper.find(".modify-button").trigger("click");

      await wrapper.setData({
        editData: {
          title: "Song 1",
          composer: "Composer A",
          year: "2000",
          key: "C",
          genre: "Rock",
        },
      });

      await wrapper.find(".save-btn").trigger("click");
      await wrapper.vm.$nextTick();

      const updatedSheet = state.musicSheets.find((sheet) => sheet.id === 1);
      expect(updatedSheet).toEqual({
        id: 1,
        title: "Song 1",
        composer: "Composer A",
        genres: ["Rock"],
        year: 2000,
        instruments: ["Guitar"],
        key: "C",
        link: "/sheets/song1.pdf",
      });

      expect(wrapper.find(".music-score-title").text()).toBe(
        "Composer A - Song 1"
      );
      expect(wrapper.find(".music-score-year").text()).toBe("Year: 2000");
    });

    it("cancels editing without saving changes", async () => {
      await wrapper.find(".modify-button").trigger("click");

      await wrapper.setData({
        editData: {
          title: "Updated Song",
          composer: "Updated Composer",
          year: "2001",
          key: "D",
          genre: "Rock, Metal",
        },
      });

      await wrapper.find(".cancel-btn").trigger("click");

      expect(wrapper.find(".music-score-title").text()).toBe(
        "Composer A - Song 1"
      );
      expect(wrapper.find(".music-score-year").text()).toBe("Year: 2000");
    });

    it("deletes a music sheet when confirmed", async () => {
      const initialLength = state.musicSheets.length;
      global.confirm.mockReturnValueOnce(true);

      await wrapper.find(".delete-button").trigger("click");

      expect(state.musicSheets).toHaveLength(initialLength - 1);
      expect(state.selectedMusicSheet).toBeNull();
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith("/");
    });

    it("does not delete a music sheet when not confirmed", async () => {
      const initialLength = state.musicSheets.length;
      global.confirm.mockReturnValueOnce(false);

      await wrapper.find(".delete-button").trigger("click");
      expect(state.musicSheets).toHaveLength(initialLength);
      expect(state.selectedMusicSheet).not.toBeNull();
    });
  });
});

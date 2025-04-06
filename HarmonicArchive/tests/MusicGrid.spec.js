// musicGrid.spec.js
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import MusicGrid from "../src/components/MusicGrid.vue";

describe("MusicGrid.vue", () => {
  const mockMusicSheets = [
    {
      id: 1,
      title: "Test Song",
      composer: "Test Composer",
      genres: ["Test"],
      year: 2000,
      instruments: ["Test"],
      key: "C"
    }
  ];

  it("displays music sheet information correctly", () => {
    const wrapper = mount(MusicGrid, {
      props: {
        musicSheets: mockMusicSheets
      }
    });

    expect(wrapper.text()).toContain("Test Song");
    expect(wrapper.text()).toContain("Test Composer");
    expect(wrapper.text()).toContain("Test");
    expect(wrapper.text()).toContain("2000");
    expect(wrapper.text()).toContain("C");
  });

  it("emits openItem event when clicked", async () => {
    const wrapper = mount(MusicGrid, {
      props: {
        musicSheets: mockMusicSheets
      }
    });

    await wrapper.find(".music-item").trigger("click");
    expect(wrapper.emitted("openItem")).toBeTruthy();
    expect(wrapper.emitted("openItem")[0]).toEqual([mockMusicSheets[0]]);
  });

  it("applies correct year color coding", () => {
    const wrapper = mount(MusicGrid, {
      props: {
        musicSheets: [
          { ...mockMusicSheets[0], year: 1960 }, // red (before mean - stdDev)
          { ...mockMusicSheets[0], year: 1985 }, // yellow (mean)
          { ...mockMusicSheets[0], year: 2010 }  // green (after mean + stdDev)
        ]
      }
    });

    const dots = wrapper.findAll(".year-dot");
    expect(dots[0].attributes("style")).toContain("red");
    expect(dots[1].attributes("style")).toContain("yellow");
    expect(dots[2].attributes("style")).toContain("green");
  });
});
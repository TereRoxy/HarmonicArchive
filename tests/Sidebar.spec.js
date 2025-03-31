import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "../src/components/Sidebar.vue";

// Mock the MusicSheetsChart component
vi.mock("../src/components/MusicSheetsChart.vue", () => ({
    default: {
      template: "<div class='mocked-chart'></div>",
      props: ['musicSheets'] // Include any props the component expects
    }
  }));

describe("Sidebar.vue", () => {
  const mockProps = {
    genres: ["Rock", "Pop"],
    instruments: ["Guitar", "Piano"],
    selectedGenres: ["Rock"],
    selectedInstruments: ["Guitar"],
    musicSheets: []
  };

  it("displays genre and instrument filters correctly", async () => {
    const wrapper = mount(Sidebar, {
      props: mockProps,
      global: {
        stubs: {
          MusicSheetsChart: true // Stub the chart component
        }
      }
    });

    // Open both dropdowns
    await wrapper.findAll('.filter-header')[0].trigger('click');
    await wrapper.findAll('.filter-header')[1].trigger('click');
    
    const html = wrapper.html();
    expect(html).toContain("Rock");
    expect(html).toContain("Pop");
    expect(html).toContain("Guitar");
    expect(html).toContain("Piano");
  });

  it("shows remove button for selected genres", async () => {
    const wrapper = mount(Sidebar, {
      props: mockProps,
      global: {
        stubs: {
          MusicSheetsChart: true
        }
      }
    });

    // Open genre dropdown
    await wrapper.findAll('.filter-header')[0].trigger('click');
    
    const chips = wrapper.findAll('.chip');
    const rockIndex = chips.findIndex(c => c.text().includes('Rock'));
    const popIndex = chips.findIndex(c => c.text().includes('Pop'));
    
    expect(rockIndex).not.toBe(-1);
    expect(popIndex).not.toBe(-1);
    expect(chips[rockIndex].find('.remove-chip').exists()).toBe(true);
    expect(chips[popIndex].find('.remove-chip').exists()).toBe(false);
  });

  it("toggles genre filter dropdown", async () => {
    const wrapper = mount(Sidebar, {
      props: mockProps,
      global: {
        stubs: {
          MusicSheetsChart: true
        }
      }
    });

    expect(wrapper.vm.isGenreOpen).toBe(false);
    await wrapper.findAll('.filter-header')[0].trigger('click');
    expect(wrapper.vm.isGenreOpen).toBe(true);
  });

  it("emits toggleGenre event when genre is clicked", async () => {
    const wrapper = mount(Sidebar, {
      props: mockProps,
      global: {
        stubs: {
          MusicSheetsChart: true
        }
      }
    });

    // Open dropdown
    await wrapper.findAll('.filter-header')[0].trigger('click');
    
    // Find Rock chip
    const rockChip = wrapper.findAll('.chip')
      .find(c => c.text().includes('Rock'));
    
    await rockChip.trigger('click');
    expect(wrapper.emitted('toggleGenre')).toBeTruthy();
    expect(wrapper.emitted('toggleGenre')[0]).toEqual(["Rock"]);
  });
});
// dashboard.spec.js (additional tests)
import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Dashboard from "../src/components/Dashboard.vue";
import { state } from "../src/sharedstate";

// Mock worker
class MockWorker {
  constructor() {
    this.onmessage = null;
    this.onerror = null;
  }
  postMessage() {}
  terminate() {}
}

vi.mock("../src/sharedstate", () => ({
  state: {
    musicSheets: [
      // ... existing mock data
    ],
  },
}));

describe("Dashboard.vue - Additional Tests", () => {
  let wrapper;

  beforeEach(() => {
    global.Worker = MockWorker;
    wrapper = shallowMount(Dashboard, {
      global: {
        stubs: {
          "pdf-viewer": true,
          "router-link": true,
        },
      },
    });
  });

  it("toggles worker on/off correctly", async () => {
    // Initial state
    expect(wrapper.vm.workerActive).toBe(false);
    expect(wrapper.vm.worker).toBeNull();

    // Activate worker
    await wrapper.vm.toggleWorker();
    expect(wrapper.vm.workerActive).toBe(true);
    expect(wrapper.vm.worker).toBeInstanceOf(MockWorker);

    // Deactivate worker
    await wrapper.vm.toggleWorker();
    expect(wrapper.vm.workerActive).toBe(false);
    expect(wrapper.vm.worker).toBeNull();
  });

  it("handles worker messages correctly", async () => {
    await wrapper.vm.toggleWorker();
    const testData = {
      id: 99,
      title: "Worker Generated",
      composer: "Worker",
      genres: ["Test"],
      year: 2023,
      instruments: ["Test"],
      key: "C",
      filetype: "PDF",
      link: "/sheets/test.pdf"
    };

    // Simulate worker message
    wrapper.vm.worker.onmessage({ data: testData });
    expect(state.musicSheets).toContainEqual(testData);
  });

  it("handles worker errors", async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await wrapper.vm.toggleWorker();
    
    // Simulate worker error
    const testError = new Error('Worker error');
    wrapper.vm.worker.onerror(testError);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Worker error:', testError);
    consoleErrorSpy.mockRestore();
  });

  it("clears filters correctly", async () => {
    await wrapper.setData({
      searchQuery: "test",
      selectedGenres: ["Rock"],
      selectedInstruments: ["Guitar"],
      currentPage: 2
    });

    await wrapper.vm.clearSearch();
    
    expect(wrapper.vm.searchQuery).toBe("");
    expect(wrapper.vm.selectedGenres).toEqual([]);
    expect(wrapper.vm.selectedInstruments).toEqual([]);
    expect(wrapper.vm.currentPage).toBe(1);
  });

  it("changes items per page correctly", async () => {
    await wrapper.vm.changeItemsPerPage(12);
    expect(wrapper.vm.itemsPerPage).toBe(12);
    expect(wrapper.vm.currentPage).toBe(1);
  });
});
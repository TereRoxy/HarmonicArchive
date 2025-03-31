// sortPagination.spec.js
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import SortPagination from "../src/components/SortPagination.vue";

describe("SortPagination.vue", () => {
  const mockProps = {
    sortBy: "title",
    sortOrder: "asc",
    currentPage: 2,
    totalPages: 5,
    itemsPerPage: 6,
    workerActive: false
  };

  it("emits setSort event when sort buttons are clicked", async () => {
    const wrapper = mount(SortPagination, {
      props: mockProps
    });

    const sortButtons = wrapper.findAll("button").filter(b => b.text().includes("Sort by"));
    
    await sortButtons[0].trigger("click"); // Title
    expect(wrapper.emitted("setSort")).toBeTruthy();
    expect(wrapper.emitted("setSort")[0]).toEqual(["title"]);
    
    await sortButtons[1].trigger("click"); // Composer
    expect(wrapper.emitted("setSort")[1]).toEqual(["composer"]);
    
    await sortButtons[2].trigger("click"); // Year
    expect(wrapper.emitted("setSort")[2]).toEqual(["year"]);
  });

  it("displays correct sort indicators", () => {
    const wrapper = mount(SortPagination, {
      props: {
        ...mockProps,
        sortBy: "title",
        sortOrder: "asc"
      }
    });
  
    // Find by button text content
    const titleButton = wrapper.findAll('button').find(b => b.text().includes('Sort by Name'));
    expect(titleButton.text()).toContain("↑");
    
    const composerButton = wrapper.findAll('button').find(b => b.text().includes('Sort by Composer'));
    expect(composerButton.text()).not.toContain("↑");
  });
  
  it("emits page change events correctly with test IDs", async () => {
    const wrapper = mount(SortPagination, {
      props: {
        ...mockProps,
        currentPage: 2,
        totalPages: 5
      }
    });
  
    // Test previous button
    await wrapper.find('[data-testid="prev-page"]').trigger('click');
    expect(wrapper.emitted('goToPage')[0]).toEqual([1]);
  
    // Test specific page button
    await wrapper.find('[data-testid="page-3-btn"]').trigger('click');
    expect(wrapper.emitted('goToPage')[1]).toEqual([3]);
  
    // Test next button
    await wrapper.find('[data-testid="next-page"]').trigger('click');
    expect(wrapper.emitted('goToPage')[2]).toEqual([3]);
  });

  it("emits itemsPerPage change event", async () => {
    const wrapper = mount(SortPagination, {
      props: mockProps
    });

    const select = wrapper.find("select");
    await select.setValue("12");
    
    expect(wrapper.emitted("changeItemsPerPage")).toBeTruthy();
    expect(wrapper.emitted("changeItemsPerPage")[0]).toEqual(["12"]);
  });

  it("toggles worker button text correctly", () => {
    const inactiveWrapper = mount(SortPagination, {
      props: {
        ...mockProps,
        workerActive: false
      }
    });
    expect(inactiveWrapper.find(".worker-btn").text()).toBe("Start Generator");
    
    const activeWrapper = mount(SortPagination, {
      props: {
        ...mockProps,
        workerActive: true
      }
    });
    expect(activeWrapper.find(".worker-btn").text()).toBe("Stop Generator");
  });
});
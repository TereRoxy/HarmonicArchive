// header.spec.js
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Header from "../src/components/Header.vue";

describe("Header.vue", () => {
  it("emits update event when input changes", async () => {
    const wrapper = mount(Header, {
      props: {
        searchQuery: ""
      }
    });

    const input = wrapper.find("input");
    await input.setValue("test search");
    
    expect(wrapper.emitted("update:searchQuery")).toBeTruthy();
    expect(wrapper.emitted("update:searchQuery")[0]).toEqual(["test search"]);
  });

  it("emits clearSearch event when clear button is clicked", async () => {
    const wrapper = mount(Header, {
      props: {
        searchQuery: "test"
      }
    });

    await wrapper.find(".clear-search-btn").trigger("click");
    expect(wrapper.emitted("clearSearch")).toBeTruthy();
  });

  it("displays the current search query", () => {
    const wrapper = mount(Header, {
      props: {
        searchQuery: "current query"
      }
    });

    expect(wrapper.find("input").element.value).toBe("current query");
  });
});
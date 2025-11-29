/**
 * @fileoverview Tests for CodeEditor component - focused on critical functionality.
 * Note: Monaco editor integration tests are limited since Monaco requires a DOM.
 */

import { CodeEditor } from "../../../js/components/code-editor.js";

describe("CodeEditor", () => {
  // Helper to get the inner editor div from the container
  const getEditorDiv = (result) => result.children[0];

  it("renders container div with code-editor-container class", () => {
    const vnode = { attrs: { id: "my-editor" }, state: {} };
    const result = CodeEditor.view(vnode);

    expect(result.tag).toBe("div");
    expect(result.attrs.className).toBe("code-editor-container");
  });

  it("renders inner div with correct id", () => {
    const vnode = { attrs: { id: "my-editor" }, state: {} };
    const result = CodeEditor.view(vnode);
    const editorDiv = getEditorDiv(result);

    expect(editorDiv.tag).toBe("div");
    expect(editorDiv.attrs.id).toBe("my-editor");
  });

  it("uses default id when not specified", () => {
    const vnode = { attrs: {}, state: {} };
    const result = CodeEditor.view(vnode);
    const editorDiv = getEditorDiv(result);

    expect(editorDiv.attrs.id).toBe("code-editor");
  });

  it("applies height style to container", () => {
    const vnode = { attrs: { height: "800px" }, state: {} };
    const result = CodeEditor.view(vnode);

    expect(result.attrs.style).toContain("height: 800px");
  });

  it("uses default height when not specified", () => {
    const vnode = { attrs: {}, state: {} };
    const result = CodeEditor.view(vnode);

    expect(result.attrs.style).toContain("height: 500px");
  });

  it("has oncreate lifecycle hook for Monaco initialization", () => {
    const vnode = { attrs: {}, state: {} };
    const result = CodeEditor.view(vnode);
    const editorDiv = getEditorDiv(result);

    expect(typeof editorDiv.attrs.oncreate).toBe("function");
  });

  it("has onupdate lifecycle hook for value sync", () => {
    const vnode = { attrs: {}, state: {} };
    const result = CodeEditor.view(vnode);
    const editorDiv = getEditorDiv(result);

    expect(typeof editorDiv.attrs.onupdate).toBe("function");
  });

  it("has onremove lifecycle hook for cleanup", () => {
    const vnode = { attrs: {}, state: {} };
    const result = CodeEditor.view(vnode);
    const editorDiv = getEditorDiv(result);

    expect(typeof editorDiv.attrs.onremove).toBe("function");
  });
});

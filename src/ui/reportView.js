import { createEmptyEntry, formatReport } from "../core/reportFormatter.js";
import { sanitizeEntries, validateEntryLimit } from "../core/validation.js";

export class ReportView {
  constructor({ root, config, storage, logger }) {
    this.root = root;
    this.config = config;
    this.storage = storage;
    this.logger = logger;
    this.entries = [];
    this.nodes = {};
  }

  mount() {
    this.nodes = {
      title: this.root.querySelector("[data-app-title]"),
      subtitle: this.root.querySelector("[data-app-subtitle]"),
      list: this.root.querySelector("[data-entry-list]"),
      output: this.root.querySelector("[data-report-output]"),
      status: this.root.querySelector("[data-status-line]"),
      template: document.querySelector("[data-entry-template]")
    };

    this.nodes.title.textContent = this.config.appName;
    this.nodes.subtitle.textContent = this.config.subtitle;
    this.entries = this.loadInitialEntries();

    this.root.addEventListener("click", (event) => this.handleClick(event));
    this.root.addEventListener("input", (event) => this.handleInput(event));

    this.render();
  }

  loadInitialEntries() {
    const savedDraft = this.storage.load();
    const entries = sanitizeEntries(savedDraft?.entries, this.config.maxEntries);
    return entries.length > 0 ? entries : [createEmptyEntry()];
  }

  handleClick(event) {
    const action = event.target.closest("[data-action]")?.dataset.action;
    const removeButton = event.target.closest("[data-entry-remove]");

    if (action === "add") {
      this.addEntry();
      return;
    }

    if (action === "copy") {
      this.copyReport();
      return;
    }

    if (action === "clear") {
      this.clearAll();
      return;
    }

    if (removeButton) {
      const card = removeButton.closest("[data-entry-id]");
      this.removeEntry(card?.dataset.entryId);
    }
  }

  handleInput(event) {
    const field = event.target.dataset.field;
    const card = event.target.closest("[data-entry-id]");

    if (!field || !card) {
      return;
    }

    const entry = this.entries.find((item) => item.id === card.dataset.entryId);

    if (!entry) {
      this.logger.warn("Input event for unknown entry.", card.dataset.entryId);
      return;
    }

    entry[field] = event.target.value;
    this.persist();
    this.updateOutput();
  }

  addEntry() {
    if (!validateEntryLimit(this.entries, this.config.maxEntries)) {
      this.setStatus(`最多支持 ${this.config.maxEntries} 条事项。`, true);
      return;
    }

    const entry = createEmptyEntry();
    this.entries.push(entry);
    this.persist();
    this.render();
    this.focusEntry(entry.id);
    this.setStatus("已新增下一条。");
  }

  removeEntry(entryId) {
    if (!entryId) {
      return;
    }

    this.entries = this.entries.filter((entry) => entry.id !== entryId);

    if (this.entries.length === 0) {
      this.entries = [createEmptyEntry()];
    }

    this.persist();
    this.render();
    this.setStatus("已删除。");
  }

  clearAll() {
    this.entries = [createEmptyEntry()];
    this.storage.clear();
    this.render();
    this.setStatus("已清空。");
  }

  async copyReport() {
    const report = formatReport(this.entries);

    if (!report) {
      this.setStatus("请至少填写一条内容。", true);
      return;
    }

    try {
      await navigator.clipboard.writeText(report);
      this.setStatus("已复制到剪贴板。");
    } catch (error) {
      this.logger.warn("Clipboard write failed.", error);
      this.nodes.output.select();
      this.setStatus("自动复制失败，已选中文本，可手动复制。", true);
    }
  }

  persist() {
    if (!this.config.autosave) {
      return;
    }

    this.storage.save({
      entries: this.entries,
      updatedAt: new Date().toISOString()
    });
  }

  render() {
    this.nodes.list.replaceChildren();

    this.entries.forEach((entry, index) => {
      const fragment = this.nodes.template.content.cloneNode(true);
      const card = fragment.querySelector(".entry-card");

      card.dataset.entryId = entry.id;
      fragment.querySelector(".entry-index").textContent = String(index + 1);
      fragment.querySelector('[data-field="content"]').value = entry.content;
      fragment.querySelector('[data-field="progress"]').value = entry.progress;
      fragment.querySelector('[data-field="reflection"]').value = entry.reflection;

      this.nodes.list.appendChild(fragment);
    });

    this.updateOutput();
  }

  updateOutput() {
    this.nodes.output.value = formatReport(this.entries);
  }

  setStatus(message, isError = false) {
    this.nodes.status.textContent = message;
    this.nodes.status.classList.toggle("error", isError);
  }

  focusEntry(entryId) {
    const entry = this.nodes.list.querySelector(`[data-entry-id="${entryId}"]`);
    const input = entry?.querySelector('[data-field="content"]');

    if (!entry || !input) {
      return;
    }

    entry.scrollIntoView({ behavior: "smooth", block: "center" });
    input.focus({ preventScroll: true });
  }
}

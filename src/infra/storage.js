export class LocalDraftStorage {
  constructor(storageKey, logger) {
    this.storageKey = storageKey;
    this.logger = logger;
  }

  load() {
    try {
      const rawValue = window.localStorage.getItem(this.storageKey);
      return rawValue ? JSON.parse(rawValue) : null;
    } catch (error) {
      this.logger.warn("Failed to load draft from localStorage.", error);
      return null;
    }
  }

  save(value) {
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(value));
      return true;
    } catch (error) {
      this.logger.warn("Failed to save draft to localStorage.", error);
      return false;
    }
  }

  clear() {
    try {
      window.localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      this.logger.warn("Failed to clear draft from localStorage.", error);
      return false;
    }
  }
}


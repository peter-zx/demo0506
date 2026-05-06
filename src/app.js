import { loadConfig } from "./infra/configLoader.js";
import { createLogger } from "./infra/logger.js";
import { LocalDraftStorage } from "./infra/storage.js";
import { ReportView } from "./ui/reportView.js";

const defaultConfig = {
  appName: "贾维斯",
  subtitle: "工作汇报小工具",
  storageKey: "jarvis-report-draft",
  maxEntries: 50,
  autosave: true,
  logLevel: "warn"
};

async function bootstrap() {
  const config = await loadConfig("./public/app.config.json", defaultConfig);
  const logger = createLogger(config.logLevel);
  const storage = new LocalDraftStorage(config.storageKey, logger);
  const root = document.querySelector("[data-app-root]");

  if (!root) {
    logger.error("Application root not found.");
    return;
  }

  const view = new ReportView({
    root,
    config,
    storage,
    logger
  });

  view.mount();
}

bootstrap().catch((error) => {
  console.error("[jarvis] bootstrap failed", error);
});


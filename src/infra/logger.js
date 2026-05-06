const levelOrder = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

export function createLogger(level = "warn") {
  const threshold = levelOrder[level] ?? levelOrder.warn;

  return {
    debug: (...args) => writeLog("debug", threshold, args),
    info: (...args) => writeLog("info", threshold, args),
    warn: (...args) => writeLog("warn", threshold, args),
    error: (...args) => writeLog("error", threshold, args)
  };
}

function writeLog(level, threshold, args) {
  if (levelOrder[level] < threshold) {
    return;
  }

  const writer = console[level] ?? console.log;
  writer(`[jarvis] ${level}`, ...args);
}


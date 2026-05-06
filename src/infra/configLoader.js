export async function loadConfig(configUrl, fallbackConfig) {
  try {
    const response = await fetch(configUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Config request failed with status ${response.status}`);
    }

    const remoteConfig = await response.json();
    return {
      ...fallbackConfig,
      ...remoteConfig
    };
  } catch (error) {
    console.warn("[jarvis] using fallback config", error);
    return fallbackConfig;
  }
}


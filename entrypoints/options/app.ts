import { getSettings, saveSettings } from "../../src/stores/app";

(async () => {
  async function initializeForm(): Promise<void> {
    try {
      const settings = await getSettings();
      (document.getElementById("primary-color") as HTMLInputElement | null)!.value = settings.primaryColor;
      (document.getElementById("enable-context-menus") as HTMLInputElement | null)!.checked = settings.enableContextMenus;
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  async function handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const newSettings = {
      primaryColor: (document.getElementById("primary-color") as HTMLInputElement | null)!.value,
      enableContextMenus: (document.getElementById("enable-context-menus") as HTMLInputElement | null)!.checked,
    };

    try {
      await saveSettings(newSettings);
      alert("Settings saved successfully!");
    } catch (error) {
      alert("Failed to save settings: " + (error instanceof Error ? error.message : String(error)));
      console.error("Save error:", error);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initializeForm();
    document.getElementById("settings-form")!.addEventListener("submit", handleSubmit);
  });
})();

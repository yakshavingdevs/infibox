interface Settings {
    primaryColor: string;
    enableContextMenus: boolean;
}

(async () => {
    const DEFAULT_SETTINGS: Record<string, unknown> = {
        primaryColor: "#0d9488",
        enableContextMenus: true,
    };

    function loadSettings(): Promise<Settings> {
        return new Promise((resolve) => {
            chrome.storage.local.get(DEFAULT_SETTINGS, (items: Record<string, unknown>) => {
                resolve(items as unknown as Settings);
            });
        });
    }

    function saveSettings(settings: Settings): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set(settings as unknown as Record<string, unknown>, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }

    async function initializeForm(): Promise<void> {
        try {
            const settings = await loadSettings();
            (document.getElementById("primary-color") as HTMLInputElement | null)!.value = settings.primaryColor;
            (document.getElementById("enable-context-menus") as HTMLInputElement | null)!.checked = settings.enableContextMenus;
        } catch (error) {
            console.error("Failed to load settings:", error);
        }
    }

    async function handleSubmit(event: Event): Promise<void> {
        event.preventDefault();
        const newSettings: Settings = {
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

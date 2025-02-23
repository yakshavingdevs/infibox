(() => {
    const DEFAULT_SETTINGS = {
        primaryColor: "#000000",
        enableContextMenus: true,
    };

    function loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.local.get(DEFAULT_SETTINGS, (items) => {
                resolve(items);
            });
        });
    }

    function saveSettings(settings) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set(settings, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }

    async function initializeForm() {
        try {
            const settings = await loadSettings();
            document.getElementById("primary-color").value = settings.primaryColor;
            document.getElementById("enable-context-menus").checked = settings.enableContextMenus;
        } catch (error) {
            console.error("Failed to load settings:", error);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const newSettings = {
            primaryColor: document.getElementById("primary-color").value,
            enableContextMenus: document.getElementById("enable-context-menus").checked,
        };

        try {
            await saveSettings(newSettings);
            alert("Settings saved successfully!");
        } catch (error) {
            alert("Failed to save settings: " + error.message);
            console.error("Save error:", error);
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        initializeForm();
        document.getElementById("settings-form").addEventListener("submit", handleSubmit);
    });
})();
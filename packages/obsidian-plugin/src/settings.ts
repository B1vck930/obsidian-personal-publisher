import { PluginSettingTab, Setting } from "obsidian";
import type ObsidianPersonalPublisherPlugin from "./main";
import type { PersonalPublisherSettings } from "./types";
import {
  defaultSettings,
  normalizePositiveNumber,
  supportedThemes
} from "./settingsCore";

export { defaultSettings, normalizeSettings } from "./settingsCore";

export class PersonalPublisherSettingTab extends PluginSettingTab {
  plugin: ObsidianPersonalPublisherPlugin;

  constructor(plugin: ObsidianPersonalPublisherPlugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Obsidian Personal Publisher" });

    new Setting(containerEl)
      .setName("API Base URL")
      .setDesc("The deployed web app URL used by future publish requests.")
      .addText((text) =>
        text
          .setPlaceholder(defaultSettings.apiBaseUrl)
          .setValue(this.plugin.settings.apiBaseUrl)
          .onChange(async (value) => {
            this.plugin.settings.apiBaseUrl = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Default Theme")
      .setDesc("The public page theme to use when publishing.")
      .addDropdown((dropdown) => {
        for (const theme of supportedThemes) {
          dropdown.addOption(theme, theme);
        }

        dropdown
          .setValue(this.plugin.settings.defaultTheme)
          .onChange(async (value) => {
            this.plugin.settings.defaultTheme = supportedThemes.includes(
              value as PersonalPublisherSettings["defaultTheme"]
            )
              ? (value as PersonalPublisherSettings["defaultTheme"])
              : defaultSettings.defaultTheme;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Default Expiration Days")
      .setDesc("Default number of days before a published page expires.")
      .addText((text) =>
        text
          .setPlaceholder(String(defaultSettings.defaultExpirationDays))
          .setValue(String(this.plugin.settings.defaultExpirationDays))
          .onChange(async (value) => {
            this.plugin.settings.defaultExpirationDays = normalizePositiveNumber(
              value,
              defaultSettings.defaultExpirationDays
            );
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Footer Text")
      .setDesc("Footer text shown on public pages.")
      .addTextArea((text) =>
        text
          .setPlaceholder(defaultSettings.footerText)
          .setValue(this.plugin.settings.footerText)
          .onChange(async (value) => {
            this.plugin.settings.footerText =
              value.trim() || defaultSettings.footerText;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Max Image Size MB")
      .setDesc("Maximum local image size to allow when image upload is implemented.")
      .addText((text) =>
        text
          .setPlaceholder(String(defaultSettings.maxImageSizeMb))
          .setValue(String(this.plugin.settings.maxImageSizeMb))
          .onChange(async (value) => {
            this.plugin.settings.maxImageSizeMb = normalizePositiveNumber(
              value,
              defaultSettings.maxImageSizeMb
            );
            await this.plugin.saveSettings();
          })
      );
  }
}

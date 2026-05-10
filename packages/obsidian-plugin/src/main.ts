import { Plugin } from "obsidian";
import { defaultSettings } from "./settings";
import type { PersonalPublisherSettings } from "./types";

export default class ObsidianPersonalPublisherPlugin extends Plugin {
  settings: PersonalPublisherSettings = defaultSettings;

  async onload() {
    await this.loadSettings();
    console.log("Loaded Obsidian Personal Publisher foundation.");
  }

  onunload() {
    console.log("Unloaded Obsidian Personal Publisher.");
  }

  async loadSettings() {
    this.settings = {
      ...defaultSettings,
      ...(await this.loadData())
    };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

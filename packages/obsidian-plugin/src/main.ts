import { Notice, Plugin, TFile } from "obsidian";
import {
  defaultSettings,
  normalizeSettings,
  PersonalPublisherSettingTab
} from "./settings";
import {
  type MarkdownAssetTransformOptions,
  extractTitle,
  formatPublishPreviewNotice,
  transformMarkdownAssets
} from "./markdownTransform";
import type { PersonalPublisherSettings } from "./types";

export default class ObsidianPersonalPublisherPlugin extends Plugin {
  settings: PersonalPublisherSettings = defaultSettings;

  async onload() {
    await this.loadSettings();

    this.addRibbonIcon("upload-cloud", "Publish current note", () => {
      void this.publishCurrentNote();
    });

    this.addCommand({
      id: "publish-current-note",
      name: "Publish current note",
      callback: () => {
        void this.publishCurrentNote();
      }
    });

    this.addCommand({
      id: "unpublish-current-note",
      name: "Unpublish current note",
      callback: () => {
        void this.unpublishCurrentNote();
      }
    });

    this.addSettingTab(new PersonalPublisherSettingTab(this));
  }

  async publishCurrentNote() {
    const file = this.getActiveMarkdownFile();

    if (!file) {
      new Notice("Open a Markdown note before publishing.");
      return;
    }

    try {
      const markdown = await this.app.vault.read(file);
      const title = extractTitle(markdown, file.basename);
      const assetOptions: MarkdownAssetTransformOptions = {};
      const isAssetAvailable = this.createAssetAvailabilityChecker();

      if (isAssetAvailable) {
        assetOptions.isAssetAvailable = isAssetAvailable;
      }

      const assetPreview = transformMarkdownAssets(markdown, assetOptions);

      new Notice(formatPublishPreviewNotice(title, assetPreview));
    } catch (error) {
      console.error(error);
      new Notice(`Could not read "${file.path}". Check the note and try again.`);
    }
  }

  async unpublishCurrentNote() {
    const file = this.getActiveMarkdownFile();

    if (!file) {
      new Notice("Open a Markdown note before unpublishing.");
      return;
    }

    const metadata = this.settings.publishedPages[file.path];

    if (!metadata) {
      new Notice("This note has not been published yet.");
      return;
    }

    new Notice(
      "Unpublish is not connected yet. Backend publishing is not implemented in Task 2."
    );
  }

  getActiveMarkdownFile(): TFile | null {
    const file = this.app.workspace.getActiveFile();

    if (!(file instanceof TFile) || file.extension !== "md") {
      return null;
    }

    return file;
  }

  createAssetAvailabilityChecker(): MarkdownAssetTransformOptions["isAssetAvailable"] {
    return (path) => Boolean(this.app.metadataCache.getFirstLinkpathDest(path, ""));
  }

  async loadSettings() {
    this.settings = normalizeSettings(await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

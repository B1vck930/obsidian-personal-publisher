import { Notice, Plugin, TFile } from "obsidian";
import { createObsidianAssetReader } from "./assetUpload";
import {
  defaultSettings,
  normalizeSettings,
  PersonalPublisherSettingTab
} from "./settings";
import { extractTitle } from "./markdownTransform";
import {
  applyPublishedPageMetadata,
  buildPublishNotice,
  buildUnpublishNotice,
  publishMarkdownNote,
  PublishWorkflowError,
  removePublishedPageMetadata,
  unpublishPublishedNote
} from "./publishWorkflow";
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
      const existingMetadata = this.settings.publishedPages[file.path];
      const result = await publishMarkdownNote({
        filePath: file.path,
        title,
        markdown,
        settings: this.settings,
        ...(existingMetadata ? { existingMetadata } : {}),
        readAsset: createObsidianAssetReader(this.app)
      });

      this.settings = applyPublishedPageMetadata(
        this.settings,
        file.path,
        result.metadata
      );
      await this.saveSettings();

      new Notice(buildPublishNotice(result));
    } catch (error) {
      console.error(error);
      new Notice(formatPublishError(error, file.path));
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

    try {
      await unpublishPublishedNote({
        apiBaseUrl: this.settings.apiBaseUrl,
        metadata
      });

      this.settings = removePublishedPageMetadata(this.settings, file.path);
      await this.saveSettings();

      new Notice(buildUnpublishNotice(metadata.url));
    } catch (error) {
      console.error(error);
      new Notice(
        error instanceof Error
          ? `Could not unpublish "${file.basename}": ${error.message}`
          : `Could not unpublish "${file.basename}".`
      );
    }
  }

  getActiveMarkdownFile(): TFile | null {
    const file = this.app.workspace.getActiveFile();

    if (!(file instanceof TFile) || file.extension !== "md") {
      return null;
    }

    return file;
  }

  async loadSettings() {
    this.settings = normalizeSettings(await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

function formatPublishError(error: unknown, filePath: string): string {
  if (error instanceof PublishWorkflowError) {
    return error.message;
  }

  if (error instanceof Error) {
    return `Could not publish "${filePath}": ${error.message}`;
  }

  return `Could not publish "${filePath}".`;
}

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
import { PublishApiError } from "./publishApi";
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
      new Notice(formatPublishError(error, file.basename));
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
      new Notice(formatUnpublishError(error, file.basename));
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

function formatPublishError(error: unknown, title: string): string {
  if (error instanceof PublishWorkflowError) {
    return error.message;
  }

  if (error instanceof PublishApiError) {
    return formatApiError("publish", title, error);
  }

  if (error instanceof Error) {
    return `Could not publish "${title}": ${error.message}`;
  }

  return `Could not publish "${title}".`;
}

function formatUnpublishError(error: unknown, title: string): string {
  if (error instanceof PublishApiError) {
    return formatApiError("unpublish", title, error);
  }

  if (error instanceof Error) {
    return `Could not unpublish "${title}": ${error.message}`;
  }

  return `Could not unpublish "${title}".`;
}

function formatApiError(
  action: "publish" | "unpublish",
  title: string,
  error: PublishApiError
): string {
  const verb = action === "publish" ? "publish" : "unpublish";

  if (error.status === 403) {
    return `Could not ${verb} "${title}": invalid owner token. Publish metadata may be stale.`;
  }

  if (error.status === 404 || error.status === 410) {
    return `Could not ${verb} "${title}": the published page was not found or has expired.`;
  }

  if (error.status && error.status >= 500) {
    return `Could not ${verb} "${title}": backend unavailable. Try again later.`;
  }

  return `Could not ${verb} "${title}": ${error.message}`;
}

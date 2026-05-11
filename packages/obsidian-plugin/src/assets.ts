export type LocalAssetReference = {
  path: string;
  syntax: "markdown" | "wiki";
  alt: string;
  original: string;
  width?: string;
};

export type AssetWarningReason = "missing" | "unsupported";

export type AssetWarning = {
  path: string;
  reason: AssetWarningReason;
  message: string;
};

import type { Metadata } from "next";
import { PreviewNoticeClient } from "./preview-notice-client";

export const metadata: Metadata = {
  title: "Notice Preview · RunnerUp",
  description: "Private preview for event notice",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreviewNoticePage() {
  return <PreviewNoticeClient />;
}

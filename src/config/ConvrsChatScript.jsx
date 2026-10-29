import Script from "next/script";
import {
  CONVRS_WEBCHAT_SCRIPT_ID,
  CONVRS_WEBCHAT_SCRIPT_URL,
} from "@/lib/chat/convrs";

export default function ConvrsChatScript() {
  return (
    <Script
      id={CONVRS_WEBCHAT_SCRIPT_ID}
      src={CONVRS_WEBCHAT_SCRIPT_URL}
      strategy="lazyOnload"
      defer
    />
  );
}

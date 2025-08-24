import { useState, useEffect } from "react";
import { checkOpenAIStatus } from "@/api/api";

export const useCheckOpenAIStatus = () => {
  const [openAIStatus, setOpenAIStatus] = useState<{ apiKeyValid: boolean } | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkOpenAIStatus();
        setOpenAIStatus(status.data);
      } catch (error) {
        console.error("OpenAI 상태 확인 실패:", error);
        setOpenAIStatus({ apiKeyValid: false });
      }
    };
    checkStatus();
  }, []);

  return { openAIStatus };
};

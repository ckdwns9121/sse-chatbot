import { useState, useEffect } from "react";
import { checkOpenAIStatus } from "@/api/api";

export const useCheckOpenAIStatus = () => {
  const [openAIStatus, setOpenAIStatus] = useState<{ apiKeyValid: boolean } | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkOpenAIStatus();
      setOpenAIStatus(status.data);
    };
    checkStatus();
  }, []);

  return { openAIStatus };
};

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export function useStartChatSession() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-container-url`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("wsPort", data.port);
      }
    },
    onError: (error) => {
      console.error("Failed to start chat session:", error);
    },
  });
}

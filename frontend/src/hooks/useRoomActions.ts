import { useCallback } from 'react';
import { useCopyToClipboard } from '@/contexts/CopyContextProvider';
import axios from '@/libs/axios';

export const useRoomActions = (sessionId: string) => {
  const { copyToClipboard } = useCopyToClipboard();

  const removeClient = useCallback(
    async (index: number) => {
      if (sessionId) {
        await axios.delete(`/session/${sessionId}/clients/${index}`);
      }
    },
    [sessionId]
  );

  const onCopyButtonClick = useCallback(() => {
    copyToClipboard(`${process.env.NEXT_PUBLIC_BASE_URL}/c/?c=${sessionId}`);
  }, [copyToClipboard, sessionId]);

  return {
    removeClient,
    onCopyButtonClick,
  };
};

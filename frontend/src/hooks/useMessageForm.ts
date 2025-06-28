import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

interface MessageFormData {
  message: string;
}

export const useMessageForm = (sendMessage: (message: string) => void, isDisconnected: boolean) => {
  const { control, handleSubmit, reset } = useForm<MessageFormData>({
    defaultValues: {
      message: '',
    },
  });

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleSubmit(async (data) => {
        try {
          if (data.message === '') return;
          sendMessage(data.message);
          reset();
        } catch (error) {
          console.error(error); // eslint-disable-line no-console
        }
      })();
    },
    [handleSubmit, sendMessage, reset]
  );

  return {
    control,
    onSubmit,
    isDisabled: isDisconnected,
  };
};

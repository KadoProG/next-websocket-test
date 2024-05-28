'use client';

import React from 'react';

interface CopyToClipboardContextType {
  copyToClipboard: (text: string) => void;
}
const context = React.createContext<CopyToClipboardContextType>({
  copyToClipboard: () => {},
});

export const useCopyToClipboard = () => React.useContext(context);

export const CopyToClipboardContextProvider = (props: { children: React.ReactNode }) => {
  const [isCopied, setIsCopied] = React.useState(false);
  const copyContext = React.useMemo(
    () => ({
      copyToClipboard: async (text: string) => {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          setIsCopied(true);
        } else {
          const textarea = document.getElementById(
            'hidden-textarea-to-clip'
          ) as HTMLTextAreaElement;
          if (textarea === null) return;
          textarea.value = text;
          textarea.select();
          document.execCommand('copy');
          textarea.blur();
        }
      },
    }),
    []
  );

  return (
    <context.Provider value={copyContext}>
      {isCopied ? 'Copied!' : null}
      <textarea
        id="hidden-textarea-to-clip"
        style={{ zIndex: -1, opacity: 0, position: 'fixed', top: 0, left: 0 }}
      />
      {props.children}
    </context.Provider>
  );
};

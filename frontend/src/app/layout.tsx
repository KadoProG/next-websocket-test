import React from 'react';
import { Metadata } from 'next';
import { CopyToClipboardContextProvider } from '@/contexts/CopyContextProvider';
import '@/app/globals.scss';
import styles from '@/app/layout.module.scss';
import { UserInfoContextProvider } from '@/contexts/UserInfoContextProvider';
import { SnackbarContextProvider } from '@/contexts/SnackbarContextProvider';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

const RootLayout = (props: { children: React.ReactNode }) => (
  <html lang="ja">
    <body className={styles.Body}>
      <UserInfoContextProvider>
        <SnackbarContextProvider>
          <CopyToClipboardContextProvider>{props.children}</CopyToClipboardContextProvider>
        </SnackbarContextProvider>
      </UserInfoContextProvider>
    </body>
  </html>
);

export default RootLayout;

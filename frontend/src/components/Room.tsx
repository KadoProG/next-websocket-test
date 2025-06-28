'use client';

import { Input } from '@/components/common/Input';
import { TalkingCard } from '@/components/common/TalkingCard';
import { useUserInfo } from '@/contexts/UserInfoContextProvider';
import { redirect } from 'next/navigation';
import React from 'react';
import styles from '@/components/Room.module.scss';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useRoomActions } from '@/hooks/useRoomActions';
import { useMessageForm } from '@/hooks/useMessageForm';

export const Room = () => {
  const { sessionId, nickname } = useUserInfo();

  React.useEffect(() => {
    if (!sessionId) {
      redirect('/c');
    }
  }, [sessionId]);

  const { response, clients, isDisconnected, sendMessage } = useWebSocket(
    sessionId || '',
    nickname || ''
  );
  const { removeClient, onCopyButtonClick } = useRoomActions(sessionId || '');
  const { control, onSubmit, isDisabled } = useMessageForm(sendMessage, isDisconnected);

  return (
    <div>
      <h1>参加しているチーム</h1>

      {sessionId && (
        <div className={styles.Room}>
          {isDisconnected && <p style={{ color: 'red' }}>切断されました</p>}
          <ul>
            {clients.map((client, index) => (
              <li key={client}>
                {client}
                <button type="button" onClick={() => removeClient(index)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p>Session ID: {sessionId}</p>
          <button type="button" onClick={onCopyButtonClick}>
            共有リンクをコピー
          </button>

          <h2>メッセージリスト</h2>
          {response.map((messageObject, index) => (
            <TalkingCard
              message={messageObject.message}
              nickName={messageObject.ws.nickname}
              isMine={messageObject.isMine}
              // eslint-disable-next-line react/no-array-index-key
              key={index}
            />
          ))}

          <form onSubmit={onSubmit} className={styles.Room__form}>
            <Input name="message" control={control} placeholder="入力しろ" disabled={isDisabled} />
          </form>
        </div>
      )}
    </div>
  );
};

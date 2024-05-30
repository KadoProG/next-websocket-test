'use client';

import { Input } from '@/components/common/Input';
import { useUserInfo } from '@/contexts/UserInfoContextProvider';
import axios from '@/libs/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';

export const JoinAndCreateHost: React.FC = () => {
  const searchParams = useSearchParams();

  const querySessionId = searchParams.get('c');

  const router = useRouter();
  const { sessionId, nickname, setSessionId, setNickname } = useUserInfo();

  const { control, trigger, getValues } = useForm<{ nickname: string }>({
    defaultValues: {
      nickname: '',
    },
  });

  const createHost = React.useCallback(async () => {
    if (!(await trigger())) return;
    if (querySessionId) {
      setSessionId(querySessionId);
    } else {
      const res = await axios.post('/create-session');
      const data = res.data;
      setSessionId(data.sessionId);
    }
    setNickname(getValues('nickname'));
  }, [setSessionId, trigger, getValues, setNickname, querySessionId]);

  React.useEffect(() => {
    if (sessionId && nickname) {
      router.push('/c/room');
    }
  }, [sessionId, router, nickname]);

  return (
    <div>
      {querySessionId && <h2>招待されたチームに参加します。</h2>}
      <p>ニックネームを入れてください。</p>
      <div>
        <Input name="nickname" control={control} placeholder="ソケット　太郎" required />
      </div>

      <button type="button" onClick={createHost}>
        {querySessionId ? '参加する！' : 'チームを作成'}
      </button>
    </div>
  );
};

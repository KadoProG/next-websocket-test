'use client';

import React from 'react';
import { FieldValues, UseControllerProps, useController } from 'react-hook-form';
import styles from '@/components/common/Input.module.scss';

export type InputProps<T extends FieldValues> = UseControllerProps<T> & {
  name: string;
  placeholder?: string;
  required?: boolean;
};

export const Input = <T extends FieldValues>(props: InputProps<T>) => {
  const { field, fieldState } = useController<T>({
    name: props.name,
    control: props.control,
    rules: { ...props.rules, required: props.required ? '入力必須の項目です' : undefined },
  });

  return (
    <div className={styles.container}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <input {...field} placeholder={props.placeholder} className={styles.Input} />
      {fieldState.error && <p className={styles.errorText}>{fieldState.error.message}</p>}
    </div>
  );
};
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/common/Input';
import { useForm } from 'react-hook-form';

const meta = {
  title: 'common/Input',
  component: Input,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const sample: Story = {
  name: 'サンプル',
  args: {
    placeholder: '入力してください',
    name: 'sample',
    required: true,
  },

  render: (args) => {
    const { control } = useForm(); // eslint-disable-line
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Input {...args} control={control} />;
  },
};

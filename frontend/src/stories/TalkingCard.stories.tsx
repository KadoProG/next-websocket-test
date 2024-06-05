import type { Meta, StoryObj } from '@storybook/react';
import { TalkingCard } from '@/components/common/TalkingCard';

const meta = {
  title: 'common/TalkingCard',
  component: TalkingCard,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
} satisfies Meta<typeof TalkingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const sample: Story = {
  name: 'サンプル',
  args: {
    isMine: false,
    nickName: 'ニックネーム',
    message: 'メッセージ',
  },
};

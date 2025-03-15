import dotenv from 'dotenv';
dotenv.config();

export const notify = async (text: string): Promise<Response> => {
  const url = 'https://api.line.me/v2/bot/message/push';
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const targetId = process.env.LINE_USER_OR_GROUP_ID;
  const payload = {
    to: targetId,
    messages: [
      {
        type: 'text',
        text,
      },
    ],
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${channelSecret}`,
    },
    body: JSON.stringify(payload),
  });

  return res;
};

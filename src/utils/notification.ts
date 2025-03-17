import dotenv from 'dotenv';
dotenv.config();

export const notify = async (text: string): Promise<Response> => {
  const url = 'https://api.line.me/v2/bot/message/push';
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const channelSecretBackup = process.env.LINE_CHANNEL_SECRET_BACKUP;
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

  let res: Response;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${channelSecret}`,
  };
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });
  } catch (e) {
    res = await fetch(url, {
      method: 'POST',
      headers: { ...headers, Authorization: `Bearer ${channelSecretBackup}` },
      body: JSON.stringify(payload),
    });
  }

  return res;
};

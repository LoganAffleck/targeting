// pages/api/hubspot-user.ts
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { hutk } = req.body;

  const response = await fetch(
    `https://api.hubapi.com/contacts/v1/contact/utk/${hutk}/profile`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    return res.status(400).json({ message: 'User not found' });
  }

  const data = await response.json();
  return res.status(200).json(data);
}
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { hutk } = await req.json();

    if (!hutk) {
      return NextResponse.json({ message: 'Missing hutk' }, { status: 400 });
    }

    const hubspotRes = await fetch(
      `https://api.hubapi.com/contacts/v1/contact/utk/${hutk}/profile`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
        },
      }
    );

    if (!hubspotRes.ok) {
      const text = await hubspotRes.text();
      console.error('HubSpot error:', text);
      return NextResponse.json({ message: 'User not found' }, { status: hubspotRes.status });
    }

    const data = await hubspotRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

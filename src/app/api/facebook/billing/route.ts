
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accounts = searchParams.get('accounts');
  const adAccountIds = accounts ? accounts.split(',') : [];

  if (adAccountIds.length === 0) {
    return NextResponse.json({ error: 'No ad accounts provided' }, { status: 400 });
  }

  const FB_TOKEN = process.env.FB_TOKEN;
  if (!FB_TOKEN) {
    return NextResponse.json({ error: 'Facebook token not configured' }, { status: 500 });
  }

  try {
    const billingInfo = await Promise.all(
      adAccountIds.map(async (id) => {
        const url = `https://graph.facebook.com/v20.0/${id}?fields=balance,funding_source_details&access_token=${FB_TOKEN}`;
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Failed to fetch billing info for account ${id}:`, errorData);
          return { id, error: 'Failed to fetch billing info' };
        }
        const data = await response.json();
        const balanceInCents = parseFloat(data.balance);
        const balanceInReal = !isNaN(balanceInCents) ? balanceInCents / 100 : 0;

        return {
          id: data.id,
          balance: balanceInReal.toString(),
          funding_source: data.funding_source_details ? {
            display_string: data.funding_source_details.display_string,
            type: data.funding_source_details.type,
          } : null,
        };
      })
    );

    return NextResponse.json(billingInfo);
  } catch (error) {
    console.error('Error fetching billing info:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

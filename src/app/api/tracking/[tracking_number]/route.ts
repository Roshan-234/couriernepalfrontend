import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { tracking_number: string } }
) {
  const tracking_number = params.tracking_number;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shipments/track/${tracking_number}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Shipment not found');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 404 }
    );
  }
}

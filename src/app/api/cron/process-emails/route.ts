import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/service';

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Unauthorized cron attempt:', authHeader);
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('Starting email queue processing...');
    
    // Process the email queue using existing EmailService
    await EmailService.processQueue();
    
    console.log('Email queue processing completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Email queue processed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Email processing error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Email processing failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering (with auth)
export async function POST(request: NextRequest) {
  return GET(request);
}

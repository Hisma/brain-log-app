import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { getAuditLogs } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters for pagination/filtering
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const action = searchParams.get('action') || undefined;
    const resource = searchParams.get('resource') || undefined;
    const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined;

    // Use your existing audit system
    const auditLogs = await getAuditLogs({
      limit: Math.min(limit, 100), // Cap at 100 for performance
      offset,
      action,
      resource,
      userId
    });

    // Transform the data to match the expected interface for the frontend
    const transformedLogs = auditLogs.map(log => ({
      id: log.id,
      action: log.action,
      resourceType: log.resource,
      resourceId: null, // Your system doesn't track specific resource IDs
      userId: log.userId,
      userName: log.displayName || log.username || 'Unknown User',
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.timestamp.toISOString(),
      success: true // Your system doesn't track failures separately
    }));

    return NextResponse.json({
      success: true,
      logs: transformedLogs,
      total: transformedLogs.length
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

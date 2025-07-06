import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/crypto';

/**
 * POST /api/users
 * Creates a new user
 */
export async function POST(request: Request) {
  try {
    const { username, password, displayName, timezone } = await request.json();
    
    // Validate input
    if (!username || !password || !displayName) {
      return NextResponse.json(
        { error: 'Username, password, and display name are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }
    
    // Hash password using Edge-compatible Web Crypto API
    const passwordHash = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        displayName,
        theme: 'system',
        timezone: timezone || 'America/New_York'
      }
    });
    
    // Don't return the password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users
 * Returns all users (without password hashes)
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        createdAt: true,
        lastLogin: true,
        theme: true
      }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

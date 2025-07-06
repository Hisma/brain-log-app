---
title: Adding New Features Guide
description: Complete workflow and patterns for implementing new features in the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Adding New Features Guide

## Overview

This guide provides a complete workflow for adding new features to the Brain Log App, from initial planning through deployment. It covers database changes, API development, UI implementation, and integration with the existing authentication and theming systems.

## Feature Development Lifecycle

### Phase 1: Planning and Design
1. **Feature Specification** - Define requirements and scope
2. **Database Design** - Plan schema changes if needed
3. **API Design** - Define endpoints and data structures
4. **UI/UX Design** - Plan user interface and user experience
5. **Integration Points** - Identify system integration requirements

### Phase 2: Backend Implementation
1. **Database Schema Updates** - Prisma migrations
2. **API Route Development** - Create/update endpoints
3. **Authentication Integration** - Secure endpoints
4. **Data Validation** - Input validation and sanitization

### Phase 3: Frontend Implementation
1. **Component Development** - Create UI components
2. **Form Implementation** - Data input and validation
3. **State Management** - Client-side data management
4. **Integration** - Connect frontend to backend

### Phase 4: Testing and Documentation
1. **Manual Testing** - Comprehensive feature testing
2. **Integration Testing** - Test with existing features
3. **Documentation Updates** - Update relevant documentation
4. **Code Review** - Internal review and refinement

## Complete Feature Implementation Example

Let's implement a hypothetical "Exercise Tracking" feature to demonstrate the complete workflow.

### Step 1: Feature Planning

#### Requirements
- Track daily exercise activities
- Record exercise type, duration, intensity
- View exercise history and trends
- Generate weekly exercise insights

#### Database Requirements
- New `Exercise` model with user relationship
- Fields: type, duration, intensity, date, notes
- Relationship with existing `User` model

#### API Requirements
- `POST /api/exercises` - Create exercise entry
- `GET /api/exercises` - List user exercises
- `PUT /api/exercises/[id]` - Update exercise entry
- `DELETE /api/exercises/[id]` - Delete exercise entry

### Step 2: Database Implementation

#### Update Prisma Schema

```prisma
// Add to prisma/schema.prisma

model Exercise {
  id        Int      @id @default(autoincrement())
  userId    Int
  date      DateTime
  type      String   // e.g., "Running", "Weightlifting", "Yoga"
  duration  Int      // minutes
  intensity Int      // 1-10 scale
  notes     String?  // optional notes
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relationship with User
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date, type]) // Prevent duplicate exercises same day/type
  @@index([userId, date]) // Optimize queries by user and date
}

// Update User model to include exercises relationship
model User {
  // ... existing fields
  exercises      Exercise[]
}
```

#### Create and Run Migration

```bash
# Generate migration
npx prisma migrate dev --name add_exercise_tracking

# Generate updated Prisma client
npx prisma generate

# Test migration in Prisma Studio
npx prisma studio
```

### Step 3: API Implementation

#### Create API Route File

**File**: `src/app/api/exercises/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/exercises
 * Create a new exercise entry
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check - reuse established pattern
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const data = await request.json();
    
    // Input validation
    if (!data.type || !data.duration || !data.intensity || !data.date) {
      return NextResponse.json(
        { error: 'Missing required fields: type, duration, intensity, date' },
        { status: 400 }
      );
    }
    
    // Validate intensity range
    if (data.intensity < 1 || data.intensity > 10) {
      return NextResponse.json(
        { error: 'Intensity must be between 1 and 10' },
        { status: 400 }
      );
    }
    
    // Check for duplicate exercise (same user, date, type)
    const existingExercise = await prisma.exercise.findUnique({
      where: {
        userId_date_type: {
          userId,
          date: new Date(data.date),
          type: data.type
        }
      }
    });
    
    if (existingExercise) {
      return NextResponse.json(
        { error: 'Exercise of this type already logged for this date' },
        { status: 409 }
      );
    }
    
    // Create exercise entry
    const exercise = await prisma.exercise.create({
      data: {
        userId,
        type: data.type,
        duration: parseInt(data.duration),
        intensity: parseInt(data.intensity),
        date: new Date(data.date),
        notes: data.notes || ''
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    });
    
    return NextResponse.json(exercise, { status: 201 });
    
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise entry' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/exercises
 * Fetch user's exercise entries with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    
    // Optional query parameters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit');
    
    // Build query conditions
    const where: any = { userId };
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (type) {
      where.type = type;
    }
    
    // Execute query with optional pagination
    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: {
        date: 'desc'
      },
      take: limit ? parseInt(limit) : undefined,
      include: {
        user: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    });
    
    return NextResponse.json({ exercises });
    
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}
```

#### Create Dynamic Route for Individual Exercises

**File**: `src/app/api/exercises/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * PUT /api/exercises/[id]
 * Update an exercise entry
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const exerciseId = parseInt(params.id);
    const data = await request.json();
    
    // Verify exercise exists and belongs to user
    const existingExercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    });
    
    if (!existingExercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }
    
    if (existingExercise.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Update exercise
    const updatedExercise = await prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        type: data.type ?? existingExercise.type,
        duration: data.duration ? parseInt(data.duration) : existingExercise.duration,
        intensity: data.intensity ? parseInt(data.intensity) : existingExercise.intensity,
        notes: data.notes ?? existingExercise.notes,
        date: data.date ? new Date(data.date) : existingExercise.date
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    });
    
    return NextResponse.json(updatedExercise);
    
  } catch (error) {
    console.error('Error updating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to update exercise' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/exercises/[id]
 * Delete an exercise entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const exerciseId = parseInt(params.id);
    
    // Verify exercise exists and belongs to user
    const existingExercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    });
    
    if (!existingExercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }
    
    if (existingExercise.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Delete exercise
    await prisma.exercise.delete({
      where: { id: exerciseId }
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
}
```

### Step 4: Frontend Implementation

#### Create Type Definitions

**File**: `src/types/exercise.ts`

```typescript
export interface Exercise {
  id: number;
  userId: number;
  type: string;
  duration: number; // minutes
  intensity: number; // 1-10 scale
  date: Date | string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: {
    id: number;
    displayName: string;
  };
}

export interface ExerciseFormData {
  type: string;
  duration: number;
  intensity: number;
  date: string;
  notes?: string;
}

export interface ExerciseFilters {
  startDate?: string;
  endDate?: string;
  type?: string;
  limit?: number;
}
```

#### Create API Client Functions

**File**: `src/lib/api/exercises.ts`

```typescript
import { Exercise, ExerciseFormData, ExerciseFilters } from '@/types/exercise';

const API_BASE = '/api/exercises';

export class ExerciseAPI {
  /**
   * Create a new exercise entry
   */
  static async create(data: ExerciseFormData): Promise<Exercise> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create exercise');
    }

    return response.json();
  }

  /**
   * Get user's exercise entries
   */
  static async getAll(filters?: ExerciseFilters): Promise<{ exercises: Exercise[] }> {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const url = filters ? `${API_BASE}?${params.toString()}` : API_BASE;
    
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch exercises');
    }

    return response.json();
  }

  /**
   * Update an exercise entry
   */
  static async update(id: number, data: Partial<ExerciseFormData>): Promise<Exercise> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update exercise');
    }

    return response.json();
  }

  /**
   * Delete an exercise entry
   */
  static async delete(id: number): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete exercise');
    }

    return response.json();
  }
}
```

#### Create Exercise Form Component

**File**: `src/components/forms/ExerciseForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ExerciseFormData } from '@/types/exercise';

interface ExerciseFormProps {
  initialValues?: Partial<ExerciseFormData>;
  onSubmit: (data: ExerciseFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  isUpdate?: boolean;
}

export function ExerciseForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isUpdate = false
}: ExerciseFormProps) {
  const [type, setType] = useState(initialValues?.type || '');
  const [duration, setDuration] = useState(initialValues?.duration || 30);
  const [intensity, setIntensity] = useState(initialValues?.intensity || 5);
  const [date, setDate] = useState(
    initialValues?.date || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(initialValues?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      type,
      duration,
      intensity,
      date,
      notes
    });
  };

  const exerciseTypes = [
    'Running',
    'Walking',
    'Cycling',
    'Swimming',
    'Weightlifting',
    'Yoga',
    'Pilates',
    'Dancing',
    'Sports',
    'Other'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isUpdate ? 'Update Exercise' : 'Log Exercise'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="exercise-type">
              Exercise Type
            </label>
            <Select
              value={type}
              onValueChange={setType}
              required
            >
              <SelectTrigger id="exercise-type">
                <SelectValue placeholder="Select exercise type" />
              </SelectTrigger>
              <SelectContent>
                {exerciseTypes.map((exerciseType) => (
                  <SelectItem key={exerciseType} value={exerciseType}>
                    {exerciseType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="duration">
              Duration (minutes)
            </label>
            <Input 
              id="duration"
              type="number" 
              min={1} 
              max={480} // 8 hours max
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">
                Intensity (1-10)
              </label>
              <span className="text-sm font-medium">{intensity}</span>
            </div>
            <Slider 
              value={[intensity]}
              max={10}
              step={1}
              onValueChange={(value) => setIntensity(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>Light</span>
              <span>Very Intense</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="date">
              Date
            </label>
            <Input 
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="notes">
              Notes (optional)
            </label>
            <Textarea 
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about your exercise..."
              rows={3}
            />
          </div>

          <div className="flex justify-between mt-6">
            {onCancel && (
              <Button 
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={onCancel ? "ml-auto" : "w-full"}
            >
              {isSubmitting 
                ? 'Saving...' 
                : isUpdate 
                  ? 'Update Exercise' 
                  : 'Log Exercise'
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### Create Exercise List Component

**File**: `src/components/ExerciseList.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExerciseAPI } from '@/lib/api/exercises';
import { Exercise } from '@/types/exercise';
import { formatDate } from '@/lib/utils';

interface ExerciseListProps {
  onEdit?: (exercise: Exercise) => void;
  refreshTrigger?: number;
}

export function ExerciseList({ onEdit, refreshTrigger }: ExerciseListProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const data = await ExerciseAPI.getAll({ limit: 10 }); // Recent 10 exercises
      setExercises(data.exercises);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [refreshTrigger]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exercise?')) {
      return;
    }

    try {
      await ExerciseAPI.delete(id);
      await fetchExercises(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exercise');
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'bg-green-500';
    if (intensity <= 6) return 'bg-yellow-500';
    if (intensity <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return <div>Loading exercises...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-md">
        Error: {error}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchExercises}
          className="ml-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Exercises</CardTitle>
      </CardHeader>
      <CardContent>
        {exercises.length === 0 ? (
          <p className="text-gray-500">No exercises logged yet.</p>
        ) : (
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <div 
                key={exercise.id}
                className="border rounded-lg p-4 flex justify-between items-start"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{exercise.type}</h3>
                    <Badge 
                      className={`${getIntensityColor(exercise.intensity)} text-white`}
                    >
                      Intensity {exercise.intensity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {exercise.duration} minutes • {formatDate(exercise.date)}
                  </p>
                  {exercise.notes && (
                    <p className="text-sm text-gray-500 mt-1">
                      {exercise.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  {onEdit && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(exercise)}
                    >
                      Edit
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(exercise.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Create Exercise Page

**File**: `src/app/exercises/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ExerciseForm } from '@/components/forms/ExerciseForm';
import { ExerciseList } from '@/components/ExerciseList';
import { ExerciseAPI } from '@/lib/api/exercises';
import { Exercise, ExerciseFormData } from '@/types/exercise';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExercisesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access exercises.</div>;
  }

  const handleSubmit = async (data: ExerciseFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingExercise) {
        await ExerciseAPI.update(editingExercise.id, data);
      } else {
        await ExerciseAPI.create(data);
      }
      
      // Reset form and refresh list
      setShowForm(false);
      setEditingExercise(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExercise(null);
    setError(null);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Exercise Tracking</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            Log New Exercise
          </Button>
        )}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <ExerciseForm
          initialValues={editingExercise ? {
            type: editingExercise.type,
            duration: editingExercise.duration,
            intensity: editingExercise.intensity,
            date: new Date(editingExercise.date).toISOString().split('T')[0],
            notes: editingExercise.notes || ''
          } : undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          isUpdate={!!editingExercise}
        />
      )}

      <ExerciseList
        onEdit={handleEdit}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
```

### Step 5: Integration with Navigation

#### Update Layout Navigation

```typescript
// Add to src/components/layout/Header.tsx or navigation component

const navigationItems = [
  // ... existing items
  {
    name: 'Exercises',
    href: '/exercises',
    icon: DumbbellIcon, // Import appropriate icon
  },
];
```

### Step 6: Testing Checklist

#### Manual Testing Procedures

**Backend Testing**:
1. **Authentication Testing**
   - Test all endpoints without authentication (should return 401)
   - Test with valid session (should work)
   - Test with expired session (should return 401)

2. **CRUD Operations Testing**
   - Create exercise with valid data
   - Create exercise with invalid data (missing fields, invalid intensity)
   - Create duplicate exercise (should fail)
   - Read exercises (all, filtered by date, type)
   - Update existing exercise
   - Update non-existent exercise (should return 404)
   - Update another user's exercise (should return 403)
   - Delete existing exercise
   - Delete non-existent exercise (should return 404)

3. **Data Validation Testing**
   - Test intensity boundaries (0, 11 should fail; 1-10 should pass)
   - Test duration boundaries (negative, zero should fail)
   - Test date formats (invalid dates should fail)

**Frontend Testing**:
1. **Form Testing**
   - Submit with all required fields
   - Submit with missing required fields (should show validation)
   - Test slider interactions
   - Test date picker
   - Test select dropdowns

2. **List Testing**
   - Load exercises list
   - Edit exercise from list
   - Delete exercise from list
   - Test empty state (no exercises)
   - Test error state (API failures)

3. **Integration Testing**
   - Create exercise and verify it appears in list
   - Edit exercise and verify changes appear
   - Delete exercise and verify it's removed
   - Test navigation between form and list

#### API Testing with curl

```bash
# Get user's exercises
curl -X GET "http://localhost:3000/api/exercises" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Create new exercise
curl -X POST "http://localhost:3000/api/exercises" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "type": "Running",
    "duration": 30,
    "intensity": 7,
    "date": "2025-01-15",
    "notes": "Morning jog in the park"
  }'

# Update exercise
curl -X PUT "http://localhost:3000/api/exercises/1" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "duration": 45,
    "intensity": 8
  }'

# Delete exercise
curl -X DELETE "http://localhost:3000/api/exercises/1" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## Established Development Patterns

### Authentication Integration

All new features must integrate with the established 3-layer authentication system:

```typescript
// Standard API authentication pattern
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;
  // Feature logic here
}
```

### Database Patterns

#### Prisma Schema Conventions
```prisma
model NewFeature {
  id        Int      @id @default(autoincrement())
  userId    Int      // Always include user relationship
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Feature-specific fields
  name      String
  data      Json?    // Use JSON for flexible data structures
  
  // Relationships
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Indexes for performance
  @@index([userId, createdAt])
  @@unique([userId, name]) // Prevent duplicates where appropriate
}
```

#### Migration Best Practices
```bash
# Descriptive migration names
npx prisma migrate dev --name add_feature_name_tracking

# Always backup before major schema changes
npx prisma db push --preview-feature

# Test migrations in development first
npx prisma studio
```

### API Route Patterns

#### Standard CRUD Implementation
```typescript
// /api/resource/route.ts - Collection endpoints
export async function POST(request: NextRequest) {
  // Create resource
}

export async function GET(request: NextRequest) {
  // List resources with optional filtering
}

// /api/resource/[id]/route.ts - Individual resource endpoints
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Get single resource
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // Update resource
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Delete resource
}
```

#### Error Handling Standards
```typescript
// Consistent error response format
interface ApiError {
  error: string;
  code?: string;
  details?: any;
}

// Standard error responses
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
```

### Frontend Component Patterns

#### Form Component Structure
```typescript
interface FormProps {
  initialValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  isUpdate?: boolean;
}

export function FeatureForm({ initialValues, onSubmit, onCancel, isSubmitting, isUpdate }: FormProps) {
  // State management
  const [formData, setFormData] = useState(initialValues || defaultValues);
  
  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  // Render form with consistent styling
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isUpdate ? 'Update' : 'Create'} Feature</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields */}
          <div className="flex justify-between mt-6">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isUpdate ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### List Component Structure
```typescript
interface ListProps {
  onEdit?: (item: Item) => void;
  refreshTrigger?: number;
  filters?: FilterOptions;
}

export function FeatureList({ onEdit, refreshTrigger, filters }: ListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data fetching
  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await FeatureAPI.getAll(filters);
      setItems(data.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchItems();
  }, [refreshTrigger, filters]);
  
  // Render states
  if (loading) return <div>Loading...</div>;
  if (error) return <ErrorDisplay error={error} onRetry={fetchItems} />;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Items</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <ItemGrid items={items} onEdit={onEdit} />
        )}
      </CardContent>
    </Card>
  );
}
```

### State Management Patterns

#### API Client Pattern
```typescript
export class FeatureAPI {
  private static readonly BASE_URL = '/api/features';
  
  static async create(data: CreateData): Promise<Feature> {
    const response = await fetch(this.BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(await this.extractError(response));
    }
    
    return response.json();
  }
  
  static async getAll(filters?: FilterOptions): Promise<{ features: Feature[] }> {
    const url = filters ? `${this.BASE_URL}?${new URLSearchParams(filters)}` : this.BASE_URL;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(await this.extractError(response));
    }
    
    return response.json();
  }
  
  private static async extractError(response: Response): Promise<string> {
    try {
      const error = await response.json();
      return error.error || 'Request failed';
    } catch {
      return 'Request failed';
    }
  }
}
```

#### React Hook Pattern for Features
```typescript
export const useFeature = (featureId?: number) => {
  const [feature, setFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchFeature = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const data = await FeatureAPI.get(id);
      setFeature(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feature');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const updateFeature = useCallback(async (id: number, updates: Partial<Feature>) => {
    try {
      setLoading(true);
      const updated = await FeatureAPI.update(id, updates);
      setFeature(updated);
      setError(null);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feature');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (featureId) {
      fetchFeature(featureId);
    }
  }, [featureId, fetchFeature]);
  
  return {
    feature,
    loading,
    error,
    updateFeature,
    refetch: () => featureId && fetchFeature(featureId),
  };
};
```

## Integration Guidelines

### Theme Integration

New components automatically inherit the Brain Log App theme system:

```typescript
// Components support dark/light mode automatically
import { useTheme } from 'next-themes';

export function FeatureComponent() {
  const { theme } = useTheme();
  
  return (
    <div className="bg-background text-foreground">
      {/* Content automatically adapts to theme */}
    </div>
  );
}
```

### Navigation Integration

Add new features to the main navigation:

```typescript
// In src/components/layout/Header.tsx or navigation component
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Daily Log', href: '/daily-log', icon: CalendarIcon },
  { name: 'Weekly Insights', href: '/weekly-insights', icon: ChartIcon },
  { name: 'New Feature', href: '/new-feature', icon: FeatureIcon }, // Add here
];
```

### Page Layout Integration

Follow the established layout pattern:

```typescript
export default function FeaturePage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feature Name</h1>
        <Button>Primary Action</Button>
      </div>
      
      {/* Feature content */}
      <FeatureContent />
    </div>
  );
}
```

## Performance Considerations

### Database Optimization

#### Query Optimization
```typescript
// Use appropriate includes for relationships
const data = await prisma.feature.findMany({
  where: { userId },
  include: {
    user: {
      select: { id: true, displayName: true } // Only select needed fields
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 20 // Limit results for pagination
});
```

#### Index Strategy
```prisma
// Add indexes for common query patterns
model Feature {
  // ... fields
  
  @@index([userId, createdAt]) // For user-specific queries by date
  @@index([userId, status])    // For filtering by status
  @@unique([userId, name])     // Prevent duplicates
}
```

### Frontend Optimization

#### Code Splitting
```typescript
// Use dynamic imports for large components
const HeavyFeatureComponent = dynamic(() => import('@/components/HeavyFeatureComponent'), {
  loading: () => <ComponentSkeleton />,
  ssr: false // If component is client-only
});
```

#### Memoization
```typescript
// Memoize expensive calculations
const processedData = useMemo(() => {
  return features.map(feature => ({
    ...feature,
    computed: expensiveCalculation(feature.data)
  }));
}, [features]);

// Memoize event handlers
const handleFeatureUpdate = useCallback((id: number, data: UpdateData) => {
  return updateFeature(id, data);
}, [updateFeature]);
```

## Documentation Requirements

When adding new features, update the following documentation:

### 1. API Documentation
- Add endpoint documentation to `docs/03-api-reference/`
- Include request/response examples
- Document error conditions

### 2. Component Documentation
- Add component usage to `docs/04-frontend/01-components.md`
- Include props interfaces and examples

### 3. Database Documentation
- Update `docs/02-architecture/04-database.md` with new models
- Document relationships and constraints

### 4. User Documentation
- Update `docs/01-getting-started/01-introduction.md` with new features
- Add feature-specific user guides if needed

## Common Patterns and Utilities

### Date Handling
```typescript
// Use established date utilities
import { formatDate, parseDate, isToday } from '@/lib/utils/date';

// Handle timezone-aware dates
const userDate = formatDate(new Date(), user.timezone);
```

### Form Validation
```typescript
// Client-side validation patterns
const validateFeatureData = (data: FeatureFormData): string[] => {
  const errors: string[] = [];
  
  if (!data.name?.trim()) {
    errors.push('Name is required');
  }
  
  if (data.value < 0 || data.value > 10) {
    errors.push('Value must be between 0 and 10');
  }
  
  return errors;
};
```

### Error Boundaries
```typescript
// Use error boundaries for robust error handling
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function FeaturePage() {
  return (
    <ErrorBoundary fallback={<FeatureErrorFallback />}>
      <FeatureContent />
    </ErrorBoundary>
  );
}
```

## Security Considerations

### Input Sanitization
```typescript
// Sanitize user inputs
import { sanitizeInput, validateEmail } from '@/lib/utils/validation';

const cleanData = {
  name: sanitizeInput(data.name),
  email: validateEmail(data.email) ? data.email : '',
};
```

### Authorization Checks
```typescript
// Always verify user ownership
const feature = await prisma.feature.findUnique({
  where: { id: featureId }
});

if (!feature || feature.userId !== session.user.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

### Rate Limiting
```typescript
// Consider rate limiting for resource-intensive operations
import { rateLimit } from '@/lib/utils/rateLimit';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  
  // Rate limit: 10 requests per minute per user
  const isAllowed = await rateLimit(session.user.id, 10, 60);
  if (!isAllowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  
  // Process request
}
```

## Deployment Checklist

Before deploying new features:

### 1. Code Quality
- [ ] Code follows established patterns
- [ ] TypeScript types are properly defined
- [ ] No console.log statements in production code
- [ ] Error handling is comprehensive

### 2. Testing
- [ ] Manual testing completed
- [ ] API endpoints tested with various inputs
- [ ] UI components tested in different states
- [ ] Authentication and authorization verified

### 3. Database
- [ ] Migrations tested and working
- [ ] Indexes added for performance
- [ ] Data integrity constraints in place
- [ ] Backup plan for schema changes

### 4. Documentation
- [ ] API documentation updated
- [ ] Component documentation added
- [ ] User guides updated if needed
- [ ] Changelog updated

### 5. Performance
- [ ] Database queries optimized
- [ ] Frontend code split appropriately
- [ ] Large assets optimized
- [ ] No memory leaks identified

## Rollback Procedures

### Database Rollback
```bash
# If migration needs to be rolled back
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# Generate new migration to undo changes
npx prisma migrate dev --name rollback_feature_name
```

### Code Rollback
```bash
# Revert to previous commit
git revert HEAD

# Or reset to specific commit
git reset --hard COMMIT_HASH

# Deploy previous version
vercel --prod
```

## Related Documents
- [Development Workflow](../01-getting-started/04-development-workflow.md) - Git workflow and coding standards
- [Authentication Flow](./01-authentication-flow.md) - Authentication integration
- [API Reference](../03-api-reference/) - API documentation standards
- [Frontend Components](../04-frontend/01-components.md) - Component patterns
- [Database Architecture](../02-architecture/04-database.md) - Database design patterns

## Changelog
- 2025-07-06: Initial feature development guide created
- 2025-07-06: Complete example implementation with exercise tracking
- 2025-07-06: Performance considerations and security guidelines added
- 2025-07-06: Deployment and rollback procedures documented

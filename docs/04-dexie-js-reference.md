# Dexie.js Reference Guide

This guide provides a reference for key Dexie.js concepts and patterns that we'll use in the Brain Log App.

## Introduction to Dexie.js

Dexie.js is a minimalistic wrapper for IndexedDB, which is a low-level browser API for client-side storage of significant amounts of structured data. Dexie.js makes IndexedDB much easier to use with a clean and simple API.

### Key Features

- **Promise-based API**: All asynchronous operations return Promises.
- **Schema definition**: Define database schema in a simple and declarative way.
- **Type safety**: TypeScript support with strong typing.
- **Powerful querying**: Rich querying capabilities with methods like `where()`, `filter()`, etc.
- **Hooks and middleware**: Intercept database operations with hooks.
- **Observable**: Subscribe to database changes.

## Installation

```bash
# Using npm
npm install dexie
# Using yarn
yarn add dexie
# Using pnpm
pnpm add dexie
```

For React integration:

```bash
# Using npm
npm install dexie dexie-react-hooks
# Using yarn
yarn add dexie dexie-react-hooks
# Using pnpm
pnpm add dexie dexie-react-hooks
```

## Database Initialization

### Basic Database Setup

```typescript
import Dexie from 'dexie';

// Define your database
class MyDatabase extends Dexie {
  // Declare tables with their types
  friends!: Dexie.Table<Friend, number>;
  notes!: Dexie.Table<Note, number>;

  constructor() {
    super('MyDatabase');
    
    // Define tables and indexes
    this.version(1).stores({
      friends: '++id, name, age', // Primary key and indexed props
      notes: '++id, title, date, *tags' // * means multi-entry index
    });
  }
}

// Define types for your data
interface Friend {
  id?: number; // Optional because it's auto-incremented
  name: string;
  age: number;
  hobbies?: string[];
}

interface Note {
  id?: number;
  title: string;
  content: string;
  date: Date;
  tags: string[];
}

// Create and export a database instance
export const db = new MyDatabase();
```

### Schema Versioning

When you need to update your database schema, you can define a new version:

```typescript
class MyDatabase extends Dexie {
  friends!: Dexie.Table<Friend, number>;
  notes!: Dexie.Table<Note, number>;
  pets!: Dexie.Table<Pet, number>; // New table in version 2

  constructor() {
    super('MyDatabase');
    
    // Original schema
    this.version(1).stores({
      friends: '++id, name, age',
      notes: '++id, title, date, *tags'
    });
    
    // Updated schema in version 2
    this.version(2).stores({
      friends: '++id, name, age, email', // Added email index
      notes: '++id, title, date, *tags',
      pets: '++id, name, species' // New table
    });
  }
}
```

### Schema Upgrade Functions

You can perform data migrations during schema upgrades:

```typescript
class MyDatabase extends Dexie {
  friends!: Dexie.Table<Friend, number>;

  constructor() {
    super('MyDatabase');
    
    this.version(1).stores({
      friends: '++id, name, age'
    });
    
    this.version(2)
      .stores({
        friends: '++id, name, age, email' // Added email index
      })
      .upgrade(tx => {
        // Upgrade function to migrate data
        return tx.table('friends').toCollection().modify(friend => {
          friend.email = `${friend.name.toLowerCase().replace(' ', '.')}@example.com`;
        });
      });
  }
}
```

## CRUD Operations

### Create (Add)

```typescript
// Add a single item
async function addFriend(friend: Friend): Promise<number> {
  return await db.friends.add(friend);
}

// Add multiple items
async function addFriends(friends: Friend[]): Promise<number[]> {
  return await db.friends.bulkAdd(friends);
}

// Add with explicit primary key
async function addFriendWithId(friend: Friend, id: number): Promise<number> {
  return await db.friends.add(friend, id);
}
```

### Read (Get)

```typescript
// Get by primary key
async function getFriend(id: number): Promise<Friend | undefined> {
  return await db.friends.get(id);
}

// Get multiple items by primary keys
async function getFriends(ids: number[]): Promise<Friend[]> {
  return await db.friends.bulkGet(ids);
}

// Get all items
async function getAllFriends(): Promise<Friend[]> {
  return await db.friends.toArray();
}

// Get first item
async function getFirstFriend(): Promise<Friend | undefined> {
  return await db.friends.first();
}
```

### Update (Put)

```typescript
// Update or add a single item
async function updateFriend(friend: Friend): Promise<number> {
  return await db.friends.put(friend);
}

// Update or add multiple items
async function updateFriends(friends: Friend[]): Promise<number[]> {
  return await db.friends.bulkPut(friends);
}

// Update specific properties
async function updateFriendAge(id: number, age: number): Promise<number> {
  return await db.friends.update(id, { age });
}

// Update with conditions
async function incrementAgeOfAdults(): Promise<number> {
  return await db.friends
    .where('age')
    .above(17)
    .modify(friend => {
      friend.age += 1;
    });
}
```

### Delete

```typescript
// Delete by primary key
async function deleteFriend(id: number): Promise<void> {
  return await db.friends.delete(id);
}

// Delete multiple items by primary keys
async function deleteFriends(ids: number[]): Promise<void> {
  return await db.friends.bulkDelete(ids);
}

// Delete all items
async function deleteAllFriends(): Promise<void> {
  return await db.friends.clear();
}

// Delete with conditions
async function deleteOldFriends(): Promise<number> {
  return await db.friends
    .where('age')
    .above(90)
    .delete();
}
```

## Querying Data

### Basic Queries

```typescript
// Get all friends
const allFriends = await db.friends.toArray();

// Get all friends sorted by name
const sortedFriends = await db.friends
  .orderBy('name')
  .toArray();

// Get friends with age > 30
const olderFriends = await db.friends
  .where('age')
  .above(30)
  .toArray();

// Get friends with specific name
const friendsNamedJohn = await db.friends
  .where('name')
  .equals('John')
  .toArray();

// Get friends with age between 20 and 30
const youngAdults = await db.friends
  .where('age')
  .between(20, 30)
  .toArray();
```

### Advanced Queries

```typescript
// Compound queries
const youngJohns = await db.friends
  .where('name')
  .equals('John')
  .and(friend => friend.age < 30)
  .toArray();

// OR queries
const johnsOrJanes = await db.friends
  .where('name')
  .anyOf('John', 'Jane')
  .toArray();

// Limit results
const firstFiveFriends = await db.friends
  .limit(5)
  .toArray();

// Offset results (pagination)
const friendsPage2 = await db.friends
  .offset(10)
  .limit(10)
  .toArray();

// Count results
const friendCount = await db.friends.count();
const youngFriendCount = await db.friends
  .where('age')
  .below(30)
  .count();
```

### Filtering

```typescript
// Filter with a function
const tallFriends = await db.friends
  .filter(friend => friend.height > 180)
  .toArray();

// Combining where and filter
const tallYoungFriends = await db.friends
  .where('age')
  .below(30)
  .filter(friend => friend.height > 180)
  .toArray();
```

### Sorting

```typescript
// Sort by a single property
const friendsByAge = await db.friends
  .orderBy('age')
  .toArray();

// Sort in descending order
const friendsByAgeDesc = await db.friends
  .orderBy('age')
  .reverse()
  .toArray();

// Sort by multiple properties (using sortBy)
const sortedFriends = await db.friends
  .toArray()
  .then(friends => 
    friends.sort((a, b) => {
      // First by name
      if (a.name !== b.name) return a.name < b.name ? -1 : 1;
      // Then by age
      return a.age - b.age;
    })
  );
```

### Unique Values

```typescript
// Get unique ages
const uniqueAges = await db.friends
  .orderBy('age')
  .uniqueKeys();

// Get unique names
const uniqueNames = await db.friends
  .orderBy('name')
  .uniqueKeys();
```

## Transactions

### Basic Transactions

```typescript
// Read-only transaction
async function getFriendWithNotes(friendId: number) {
  return await db.transaction('r', [db.friends, db.notes], async () => {
    const friend = await db.friends.get(friendId);
    if (!friend) return null;
    
    const notes = await db.notes
      .where('friendId')
      .equals(friendId)
      .toArray();
    
    return {
      ...friend,
      notes
    };
  });
}

// Read-write transaction
async function transferNote(noteId: number, fromFriendId: number, toFriendId: number) {
  return await db.transaction('rw', [db.notes], async () => {
    const note = await db.notes.get(noteId);
    if (!note || note.friendId !== fromFriendId) {
      throw new Error('Note not found or does not belong to source friend');
    }
    
    await db.notes.update(noteId, { friendId: toFriendId });
    return true;
  });
}
```

### Transaction Scopes

```typescript
// Transaction with multiple tables
async function createFriendWithNotes(friend: Friend, notes: Note[]) {
  return await db.transaction('rw', [db.friends, db.notes], async () => {
    const friendId = await db.friends.add(friend);
    
    // Add notes with reference to the new friend
    const notesWithFriendId = notes.map(note => ({
      ...note,
      friendId
    }));
    
    const noteIds = await db.notes.bulkAdd(notesWithFriendId);
    
    return {
      friendId,
      noteIds
    };
  });
}
```

## Relationships

### One-to-Many Relationships

```typescript
interface Friend {
  id?: number;
  name: string;
  age: number;
}

interface Note {
  id?: number;
  title: string;
  content: string;
  friendId: number; // Foreign key to Friend
}

// Get all notes for a friend
async function getFriendNotes(friendId: number): Promise<Note[]> {
  return await db.notes
    .where('friendId')
    .equals(friendId)
    .toArray();
}

// Get friend with all their notes
async function getFriendWithNotes(friendId: number) {
  return await db.transaction('r', [db.friends, db.notes], async () => {
    const friend = await db.friends.get(friendId);
    if (!friend) return null;
    
    const notes = await db.notes
      .where('friendId')
      .equals(friendId)
      .toArray();
    
    return {
      ...friend,
      notes
    };
  });
}
```

### Many-to-Many Relationships

```typescript
interface Student {
  id?: number;
  name: string;
}

interface Course {
  id?: number;
  title: string;
}

interface Enrollment {
  id?: number;
  studentId: number; // Foreign key to Student
  courseId: number;  // Foreign key to Course
  enrollmentDate: Date;
}

// Get all courses for a student
async function getStudentCourses(studentId: number) {
  return await db.transaction('r', [db.enrollments, db.courses], async () => {
    const enrollments = await db.enrollments
      .where('studentId')
      .equals(studentId)
      .toArray();
    
    const courseIds = enrollments.map(e => e.courseId);
    const courses = await db.courses.bulkGet(courseIds);
    
    return courses.filter(Boolean); // Filter out any undefined results
  });
}

// Get all students in a course
async function getCourseStudents(courseId: number) {
  return await db.transaction('r', [db.enrollments, db.students], async () => {
    const enrollments = await db.enrollments
      .where('courseId')
      .equals(courseId)
      .toArray();
    
    const studentIds = enrollments.map(e => e.studentId);
    const students = await db.students.bulkGet(studentIds);
    
    return students.filter(Boolean); // Filter out any undefined results
  });
}
```

## React Integration

### Using useLiveQuery Hook

```tsx
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';

function FriendList() {
  // This query will automatically re-run when the database changes
  const friends = useLiveQuery(
    () => db.friends.toArray()
  );
  
  // Optional second parameter for query arguments
  const age = 30;
  const youngFriends = useLiveQuery(
    () => db.friends.where('age').below(age).toArray(),
    [age] // Dependencies array, similar to useEffect
  );
  
  if (!friends) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Friends</h1>
      <ul>
        {friends.map(friend => (
          <li key={friend.id}>
            {friend.name} ({friend.age})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### CRUD Operations in React Components

```tsx
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { Friend } from './types';

function FriendManager() {
  const friends = useLiveQuery(() => db.friends.toArray());
  const [newFriend, setNewFriend] = useState<Partial<Friend>>({
    name: '',
    age: 0
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewFriend(prev => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : value
    }));
  };
  
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.friends.add(newFriend as Friend);
      setNewFriend({ name: '', age: 0 });
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };
  
  const handleDeleteFriend = async (id: number) => {
    try {
      await db.friends.delete(id);
    } catch (error) {
      console.error('Failed to delete friend:', error);
    }
  };
  
  if (!friends) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Friend Manager</h1>
      
      <form onSubmit={handleAddFriend}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newFriend.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="age">Age:</label>
          <input
            type="number"
            id="age"
            name="age"
            value={newFriend.age}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <button type="submit">Add Friend</button>
      </form>
      
      <h2>Friends List</h2>
      <ul>
        {friends.map(friend => (
          <li key={friend.id}>
            {friend.name} ({friend.age})
            <button onClick={() => handleDeleteFriend(friend.id!)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Import/Export Functionality

### Installing the Export/Import Add-on

```bash
# Using npm
npm install dexie-export-import
# Using yarn
yarn add dexie-export-import
# Using pnpm
pnpm add dexie-export-import
```

### Exporting Database

```typescript
import { exportDB } from 'dexie-export-import';
import { db } from './db';

async function exportDatabase() {
  try {
    // Export the database to a blob
    const blob = await exportDB(db);
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database-backup.json';
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export database:', error);
  }
}
```

### Importing Database

```typescript
import { importDB } from 'dexie-export-import';
import { db } from './db';

async function importDatabase(file: File) {
  try {
    // Import the database from a blob
    await importDB(file);
    
    // Refresh the page to use the new database
    window.location.reload();
  } catch (error) {
    console.error('Failed to import database:', error);
  }
}

// Usage in a file input component
function DatabaseImport() {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importDatabase(file);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
      />
    </div>
  );
}
```

### Partial Export/Import

```typescript
import { exportTable, importTable } from 'dexie-export-import';
import { db } from './db';

// Export a single table
async function exportFriendsTable() {
  try {
    const blob = await exportTable(db.friends);
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'friends-backup.json';
    a.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export friends table:', error);
  }
}

// Import a single table
async function importFriendsTable(file: File) {
  try {
    await importTable(file, {
      overwriteValues: true, // Replace existing values
      clearTable: true       // Clear the table before import
    });
  } catch (error) {
    console.error('Failed to import friends table:', error);
  }
}
```

## Advanced Features

### Hooks

```typescript
import Dexie from 'dexie';

class MyDatabase extends Dexie {
  friends!: Dexie.Table<Friend, number>;

  constructor() {
    super('MyDatabase');
    
    this.version(1).stores({
      friends: '++id, name, age'
    });
    
    // Hook that runs before creating a friend
    this.friends.hook('creating', (primKey, obj, transaction) => {
      // Modify the object before it's added to the database
      obj.createdAt = new Date();
      
      // You can also validate data
      if (obj.age < 0) {
        throw new Error('Age cannot be negative');
      }
      
      // Return undefined or nothing to proceed with the operation
    });
    
    // Hook that runs after updating a friend
    this.friends.hook('updating', (modifications, primKey, obj, transaction) => {
      // Add updatedAt to the modifications
      modifications.updatedAt = new Date();
      
      // Return undefined or nothing to proceed with the operation
    });
    
    // Hook that runs before deleting a friend
    this.friends.hook('deleting', (primKey, obj, transaction) => {
      // You can prevent deletion based on some condition
      if (obj.isAdmin) {
        throw new Error('Cannot delete admin users');
      }
      
      // Return undefined or nothing to proceed with the operation
    });
  }
}
```

### Middleware

```typescript
import Dexie from 'dexie';

// Create a middleware function
function loggingMiddleware(db: Dexie) {
  // Add hooks to all tables
  db.tables.forEach(table => {
    table.hook('creating', (primKey, obj) => {
      console.log(`Creating in ${table.name}:`, obj);
    });
    
    table.hook('updating', (modifications, primKey, obj) => {
      console.log(`Updating in ${table.name}:`, { primKey, modifications });
    });
    
    table.hook('deleting', (primKey, obj) => {
      console.log(`Deleting from ${table.name}:`, obj);
    });
  });
}

// Apply the middleware to your database
class MyDatabase extends Dexie {
  friends!: Dexie.Table<Friend, number>;

  constructor() {
    super('MyDatabase');
    
    this.version(1).stores({
      friends: '++id, name, age'
    });
    
    // Apply middleware
    loggingMiddleware(this);
  }
}
```

### Observable

```typescript
import Dexie from 'dexie';
import 'dexie-observable';

// First, install the add-on:
// npm install dexie-observable

// Then import it and use it
class MyDatabase extends Dexie {
  friends!: Dexie.Table<Friend, number>;

  constructor() {
    super('MyDatabase');
    
    this.version(1).stores({
      friends: '++id, name, age'
    });
  }
}

const db = new MyDatabase();

// Subscribe to all database changes
db.on('changes', changes => {
  changes.forEach(change => {
    switch (change.type) {
      case 1: // CREATED
        console.log('Object created:', change.obj);
        break;
      case 2: // UPDATED
        console.log('Object updated:', {
          key: change.key,
          modifications: change.mods
        });
        break;
      case 3: // DELETED
        console.log('Object deleted:', change.oldObj);
        break;
    }
  });
});
```

### Syncable

```typescript
import Dexie from 'dexie';
import 'dexie-observable';
import 'dexie-syncable';

// First, install the add-ons:
// npm install dexie-observable dexie-syncable

// Then import them and use them
class MyDatabase extends Dexie {
  friends!: Dexie.Table<Friend, number>;

  constructor() {
    super('MyDatabase');
    
    this.version(1).stores({
      friends: '++id, name, age'
    });
  }
}

const db = new MyDatabase();

// Connect to a sync server
db.syncable.connect('websocket', 'wss://sync.example.com');

// Listen for sync status changes
db.syncable.on('statusChanged', (newStatus, url) => {
  console.log(`Sync status for ${url}: ${newStatus}`);
});
```

## Performance Optimization

### Indexing

```typescript
// Good indexing practices
class MyDatabase extends Dexie {
  friends!: Dexie.Table<Friend, number>;
  notes!: Dexie.Table<Note, number>;

  constructor() {
    super('MyDatabase');
    
    this.version(1).stores({
      // Index fields that you frequently query on
      friends: '++id, name, age, email',
      
      // Multi-entry index for array fields
      notes: '++id, title, date, *tags'
    });
  }
}

// Using indexes efficiently
async function findFriendsByTag(tag: string) {
  // This is efficient because tags is indexed
  return await db.notes
    .where('tags')
    .equals(tag)
    .toArray();
}

// Avoid non-indexed queries in production
async function inefficientQuery() {
  // This is inefficient because it can't use an index
  return await db.friends
    .filter(friend => friend.name.startsWith('A'))
    .toArray();
}
```

### Bulk Operations

```typescript
// Use bulkAdd instead of multiple add operations
async function addManyFriends(friends: Friend[]) {
  // Efficient: One transaction for all items
  return await db.friends.bulkAdd(friends);
  
  // Inefficient: Separate transaction for each item
  // for (const friend of friends) {
  //   await db.friends.add(friend);
  // }
}

// Use bulkPut instead of multiple put operations
async function updateManyFriends(friends: Friend[]) {
  return await db.friends.bulkPut(friends);
}

// Use bulkDelete instead of multiple delete operations
async function deleteManyFriends(ids: number[]) {
  return await db.friends.bulkDelete(ids);
}
```

### Compound Queries

```typescript
// Efficient compound query using an index
async function findFriendsByNameAndAge(name: string, age: number) {
  // If you have a compound index: 'name+age'
  return await db.friends
    .where('[name+age]')
    .equals([name, age])
    .toArray();
}

// Alternative approach using multiple filters
async function findFriendsByNameAndAgeAlternative(name: string, age: number) {
  return await db.friends
    .where('name')
    .equals(name)
    .and(friend => friend.age === age)
    .toArray();
}
```

## Error Handling

```typescript
async function safeOperation() {
  try {
    const result = await db.friends.add({
      name: 'John',
      age: 30
    });
    
    console.log('Friend added with ID:', result);
    return result;
  } catch (error) {
    console.error('Failed to add friend:', error);
    
    // Handle specific errors
    if (error instanceof Dexie.ConstraintError) {
      // Handle constraint violation (e.g., unique constraint)
      alert('A friend with this name already exists');
    } else if (error instanceof Dexie.QuotaExceededError) {
      // Handle storage quota exceeded
      alert('Your device is out of storage space');
    } else {
      // Handle other errors
      alert('An error occurred while adding the friend');
    }
    
    throw error; // Re-throw or handle as needed
  }
}
```

## Working with Complex Data

### Storing Binary Data

```typescript
interface User {
  id?: number;
  name: string;
  photo?: Blob;
}

// Store a photo
async function saveUserWithPhoto(name: string, photoFile: File) {
  return await db.users.add({
    name,
    photo: photoFile // IndexedDB can store Blob objects directly
  });
}

// Retrieve and display a photo
async function displayUserPhoto(userId: number) {
  const user = await db.users.get(userId);
  if (user?.photo) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(user.photo);
    document.body.appendChild(img);
    
    // Clean up the object URL when done
    img.onload = () => URL.revokeObjectURL(img.src);
  }
}
```

### Storing Dates

```typescript
interface Event {
  id?: number;
  title: string;
  date: Date;
}

// Store a date
async function addEvent(title: string, date: Date) {
  return await db.events.add({
    title,
    date // IndexedDB can store Date objects directly
  });
}

// Query by date range
async function getEventsInRange(startDate: Date, endDate: Date) {
  return await db.events
    .where('date')
    .between(startDate, endDate)
    .toArray();
}
```

### Storing Complex Objects

```typescript
interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface Contact {
  id?: number;
  name: string;
  address: Address;
  phones: string[];
}

// Store a complex object
async function addContact(contact: Contact) {
  return await db.contacts.add(contact);
}

// Query based on nested properties
async function findContactsByCity(city: string) {
  return await db.contacts
    .filter(contact => contact.address.city === city)
    .toArray();
}

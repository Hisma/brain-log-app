# TypeScript Error Cleanup - Phase 4

## Objective
Fix all remaining TypeScript errors caused by the service function signature changes made in Phase 3. The ESLint cleanup successfully removed unused `userId` parameters from service functions, but now we need to update all calling code to match the new signatures.

## Current Status
- ✅ ESLint: 0 warnings/errors (Phase 3 complete)
- ❌ TypeScript: 25 errors across 5 files

## TypeScript Errors to Fix

### 1. **src/app/daily-log/page.tsx** (18 errors)

**Function Signature Changes Needed:**
- `getDailyLogById(id)` - Remove `userId` parameter (2 calls)
- `getAllDailyLogs()` - Remove `userId` parameter (7 calls)  
- `updateMorningCheckIn(userId, id, data)` - Remove 4th `isUpdate` parameter (1 call)
- `updateAfternoonCheckIn(userId, id, data)` - Remove 4th `isUpdate` parameter (1 call)
- `updateEveningReflection(userId, id, data)` - Remove 4th `isUpdate` parameter (1 call)

**Form Type Mismatches:**
- `ConcertaDoseLogForm.onSubmit` - Fix type mismatch (1 error)
- `MidDayCheckInForm.onSubmit` - Fix type mismatch (1 error)
- `AfternoonCheckInForm.onSubmit` - Fix type mismatch (1 error)
- `EveningReflectionForm.onSubmit` - Fix type mismatch (1 error)

**Specific Errors:**
```typescript
// Line 168: Expected 1 arguments, but got 2
const log = await dailyLogService.getDailyLogById(user.id, dailyLogId);
// Fix: Remove user.id parameter

// Line 192: Expected 3 arguments, but got 4  
await dailyLogService.updateMorningCheckIn(user.id, dailyLogId, data, true);
// Fix: Remove the 4th parameter (true)

// Line 200: Expected 0 arguments, but got 1
const logs = await dailyLogService.getAllDailyLogs(user.id);
// Fix: Remove user.id parameter
```

### 2. **src/app/weekly-reflection/page.tsx** (1 error)

**Form Type Mismatch:**
```typescript
// Line 156: Type mismatch in WeeklyReflectionForm.onSubmit
onSubmit={handleSubmit}
// Issue: Form expects Record<string, unknown> but gets typed WeeklyReflection data
```

### 3. **src/app/weekly-insights/page.tsx** (1 error)

**Component Prop Mismatch:**
```typescript
// Line 222: Property 'weeklyReflectionId' does not exist
weeklyReflectionId={parseInt(selectedReflectionId)}
// Fix: Update WeeklyInsightCardProps interface or remove prop
```

### 4. **src/components/DailyLogOverview.tsx** (2 errors)

**Function Signature Changes:**
```typescript
// Line 32 & 68: Expected 1 arguments, but got 2
log = await getDailyLogById(userId, dailyLogId);
// Fix: Remove userId parameter
```

## Implementation Strategy

### Phase 4A: Service Function Calls
1. **Update all `getDailyLogById` calls** - Remove `userId` parameter
2. **Update all `getAllDailyLogs` calls** - Remove `userId` parameter  
3. **Update all service update calls** - Remove extra `isUpdate` parameters

### Phase 4B: Form Component Types
1. **Fix form component interfaces** - Update `onSubmit` type definitions
2. **Update component prop interfaces** - Fix WeeklyInsightCard props
3. **Ensure type consistency** - Match form data types with service expectations

### Phase 4C: Validation
1. **Run TypeScript check** - Ensure 0 errors
2. **Test functionality** - Verify no regressions
3. **Final ESLint check** - Maintain 0 warnings

## Files to Modify

### High Priority (Most Errors)
1. `src/app/daily-log/page.tsx` - 18 errors
2. `src/components/DailyLogOverview.tsx` - 2 errors

### Medium Priority (Type Fixes)
3. `src/app/weekly-reflection/page.tsx` - 1 error
4. `src/app/weekly-insights/page.tsx` - 1 error

### Component Interface Updates
5. `src/components/forms/WeeklyReflectionForm.tsx` - Update onSubmit type
6. `src/components/forms/ConcertaDoseLogForm.tsx` - Update onSubmit type
7. `src/components/forms/MidDayCheckInForm.tsx` - Update onSubmit type
8. `src/components/forms/AfternoonCheckInForm.tsx` - Update onSubmit type
9. `src/components/forms/EveningReflectionForm.tsx` - Update onSubmit type
10. `src/components/ui/weekly-insight-card.tsx` - Update props interface

## Expected Outcome
- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 warnings (maintained)
- ✅ All functionality preserved
- ✅ Cleaner, more consistent codebase

## Success Criteria
1. `npx tsc --noEmit` returns no errors
2. `npx eslint src/ --ext .ts,.tsx` returns no warnings
3. All forms and components function correctly
4. No runtime errors introduced

## Notes
- This is a **breaking change cleanup** - fixing calling code to match new service signatures
- **No new functionality** - purely fixing type mismatches
- **Maintain backward compatibility** where possible
- **Test thoroughly** after each file fix to catch any regressions early

## Implementation Order
1. Start with `src/app/daily-log/page.tsx` (highest error count)
2. Fix `src/components/DailyLogOverview.tsx` 
3. Update form component interfaces
4. Fix remaining component prop mismatches
5. Run final validation checks

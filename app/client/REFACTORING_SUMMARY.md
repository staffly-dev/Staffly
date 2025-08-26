# StafflyHR React Query Refactoring Summary

## Overview

This document summarizes the refactoring changes made to replace multiple React contexts with dedicated React Query hooks for better data fetching, caching, and performance.

## Changes Made

### 1. Updated QueryProvider Configuration

- **File**: `app/client/src/providers/QueryProvider.tsx`
- **Changes**: Added new default options:
  - `refetchOnWindowFocus: false`
  - `refetchOnMount: false`
  - `refetchOnReconnect: false`
  - `cacheTime: 30 * 60 * 1000` (30 minutes)

### 2. Created New React Query Hooks

#### `useEmployees.ts`

- **Purpose**: Employee data management
- **Hooks**: `useEmployees`, `useEmployee`, `useAddEmployee`, `useUpdateEmployee`, `useDeleteEmployee`
- **Query Keys**: `["employees"]`, `["employees", "list"]`, `["employees", "detail", id]`
- **Endpoints**: `/hrms/employees/*`

#### `useAttendance.ts`

- **Purpose**: Attendance and dashboard data
- **Hooks**: `useAttendance`, `useAttendanceById`, `useAttendanceSearch`, `useCheckIn`, `useDashboard`, `useSettings`, `useUpdateSettings`
- **Query Keys**: `["attendance"]`, `["attendance", "dashboard"]`, `["attendance", "settings", userId]`
- **Endpoints**: `/hrms/attendance/*`, `/hrms/dashboard`

#### `usePayroll.ts`

- **Purpose**: Payroll data management
- **Hooks**: `usePayrolls`, `usePayrollSearch`, `useCreatePayroll`, `useUpdatePayroll`, `useDeletePayroll`
- **Query Keys**: `["payroll"]`, `["payroll", "list"]`
- **Endpoints**: `/hrms/payroll/*`

#### `useJobs.ts`

- **Purpose**: Job and candidate management
- **Hooks**: `useJobs`, `useJob`, `useCreateJob`, `useApplyForJob`, `useCandidates`, `useAdminStatistics`, `useDeleteJob`, `useDeleteApplication`
- **Query Keys**: `["jobs"]`, `["jobs", "candidates"]`, `["jobs", "statistics"]`
- **Endpoints**: `/ats-checker/*`

### 3. Removed Context Providers

- **File**: `app/client/src/app/layout.tsx`
- **Removed**: `EmployeeProvider`, `JobProvider`, `AttendanceProvider`, `PayRollProvider`
- **Reason**: No longer needed with React Query hooks

### 4. Updated Components

The following components were updated to use the new hooks:

#### Core Components

- `BreadCrumb.tsx` - Now uses `useEmployee` hook
- `StatusCards.tsx` - Now uses `useDashboard` hook

#### Page Components

- `jobs/page.tsx` - Now uses `useJobs` hook
- `payroll/page.tsx` - Now uses `usePayrolls` and `useDeletePayroll` hooks
- `attendance/page.tsx` - Now uses `useAttendance` hook
- `all-employees/page.tsx` - Now uses `useEmployees` hook
- `candidates/page.tsx` - Now uses `useJobs`, `useCandidates`, `useDeleteApplication` hooks

## Benefits of the Refactoring

### 1. **Better Caching**

- 5-minute stale time prevents unnecessary refetches
- 30-minute cache time keeps data in memory longer
- Automatic cache invalidation on mutations

### 2. **Improved Performance**

- No more multiple API calls on component mount
- Shared data across components
- Background refetching when data becomes stale

### 3. **Better User Experience**

- No loading states on navigation
- Consistent data across the application
- Optimistic updates for mutations

### 4. **Reduced Bundle Size**

- Removed context providers and their state management
- Cleaner component code without useEffect calls
- Better tree-shaking opportunities

### 5. **Automatic Background Updates**

- Data stays fresh without user intervention
- Smart refetching based on window focus and network status
- Optimized for mobile and desktop usage

## Query Key Strategy

Each hook uses a structured query key system:

- **List queries**: `["entity", "list"]`
- **Detail queries**: `["entity", "detail", id]`
- **Search queries**: `["entity", "list", filters]`
- **Related data**: `["entity", "related", "type"]`

This allows for:

- Precise cache invalidation
- Shared data between related queries
- Efficient cache management

## Migration Notes

### For Developers

1. **Replace context imports** with hook imports
2. **Update destructuring** to use `data`, `isLoading`, `error` properties
3. **Remove useEffect calls** for data fetching
4. **Update mutation calls** to use the new mutation hooks

### Example Migration

```typescript
// Before (Context)
const { employees, getAllEmployees, loading } = useEmployee();
useEffect(() => {
  getAllEmployees();
}, [getAllEmployees]);

// After (React Query)
const { data: employees = [], isLoading, error } = useEmployees();
```

## Next Steps

1. **Test all components** to ensure they work correctly
2. **Update remaining components** that still use old contexts
3. **Add error boundaries** for better error handling
4. **Implement optimistic updates** for better UX
5. **Add loading skeletons** for better perceived performance

## Files to Remove (After Testing)

- `app/client/src/context/EmployeeContext.tsx`
- `app/client/src/context/AttendanceContext.tsx`
- `app/client/src/context/PayRollContext.tsx`
- `app/client/src/context/JobContext.tsx`

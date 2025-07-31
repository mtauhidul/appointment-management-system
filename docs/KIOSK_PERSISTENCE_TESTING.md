# Kiosk Data Persistence Testing Guide

## Issue Description
Data is not persisting properly when:
1. User fills out forms and reloads the page
2. User enters edit mode from review page
3. Previous filled data not showing in edit mode

## Fixes Implemented

### 1. Enhanced Store Persistence
```typescript
// Updated partialize to include edit mode state
partialize: (state) => ({ 
  progress: state.progress,
  isEditMode: state.isEditMode,
  returnToStep: state.returnToStep
})
```

### 2. Added Hydration Protection
- Added `isMounted` state to prevent hydration mismatches
- Shows loading spinner until store is fully hydrated
- Prevents React from attempting to render with server-side state

### 3. Enhanced Debugging
- Added console logs to `enterEditMode` and `updateData` functions
- Changed storage key to `kiosk-patient-checkin-v1` to avoid conflicts

### 4. Store State Management
- Fixed `resetKiosk` to clear all persistent state
- Fixed `submitCheckIn` to clear edit mode state

## Testing Steps

### Test 1: Basic Data Persistence
1. Go to kiosk page
2. Fill out personal information (name, DOB, location)
3. Navigate to next step (demographics)
4. Fill out contact information
5. **Reload the page**
6. **Expected**: Should return to demographics step with data intact
7. **Expected**: Personal info should still be filled when going back

### Test 2: Edit Mode Persistence
1. Complete entire kiosk flow to review page
2. Click "Edit Personal Info"
3. **Reload the page**
4. **Expected**: Should return to User Info step (edit mode)
5. **Expected**: Form should show previously filled data
6. Make changes and click "Next"
7. **Expected**: Should return to review page with updated data

### Test 3: Cross-Step Data Persistence
1. Fill out User Info step completely
2. Fill out Demographics step completely
3. Go to review page
4. Click "Edit Personal Info"
5. **Expected**: Form should show all previously entered data
6. Change name and submit
7. **Expected**: Return to review with updated name
8. **Expected**: Demographics data should still be intact

### Test 4: Browser Storage Verification
1. Fill out some data
2. Open browser dev tools → Application → Local Storage
3. Look for key: `kiosk-patient-checkin-v1`
4. **Expected**: Should see JSON with progress, isEditMode, returnToStep

## Debugging Console Logs

When working correctly, you should see:
```
Entering edit mode: { targetStep: 'user-info', returnTo: 'review', currentData: {...} }
Updating data: { stepData: {...}, currentData: {...} }
Data updated: {...}
```

## Common Issues & Solutions

### Issue: Data disappears on reload
**Solution**: Check browser's Local Storage for the key `kiosk-patient-checkin-v1`

### Issue: Edit mode doesn't work
**Solution**: Check console for "Entering edit mode" logs

### Issue: Hydration mismatch errors
**Solution**: The `isMounted` state should prevent this

### Issue: Form fields are empty in edit mode
**Solution**: Check that step components are reading from `data.stepName` props

## Storage Structure
```json
{
  "state": {
    "progress": {
      "currentStep": "user-info",
      "completedSteps": ["welcome"],
      "data": {
        "userInfo": {
          "fullName": "John Doe",
          "day": "15",
          "month": "March",
          "year": "1990",
          "location": "New York"
        },
        "demographicsInfo": { ... }
      }
    },
    "isEditMode": true,
    "returnToStep": "review"
  },
  "version": 0
}
```

## Implementation Status
- ✅ Store persistence configuration
- ✅ Hydration protection
- ✅ Edit mode state persistence
- ✅ Debugging logs
- ✅ Reset functionality
- ✅ Storage key optimization

The system should now properly persist all data across page reloads and maintain edit mode state.

## Quick Verification Checklist

### Before Setup:
- [ ] I have access to Supabase SQL Editor
- [ ] I'm logged in as admin (hardik@gmail.com / Hardik123)

### Setup Steps:
1. [ ] Open Supabase SQL Editor
2. [ ] Copy contents from `SETUP_ADMIN_FEATURES.sql`
3. [ ] Paste and run in SQL Editor
4. [ ] See success message with 2 rows

### After Setup - Verify Features:

#### Admin Dashboard → System Overview Tab:
- [ ] I can see "Dashboard Access Control" card
- [ ] I can see "Ambulance Dashboard" with Lock/Unlock button
- [ ] I can see "Hospital Dashboard" with Lock/Unlock button
- [ ] Clicking Lock changes status to "Locked"
- [ ] Clicking Unlock changes status to "Unlocked"

#### Admin Dashboard → Fleet Management Tab:
- [ ] I can see "Add Ambulance" button (green, top right)
- [ ] I can see "Link Driver to Ambulance" button (outline, top right)
- [ ] Clicking "Add Ambulance" opens a dialog
- [ ] Clicking "Link Driver" opens a dialog

### Test Lock Feature:
1. [ ] Lock the Ambulance Dashboard
2. [ ] Sign out and sign in as driver (manthan@gmail.com)
3. [ ] See "Dashboard Locked" message
4. [ ] Sign back as admin and unlock
5. [ ] Driver can now access dashboard

### Test Add Ambulance:
1. [ ] Click "Add Ambulance"
2. [ ] Enter vehicle number: TEST-123
3. [ ] Enter driver email: manthan@gmail.com
4. [ ] Select care type
5. [ ] Click Add
6. [ ] See success message

### Test Link Driver:
1. [ ] Click "Link Driver to Ambulance"
2. [ ] Select a driver from dropdown
3. [ ] Select an ambulance from dropdown
4. [ ] Click Link
5. [ ] See success message

---

## If Something Doesn't Work:

### Dashboard Access Control not showing:
```sql
-- Run this in Supabase SQL Editor to check:
SELECT * FROM dashboard_locks;
```
Should return 2 rows. If not, run SETUP_ADMIN_FEATURES.sql again.

### No drivers/ambulances in Link dialog:
- Create driver accounts first via Sign Up
- Create ambulances via "Add Ambulance" button

### Buttons not showing:
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors

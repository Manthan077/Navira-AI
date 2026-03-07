# Admin Features Setup Instructions

## Step 1: Run SQL in Supabase

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `SETUP_ADMIN_FEATURES.sql`
5. Click "Run" button
6. You should see 2 rows returned showing ambulance and hospital locks

## Step 2: Verify Setup

After running the SQL, refresh your admin dashboard and you should see:

### In "System Overview" Tab:
- **Dashboard Access Control** section with:
  - Ambulance Dashboard (with Lock/Unlock button)
  - Hospital Dashboard (with Lock/Unlock button)

### In "Fleet Management" Tab:
- **Add Ambulance** button (green, top right)
- **Link Driver to Ambulance** button (outline, top right)

## Features Available:

### 1. Add New Ambulance
- Click "Add Ambulance" button
- Enter vehicle number (e.g., DL-01-AB-1234)
- Enter driver email (must be an existing driver account)
- Select care type
- Click "Add Ambulance"

### 2. Link Existing Driver to Existing Ambulance
- Click "Link Driver to Ambulance" button
- Select a driver from dropdown (shows unlinked drivers)
- Select an ambulance from dropdown (shows all ambulances)
- Click "Link Driver & Ambulance"

### 3. Lock/Unlock Dashboards
- Go to "System Overview" tab
- Under "Dashboard Access Control":
  - Click "Lock" to prevent drivers/hospitals from accessing their dashboard
  - Click "Unlock" to restore access
- Locked users will see a "Dashboard Locked" message

## Troubleshooting:

**If you don't see "Dashboard Access Control":**
- Make sure you ran the SQL in Supabase
- Refresh the page
- Check browser console for errors

**If "Add Ambulance" fails:**
- Make sure the driver email exists and has role='ambulance'
- Check that vehicle number is unique

**If "Link Driver" shows no options:**
- Create some driver accounts first
- Make sure drivers don't already have ambulances linked

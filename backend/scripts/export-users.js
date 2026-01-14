const fs = require('fs-extra');
const path = require('path');

// Path to users.json
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

async function exportUsers() {
  try {
    // Read users from file
    const users = await fs.readJSON(USERS_FILE);
    
    // Remove sensitive data and prepare for export
    const usersForExport = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password, // Keep password hash for import
      mobileNumber: user.mobileNumber || '',
      profileImage: user.profileImage || undefined,
      createdAt: user.createdAt,
      loginCount: user.loginCount || 0,
      loginHistory: user.loginHistory || [],
      // Explicitly set isAdmin to false (will be handled by import)
      isAdmin: false,
    }));

    // Write to export file
    const exportFile = path.join(__dirname, '..', 'data', 'users-export.json');
    await fs.writeJSON(exportFile, usersForExport, { spaces: 2 });
    
    console.log(`✅ Exported ${usersForExport.length} users to ${exportFile}`);
    console.log(`\n📋 To import these users to Render server:`);
    console.log(`1. Copy the contents of ${exportFile}`);
    console.log(`2. Use the admin import endpoint: POST /api/v1/admin/users/import`);
    console.log(`3. Send the users array in the request body: { "users": [...] }`);
    
    return usersForExport;
  } catch (error) {
    console.error('❌ Error exporting users:', error);
    process.exit(1);
  }
}

exportUsers();

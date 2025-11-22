import { firestoreAuth } from '../lib/firestoreAuth';
import { initializePaymentSettings } from './setupFirestore';

export async function initializeAdminUser() {
  try {
    await firestoreAuth.createAdminUser(
      'neocommerce@admin.com',
      'Rahma1211'
    );
    console.log('Admin user created successfully!');
    console.log('Email: neocommerce@admin.com');
    console.log('Password: Rahma1211');
  } catch (error: any) {
    if (error.message === 'User already exists') {
      console.log('Admin user already exists');
    } else {
      console.error('Error creating admin user:', error);
    }
  }

  await initializePaymentSettings();
}

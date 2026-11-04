import { redirect } from 'next/navigation';

// MoonGazers is edited from the prameet.space admin panel (one login for both sites)
export default function AdminPage() {
  redirect('https://prameet.space/admin#moongazers');
}

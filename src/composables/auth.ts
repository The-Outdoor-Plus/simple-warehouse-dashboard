import axios from 'axios';

import { useUserStore } from '@/store/user';

const userStore = useUserStore();

export function useAuth() {
  const checkToken = async () => {
    try {
      const result = await axios({
        method: 'get',
        url: `${import.meta.env.VITE_API_URL}/api/user`,
        headers: { "Content-Type": "application/json", "Authorization": userStore.currentToken },
      });
    } catch (e) {
      userStore.logOut();
      return 'redirect';
    } 
  }

  return {
    checkToken,
  }
}


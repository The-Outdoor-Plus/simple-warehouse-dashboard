import { defineStore } from 'pinia';
import * as Sentry from '@sentry/vue';

interface User {
  username?: string;
  password?: string;
}

interface Session {
  access_token: string;
  user: User;
}

interface State {
  user: User | null | undefined;
  token: string | null;
  session: Session | null;
}

export const useUserStore = defineStore('user', {
  state: (): State => {
    const token = null;
    const user = null;
    const session = null;

    return {
      token,
      user,
      session,
    }
  },
  actions: {
    setUser(user: User) {
      this.user = user;
      localStorage.setItem('username', user.username || '');
    },
    setSession(session: Session) {
      this.session = session;
      this.token = session.access_token;
      localStorage.setItem('tk', session.access_token);
    },
    setSentryUser(user: User) {
      Sentry.setUser({
        id: user.username,
        email: user.username,
        username: user.username,
      })
    },
    successfullLogin(user: User, session: any) {
      this.setUser(user);
      this.setSentryUser(user);
      this.setSession(session);
    },
    logOut() {
      this.user = null;
      this.session = null;
      this.token = null;
      localStorage.removeItem('tk');
      localStorage.removeItem('username');
    }
  },
  getters: {
    currentUser: (state) => {
      return {
        ...state.user,
      }
    },
    currentUserName: (state) => {
      return state.user?.username || localStorage.getItem('username');
    },
    isUserAuthenticated(state) {
      return !!state.session;
    },
    currentToken(state) {
      return state.token || localStorage.getItem('tk');
    }
  },
})
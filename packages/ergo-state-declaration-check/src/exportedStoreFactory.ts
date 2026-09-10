import { createErgoStore } from 'ergo-state';

interface MobileState {
  isMobile: boolean;
}

interface MobileActions {
  setMobile: (isMobile: boolean) => void;
}

export function createMobileStoreApi() {
  return createErgoStore<MobileState, MobileActions>()
    .withInitialState(() => ({ isMobile: false }))
    .withAutoselectors(['isMobile'])
    .withActions(({ set }) => ({
      setMobile: isMobile => set({ isMobile })
    }));
}

const store = createMobileStoreApi();

void (store.getIsMobile satisfies () => boolean);
void (store.subscribeIsMobile satisfies (listener: (isMobile: boolean) => void) => () => void);
void (store.actions.setMobile satisfies (isMobile: boolean) => void);

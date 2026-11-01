import '@testing-library/jest-dom/vitest';
import {afterEach,vi} from 'vitest';
import {cleanup} from '@testing-library/react';
afterEach(cleanup);

// jsdom does not implement scrolling; navigation behavior is checked in the browser.
window.scrollTo=vi.fn();

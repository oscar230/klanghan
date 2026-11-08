export type Theme = 'light' | 'dark';

/** Keep in sync with the inline script in src/app.html. */
const STORAGE_KEY = 'klanghan:theme';

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

/** The theme currently shown: the saved choice, otherwise the device setting. */
export function currentTheme(): Theme {
	const saved = document.documentElement.dataset.theme;
	if (saved === 'light' || saved === 'dark') return saved;
	return prefersDark() ? 'dark' : 'light';
}

/**
 * Switches to the other theme. A choice that matches the device setting is not
 * stored, so the app keeps following the device until the user picks the
 * opposite.
 */
export function toggleTheme(): Theme {
	const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
	const followsDevice = next === (prefersDark() ? 'dark' : 'light');
	const root = document.documentElement;

	try {
		if (followsDevice) localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, next);
	} catch {
		// Storage can be unavailable (private mode); the choice just won't persist.
	}

	if (followsDevice) delete root.dataset.theme;
	else root.dataset.theme = next;
	return next;
}

import { PREFERS_DARK, THEME_DEFAULT, THEME_STORAGE_KEY } from './theme-config'

// Runs synchronously before hydration to set the <html> class, avoiding a theme
// flash. Rendered by the root layout (src/app/layout.tsx), which stays mounted
// across locale switches — so React never re-renders this <script> on the client
// and doesn't warn about an inline script in the client tree. ThemeProvider
// re-asserts the theme on mount to cover the [locale] subtree remount.
const script = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'${THEME_DEFAULT}';if(t==='system'){t=window.matchMedia('${PREFERS_DARK}').matches?'dark':'light'}var e=document.documentElement;e.classList.remove('light','dark');e.classList.add(t);e.style.colorScheme=t}catch(e){}})()`

export function ThemeScript() {
  return (
    <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: script }} />
  )
}

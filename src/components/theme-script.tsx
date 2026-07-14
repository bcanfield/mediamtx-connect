import { PREFERS_DARK, THEME_DEFAULT, THEME_STORAGE_KEY } from './theme-config'

// Runs synchronously before hydration to set the <html> class, avoiding a theme
// flash. Rendered by the server layout (not a client component) so React 19 does
// not warn about an inline script in the client tree.
const script = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'${THEME_DEFAULT}';if(t==='system'){t=window.matchMedia('${PREFERS_DARK}').matches?'dark':'light'}var e=document.documentElement;e.classList.remove('light','dark');e.classList.add(t);e.style.colorScheme=t}catch(e){}})()`

export function ThemeScript() {
  return (
    <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: script }} />
  )
}

// `?day` on /recordings/{stream}: one browser-local day, YYYY-MM-DD. The route
// validates against this, so the timeline can trust what reaches it.
export const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

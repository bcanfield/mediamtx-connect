import type { RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'

import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import enMessages from '../../messages/en.json'

export function renderWithIntl(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { locale?: string },
) {
  const { locale = 'en', ...rest } = options ?? {}
  return render(ui, {
    wrapper: ({ children }) => (
      <NextIntlClientProvider locale={locale} messages={enMessages}>
        {children}
      </NextIntlClientProvider>
    ),
    ...rest,
  })
}

'use client'

import { useEffect } from 'react'
import logger from '@/app/utils/logger'

export default function SW() {
  useEffect(() => {
    logger.debug('Registering service worker', { navigator })
    if ('serviceWorker' in navigator) {
      logger.debug('Service worker supported')
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => logger.info('service worker installed'))
        .catch(err => logger.error('Service worker registration failed', err))
    }
  }, [])

  return <></>
}

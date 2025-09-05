type TrackingEvent = string

export interface TrackEventParams {
  event_category: 'engagement'
  event_label?: string
  event_value?: string
}

export const useTracking = () => {
  const { tracking } = useRuntimeConfig().public

  const trackEvent = (event_name: TrackingEvent | string, payload: TrackEventParams) => {
    if (tracking.disabled || !import.meta.client) return
    useTrackEvent(event_name, { props: { ...payload } })
  }

  return {
    trackEvent
  }
}

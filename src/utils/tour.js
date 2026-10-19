export function restartTour() {
  window.dispatchEvent(new CustomEvent('start-onboarding-tour'));
}

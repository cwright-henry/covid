export const GA = {
	methods: {
		/**
		 * e.g. User clicked on popup's
		 */
		gaNavigation(action, label) {
			window.gtag('event', action, {
				event_category: 'navigation',
				event_label: label
			});
		},
		/**
		 * e.g. User clicked
		 */
		gaInteraction(action, label) {
			window.gtag('event', action, {
				event_category: 'interaction',
				event_label: label
			});
		},
		/**
		 * e.g. User viewed/experienced a snack bar
		 */
		gaExperience(action, label) {
			window.gtag('event', action, {
				event_category: 'experience',
				event_label: label
			});
		}
	}
};
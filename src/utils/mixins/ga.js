export const GA = {
	methods: {
		/**
		 * e.g. User clicked, general interactions
		 */
		gaInteraction(action, label) {
			window.gtag('event', action, {
				event_category: 'interaction',
				event_label: label
			});
		},
		/**
		 * e.g. User experinced an error
		 */
		gaError(action, label) {
			window.gtag('event', action, {
				event_category: 'error',
				event_label: label
			});
		}
	}
};
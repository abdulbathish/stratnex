/**
 * Component Loader
 * Loads header and footer components into pages
 * Note: For file:// protocol, use a local server (e.g., python -m http.server 8000)
 */
(function() {
	'use strict';

	let componentsLoaded = 0;
	const totalComponents = 2;

	// Function to initialize preloader handling
	function initPreloader() {
		// Set up preloader close button first
		const preloaderClose = document.querySelector('.preloader-close');
		if (preloaderClose) {
			preloaderClose.addEventListener('click', function() {
				hidePreloader();
			});
		}

		// Hide preloader when page is fully loaded
		function hidePreloader() {
			const loaderWrap = document.querySelector('.loader-wrap');
			if (loaderWrap && loaderWrap.style.display !== 'none') {
				// Use jQuery if available (for consistency with existing code)
				if (typeof jQuery !== 'undefined' && jQuery('.loader-wrap').length) {
					jQuery('.loader-wrap').delay(300).fadeOut(300);
				} else {
					// Fallback to vanilla JS
					loaderWrap.style.transition = 'opacity 0.3s';
					loaderWrap.style.opacity = '0';
					setTimeout(function() {
						loaderWrap.style.display = 'none';
					}, 300);
				}
			}
		}

		// Wait for window load or a minimum delay, whichever comes first
		let preloaderHidden = false;
		const hideAfterDelay = setTimeout(function() {
			if (!preloaderHidden) {
				hidePreloader();
				preloaderHidden = true;
			}
		}, 800);

		// Also hide on window load
		if (document.readyState === 'complete') {
			clearTimeout(hideAfterDelay);
			hidePreloader();
			preloaderHidden = true;
		} else {
			window.addEventListener('load', function() {
				clearTimeout(hideAfterDelay);
				if (!preloaderHidden) {
					hidePreloader();
					preloaderHidden = true;
				}
			});
		}
	}

	// Function to check if all components are loaded
	function checkAllComponentsLoaded() {
		componentsLoaded++;
		if (componentsLoaded >= totalComponents) {
			// Dispatch custom event when all components are loaded
			const event = new CustomEvent('componentsLoaded', {
				bubbles: true,
				cancelable: true
			});
			document.dispatchEvent(event);
		}
	}

	// Function to load component using XMLHttpRequest (works better with file://)
	function loadComponentXHR(containerId, componentPath) {
		const container = document.getElementById(containerId);
		if (!container) {
			console.warn('Container with ID "' + containerId + '" not found');
			checkAllComponentsLoaded(); // Still count as loaded to avoid blocking
			return;
		}

		const xhr = new XMLHttpRequest();
		xhr.open('GET', componentPath, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200 || xhr.status === 0) { // 0 for file:// protocol
					container.innerHTML = xhr.responseText;
					// Handle preloader if header was loaded
					if (containerId === 'header-container') {
						initPreloader();
					}
					checkAllComponentsLoaded();
					// Re-initialize any scripts that depend on the loaded content
					if (typeof initComponents === 'function') {
						initComponents();
					}
				} else {
					console.error('Error loading component:', componentPath, 'Status:', xhr.status);
					checkAllComponentsLoaded(); // Count as loaded to avoid blocking
				}
			}
		};
		xhr.onerror = function() {
			console.error('Network error loading component:', componentPath);
			console.warn('Tip: Use a local server for development. Run: python3 -m http.server 8000');
			checkAllComponentsLoaded(); // Count as loaded to avoid blocking
		};
		xhr.send(null);
	}

	// Function to load component using fetch (preferred for http/https)
	function loadComponentFetch(containerId, componentPath) {
		const container = document.getElementById(containerId);
		if (!container) {
			console.warn('Container with ID "' + containerId + '" not found');
			checkAllComponentsLoaded(); // Still count as loaded to avoid blocking
			return;
		}

		fetch(componentPath)
			.then(response => {
				if (!response.ok) {
					throw new Error('Failed to load component: ' + componentPath);
				}
				return response.text();
			})
			.then(html => {
				container.innerHTML = html;
				// Handle preloader if header was loaded
				if (containerId === 'header-container') {
					initPreloader();
				}
				checkAllComponentsLoaded();
				// Re-initialize any scripts that depend on the loaded content
				if (typeof initComponents === 'function') {
					initComponents();
				}
			})
			.catch(error => {
				console.error('Error loading component with fetch:', error);
				// Fallback to XHR
				loadComponentXHR(containerId, componentPath);
			});
	}

	// Choose loader based on protocol
	function loadComponent(containerId, componentPath) {
		const protocol = window.location.protocol;
		if (protocol === 'file:') {
			// Use XHR for file:// protocol
			loadComponentXHR(containerId, componentPath);
		} else {
			// Use fetch for http/https
			loadComponentFetch(containerId, componentPath);
		}
	}

	// Load components when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function() {
			loadComponent('header-container', 'components/header.html');
			loadComponent('footer-container', 'components/footer.html');
		});
	} else {
		// DOM already loaded
		loadComponent('header-container', 'components/header.html');
		loadComponent('footer-container', 'components/footer.html');
	}
})();


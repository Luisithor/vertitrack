module.exports = {
	globDirectory: '.',
	globPatterns: [
		'**/*.{js,html,json,cjs,svg,md,css,jsx,lock}'
	],
	swDest: 'sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};
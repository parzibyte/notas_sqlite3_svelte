module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{gif,png,js,css,ttf,wasm,html,svg}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};
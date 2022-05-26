'use strict';

module.exports = function(grunt) {

grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-cssmin');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-banner');

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	meta: {
		banner:
		'/*! @preserve\n'+
		' * Leaflet Panel Layers v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n'+
		' *\n'+
		' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n'+
		' * <%= pkg.author.email %>\n'+
		' * <%= pkg.author.url %>\n'+
		' *\n'+
		' * Licensed under the <%= pkg.license %> license.\n'+
		' *\n'+
		' * Demos:\n'+
		' * <%= pkg.homepage %>\n'+
		' *\n'+
		' * Source:\n'+
		' * <%= pkg.repository.url %>\n'+
		' */\n'
	},
	clean: {
		dist: {
			src: ['dist/*']
		}
	},
	jshint: {
		options: {
			globals: {
				console: true,
				module: true,
			},
		},
		files: ['src/*.js']
	},
	concat: {
		//TODO cut out SearchMarker
		options: {
			banner: '<%= meta.banner %>'
		},
		dist: {
			files: {
				'dist/leaflet-panel-layers.src.js': ['src/leaflet-panel-layers.js'],
				'dist/leaflet-panel-layers.src.css': ['src/leaflet-panel-layers.css']
			}
		}
	},
	uglify: {
		dist: {
			files: {
				'dist/leaflet-panel-layers.min.js': ['dist/leaflet-panel-layers.src.js']
			}
		}
	},
	cssmin: {
		combine: {
			files: {
				'dist/leaflet-panel-layers.min.css': ['src/leaflet-panel-layers.css']
			}
		},
		minify: {
			expand: true,
			cwd: 'dist/',
			files: {
				'dist/leaflet-panel-layers.min.css': ['src/leaflet-panel-layers.css']
			}
		}
	},
	usebanner: {
		options: {
			position: 'top',
			linebreak: false
		},
		css: {
			options: {
				banner: '<%= meta.banner %>'
			},
			files: {
				src: 'dist/leaflet-panel-layers.min.css'
			}
		},
		js: {
			options: {
				banner: '<%= meta.banner %>'
			},
			files: {
				src: 'dist/leaflet-panel-layers.min.js'
			}
		}
	},
	watch: {
		dist: {
			options: { livereload: true },
			files: ['src/*','examples/*'],
			tasks: ['clean','concat','cssmin','jshint']
		}
	}
});

grunt.registerTask('default', [
	'clean',
	'concat',
	'cssmin',
	'usebanner:css',
	'jshint',
	'uglify',
	'usebanner:js'
]);

};

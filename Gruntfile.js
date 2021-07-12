module.exports = function (grunt) {
  // How to consume
  // grunt build --version_sdk=2.0.0
  // grunt build --version_sdk=stable
  const version_sdk = grunt.option('version_sdk') || 'stable';
  grunt.initConfig({

    //
    // Server in localhost
    //
    connect: {
      server: {
        options: {
          port: 9001
        }
      }
    },

    //
    // Version SDK
    //
    version_sdk: version_sdk,

    //
    // CSS Minify
    //
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      "css": {
        files: {
          "payment_<%= version_sdk %>.min.css": ["./src/css/**/*.css"]
        }
      }
    },

    //
    // JavaScript Minify
    //
    uglify: {
      options: {
        mangle: false
      },
      js: {
        files: {
          "payment_<%= version_sdk %>.min.js": ["src/js/**/*.js"]
        }
      }
    },

    //
    // Watch Configuration
    //
    watch: {
      "css": {
        files: [
          "./src/css/**/*.css"
        ],
        tasks: ["cssmin:css"],
        options: {
          livereload: true
        }
      },
      "js": {
        files: [
          './src/js/**/*.js'
        ],
        tasks: ["uglify-es:js"],
        options: {
          livereload: true
        }
      }
    }

  });

  //
  // Plugin loading
  //
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-connect');

  //
  // Task definition
  //
  grunt.registerTask('default', ['connect', 'watch']);
  grunt.registerTask('build', ['cssmin:css', 'uglify:js']);
};

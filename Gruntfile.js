module.exports = function(grunt) {
  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    bump: {
      options: {
        files: ['package.json'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['-a'], // '-a' for all files
        createTag: true,
        pushTo: 'origin',
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
      }
    }
  });

  grunt.registerTask('default', ['bump']);
}

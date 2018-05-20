let config = require('./GruntConfig');

let {
    index_dir,
    styles_dir,
    hbs_template_dir,
    dist_dir_base,
    dist_scripts_dir,
    dist_templates_dir,
    templates_output_file,
    concat_app_file,
    adhara_min_js,
    adhara_min_templates,
    adhara_min_css,
    concat_app_file_es5,
    adhara_min_js_es5
} = config;

module.exports = function (grunt) {

    let scripts = config.app_scripts;
    let hbs_templates = grunt.file.expand({ filter: "isFile" }, [`${hbs_template_dir}/**/*.hbs`]);

    scripts.unshift(`${dist_scripts_dir}${templates_output_file}`);    //template's output file

    //Grunt config
    grunt.initConfig({
        adhara_min_js,
        adhara_min_templates,
        adhara_min_css,
        concat_app_file,
        concat_app_file_es5,
        adhara_min_js_es5,
        dist_scripts_dir,
        /*clean: {
            dist: {
                src: [dist_dir_base]
            }
        },*/
        less: {
            all: {
                options: {
                    // strictMath: true
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    src: [`${styles_dir}/*.less`],
                    ext: '.css',
                    extDot: 'first'
                }]
            }
        },
        handlebars: {
            options: {
                // amd: true,
                namespace: function(/*filename*/) {
                    return "Handlebars.templates";
                },
                processName: function(filePath) {
                    return filePath.replace(new RegExp(`${hbs_template_dir}(.*).hbs`), '$1');
                }
            },
            compile: {
                files: {
                    '<%= adhara_min_templates %>' : hbs_templates
                }
            }
        },
        concat: {
            options: {
                separator: '\n/**------------------------------------------------------------------------------------------------------------------**/\n'
            },
            app_scripts: {
                src: scripts,
                dest: `${dist_scripts_dir}/${concat_app_file}`
            }
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['env']
            },
            dist: {
                files: {
                    '<%= dist_scripts_dir %><%= concat_app_file_es5 %>': '<%= dist_scripts_dir %><%= concat_app_file %>',
                }
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            all: {
                files: {
                    '<%= adhara_min_js %>' :
                        [
                            `${dist_scripts_dir}${concat_app_file}`,
                            `${dist_templates_dir}${templates_output_file}`,
                        ],
                    '<%= adhara_min_js_es5 %>' :
                        [
                            `${dist_scripts_dir}${concat_app_file_es5}`,
                            `${dist_templates_dir}${templates_output_file}`,
                        ],

                }
            }
        },
        cssmin: {
            all: {
                files: {
                    '<%= adhara_min_css %>':
                        [ `${styles_dir}/*.css` ]    //App app styles.
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-babel');


    let command = [
        'less:all',
        'handlebars:compile',
        'concat:app_scripts',
        'babel:dist',
        'uglify:all',
        'cssmin:all'
    ];

    grunt.registerTask('default', command);
};
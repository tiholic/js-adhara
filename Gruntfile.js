let config = require('./GruntConfig');

module.exports = function (grunt) {
    let debug = !grunt.option('production') && !grunt.option('prod');
    let mode_config = debug?config.debug:config.prod;
    if(!mode_config){
        mode_config = {
            tp_styles: [],
            tp_scripts: []
        }
    }

    let pkg = grunt.file.readJSON('package.json');

    let index_dir = ``;
    let styles_dir = `${index_dir}less/`;
    let hbs_template_dir = `${index_dir}templates/`;
    let dist_dir = `${index_dir}dist/${pkg.version}/`;
    let dist_scripts_dir = `${dist_dir}js/`;
    let dist_templates_dir = `${dist_dir}templates/`;
    let minified_scripts_dir = dist_scripts_dir;
    let minified_styles_dir = `${dist_dir}css/`;

    let templates_output_file = "templates.js";
    let concat_app_file = "adhara.combined.js";
    let minified_app_file = "adhara.min.js";
    let minified_css_file = "app.min.css";

    let styles = grunt.file.expand({ filter: "isFile" }, [`${styles_dir}/*.css`]);
    let scripts = config.app_scripts;
    let hbs_templates = grunt.file.expand({ filter: "isFile" }, [`${hbs_template_dir}/**/*.hbs`]);
    let tp_styles = mode_config.tp_styles;
    let tp_scripts = mode_config.tp_scripts;

    scripts.unshift(`${dist_scripts_dir}${templates_output_file}`);    //template's output file

    let include_scripts = null, include_styles = null;
    (()=>{
        //include scripts and styles lists creation
        let ver = Date.now();   //pkg.version;
        function formatLinks(list){
            return list.map(li => (li.startsWith("http://")||li.startsWith("https://"))?li:`/${li}?v=${ver}`);
        }
        //include scripts list
        include_scripts = tp_scripts.slice();
        // include_scripts.push(`${dist_scripts_dir}${templates_output_file}`);    //template file
        include_scripts.push.apply(include_scripts, scripts);
        include_scripts = formatLinks(include_scripts);
        //include styles list
        include_styles = styles.slice();
        include_styles.push.apply(include_styles, tp_styles);
        include_styles = formatLinks(include_styles);
    })();

    //Grunt config
    grunt.initConfig({
        dist_templates_dir,
        templates_output_file,
        minified_scripts_dir,
        minified_app_file,
        minified_styles_dir,
        minified_css_file,
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
                    '<%= dist_templates_dir %><%= templates_output_file %>' : hbs_templates
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
        uglify: {
            all: {
                files: {
                    '<%= minified_scripts_dir %><%= minified_app_file %>' :
                        [
                            `${dist_scripts_dir}${concat_app_file}`,
                            `${dist_templates_dir}${templates_output_file}`,
                        ]
                }
            }
        },
        cssmin: {
            all: {
                files: {
                    '<%= minified_styles_dir %>/<%= minified_css_file %>':
                        [ `${styles_dir}/*.css` ]    //App app styles.
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');


    let command = [
        'less:all',
        'handlebars:compile',
        'concat:app_scripts',
        'uglify:all',
        'cssmin:all'
    ];

    grunt.registerTask('default', command);
};
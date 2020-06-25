const config = require('../config.json');
const versions = require('../versions.json');
const fse = require('fs-extra');
const path = process.cwd();

module.exports = {
    versions: {
        /*
	        Get the latest stable release
        */
        get latest() {
            return versions[1];
        },
        /*
	        Get all the v ersions
        */
        get all() {
            return versions;
        }
    },
    /*
	    Generate a single object that represents all versions from each sidebar
	    https://vuepress.vuejs.org/theme/default-theme-config.html#multiple-sidebars
    */ 
    get sidebars() {
        let sidebars = {};

        versions.forEach((version) => {
            let sidebar = require(`../../${version}/sidebar.js`);
            sidebars[`/${version}/`] = sidebar;
        });

        return sidebars;
    },
    /*
	    Build dropdown items for each version
    */
    linksFor(url) {
        let links = [];

        versions.forEach(version => {
	        let currversion = Math.floor(Number(version));
	        let path = url;
	        
	        if (config[currversion] && !url) {
		        path = config[currversion].home;
	        }
	        
            let item = {
                text: version,
                link: `/${version}/${path}`
            };
            links.push(item);
        })

        return links;
    },
    /*
	    Generate a new version from a master version
	    PARAMETERS:
	    	version: the version to create
	    	master: the master version to duplicate
    */
    generate(version, master) {
        version = version || process.argv[1];
        console.log('\n');

        if (!fs.existsSync(`${path}/.vuepress/versions.json`)) {
            this.error('File .vuepress/versions.json not found');
        }

        if (typeof master === 'undefined') {
            this.error('No master version number specified! \nPass the master version you wish to duplicate as an argument.\nEx: 1.0');
        }

        if (typeof version === 'undefined') {
            this.error('No version number specified! \nPass the version you wish to create as an argument.\nEx: 1.1');
        }

        if (versions.includes(version)) {
            this.error(`This version '${version}' already exists! Specify a new version to create that does not already exist.`);
        }

        this.info(`Generating new version into 'docs/${version}' ...`);

        try {
            fse.copySync(`${path}/${master}`, `${path}/${version}`);

            /*
	            Add new generated version on top of list
            */
            
            versions.unshift(version)
            
            /*
	            Write to versions.json
            */

            fs.writeFileSync(
                `${path}/.vuepress/versions.json`,
                `${JSON.stringify(versions, null, 2)}\n`,
            );

            this.success(`Version '${version}' created!`)
        } catch (e) {
            this.error(e)
        }
    },
    error(message) {
        console.log("\x1b[41m%s\x1b[0m", ' ERROR ', `${message}\n`)
        process.exit(0)
    },
    info(message) {
        console.log("\x1b[44m%s\x1b[0m", ' INFO ', `${message}\n`)
    },
    success(message) {
        console.log("\x1b[42m\x1b[30m%s\x1b[0m", ' DONE ', `${message}\n`)
    }
}
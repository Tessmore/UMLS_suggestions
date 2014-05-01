JSON files
=========

The app expects two configuration files:

* `config.json`
** Contains port / database configuration (`cp config_example.json config.json` and edit)
* `settings.json`
** File that contains the elasticsearch database setup. Note that under "mappings" the table should match the elastic_db table in the config file.
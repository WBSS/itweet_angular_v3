Instruction&Pitfalls

[uk 20160516] Create src doc:
1. run grunt task (Gruntfile_project): copy_temp_doc_itweet or copy_temp_doc_rhb
2. run doc creator:
typedoc --out ./doc/rhb ./temp/**/*.ts --name 'QS-Mobile App' --verbose --target ES5 --module amd --excludeExternals
or
typedoc --out ./doc/itweet ./temp/**/*.ts --name 'itweet App' --verbose --target ES5 --module amd --excludeExternals

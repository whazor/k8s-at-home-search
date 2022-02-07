#!/bin/bash
git submodule init
# add as submodule
eval "$(sqlite3 repos.db 'select "git submodule add " ||url || " repos/" || REPLACE(repo_name, "/", "-") from repos')"

# git config pull.ff only
# find repos -type d -depth 1 -exec git --git-dir={}/.git --work-tree=$PWD/{} pull \;
git submodule foreach git config --local pull.ff only
git submodule foreach git pull 
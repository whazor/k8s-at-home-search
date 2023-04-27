{ pkgs, ... }:

{
  # https://devenv.sh/languages/
  languages.nix.enable = true;
  languages.typescript.enable = true;
  languages.javascript.enable = true;
  languages.python.enable = true;
  languages.python.package = pkgs.python311.withPackages (p: with p; [ 
    requests
    ruamel-yaml
    pydantic
  ]);

  packages = [
    pkgs.pigz
    pkgs.sqlite
    pkgs.playwright-driver
    pkgs.nodePackages.zx
  ];

  env.LD_LIBRARY_PATH="";
  env.PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}";
  env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS="true";
  # https://devenv.sh/processes/
  processes.web.exec = "cd $DEVENV_ROOT/web/; yarn run dev";
  # download the latest repos.db from github
  scripts.download.exec = "$DEVENV_ROOT/scripts/download.mjs";
}

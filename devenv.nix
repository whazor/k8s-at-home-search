{ pkgs, ... }:

{
  # https://devenv.sh/languages/
  languages.nix.enable = true;
  languages.typescript.enable = true;
  languages.javascript.enable = true;
  packages = [
    pkgs.pigz
    pkgs.sqlite
    pkgs.playwright.browsers
    pkgs.nodePackages.zx
  ];

  env.PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright.browsers}";
  env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS="true";
  # https://devenv.sh/processes/
  # processes.ping.exec = "ping example.com";
}

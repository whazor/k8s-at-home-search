{ pkgs, ... }:

{
  # https://devenv.sh/languages/
  languages.nix.enable = true;
  languages.typescript.enable = true;
  languages.javascript.enable = true;
  packages = [
    pkgs.pigz
    pkgs.sqlite
  ];

  # https://devenv.sh/processes/
  # processes.ping.exec = "ping example.com";
}

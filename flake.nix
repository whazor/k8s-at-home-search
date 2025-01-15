{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    devshell.url = "github:numtide/devshell";

  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.devshell.flakeModule
      ];
      systems = [ "x86_64-linux" "x86_64-darwin" "aarch64-linux" "aarch64-darwin" ];

      perSystem = { config, self', inputs', pkgs, lib, system, ... }:
        let
          nodejs = pkgs.nodejs_23;
          python = pkgs.python3;
        in
        {
          devshells.default = {
            env = [
              {
                name = "BROWSER_PATH";
                value = pkgs.playwright-driver.browsers;
              }
              {
                name = "PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS";
                value = "true";
              }
            ];
            commands = [
              {
                help = "download repos";
                name = "download";
                command = "./scripts/download.mjs";
              }
              {
                help = "run frontend";
                name = "run";
                command = "cd web/; yarn run dev";
              }
            ];
            packages = [
              (python.withPackages (p: with p; [
                requests
                ruamel-yaml
                pydantic
              ]))
              pkgs.sqlite
              pkgs.curl
              pkgs.playwright-driver
              pkgs.nodePackages.zx
              pkgs.nodePackages.npm
              pkgs.nodePackages.yarn
            ];
          };
        };
    };
}

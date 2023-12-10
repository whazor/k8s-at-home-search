{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.11";
    devenv.url = "github:cachix/devenv";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.devenv.flakeModule
      ];
      systems =  [ "x86_64-linux" "x86_64-darwin" "aarch64-linux" "aarch64-darwin" ];

      perSystem = { config, self', inputs', pkgs, lib, system, ... }:
      let
      nodejs = pkgs.nodejs_20;
      python = pkgs.python311;
      in
      {
        packages.default = pkgs.hello;
        devenv.shells.default = {
          # https://devenv.sh/reference/options/

          languages.nix.enable = true;
          languages.javascript.enable = true;
          languages.javascript.package = nodejs;
          languages.typescript.enable = true;

          languages.python.enable = true;
          languages.python.package = python.withPackages (p: with p; [
            requests
            ruamel-yaml
            pydantic
          ]);


          packages = [
            config.packages.default
            pkgs.sqlite
            pkgs.playwright-driver
            pkgs.nodePackages.zx
          ];

          env.PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
          env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";

          processes.web.exec = "cd $DEVENV_ROOT/web/; yarn run dev";
          scripts.download.exec = "$DEVENV_ROOT/scripts/download.mjs";

        };
      };
    };
}

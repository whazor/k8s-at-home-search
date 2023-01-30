{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    dream2nix.url = "github:nix-community/dream2nix";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    dream2nix,
    flake-utils
  } @ inputs:
  let 
    system = "x86_64-linux";
    pkgs = import nixpkgs {
      inherit system;
      overlays = [ ];
    };
  in
    (dream2nix.lib.makeFlakeOutputs {
      systems = ["x86_64-linux"];
      config.projectRoot = ./.;
      source = ./frontend/.;
      settings = [
        {
          filter = project: project.translator == "yarn-lock";
          subsystemInfo.nodejs = 18;
        }
      ];
    });
}

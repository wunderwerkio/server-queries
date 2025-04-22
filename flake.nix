{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.05";

    ww-node-overlays.url = "github:wunderwerkio/nix-node-packages-overlays";
    ww-node-overlays.inputs.nixpkgs.follows = "nixpkgs";

    ww-utils.url = "github:wunderwerkio/nix-ww-utils";
    ww-utils.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = {
    self,
    nixpkgs,
    ww-node-overlays,
    ww-utils,
  }: {
    devShells = ww-utils.lib.forEachWunderwerkSystem (
      system: let
        overlays = with ww-node-overlays.overlays; [
          pnpm
        ];
        pkgs = import nixpkgs {
          inherit system overlays;
        };
      in rec {
        default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20

            nodePackages.pnpm-latest
          ];
        };
      }
    );

    formatter = ww-utils.lib.forEachWunderwerkSystem (
      system:
        nixpkgs.legacyPackages.${system}.alejandra
    );
  };
}

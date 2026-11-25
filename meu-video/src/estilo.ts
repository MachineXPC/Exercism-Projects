import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

for (const peso of ["400", "600", "700", "800"]) {
  void loadFont({
    family: "Montserrat",
    url: staticFile(`fonts/montserrat-${peso}.woff2`),
    weight: peso,
  });
}

export const FONTE = "Montserrat, sans-serif";

export const COR = {
  ciano: "#38bdf8",
  gelo: "#7dd3fc",
  calor: "#fb923c",
  texto: "#f1f5f9",
  textoSuave: "#94a3b8",
  marinho: "#0b1220",
};

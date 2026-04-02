import { content as x6Styles } from "@antv/x6/es/style/raw";

export function ensureX6Styles() {
	if (document.getElementById("x6-base-styles")) {
		return;
	}

	const style = document.createElement("style");
	style.id = "x6-base-styles";
	style.textContent = x6Styles;
	document.head.append(style);
}

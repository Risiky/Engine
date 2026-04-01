import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
	plugins: [
		vue(),
		Components({
			resolvers: [
				AntDesignVueResolver({
					importStyle: "css-in-js",
				}),
			],
		}),
	],
	build: {
		chunkSizeWarningLimit: 650,
		rollupOptions: {
			output: {
				manualChunks(id) {
					const x6Packages = [
						"node_modules/@antv/x6",
						"node_modules/dom-align",
						"node_modules/lodash-es",
						"node_modules/mousetrap",
						"node_modules/utility-types",
					];

					if (x6Packages.some((pkg) => id.includes(pkg))) {
						return "x6-demo";
					}
				},
			},
		},
	},
	server: {
		host: "127.0.0.1",
		port: 5173,
	},
});

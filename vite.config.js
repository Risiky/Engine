import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
	plugins: [
		vue(),
		AutoImport({
			imports: ["vue"],
			resolvers: [
				AntDesignVueResolver({
					importStyle: false,
				}),
			],
			dts: "src/auto-imports.d.ts",
		}),
		Components({
			dirs: ["src/components"],
			extensions: ["vue"],
			deep: true,
			dts: "src/components.d.ts",
			resolvers: [
				AntDesignVueResolver({
					importStyle: false,
				}),
			],
		}),
	],
	build: {
		chunkSizeWarningLimit: 500,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules/vue")) {
						return "vue-core";
					}

					if (id.includes("node_modules/ant-design-vue") || id.includes("node_modules/@ant-design")) {
						return "antdv";
					}

					const x6CommonPackages = [
						"node_modules/@antv/x6/es/common",
						"node_modules/@antv/x6/es/geometry",
						"node_modules/@antv/x6/es/config",
						"node_modules/@antv/x6/es/constants",
						"node_modules/@antv/x6/es/style",
					];

					if (x6CommonPackages.some((pkg) => id.includes(pkg))) {
						return "x6-common";
					}

					if (id.includes("node_modules/@antv/x6")) {
						return "x6-core";
					}

					const x6SupportPackages = [
						"node_modules/dom-align",
						"node_modules/lodash-es",
						"node_modules/mousetrap",
						"node_modules/utility-types",
					];

					if (x6SupportPackages.some((pkg) => id.includes(pkg))) {
						return "x6-support";
					}

					if (id.includes("node_modules")) {
						return "vendor";
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

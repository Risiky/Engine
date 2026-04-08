import { defineStore } from "pinia";
import { isSameSelectedNodePayload } from "../utils/selectedNode.js";

const EMPTY_GRAPH_SNAPSHOT = Object.freeze({
	nodes: [],
	edges: [],
});

function cloneSnapshot(snapshot) {
	return {
		nodes: [...(snapshot?.nodes ?? [])],
		edges: [...(snapshot?.edges ?? [])],
	};
}

export const useWorkflowStore = defineStore("workflow", {
	state: () => ({
		selectedNode: null,
		graphSnapshot: cloneSnapshot(EMPTY_GRAPH_SNAPSHOT),
	}),
	actions: {
		setSelectedNode(payload) {
			if (isSameSelectedNodePayload(this.selectedNode, payload)) {
				return false;
			}

			this.selectedNode = payload ? { ...payload } : null;
			return true;
		},
		patchSelectedNode(patch) {
			if (!this.selectedNode) {
				return false;
			}

			const nextValue = {
				...this.selectedNode,
				...patch,
			};

			if (isSameSelectedNodePayload(this.selectedNode, nextValue)) {
				return false;
			}

			this.selectedNode = nextValue;
			return true;
		},
		clearSelectedNode() {
			return this.setSelectedNode(null);
		},
		setGraphSnapshot(snapshot) {
			this.graphSnapshot = cloneSnapshot(snapshot);
		},
		clearGraphSnapshot() {
			this.graphSnapshot = cloneSnapshot(EMPTY_GRAPH_SNAPSHOT);
		},
	},
});

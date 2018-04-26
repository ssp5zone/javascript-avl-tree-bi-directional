/**
 * ##AVL Tree - Bi-Directional 
 * 
 * This uses a progressive (no-return) algorithm for addition 
 * and deletion on a bi-directional Binary Search Tree
 *
 * ******* 
 * ###USAGE
 * ```
 * var tree = new AVLTree();
 * tree.add(value);
 * tree.remove(value);
 * tree.getRoot();
 * tree.min(); 
 * tree.max(); 
 * tree.find(value);
 * tree.destroy();
 * ```
 *
 * @version 2.0
 * @author ssp5zone
 */
function AVLTree() {

	var root = null;

	this.destroy = this.clear = function () {
		root = null;
	};

	this.insert = this.add = function (val) {
		if (!root) root = new Node(val);
		else add(val, root);
	};

	this.delete = this.remove = function (val) {
		remove(val, root);
	};

	this.find = function (val) {
		return find(val, root);
	};

	this.min = function () {
		return root ? findMin(root) : null;
	};

	this.max = function () {
		return root ? findMax(root) : null;
	};

	this.getRoot = function () {
		return root;
	};

	/**
	 * Prints the given tree as a text-pyramid
	 * in console
	 * @returns {String[][]}
	 */
	this.print = function () {
		if (!root) return;
		var height, nodeList = [root],
			newList;
		var strBuffer, gap, legends = []; // These variables are only need to generate a text-pyramid
		for (height = root.height; height != -1; height--) {
			newList = [];
			strBuffer = fiboncciSpace(height); // the initial gap
			gap = fiboncciSpace(height + 1); // gap between nodes
			nodeList.forEach(function (node) {
				node = node || {
					value: " "
				};
				strBuffer = strBuffer
					.concat(getChar(node))
					.concat(gap);
				newList.push(node.left);
				newList.push(node.right);
			});
			strBuffer = strBuffer.trimRight();
			console.log(strBuffer);
			nodeList = newList;
		}

		// print the legends if any
		legends.forEach(function (legend) {
			console.log(legend.key, " = ", legend.value);
		});

		// this function was written to replace big numbers by
		// alternate legends so as the pyramid is not disturbed
		function getChar(node) {
			if ((node.value + '').length > 1) {
				var key = String.fromCharCode(legends.length + 97);
				legends.push({
					key: key,
					value: node.value,
				});
				return key;
			} else {
				return node.value;
			}
		}

	};

	/**
	 * Adds a given values appropriatly
	 * under the mentioned node and balances the tree
	 * **********
	 * **Note:** This is based on progressive (no-return) BST add algorithm
	 * **********
	 * @param {any} val 
	 * @param {Node} node 
	 * @return {void}
	 */
	function add(val, node) {
		var position = val < node.value ? 'left' : 'right',
			nextNode = node[position];
		if (nextNode) {
			add(val, nextNode, node);
		} else {
			node[position] = new Node(val, node);
			balance(node); // start balancing from the bottom
		}
	}

	/**
	 * Searches and removes a given values 
	 * under a given node
	 * **********
	 * **Note:** This is based on progressive (no-return) BST remove algorithm
	 * **********
	 * @param {any} val 
	 * @param {Node} node 
	 * @returns {void}
	 */
	function remove(val, node) {
		if (!node) return console.log("Element not found");
		if (node.value === val) {
			// has both sides
			if (node.left && node.right) {
				// find the smallest node in right child
				var minNode = findMin(node.right); // one can also findMax(node.left)
				// copy that node to current
				node.value = minNode.value;
				// since we have already copied that node, remove it
				remove(minNode.value, node.right);
				// No need to balance it now as we are going to remove the leaf node anyways
			}
			// has either one side or is a leaf node
			// just remove the node and bind child to parent
			else {
				var next = node.left ? node.left : node.right;

				// if this is not a leaf node
				if (next) {
					next.parent = node.parent; // update the parent of subsequent child
				}

				// if the element has a parent
				if (node.parent) {
					var side = node.parent.left == node ? "left" : "right";
					node.parent[side] = next; // bypass node
					balance(node.parent); // This is the bottom. Start balancing from here
				}
				// if the element to be deleted is root itself 
				else {
					root = next;
					balance(root);
				}
			}
		} else {
			var position = val < node.value ? "left" : "right";
			remove(val, node[position]);
		}
	}

	/**
	 * The main balancer function that balances the given node
	 * and updates the height. It keeps balancing until the top
	 * or root node is reached.
	 * 
	 * Balancing might causes a shift in root. If it does, it updates the same.
	 * 
	 * @param {Node} node 
	 * @returns {void} 
	 */
	function balance(node) {
		if (!node) return;
		node.height = getHeight(node);
		var parent = node.parent || {};
		var position = parent.left == node ? "left" : "right";
		if (getBalance(node) === -2) {
			// Left Left scenario
			if (getBalance(node.left) < 1) {
				parent[position] = rightRotate(node);
				balance(node);
			}
			// Left Right scenario
			else {
				var left = node.left;
				node.left = leftRotate(left);
				// No need to right rotate because the next step
				// would be a Left Left scenario. COOL!!
				balance(left);
			}
		} else if (getBalance(node) === 2) {
			// Right Right scenario
			if (getBalance(node.right) > -1) {
				parent[position] = leftRotate(node);
				balance(node);
			}
			// Right Left scenario 
			else {
				var right = node.right;
				node.right = rightRotate(right);
				// No need to left rotate because the next step
				// would be a Right Right scenario. COOL!!
				balance(right);
			}
		} else {
			// everything is balanced here. Go up.
			balance(node.parent);
			if (!node.parent)
				root = node;
		}
	}

	/**
	 * An internal function to Left Rotate 
	 * a given node in tree
	 * @param {Node} node 
	 * @returns {Node}
	 */
	function leftRotate(node) {
		var right = node.right,
			parent = node.parent;
		node.right = right.left;
		node.right.parent = node;
		node.parent = right;
		right.left = node;
		right.parent = parent;
		return right;
	}

	/**
	 * An internal function to Right Rotate 
	 * a given node in tree
	 * @param {Node} node 
	 * @returns {Node}
	 */
	function rightRotate(node) {
		var left = node.left,
			parent = node.parent;
		node.left = left.right;
		node.left.parent = node;
		node.parent = left;
		left.right = node;
		left.parent = parent;
		return left;
	}

	/**
	 * The Node constructor that creates a Node.
	 * 
	 * @param {any} val 
	 * @param {Node} parent 
	 */
	function Node(val, parent) {
		this.value = val;
		this.right = this.left = false;
		Object.defineProperty(this, "parent", {
			value: parent,
			enumerable: false,
			writable: true,
		});
		Object.defineProperty(this, "height", {
			value: 0,
			enumerable: false,
			writable: true,
		});
	}

	/**
	 * Get height of the given node
	 * @param {Node} node 
	 * @returns {number}
	 */
	function getHeight(node) {
		if (node.right && node.left) {
			return Math.max(node.left.height, node.right.height) + 1;
		} else if (node.right) {
			return node.right.height + 1;
		} else if (node.left) {
			return node.left.height + 1;
		}
		return 0;
	}

	/**
	 * Checks if the node is balanced and returns,
	 * * < 0 if it is leaning towards left
	 * * \> 0 if it is leaning towards right
	 * * 0 if node is balanced
	 * @param {Node} node 
	 * @returns {number}
	 */
	function getBalance(node) {
		if (!node) return 0;
		if (node.left && node.right) {
			return node.right.height - node.left.height;
		} else {
			return node.height * (!node.right ? -1 : 1);
		}
	}

	/**
	 * Find the lowest value node in a given tree
	 * @param {Node} node 
	 * @returns {Node}
	 */
	function findMin(node) {
		return node.left ? findMin(node.left) : node;
	}

	/**
	 * Find the highest value node in a given tree
	 * @param {Node} node 
	 * @returns {Node}
	 */
	function findMax(node) {
		return node.right ? findMax(node.right) : node;
	}

	/**
	 * Finds the node containing given value
	 * @param {any} val 
	 * @param {Node} node 
	 * @returns {Node}
	 */
	function find(val, node) {
		if (!node) return "Not Found";
		if (node.value == val) return node;
		return node.value > val ? find(val, node.left) : find(val, node.right);
	}

	/**
	 * generates spaces at power of 2.
	 * Used while printing tree as text-pyramid
	 * @param {number} level 
	 * @returns {String}
	 */
	function fiboncciSpace(level) {
		return Array(Math.pow(2, level)).join(" ");
	}

}

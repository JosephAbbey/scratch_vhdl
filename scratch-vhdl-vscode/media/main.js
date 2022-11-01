/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

document.addEventListener('DOMContentLoaded', function () {
    const vscode = acquireVsCodeApi();

    let rid = 0;
    let requests = [];
    const alert = (m) => vscode.postMessage({
        type: "alert",
        body: m
    });
    window.addEventListener("message", (message) => message.data.type == "prompt" && requests[message.data.id](message.data.body));
    const prompt = (m) => {
        vscode.postMessage({
            type: "prompt",
            body: m,
            id: rid
        });
        return new Promise((resolve) => requests[rid++] = resolve);
    };
    window.addEventListener("message", (message) => message.data.type == "confirm" && requests[message.data.id](message.data.body));
    const confirm = (m) => {
        vscode.postMessage({
            type: "confirm",
            body: m,
            id: rid
        });
        return new Promise((resolve) => requests[rid++] = resolve);
    };
    window.addEventListener("message", (message) => message.data.type == "select" && requests[message.data.id](message.data.body));
    const select = (o) => {
        vscode.postMessage({
            type: "select",
            body: o,
            id: rid
        });
        return new Promise((resolve) => requests[rid++] = resolve);
    };
    window.addEventListener("message", (message) => message.data.type == "selectFile" && requests[message.data.id](message.data.body));
    const selectFile = () => {
        vscode.postMessage({
            type: "selectFile",
            id: rid
        });
        return new Promise((resolve) => requests[rid++] = resolve);
    };
    window.addEventListener("message", (message) => message.data.type == "getFile" && requests[message.data.id](message.data.body));
    const getFile = (m) => {
        vscode.postMessage({
            type: "getFile",
            path: m,
            id: rid
        });
        return new Promise((resolve) => requests[rid++] = resolve);
    };
    window.addEventListener("message", (message) => message.data.type == "getState" && requests[message.data.id](message.data.value));
    const getState = (key, a) => {
        vscode.postMessage({
            type: "getState",
            key,
            a,
            id: rid
        });
        return new Promise((resolve) => requests[rid++] = resolve);
    };
    window.addEventListener("message", (message) => message.data.type == "setState" && requests[message.data.id]());
    const setState = (key, value) => {
        vscode.postMessage({
            type: "setState",
            key,
            value,
            id: rid
        });
        return new Promise((resolve) => requests[rid++] = resolve);
    };

    //#region storage_backpack
    class StorageBackpack extends Backpack {
        open() {
            if (!this.isOpenable_()) {
                return;
            }
            getState("bp_contents", []).then((d) => (this.contents_ = d, super.open()));
        }
        onContentChange_() {
            super.onContentChange_();
            setState("bp_contents", this.contents_)
        }
    }
    //#endregion

    const builtinLibs = {};

    const toolbox = {
        'kind': 'categoryToolbox',
        'contents': [
            {
                'kind': 'category',
                'name': 'Literals',
                "colour": "30",
                'contents': [
                    {
                        'kind': 'block',
                        'type': 'logic_boolean',
                    },
                    {
                        'kind': 'block',
                        'type': 'math_number',
                        'gap': 32,
                        'fields': {
                            'NUM': 123,
                        },
                    },
                    {
                        'kind': 'block',
                        'type': 'value_std_logic',
                    },
                    {
                        'kind': 'block',
                        'type': 'value_std_logic_vector',
                    },
                ]
            },
            {
                'kind': 'category',
                'name': 'Logic',
                'categorystyle': 'logic_category',
                'contents': [
                    {
                        'kind': 'block',
                        'type': 'controls_if',
                    },
                    {
                        'kind': 'block',
                        'type': 'controls_case',
                    },
                    {
                        'kind': 'block',
                        'type': 'controls_when',
                    },
                    {
                        'kind': "block",
                        'type': 'logic_others'
                    },
                    {
                        'kind': 'block',
                        'type': 'logic_or',
                    },
                    {
                        'kind': 'block',
                        'type': 'logic_compare',
                    },
                    {
                        'kind': 'block',
                        'type': 'logic_operation',
                    },
                    {
                        'kind': 'block',
                        'type': 'logic_operation_vector',
                    },
                    {
                        'kind': 'block',
                        'type': 'logic_not',
                    },
                    {
                        'kind': 'block',
                        'type': 'logic_rising_edge',
                    },
                    {
                        'kind': 'block',
                        'type': 'report',
                    },
                ],
            },
            // {
            //     'kind': 'category',
            //     'name': 'Loops',
            //     'categorystyle': 'loop_category',
            //     'contents': [
            //     ],
            // },
            {
                'kind': 'category',
                'name': 'Operations',
                'categorystyle': 'math_category',
                'contents': [
                    {
                        'kind': 'block',
                        'type': 'math_arithmetic',
                        'inputs': {
                            'A': {
                                'shadow': {
                                    'type': 'math_number',
                                    'fields': {
                                        'NUM': 1,
                                    },
                                },
                            },
                            'B': {
                                'shadow': {
                                    'type': 'math_number',
                                    'fields': {
                                        'NUM': 1,
                                    },
                                },
                            },
                        },
                    },
                    // {
                    //     'kind': 'block',
                    //     'type': 'math_number_property',
                    //     'inputs': {
                    //         'NUMBER_TO_CHECK': {
                    //             'shadow': {
                    //                 'type': 'math_number',
                    //                 'fields': {
                    //                     'NUM': 0,
                    //                 },
                    //             },
                    //         },
                    //     },
                    // },
                    {
                        'kind': 'block',
                        'type': 'list_index',
                    },
                    {
                        'kind': 'block',
                        'type': 'list_range',
                    },
                    {
                        'kind': 'block',
                        'type': 'list_concat',
                    },
                    {
                        'kind': 'block',
                        'type': 'variables_set_index',
                    },
                ],
            },
            // {
            //     'kind': 'category',
            //     'name': 'Text',
            //     'categorystyle': 'text_category',
            //     'contents': [
            //         {
            //             'kind': 'block',
            //             'type': 'text',
            //         },
            //         {
            //             'kind': 'block',
            //             'type': 'text_multiline',
            //         },
            //         {
            //             'kind': 'label',
            //             'text': 'Input/Output:',
            //             'web-class': 'ioLabel',
            //         },
            //         {
            //             'kind': 'block',
            //             'type': 'text_print',
            //             'inputs': {
            //                 'TEXT': {
            //                     'shadow': {
            //                         'type': 'text',
            //                         'fields': {
            //                             'TEXT': 'abc',
            //                         },
            //                     },
            //                 },
            //             },
            //         },
            //         {
            //             'kind': 'block',
            //             'type': 'text_prompt_ext',
            //             'inputs': {
            //                 'TEXT': {
            //                     'shadow': {
            //                         'type': 'text',
            //                         'fields': {
            //                             'TEXT': 'abc',
            //                         },
            //                     },
            //                 },
            //             },
            //         },
            //     ],
            // },
            {
                'kind': 'sep',
            },
            {
                'kind': 'category',
                'name': 'Signals',
                'categorystyle': 'variable_category',
                'custom': 'VARIABLE',
            },
            {
                'kind': 'category',
                'name': 'Processes',
                "colour": 190,
                'contents': [
                    {
                        "kind": "block",
                        "type": "process"
                    },
                    {
                        "kind": "block",
                        "type": "process_wait"
                    },
                    {
                        "kind": "block",
                        "type": "process_direct_set"
                    }
                ],
            },
            // {
            //   'kind': 'category',
            //   'name': 'Functions',
            //   'categorystyle': 'procedure_category',
            //   'custom': 'PROCEDURE',
            // },
        ],
    };

    Blockly.defineBlocksWithJsonArray([
        {
            "kind": "block",
            "type": "process",
            "message0": "process %1",
            "args0": [
                {
                    "type": "field_variable",
                    "name": "1",
                    // "variable": "%{BKY_VARIABLES_DEFAULT_NAME}"
                }
            ],
            "message1": "%1",
            "args1": [
                { "type": "input_statement", "name": "body" }
            ],
            "colour": 190,
            "mutator": "process_mutator",
        },
        {
            "kind": "block",
            "type": "process_internal_container",
            "message0": "process",
            "args0": [],
            "message1": "%1",
            "args1": [
                { "type": "input_statement", "name": "body" }
            ],
            "colour": 190
        },
        {
            "kind": "block",
            "type": "process_internal_item",
            "message0": "dependency",
            "args0": [],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 190
        },
        {
            "kind": "block",
            "type": "process_internal_all",
            "message0": "all",
            "args0": [],
            "previousStatement": null,
            "colour": 190
        },
        {
            "kind": "block",
            "type": "process_wait",
            "message0": "wait",
            "args0": [],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 190
        },
        {
            "type": "process_direct_set",
            "message0": "directly set %1 to %2",
            "colour": "%{BKY_VARIABLES_HUE}",
            "args0": [
                {
                    "type": "field_variable",
                    "name": "VAR",
                    // "variable": "%{BKY_VARIABLES_DEFAULT_NAME}"
                },
                {
                    "type": "input_value",    // This expects an input of any type
                    "name": "VALUE"
                }
            ],
        },
        {
            "kind": "block",
            "type": "value_std_logic",
            "colour": 30,
            "message0": "'%1'",
            "args0": [
                {
                    "type": "field_number",
                    "name": "VALUE",
                    "min": 0,
                    "max": 1,
                    "precision": 1,
                    "value": 1,
                }
            ],
            "output": null,
        },
        {
            "kind": "block",
            "type": "value_std_logic_vector",
            "colour": 30,
            "message0": "\"%1\"",
            "args0": [
                {
                    "type": "field_input",
                    "name": "VALUE",
                }
            ],
            "output": null,
        },
        {
            "kind": "block",
            "type": "logic_operation_vector",
            "message0": "%1 %2",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "OPERATION",
                    "options": [
                        ["AND", "and"],
                        ["OR", "or"],
                        ["XOR", "xor"],
                        ["NOR", "nor"],
                        ["NAND", "nand"],
                        ["XNOR", "xnor"],
                    ]
                },
                {
                    "type": "input_value",
                    "name": "LIST",
                }
            ],
            "output": "Boolean",
            "inputsInline": true,
            "style": "logic_blocks",
        },
        {
            "kind": "block",
            "type": "logic_not",
            "message0": "not %1",
            "args0": [
                {
                    "type": "input_value",
                    "name": "INPUT",
                }
            ],
            "output": "Boolean",
            "inputsInline": true,
            "style": "logic_blocks",
        },
        {
            "kind": "block",
            "type": "logic_operation",
            "message0": "%1 %2 %3",
            "args0": [
                {
                    "type": "input_value",
                    "name": "A",
                },
                {
                    "type": "field_dropdown",
                    "name": "OPERATION",
                    "options": [
                        ["AND", "and"],
                        ["OR", "or"],
                        ["XOR", "xor"],
                        ["NOR", "nor"],
                        ["NAND", "nand"],
                        ["XNOR", "xnor"],
                    ]
                },
                {
                    "type": "input_value",
                    "name": "B",
                }
            ],
            "output": "Boolean",
            "style": "logic_blocks",
            "inputsInline": true,
        },
        {
            "kind": "block",
            "type": "list_index",
            "message0": "%1 %2",
            "colour": "%{BKY_MATH_HUE}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "LIST"
                },
                {
                    "type": "field_number",
                    "name": "INDEX",
                    "min": 0,
                    "value": 0,
                }
            ],
            "output": null,
        },
        {
            "kind": "block",
            "type": "list_range",
            "message0": "%1 %2 %3 %4",
            "colour": "%{BKY_MATH_HUE}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "LIST"
                },
                {
                    "type": "field_number",
                    "name": "FROM",
                    "min": 0,
                    "value": 0,
                },
                {
                    "type": "field_dropdown",
                    "name": "ORDER",
                    "options": [
                        ["to", "to"],
                        ["downto", "downto"]
                    ]
                },
                {
                    "type": "field_number",
                    "name": "TO",
                    "min": 0,
                    "value": 0,
                }
            ],
            "output": null,
        },
        {
            "kind": "block",
            "type": "list_concat",
            "message0": "%1 & %2",
            "colour": "%{BKY_MATH_HUE}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "A",
                },
                {
                    "type": "input_value",
                    "name": "B",
                }
            ],
            "output": null,
            "inputsInline": true,
        },
        {
            "type": "variables_set_index",
            "message0": "set %1 %2 to %3",
            "colour": "%{BKY_VARIABLES_HUE}",
            "args0": [
                {
                    "type": "field_variable",
                    "name": "VAR",
                    // "variable": "%{BKY_VARIABLES_DEFAULT_NAME}"
                },
                {
                    "type": "field_number",
                    "name": "INDEX",
                    "min": 0,
                    "value": 0,
                },
                {
                    "type": "input_value",    // This expects an input of any type
                    "name": "VALUE"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
        },
        {
            "kind": "block",
            "type": "logic_rising_edge",
            "message0": "rising_edge %1",
            "args0": [
                {
                    "type": "field_variable",
                    "name": "dep",
                    // "variable": "%{BKY_VARIABLES_DEFAULT_NAME}"
                }
            ],
            "output": "Boolean",
            "style": "logic_blocks",
        },
        {
            "kind": "block",
            "type": "report",
            "message0": "report %1",
            "args0": [
                {
                    "type": "field_input",
                    "name": "S"
                }
            ],
            "previousStatement": null,
            "nextStatement": null
        },
        {
            "kind": "block",
            "type": "controls_case",
            "message0": "case %1 is",
            "args0": [
                {
                    "type": "input_value",
                    "name": "ON"
                }
            ],
            "message1": "%1",
            "args1": [
                { "type": "input_statement", "name": "body", "check": ["controls_when"] }
            ],
            "colour": "%{BKY_LOGIC_HUE}",
            "previousStatement": null,
            "nextStatement": null,
            "inputsInline": true,
        },
        {
            "kind": "block",
            "type": "controls_when",
            "message0": "when %1",
            "args0": [
                {
                    "type": "input_value",
                    "name": "TEST"
                }
            ],
            "message1": "%1",
            "args1": [
                { "type": "input_statement", "name": "body" }
            ],
            "colour": "%{BKY_LOGIC_HUE}",
            "previousStatement": "controls_when",
            "nextStatement": "controls_when",
        },
        {
            "kind": "block",
            "type": "logic_others",
            "message0": "others",
            "colour": "%{BKY_LOGIC_HUE}",
            "args0": [],
            "output": null,
        },
        {
            "kind": "block",
            "type": "logic_or",
            "message0": "%1 | %2",
            "colour": "%{BKY_LOGIC_HUE}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "A"
                },
                {
                    "type": "input_value",
                    "name": "B"
                }
            ],
            "inputsInline": true,
            "output": null,
        },
    ]);

    Blockly.Extensions.registerMutator("process_mutator", {
        updateShape_: function () {
            if (this.all_) {
                if (this.prevDepCount_ > 0) {
                    for (var i = this.prevDepCount_; i > 0; i--) {
                        this.inputList[0].removeField(i.toString());
                    }
                }
                this.prevDepCount_ = 0;
                this.inputList[0].removeField("all", true);
                this.inputList[0].appendField(new Blockly.FieldLabel("all"), "all");
            } else {
                this.inputList[0].removeField("all", true);
                if (this.prevDepCount_ < this.depCount_) {
                    for (var i = this.prevDepCount_ + 1; i <= this.depCount_; i++) {
                        this.inputList[0].appendField(new Blockly.FieldVariable(), i.toString());
                    }
                } else if (this.prevDepCount_ > this.depCount_) {
                    for (var i = this.prevDepCount_; i > this.depCount_; i--) {
                        this.inputList[0].removeField(i.toString());
                    }
                }
                this.prevDepCount_ = this.depCount_;
            }
        },

        saveExtraState: function () {
            return {
                'depCount': this.depCount_,
                'all': this.all_,
            };
        },
        loadExtraState: function (state) {
            this.depCount_ = state['depCount'];
            this.all_ = state['all'];
            this.updateShape_();
        },

        decompose: function (workspace) {
            var topBlock = workspace.newBlock('process_internal_container');
            topBlock.initSvg();

            var connection = topBlock.getInput('body').connection;
            for (var i = 0; i < this.depCount_; i++) {
                var itemBlock = workspace.newBlock('process_internal_item');
                itemBlock.initSvg();
                connection.connect(itemBlock.previousConnection);
                connection = itemBlock.nextConnection;
            }

            if (this._all) {
                var itemBlock = workspace.newBlock('process_internal_all');
                itemBlock.initSvg();
                connection.connect(itemBlock.previousConnection);
            }

            return topBlock;
        },
        compose: function (topBlock) {
            var itemBlock = topBlock.getInputTargetBlock('body');

            var connections = [];
            var all = false;
            var allConnection = undefined;
            while (itemBlock && !itemBlock.isInsertionMarker()) {
                if (itemBlock.type === "process_internal_item") {
                    connections.push(itemBlock.valueConnection_);
                } else if (itemBlock.type === "process_internal_all") {
                    all = true;
                    allConnection = itemBlock.valueConnection_;
                }
                itemBlock = itemBlock.nextConnection?.targetBlock();
            }

            this.depCount_ = connections.length;
            this.all_ = all;
            this.updateShape_();

            for (var i = 0; i < this.itemCount_; i++) {
                Blockly.Mutator.reconnect(connections[i], this, 'item' + i);
            }
            if (all) Blockly.Mutator.reconnect(allConnection, this, 'all');
        },
    }, function () {
        this.prevDepCount_ = 1;
        this.depCount_ = 1;
        this.all_ = false;
        this.updateShape_();
    }, ["process_internal_item", "process_internal_all"]);

    Blockly.dialog.setAlert((m, cb) => (alert(m), cb()));
    Blockly.dialog.setPrompt((m, a, cb) => prompt(m).then((d) => cb(d ?? a)));
    Blockly.dialog.setConfirm((m, cb) => confirm(m).then((d) => cb(d ?? false)));

    const entityVars = {};
    const aliasVars = {};

    (() => {
        Blockly.fieldRegistry.unregister("field_variable");
        Blockly.fieldRegistry.register("field_variable", Blockly.FieldVariable = class extends Blockly.FieldVariable {
            // TODO: Prevent deleting and renaming entity signals by removing the dropdown option for entities
            renderSelectedText_() {
                super.renderSelectedText_();
                if (["variables_get", "variables_set", "variables_set_index", "math_change", "process_direct_set"].indexOf(this.sourceBlock_.type) !== -1) {
                    if (Object.keys(entityVars).indexOf(this.value_) !== -1) this.sourceBlock_.setColour(20);
                    else if (Object.keys(aliasVars).indexOf(this.value_) !== -1) this.sourceBlock_.setColour(120);
                    else this.sourceBlock_.setColour('%{BKY_VARIABLES_HUE}');
                }
            }

            initModel() {
                if (!this.variable_) {
                    if (this.defaultVariableName === "") {
                        this.doValueUpdate_(this.getSourceBlock().workspace.getAllVariables()[0].getId());
                    } else {
                        super.initModel();
                    }
                }
            }
        });
    })();

    const theme = Blockly.Theme.defineTheme('vscode', {
        'base': Blockly.Themes.Classic,
        'componentStyles': {
            'workspaceBackgroundColour': 'var(--vscode-editor-background)',
            'toolboxBackgroundColour': 'var(--vscode-editorWidget-background)',
            'toolboxForegroundColour': 'var(--vscode-editorWidget-foreground)',
            'flyoutBackgroundColour': 'var(--vscode-editorWidget-background)',
            'flyoutForegroundColour': 'var(--vscode-editorWidget-foreground)',
            'flyoutOpacity': 0.8,
            'scrollbarColour': '#797979',
            'insertionMarkerColour': '#fff',
            'insertionMarkerOpacity': 0.3,
            'scrollbarOpacity': 0.4,
            'cursorColour': '#d0d0d0',
        },
    });

    const VHDLGenerator = new Blockly.Generator("VHDL");
    // TODO: VHDL keyword list

    VHDLGenerator.ORDER_ATOMIC   /**/ = 0;
    VHDLGenerator.ORDER_FUNCTION_CALL = 1;
    VHDLGenerator.ORDER_INDEX    /**/ = 1.1;
    VHDLGenerator.ORDER_CONCAT   /**/ = 2;
    VHDLGenerator.ORDER_MUL      /**/ = 3.0;
    VHDLGenerator.ORDER_DIV      /**/ = 3.1;
    VHDLGenerator.ORDER_SUB      /**/ = 4.1;
    VHDLGenerator.ORDER_ADD      /**/ = 4.2;
    VHDLGenerator.ORDER_NOT      /**/ = 5;
    VHDLGenerator.ORDER_COMPARE  /**/ = 6;
    VHDLGenerator.ORDER_LOGIC    /**/ = 7;
    VHDLGenerator.ORDER_NONE     /**/ = 99;


    VHDLGenerator.finish = function (code) {
        function gen_signals(signals) {
            return Object.keys(signals).map((n) =>
                "\n  signal " + n + " : " + signals[n] + ";"
            ).join("");
        }
        return librariesCode + "\n\n" + entityCode + "\n\n\narchitecture scratch of " + name + " is\n" + constantsCode + "\n" + gen_signals(signals) + "\n" + aliasesCode + "\n\nbegin\n" + Object.getPrototypeOf(this).finish.call(this, code) + "\n\nend architecture;\n";
    }

    VHDLGenerator.scrub_ = function (block, code, opt_thisOnly) {
        let commentCode = '';
        // Only collect comments for blocks that aren't inline.
        if (!block.outputConnection || !block.outputConnection.targetConnection) {
            // Collect comment for this block.
            let comment = block.getCommentText();
            if (comment) {
                comment = Blockly.utils.string.wrap(comment, this.COMMENT_WRAP - 3);
                commentCode += this.prefixLines(comment, '-- ') + '\n';
            }
            // Collect comments for all value arguments.
            // Don't collect comments for nested statements.
            for (let i = 0; i < block.inputList.length; i++) {
                if (block.inputList[i].type === Blockly.inputTypes.VALUE) {
                    const childBlock = block.inputList[i].connection.targetBlock();
                    if (childBlock) {
                        comment = this.allNestedComments(childBlock);
                        if (comment) {
                            commentCode += this.prefixLines(comment, '-- ');
                        }
                    }
                }
            }
        }
        const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
        const nextCode = opt_thisOnly ? '' : this.blockToCode(nextBlock);
        return commentCode + code + nextCode;
    };

    VHDLGenerator.process = function (block) {
        return "\n  process" + ((a) => a.length > 0 ? "(" + a + ")" : "")(
            block.all_ ? "all" : block.inputList[0]
                .fieldRow.filter(
                    (a) => a instanceof Blockly.FieldVariable
                ).map(
                    (a) => a.getVariable().name
                ).join(", ")) + "\n  begin\n  " +
            VHDLGenerator.statementToCode(block, 'body').replaceAll("\n", "\n  ") +
            "end process;";
    }

    VHDLGenerator.process_wait = function (block) {
        return 'wait;\n';
    }

    VHDLGenerator.process_direct_set = function (block) {
        return "\n  " + block.getField("VAR").getVariable().name + ' <= ' +
            VHDLGenerator.valueToCode(block, 'VALUE', VHDLGenerator.ORDER_NONE) + ';';
    }

    VHDLGenerator.controls_if = function (block) {
        let n = 0;
        let code = '';
        while (block.getInput('IF' + n)) {
            const conditionCode =
                VHDLGenerator.valueToCode(block, 'IF' + n, VHDLGenerator.ORDER_NONE) || 'false';
            let branchCode = VHDLGenerator.statementToCode(block, 'DO' + n);
            code +=
                (n > 0 ? 'els' : '') + 'if ' + conditionCode + ' then\n' + branchCode;
            n++;
        }

        if (block.getInput('ELSE')) {
            let branchCode = VHDLGenerator.statementToCode(block, 'ELSE');
            code += 'else\n' + branchCode;
        }
        return code + 'end if;\n';
    }

    VHDLGenerator.controls_case = function (block) {
        return "case " + VHDLGenerator.valueToCode(block, "ON", VHDLGenerator.ORDER_NONE) + " is\n" + VHDLGenerator.statementToCode(block, 'body') + "end case;\n";
    }

    VHDLGenerator.controls_when = function (block) {
        return "when " + VHDLGenerator.valueToCode(block, "TEST", VHDLGenerator.ORDER_NONE) + " =>\n" + VHDLGenerator.statementToCode(block, 'body') + "\n";
    }

    VHDLGenerator.logic_others = function (block) {
        return ["others", VHDLGenerator.ORDER_ATOMIC];
    }

    VHDLGenerator.logic_or = function (block) {
        return [VHDLGenerator.valueToCode(block, "A", VHDLGenerator.ORDER_NONE) + " | " + VHDLGenerator.valueToCode(block, 'B', VHDLGenerator.ORDER_NONE), VHDLGenerator.ORDER_ATOMIC];
    }

    VHDLGenerator.logic_rising_edge = function (block) {
        return ["rising_edge(" + block.getField("dep").getVariable().name + ")", VHDLGenerator.ORDER_FUNCTION_CALL]
    }

    VHDLGenerator.logic_not = function (block) {
        return ["not " + VHDLGenerator.valueToCode(block, "INPUT", VHDLGenerator.ORDER_NOT), VHDLGenerator.ORDER_NOT]
    }

    VHDLGenerator.logic_boolean = function (block) {
        return [block.getFieldValue(""), VHDLGenerator.ORDER_ATOMIC]
    }

    VHDLGenerator.logic_operation = function (block) {
        return [VHDLGenerator.valueToCode(block, "A", VHDLGenerator.ORDER_LOGIC) + " " + block.getFieldValue("OPERATION") + " " + VHDLGenerator.valueToCode(block, "B", VHDLGenerator.ORDER_LOGIC), VHDLGenerator.ORDER_LOGIC]
    }

    VHDLGenerator.logic_operation_vector = function (block) {
        return [block.getFieldValue("OPERATION") + "(" + VHDLGenerator.valueToCode(block, "LIST", VHDLGenerator.ORDER_NONE) + ")", VHDLGenerator.ORDER_FUNCTION_CALL]
    }

    VHDLGenerator.logic_compare = function (block) {
        return [VHDLGenerator.valueToCode(block, "A", VHDLGenerator.ORDER_COMPARE) + " = " + VHDLGenerator.valueToCode(block, "B", VHDLGenerator.ORDER_COMPARE), VHDLGenerator.ORDER_COMPARE]
    }

    VHDLGenerator.variables_get = function (block) {
        return [block.getField("VAR").getVariable().name, VHDLGenerator.ORDER_ATOMIC];
    }

    VHDLGenerator.constant = function (block) {
        return [block.getFieldValue("NAME"), VHDLGenerator.ORDER_ATOMIC];
    }

    VHDLGenerator.variables_set = function (block) {
        return block.getField("VAR").getVariable().name + ' <= ' +
            VHDLGenerator.valueToCode(block, 'VALUE', VHDLGenerator.ORDER_NONE) + ';\n';
    }

    VHDLGenerator.variables_set_index = function (block) {
        return block.getField("VAR").getVariable().name + "(" + block.getFieldValue("INDEX") + ') <= ' +
            VHDLGenerator.valueToCode(block, 'VALUE', VHDLGenerator.ORDER_NONE) + ';\n';
    }

    VHDLGenerator.math_change = function (block) {
        return block.getField("VAR").getVariable().name + ' <= ' +
            block.getField("VAR").getVariable().name + " + " + VHDLGenerator.valueToCode(block, 'DELTA', VHDLGenerator.ORDER_ADD) + ';\n';
    }

    VHDLGenerator.value_std_logic = function (block) {
        return ["'" + block.getFieldValue("VALUE") + "'", VHDLGenerator.ORDER_ATOMIC];
    };

    VHDLGenerator.value_std_logic_vector = function (block) {
        return ['"' + block.getFieldValue("VALUE") + '"', VHDLGenerator.ORDER_ATOMIC];
    };

    VHDLGenerator.math_number = function (block) {
        return [block.getFieldValue("NUM"), VHDLGenerator.ORDER_ATOMIC];
    };

    VHDLGenerator.math_arithmetic = function (block) {
        // Basic arithmetic operators, and power.
        const OPERATORS = {
            'ADD': [' + ', Lua.ORDER_ADDITIVE],
            'MINUS': [' - ', Lua.ORDER_ADDITIVE],
            'MULTIPLY': [' * ', Lua.ORDER_MULTIPLICATIVE],
            'DIVIDE': [' / ', Lua.ORDER_MULTIPLICATIVE],
            'POWER': [' ^ ', Lua.ORDER_EXPONENTIATION],
        };
        const tuple = OPERATORS[block.getFieldValue('OP')];
        const order = tuple[1];
        return [VHDLGenerator.valueToCode(block, 'A', order) || '0' + tuple[0] + VHDLGenerator.valueToCode(block, 'B', order) || '0', order];
    };

    VHDLGenerator.list_index = function (block) {
        return [VHDLGenerator.valueToCode(block, 'LIST', VHDLGenerator.ORDER_INDEX) + "(" + block.getFieldValue("INDEX") + ")", VHDLGenerator.ORDER_INDEX];
    };

    VHDLGenerator.list_range = function (block) {
        return [VHDLGenerator.valueToCode(block, 'LIST', VHDLGenerator.ORDER_INDEX) + "(" + block.getFieldValue("FROM") + " " + block.getFieldValue("ORDER") + " " + block.getFieldValue("TO") + ")", VHDLGenerator.ORDER_INDEX];
    };

    VHDLGenerator.list_concat = function (block) {
        return [VHDLGenerator.valueToCode(block, 'A', VHDLGenerator.ORDER_CONCAT) + " & " + VHDLGenerator.valueToCode(block, 'B', VHDLGenerator.ORDER_CONCAT), VHDLGenerator.ORDER_CONCAT];
    };

    VHDLGenerator.report = function (block) {
        return "report " + block.getFieldValue("S") + ";\n";
    };

    const ws = Blockly.inject('root', {
        toolbox: structuredClone(toolbox),
        grid: {
            spacing: 25,
            length: 3,
            colour: '#ccc',
            snap: true,
        },
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2,
            pinch: true
        },
        theme,
        renderer: "zelos"
    });

    const bp = new StorageBackpack(ws);
    bp.init();

    let entity = {};
    let libraries = {};
    let signals = {};
    let constants = {};
    let aliases = {};
    let entityCode = "";
    let librariesCode = "";
    let constantsCode = "";
    let aliasesCode = "";

    Blockly.ContextMenuRegistry.registry.register({
        displayText: "View Code",
        preconditionFn() {
            return "enabled";
        },
        callback() {
            vscode.postMessage({
                type: "code"
            });
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        id: 'viewCode',
        weight: -1,
    });

    Blockly.ContextMenuRegistry.registry.register({
        displayText: "Add port",
        preconditionFn() {
            return "enabled";
        },
        callback() {
            prompt("New port name: ").then((n) => {
                prompt("New port direction: ").then((d) => {
                    prompt("New port type: ").then((t) => {
                        entity.entity[n] = [d, t];
                        vscode.postMessage({
                            type: "updateEntity",
                            body: JSON.stringify(entity)
                        });
                    });
                });
            });
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        id: 'addPort',
        weight: 9.0,
    });
    Blockly.ContextMenuRegistry.registry.register({
        displayText: "Remove port",
        preconditionFn() {
            return "enabled";
        },
        callback() {
            select(Object.keys(entity.entity)).then((s) => {
                delete entity.entity[s];
                vscode.postMessage({
                    type: "updateEntity",
                    body: JSON.stringify(entity)
                });
            });
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        id: 'removePort',
        weight: 9.1,
    });

    Blockly.ContextMenuRegistry.registry.register({
        displayText: "Add library",
        preconditionFn() {
            return "enabled";
        },
        callback() {
            selectFile().then(async (p) => {
                const lib = eval("((colour, generator)=>" + await getFile(p) + ")")().name.split(".");
                entity.libraries = entity.libraries || {};
                entity.libraries[lib[0]] = entity.libraries[lib[0]] || {};
                entity.libraries[lib[0]][lib[1]] = p;
                vscode.postMessage({
                    type: "updateEntity",
                    body: JSON.stringify(entity)
                });
            });
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        id: 'addLibrary',
        weight: 10.0,
    });
    Blockly.ContextMenuRegistry.registry.register({
        displayText: "Remove library",
        preconditionFn() {
            return "enabled";
        },
        callback() {
            const libs = Object.keys(entity.libraries).flatMap((l) => Object.keys(entity.libraries[l]).map((p) => l + "." + p));
            select(libs).then((s) => {
                const lib = s.split(".");
                delete entity.libraries[lib[0]][lib[1]];
                vscode.postMessage({
                    type: "updateEntity",
                    body: JSON.stringify(entity)
                });
            });
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        id: 'removeLibrary',
        weight: 10.1,
    });

    Blockly.ContextMenuRegistry.registry.register({
        displayText: "Add constant",
        preconditionFn() {
            return "enabled";
        },
        callback() {
            prompt("New constant name: ").then((n) => {
                prompt("New constant type: ").then((t) => {
                    prompt("New constant value: ").then((v) => {
                        entity.constants = entity.constants || {};
                        entity.constants[n] = [t, v];
                        vscode.postMessage({
                            type: "updateEntity",
                            body: JSON.stringify(entity)
                        });
                    });
                });
            });
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        id: 'addConstant',
        weight: 11.0,
    });
    Blockly.ContextMenuRegistry.registry.register({
        displayText: "Remove constant",
        preconditionFn() {
            return "enabled";
        },
        callback() {
            select(Object.keys(entity.constants)).then((s) => {
                delete entity.constants[s];
                vscode.postMessage({
                    type: "updateEntity",
                    body: JSON.stringify(entity)
                });
            });
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        id: 'removeConstant',
        weight: 11.1,
    });

    Blockly.ContextMenuRegistry.registry.register({
        displayText: "Add alias",
        preconditionFn() {
            return "enabled";
        },
        callback() {
            prompt("New alias name: ").then((n) => {
                prompt("New alias value: ").then((v) => {
                    entity.aliases = entity.aliases || {};
                    entity.aliases[n] = v;
                    vscode.postMessage({
                        type: "updateEntity",
                        body: JSON.stringify(entity)
                    });
                });
            });
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        id: 'addAlias',
        weight: 12.0,
    });
    Blockly.ContextMenuRegistry.registry.register({
        displayText: "Remove alias",
        preconditionFn() {
            return "enabled";
        },
        callback() {
            select(Object.keys(entity.aliases)).then((s) => {
                delete entity.aliases[s];
                vscode.postMessage({
                    type: "updateEntity",
                    body: JSON.stringify(entity)
                });
            });
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        id: 'removeAlias',
        weight: 12.1,
    });

    Blockly.serialization.registry.register(
        'signals',
        {
            save: () => signals,
            load: (s) => signals = s,
            clear: () => { },
            priority: 10,
        });

    (() => {
        const old = ws.registerButtonCallback.bind(ws);
        ws.registerButtonCallback = (...args) => {
            old(...args);
            if (!args[2] && args[0] == "CREATE_VARIABLE") {
                ws.removeButtonCallback("CREATE_VARIABLE");
                ws.registerButtonCallback("CREATE_VARIABLE", (d) => {
                    prompt("New variable name: ").then((n) => {
                        prompt("New variable type: ").then((t) => {
                            d.getTargetWorkspace().createVariable(n);
                            signals[n] = t;
                        });
                    });
                }, true);
            }
        }
    })();

    let name = "hi";

    window.addEventListener('message',
        (message) => message.data.type == "getFileData" &&
            vscode.postMessage({
                type: 'response',
                requestId: message.data.requestId,
                body: VHDLGenerator.workspaceToCode(ws)
            }));
    window.addEventListener('message',
        (message) => message.data.type == "getScratchData" &&
            vscode.postMessage({
                type: 'response',
                requestId: message.data.requestId,
                body: JSON.stringify(Blockly.serialization.workspaces.save(ws))
            }));
    function generateEntity() {
        Blockly.Events.disable();
        for (const n in entity.entity) {
            entityVars[ws.createVariable(n).id_] = n;
        }
        // rerender all variable fields
        ws.getAllBlocks().forEach((b) => b.inputList.forEach((c) => c.fieldRow.forEach((d) => d instanceof Blockly.FieldVariable && d.renderSelectedText_())));
        Blockly.Events.enable();

        if (entity.name == undefined)
            entityCode = "entity " + name + " is\n  port(" +
                Object.keys(entity.entity).map((n) =>
                    "\n    " + n + " : " + entity.entity[n][0] + " " + entity.entity[n][1]
                ).join(";") +
                "\n  );\nend entity;";
    }
    function generateAliases() {
        Blockly.Events.disable();
        for (const n in aliases) {
            aliasVars[ws.createVariable(n).id_] = n;
        }
        // rerender all variable fields
        ws.getAllBlocks().forEach((b) => b.inputList.forEach((c) => c.fieldRow.forEach((d) => d instanceof Blockly.FieldVariable && d.renderSelectedText_())));
        Blockly.Events.enable();

        aliasesCode =
            Object.keys(aliases).map((n) =>
                "\n  alias " + n + " is " + aliases[n] + ";"
            ).join("");
    }
    window.addEventListener('message',
        (message) => message.data.type == "contentUpdate" && (
            Blockly.Events.disable(),
            Blockly.serialization.workspaces.load(JSON.parse(message.data.body), ws, { registerUndo: false }),
            Blockly.Events.enable(),
            generateEntity(), generateAliases()
        ));
    window.addEventListener('message',
        async (message) => {
            if (message.data.type == "entity") {
                entity = JSON.parse(message.data.body);
                name = entity.name || message.data.file_name;
                constants = entity.constants || constants;
                aliases = entity.aliases || aliases;

                // reset toolbox
                ws.updateToolbox(structuredClone(toolbox));

                if (constants) {
                    Blockly.defineBlocksWithJsonArray([{
                        type: "constant",
                        message0: "%1",
                        args0: [
                            {
                                "type": "field_dropdown",
                                "name": "NAME",
                                "options": Object.keys(constants).map((a) => [a, a])
                            },
                        ],
                        colour: 250,
                        output: null
                    }]);
                    const tb = ws.getToolbox().toolboxDef_;
                    tb.contents = [
                        ...tb.contents,
                        {
                            kind: "category",
                            colour: 250,
                            contents: Object.keys(constants).map((a) => ({
                                kind: "block",
                                type: "constant",
                                fields: {
                                    "NAME": a
                                }
                            })),
                            name: "Constants"
                        }
                    ];
                    ws.updateToolbox(tb);
                    constantsCode = Object.keys(constants).map((n) =>
                        "\n  constant " + n + " : " + constants[n][0] + " := " + constants[n][1] + ";"
                    ).join("");
                }

                libraries = {
                    "ieee": {
                        "std_logic_1164": null
                    }
                };

                if (entity.libraries) {
                    function libraryDef(def) {
                        Blockly.defineBlocksWithJsonArray(def.map((a) => a.block));
                        def.forEach((a) => VHDLGenerator[a.block.type] = a.generator);
                        return def.map((a) => ({
                            kind: "block",
                            type: a.block.type
                        }));
                    }

                    libraries = mergeDeep(libraries, entity.libraries);
                    categories = [];

                    for (const a in libraries) {
                        let c = [];
                        let colour = Array.from(a).slice(0, 10).map((x) => parseInt(x, 36) - 10).reduce((x, y) => x + y, 0) * Math.min(a.length, 10) / 10;
                        for (const lib in libraries[a]) {
                            if (libraries[a][lib] === null)
                                continue;
                            else if (libraries[a][lib] === "builtin")
                                def = builtinLibs[a][lib];
                            else
                                def = eval("((colour, generator)=>" + await getFile(libraries[a][lib]) + ")")(colour, VHDLGenerator).blocks;
                            c.push({
                                kind: "category",
                                colour,
                                contents: libraryDef(def),
                                name: lib
                            });
                        }
                        if (c.length > 0)
                            categories.push({
                                kind: "category",
                                colour,
                                contents: c,
                                name: a
                            });
                    }

                    const tb = ws.getToolbox().toolboxDef_;
                    tb.contents = [
                        ...tb.contents,
                        {
                            'kind': 'sep',
                        },
                        ...categories
                    ];
                    ws.updateToolbox(tb);
                }

                vscode.postMessage({ type: 'requestUpdate' });

                librariesCode = Object.keys(libraries).map((l) => "library " + l + ";" + Object.keys(libraries[l]).map((p) => "\n  use " + l + "." + p + ".all;").join("")).join("\n");
            }
        }
    );

    ws.addChangeListener((e) => {
        if (e.isUiEvent) return;

        if (e.type == Blockly.Events.VAR_DELETE)
            delete signals[e.varName];
        else if (e.type == Blockly.Events.VAR_RENAME) {
            signals[e.newName] = signals[e.oldName];
            delete signals[e.oldName];
        }

        vscode.postMessage({
            type: "update",
            body: JSON.stringify(Blockly.serialization.workspaces.save(ws))
        });
    });

    vscode.postMessage({ type: 'requestEntity' });
});

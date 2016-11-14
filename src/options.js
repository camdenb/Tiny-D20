window.onload = init;

var currentConfiguration = null;

function init() {
    loadOptionsFromStorage();
    addEventHandlers();
}

function addEventHandlers() {
    $("#color").change(saveCurrentConfiguration);
    $("#alwaysShowAdvanced").change(saveCurrentConfiguration);
    $("#rollAnimation").change(saveCurrentConfiguration);

    $("#macro_name").on("input", validateMacro);
    $("#macro_value").on("input", validateMacro);

    $("#btn_create").click(createMacro);
}

function loadOptionsFromStorage() {
    chrome.storage.sync.get(PRIMARY_CONFIG_KEY, function(items) {
        var config = items[PRIMARY_CONFIG_KEY];
        setConfiguration(config);
    });
}

function setConfiguration(config) {
    currentConfiguration = config;
    $("#color").val(config.iconColor);
    $("#alwaysShowAdvanced").prop("checked", config.alwaysShowAdvanced);
    $("#rollAnimation").prop("checked", config.showRollAnimation);

    var color = config.iconColor;
    chrome.browserAction.setIcon({
        path: {"19": "assets/icon19-" + color + "-outline.png",
            "38": "assets/icon38-" + color + "-outline.png"	}
    });
}

function saveCurrentConfiguration() {
    var color = $("#color").val();
    var alwaysShowAdvanced = $("#alwaysShowAdvanced").prop("checked");
    var showRollAnimation = $("#rollAnimation").prop("checked");
    var macros = []; // @TODO
    newConfig = new Configuration(color, alwaysShowAdvanced, showRollAnimation, macros);
    currentConfiguration = newConfig;
    setConfiguration(currentConfiguration);

    chrome.storage.sync.set({ [PRIMARY_CONFIG_KEY]: newConfig }, function() {
        console.log("saved!", newConfig);
    });
}

function validateMacro() {
    createMacroButton = $("#btn_create");
    nameField = $("#macro_name");
    valueField = $("#macro_value");

	if(nameField.val() == "" && valueField.val() == "") {
		btn_create.value = "Create Macro";
	} else {
		btn_create.value = "Create Macro: " + nameField.val() + " (" + valueField.val() + ") ";
	}

    createMacroButton.prop("disabled", !DICE_NOTATION_REGEX.test(valueField.val()));
}

function createMacro() {
    nameField = $("#macro_name");
    valueField = $("#macro_value");

    var matchArr = DICE_NOTATION_REGEX.exec(valueField.val());
    var rollConfig = new RollConfig(matchArr[1], matchArr[2], matchArr[3]);
    var macro = new Macro(nameField.val(), rollConfig);
    addMacroToTable(macro);

    nameField.val("");
    valueField.val("");
    validateMacro();
}

function addMacroToTable(macro) {
    var macro_table = document.getElementById('macro_table');

    var newRow = macro_table.insertRow(macro_table.rows.length - 1);
    var nameCell = newRow.insertCell(-1)
    nameCell.innerHTML = macro.name;
    var valueCell = newRow.insertCell(-1)
    valueCell.innerHTML = macro.rollConfig;
    var optionsCell = newRow.insertCell(-1)
    optionsCell.innerHTML = "<input type='button' value='Edit' class='btn_edit' /><input type='button' value='Delete' class='btn_delete' />";
    bindEvents();
}

function bindEvents() {
    var btns_edit = document.getElementsByClassName("btn_edit");
    var btns_delete = document.getElementsByClassName("btn_delete");

    for (var i = 0; i < btns_edit.length; i++) {
        btns_edit[i].onclick = null;
        btns_edit[i].onclick = (function(i) {
            return function() {
                editMacro(i);
            };
        })(i);
    }

    for (var j = 0; j < btns_delete.length; j++) {
        btns_delete[j].onclick = null;
        btns_delete[j].onclick = (function(j) {
            return function() {
                deleteMacro(j);
            };
        })(j);
    }
}

function editMacro(btn_index) {
    var macro_table = document.getElementById('macro_table');
	var macro_name = macro_table.rows[btn_index + 1].cells[0].innerHTML;
	var macro_value = macro_table.rows[btn_index + 1].cells[1].innerHTML;
	deleteMacro(btn_index);

    $("#macro_name").val(macro_name);
    $("#macro_value").val(macro_value);
    validateMacro();
}

function deleteMacro(btn_index) {
    var macro_table = document.getElementById('macro_table');
	macro_table.deleteRow(btn_index + 1);
	bindEvents();
    validateMacro();
}

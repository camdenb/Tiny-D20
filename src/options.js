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
    resetMacroInputHandlers();
}

function resetMacroInputHandlers() {
    $("#macro_name").off();
    $("#macro_value").off();
    $("#btn_create").off();

    $("#macro_name").on("input", validateMacro);
    $("#macro_value").on("input", validateMacro);
    $("#btn_create").on("click", createMacro);
}

function loadOptionsFromStorage() {
    chrome.storage.sync.get(PRIMARY_CONFIG_KEY, function(items) {
        var config = items[PRIMARY_CONFIG_KEY];
        setConfiguration(config);
        console.log(config);
    });
}

function setConfiguration(config) {
    currentConfiguration = config;
    $("#color").val(config.iconColor);
    $("#alwaysShowAdvanced").prop("checked", config.alwaysShowAdvanced);
    $("#rollAnimation").prop("checked", config.showRollAnimation);
    updateTable();

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
    var macros = currentConfiguration.macros;
    newConfig = new Configuration(color, alwaysShowAdvanced, showRollAnimation, macros);

    currentConfiguration = newConfig;
    setConfiguration(currentConfiguration);

    chrome.storage.sync.set({ [PRIMARY_CONFIG_KEY]: newConfig });
}

function validateMacro() {
    createMacroButton = $("#btn_create");
    nameField = $("#macro_name");
    valueField = $("#macro_value");

    var buttonLabel = "Create Macro";
	if(nameField.val() != "" || valueField.val() != "") {
		buttonLabel = "Create Macro: " + nameField.val() + " (" + valueField.val() + ") ";
	}
    createMacroButton.prop("value", buttonLabel);

    createMacroButton.prop("disabled", !DICE_NOTATION_REGEX.test(valueField.val()));
}

function createMacro() {
    nameField = $("#macro_name");
    valueField = $("#macro_value");

    var matchArr = DICE_NOTATION_REGEX.exec(valueField.val());
    var rollConfig = new RollConfig(matchArr[1], matchArr[2], matchArr[3]);
    var macro = new Macro(nameField.val(), rollConfig);
    currentConfiguration.macros.push(macro);
    console.log(currentConfiguration);
    updateTable();

    nameField.val("");
    valueField.val("");
    validateMacro();
    saveCurrentConfiguration();
}

function bindEventsToMacroOptions() {
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
	var deletedMacro = deleteMacro(btn_index);

    $("#macro_name").val(deletedMacro.name);
    $("#macro_value").val(RollConfig.cast(deletedMacro.rollConfig).toString());
    validateMacro();
}

function deleteMacro(btn_index) {
    var removed = currentConfiguration.macros.splice(btn_index, 1);
    updateTable();
    return removed[0];
}

function updateTable() {
    arr = currentConfiguration.macros;
	var table = document.getElementById("macro_table");

    // first clear the table
    var headerHTML = table.rows[0].innerHTML;
    var inputRowHTML = table.rows[table.rows.length - 1].innerHTML;

    table.innerHTML = "";

    var newRow = table.insertRow(0);
    newRow.innerHTML = headerHTML;

    // populate table from array
	for (var i = arr.length - 1; i >= 0; i--) {

        var name = arr[i].name;

        var rollConfig = arr[i].rollConfig;
        var value = RollConfig.cast(rollConfig).toString();
        var options = "<input type='button' value='Edit' class='btn_edit' /><input type='button' value='Delete' class='btn_delete' />";
		var newRow = table.insertRow(1);

		//name column
		var nameCell = newRow.insertCell();
		nameCell.innerHTML = name;

		//value column
		var valueCell = newRow.insertCell();
		valueCell.innerHTML = value;

		//options column
		var optionsCell = newRow.insertCell();
		optionsCell.innerHTML = options;
	};

    var newLastRow = table.insertRow(-1);
    newLastRow.innerHTML = inputRowHTML;
    resetMacroInputHandlers();

    bindEventsToMacroOptions();
}
